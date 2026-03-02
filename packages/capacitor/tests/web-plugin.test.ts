import { afterEach, describe, expect, it, vi } from 'vitest'

import { QuilttConnectorWeb } from '../src/web'

describe('QuilttConnectorWeb', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('opens URLs in a new tab and returns completion state', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    const plugin = new QuilttConnectorWeb()

    await expect(plugin.openUrl({ url: 'https://example.com' })).resolves.toEqual({
      completed: true,
    })
    expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer')
  })

  it('returns launch URL when OAuth params exist', async () => {
    window.history.replaceState({}, '', '/callback?code=abc')

    const plugin = new QuilttConnectorWeb()
    await expect(plugin.getLaunchUrl()).resolves.toEqual({
      url: 'http://localhost:3000/callback?code=abc',
    })
  })

  it('returns null url when no OAuth params exist', async () => {
    window.history.replaceState({}, '', '/')

    const plugin = new QuilttConnectorWeb()
    await expect(plugin.getLaunchUrl()).resolves.toEqual({ url: null })
  })
})
