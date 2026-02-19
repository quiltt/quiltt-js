import { createApp, h } from 'vue'

import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const openSpy = vi.fn()
  const useQuilttConnectorMock = vi.fn(() => ({ open: openSpy }))

  return {
    openSpy,
    useQuilttConnectorMock,
  }
})

vi.mock('@/composables/use-quiltt-connector', () => ({
  useQuilttConnector: mocks.useQuilttConnectorMock,
}))

import { QuilttContainer } from '@/components/quiltt-container'

describe('QuilttContainer', () => {
  afterEach(() => {
    vi.useRealTimers()
    mocks.openSpy.mockReset()
    mocks.useQuilttConnectorMock.mockClear()
    document.body.innerHTML = ''
  })

  it('passes fallback oauthRedirectUrl as appLauncherUri to connector composable', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)

    const app = createApp({
      render: () =>
        h(QuilttContainer, {
          connectorId: 'connector_test',
          oauthRedirectUrl: 'https://example.com/oauth/callback',
        }),
    })

    app.mount(root)

    expect(mocks.useQuilttConnectorMock).toHaveBeenCalledWith(
      'connector_test',
      expect.objectContaining({
        appLauncherUri: 'https://example.com/oauth/callback',
      })
    )

    app.unmount()
  })

  it('opens connector on mounted lifecycle after delay', () => {
    vi.useFakeTimers()

    const root = document.createElement('div')
    document.body.appendChild(root)

    const app = createApp({
      render: () => h(QuilttContainer, { connectorId: 'connector_test' }),
    })

    app.mount(root)

    expect(mocks.openSpy).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)

    expect(mocks.openSpy).toHaveBeenCalledTimes(1)

    app.unmount()
  })
})
