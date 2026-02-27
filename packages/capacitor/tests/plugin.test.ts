import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  registerPlugin: vi.fn(() => ({ name: 'mocked-plugin' })),
}))

vi.mock('@capacitor/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@capacitor/core')>()
  return {
    ...actual,
    registerPlugin: mocks.registerPlugin,
  }
})

import { QuilttConnector } from '../src/plugin'

describe('QuilttConnector plugin registration', () => {
  it('registers the Capacitor plugin with a web implementation', async () => {
    expect(QuilttConnector).toEqual({ name: 'mocked-plugin' })

    expect(mocks.registerPlugin).toHaveBeenCalledWith(
      'QuilttConnector',
      expect.objectContaining({
        web: expect.any(Function),
      })
    )

    const calls = mocks.registerPlugin.mock.calls as unknown[][]
    const options = calls[0]?.[1] as { web: () => Promise<unknown> } | undefined
    expect(options).toBeDefined()
    const webFactory = options?.web
    expect(webFactory).toBeTypeOf('function')

    const webPlugin = await webFactory?.()
    expect(webPlugin).toBeDefined()
    expect(webPlugin).toMatchObject({
      openUrl: expect.any(Function),
      getLaunchUrl: expect.any(Function),
    })
  })
})
