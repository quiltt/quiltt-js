import { createRef } from 'react'

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'

const pluginMocks = vi.hoisted(() => ({
  openUrl: vi.fn(),
  addListener: vi.fn(),
  getLaunchUrl: vi.fn(),
}))

const sessionMocks = vi.hoisted(() => ({
  session: { token: 'session_token' },
}))

vi.mock('../src/plugin', () => ({
  QuilttConnector: {
    openUrl: pluginMocks.openUrl,
    addListener: pluginMocks.addListener,
    getLaunchUrl: pluginMocks.getLaunchUrl,
  },
}))

vi.mock('@quiltt/react', () => ({
  ConnectorSDKEventType: {
    Load: 'Load',
    ExitSuccess: 'ExitSuccess',
    ExitAbort: 'ExitAbort',
    ExitError: 'ExitError',
  },
  cdnBase: 'https://cdn.quiltt.dev',
  useQuilttSession: () => ({ session: sessionMocks.session }),
}))

import type { QuilttConnectorHandle } from '../src/components/QuilttConnector'
import { QuilttConnector } from '../src/components/QuilttConnector'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

const primePluginMocks = () => {
  pluginMocks.addListener.mockResolvedValue({ remove: vi.fn() })
  pluginMocks.getLaunchUrl.mockResolvedValue(undefined)
}

describe('QuilttConnector (capacitor)', () => {
  it('builds iframe src with connector props and session token', () => {
    primePluginMocks()

    const { container } = render(
      <QuilttConnector
        connectorId="connector_test"
        connectionId="connection_test"
        institution="institution_test"
        appLauncherUri="myapp://oauth-callback"
      />
    )

    const iframe = container.querySelector('iframe') as HTMLIFrameElement | null
    expect(iframe).toBeTruthy()

    const src = iframe?.getAttribute('src') || ''
    expect(src).toContain('/v1/connectors/connector_test')
    expect(src).toContain('token=session_token')
    expect(src).toContain('connectionId=connection_test')
    expect(src).toContain('institution=institution_test')
    expect(src).toContain('app_launcher_uri=myapp%3A%2F%2Foauth-callback')
    expect(src).toContain('mode=capacitor')
  })

  it('opens system browser on navigate events from trusted origin', () => {
    primePluginMocks()

    render(<QuilttConnector connectorId="connector_test" />)

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://quiltt.dev',
        data: {
          type: 'quiltt:connector:navigate',
          payload: { url: 'https://bank.example.com' },
        },
      })
    )

    expect(pluginMocks.openUrl).toHaveBeenCalledWith({ url: 'https://bank.example.com' })

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://evil.example.com',
        data: {
          type: 'quiltt:connector:navigate',
          payload: { url: 'https://evil.example.com' },
        },
      })
    )

    expect(pluginMocks.openUrl).toHaveBeenCalledTimes(1)
  })

  it('sends OAuth callbacks to the iframe and exposes a handle', async () => {
    let deepLinkListener: ((event: { url: string }) => void) | undefined

    pluginMocks.addListener.mockImplementation((_event, listener) => {
      deepLinkListener = listener
      return Promise.resolve({ remove: vi.fn() })
    })

    pluginMocks.getLaunchUrl.mockResolvedValue({ url: 'myapp://launch' })

    const connectorRef = createRef<QuilttConnectorHandle>()

    const { container } = render(
      <QuilttConnector connectorId="connector_test" ref={connectorRef} />
    )

    const iframe = container.querySelector('iframe') as HTMLIFrameElement
    const postMessageSpy = vi.fn()

    Object.defineProperty(iframe, 'contentWindow', {
      value: { postMessage: postMessageSpy },
      configurable: true,
    })

    deepLinkListener?.({ url: 'myapp://oauth' })
    expect(postMessageSpy).toHaveBeenCalledWith(
      {
        type: 'quiltt:connector:oauthCallback',
        payload: { url: 'myapp://oauth' },
      },
      '*'
    )
    expect(postMessageSpy).toHaveBeenCalledWith(
      {
        source: 'quiltt',
        type: 'OAuthCallback',
        data: {
          url: 'myapp://oauth',
          params: {},
        },
      },
      '*'
    )

    await Promise.resolve()
    await Promise.resolve()

    expect(postMessageSpy).toHaveBeenCalledWith(
      {
        type: 'quiltt:connector:oauthCallback',
        payload: { url: 'myapp://launch' },
      },
      '*'
    )
    expect(postMessageSpy).toHaveBeenCalledWith(
      {
        source: 'quiltt',
        type: 'OAuthCallback',
        data: {
          url: 'myapp://launch',
          params: {},
        },
      },
      '*'
    )

    connectorRef.current?.handleOAuthCallback('myapp://manual')
    expect(postMessageSpy).toHaveBeenCalledWith(
      {
        type: 'quiltt:connector:oauthCallback',
        payload: { url: 'myapp://manual' },
      },
      '*'
    )
    expect(postMessageSpy).toHaveBeenCalledWith(
      {
        source: 'quiltt',
        type: 'OAuthCallback',
        data: {
          url: 'myapp://manual',
          params: {},
        },
      },
      '*'
    )
  })
})
