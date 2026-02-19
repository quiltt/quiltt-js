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

import { QuilttButton } from '@/components/quiltt-button'

describe('QuilttButton', () => {
  afterEach(() => {
    mocks.openSpy.mockReset()
    mocks.useQuilttConnectorMock.mockClear()
    document.body.innerHTML = ''
  })

  it('passes fallback oauthRedirectUrl as appLauncherUri to connector composable', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)

    const app = createApp({
      render: () =>
        h(
          QuilttButton,
          {
            connectorId: 'connector_test',
            oauthRedirectUrl: 'https://example.com/oauth/callback',
          },
          () => 'Open Connector'
        ),
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

  it('opens connector when rendered element is clicked', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)

    const app = createApp({
      render: () =>
        h(
          QuilttButton,
          {
            connectorId: 'connector_test',
          },
          () => 'Open Connector'
        ),
    })

    app.mount(root)

    const button = root.querySelector('.quiltt-button') as HTMLButtonElement | null
    expect(button).toBeTruthy()

    button?.click()

    expect(mocks.openSpy).toHaveBeenCalledTimes(1)

    app.unmount()
  })
})
