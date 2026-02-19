import { createApp, h } from 'vue'

import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const openSpy = vi.fn()
  let latestOptions: Record<string, unknown> | undefined
  const useQuilttConnectorMock = vi.fn((_, options) => {
    latestOptions = options as Record<string, unknown>
    return { open: openSpy }
  })

  return {
    openSpy,
    getLatestOptions: () => latestOptions,
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

  it('prefers appLauncherUri over oauthRedirectUrl when both are provided', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)

    const app = createApp({
      render: () =>
        h(QuilttButton, {
          connectorId: 'connector_test',
          appLauncherUri: 'myapp://preferred',
          oauthRedirectUrl: 'https://example.com/fallback',
        }),
    })

    app.mount(root)

    expect(mocks.useQuilttConnectorMock).toHaveBeenCalledWith(
      'connector_test',
      expect.objectContaining({
        appLauncherUri: 'myapp://preferred',
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

  it('renders custom element and wires connector callbacks to emits', () => {
    const onEvent = vi.fn()
    const onOpen = vi.fn()
    const onLoad = vi.fn()
    const onExit = vi.fn()
    const onExitSuccess = vi.fn()
    const onExitAbort = vi.fn()
    const onExitError = vi.fn()

    const root = document.createElement('div')
    document.body.appendChild(root)

    const app = createApp({
      render: () =>
        h(
          QuilttButton,
          {
            connectorId: 'connector_test',
            as: 'a',
            onEvent,
            onOpen,
            onLoad,
            onExit,
            onExitSuccess,
            onExitAbort,
            onExitError,
          },
          () => 'Open Connector'
        ),
    })

    app.mount(root)

    const anchor = root.querySelector('a.quiltt-button')
    expect(anchor).toBeTruthy()

    const options = mocks.getLatestOptions()
    expect(options).toBeDefined()

    const metadata = { connectorId: 'connector_test' }
    ;(options?.onEvent as (type: string, metadata: unknown) => void)?.('Load', metadata)
    ;(options?.onOpen as (metadata: unknown) => void)?.(metadata)
    ;(options?.onLoad as (metadata: unknown) => void)?.(metadata)
    ;(options?.onExit as (type: string, metadata: unknown) => void)?.('ExitSuccess', metadata)
    ;(options?.onExitSuccess as (metadata: unknown) => void)?.(metadata)
    ;(options?.onExitAbort as (metadata: unknown) => void)?.(metadata)
    ;(options?.onExitError as (metadata: unknown) => void)?.(metadata)

    expect(onEvent).toHaveBeenCalledWith('Load', metadata)
    expect(onOpen).toHaveBeenCalledWith(metadata)
    expect(onLoad).toHaveBeenCalledWith(metadata)
    expect(onExit).toHaveBeenCalledWith('ExitSuccess', metadata)
    expect(onExitSuccess).toHaveBeenCalledWith(metadata)
    expect(onExitAbort).toHaveBeenCalledWith(metadata)
    expect(onExitError).toHaveBeenCalledWith(metadata)

    app.unmount()
  })
})
