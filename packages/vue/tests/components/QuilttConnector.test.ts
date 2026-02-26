import { createApp, h, ref } from 'vue'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sessionRef = ref<{ token: string } | null>({ token: 'session_token' })

vi.mock('@/composables/useQuilttSession', () => ({
  useQuilttSession: () => ({
    session: sessionRef,
  }),
}))

import { QuilttConnector } from '@/components/QuilttConnector'

describe('QuilttConnector', () => {
  beforeEach(() => {
    sessionRef.value = { token: 'session_token' }
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('builds iframe src with connector props and session token', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)

    const app = createApp({
      render: () =>
        h(QuilttConnector, {
          connectorId: 'connector_test',
          connectionId: 'connection_test',
          institution: 'institution_test',
          appLauncherUrl: 'https://app.example.com/quiltt/callback',
        }),
    })

    app.mount(root)

    const iframe = root.querySelector('iframe') as HTMLIFrameElement | null
    expect(iframe).toBeTruthy()

    const src = iframe?.getAttribute('src') || ''
    expect(src).toContain('connector_test.quiltt.app')
    expect(src).toContain('token=session_token')
    expect(src).toContain('connectionId=connection_test')
    expect(src).toContain('institution=institution_test')
    expect(src).toContain('app_launcher_url=https%3A%2F%2Fapp.example.com%2Fquiltt%2Fcallback')
    expect(src).toContain('mode=INLINE')

    app.unmount()
  })

  it('does not include token in iframe src when session token is missing', () => {
    sessionRef.value = null

    const root = document.createElement('div')
    document.body.appendChild(root)

    const app = createApp({
      render: () => h(QuilttConnector, { connectorId: 'connector_test' }),
    })

    app.mount(root)

    const iframe = root.querySelector('iframe') as HTMLIFrameElement | null
    const src = iframe?.getAttribute('src') || ''

    expect(src).toContain('connector_test.quiltt.app')
    expect(src).not.toContain('token=')

    app.unmount()
  })

  it('emits connector events only for allowed origins', () => {
    const onEvent = vi.fn()
    const onExitSuccess = vi.fn()
    const onNavigate = vi.fn()

    const root = document.createElement('div')
    document.body.appendChild(root)

    const app = createApp({
      render: () =>
        h(QuilttConnector, {
          connectorId: 'connector_test',
          onEvent,
          onExitSuccess,
          onNavigate,
        }),
    })

    app.mount(root)

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://connector_test.quiltt.app',
        data: {
          source: 'quiltt',
          type: 'ExitSuccess',
          connectionId: 'connection_test',
        },
      })
    )

    expect(onEvent).toHaveBeenCalledWith(
      'ExitSuccess',
      expect.objectContaining({ connectorId: 'connector_test', connectionId: 'connection_test' })
    )
    expect(onExitSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ connectorId: 'connector_test', connectionId: 'connection_test' })
    )

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://connector_test.quiltt.app',
        data: {
          source: 'quiltt',
          type: 'Navigate',
          url: 'https://app.example.com/quiltt/callback',
        },
      })
    )

    expect(onNavigate).toHaveBeenCalledWith('https://app.example.com/quiltt/callback')

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://example.com',
        data: {
          source: 'quiltt',
          type: 'ExitSuccess',
          connectionId: 'blocked_connection',
        },
      })
    )

    expect(onExitSuccess).toHaveBeenCalledTimes(1)

    app.unmount()
  })

  it('handles load, abort, error and ignores invalid message payloads', () => {
    const onEvent = vi.fn()
    const onLoad = vi.fn()
    const onExitAbort = vi.fn()
    const onExitError = vi.fn()
    const onNavigate = vi.fn()

    const root = document.createElement('div')
    document.body.appendChild(root)

    const app = createApp({
      render: () =>
        h(QuilttConnector, {
          connectorId: 'connector_test',
          onEvent,
          onLoad,
          onExitAbort,
          onExitError,
          onNavigate,
        }),
    })

    app.mount(root)

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://connector_test.quiltt.app',
        data: { source: 'quiltt', type: 'Load', connectionId: 'c1' },
      })
    )
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://connector_test.quiltt.app',
        data: { source: 'quiltt', type: 'ExitAbort' },
      })
    )
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://connector_test.quiltt.app',
        data: { source: 'quiltt', type: 'ExitError' },
      })
    )
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://connector_test.quiltt.app',
        data: { source: 'quiltt', type: 'Navigate' },
      })
    )
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://connector_test.quiltt.app',
        data: { source: 'quiltt', type: 'UnknownEvent' },
      })
    )
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://connector_test.quiltt.app',
        data: {},
      })
    )
    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://quiltt.io',
      })
    )

    expect(onLoad).toHaveBeenCalledWith(expect.objectContaining({ connectorId: 'connector_test' }))
    expect(onExitAbort).toHaveBeenCalledWith(
      expect.objectContaining({ connectorId: 'connector_test' })
    )
    expect(onExitError).toHaveBeenCalledWith(
      expect.objectContaining({ connectorId: 'connector_test' })
    )
    expect(onEvent).toHaveBeenCalledWith(
      'Load',
      expect.objectContaining({ connectorId: 'connector_test' })
    )
    expect(onEvent).toHaveBeenCalledWith(
      'ExitAbort',
      expect.objectContaining({ connectorId: 'connector_test' })
    )
    expect(onEvent).toHaveBeenCalledWith(
      'ExitError',
      expect.objectContaining({ connectorId: 'connector_test' })
    )
    expect(onNavigate).not.toHaveBeenCalled()

    app.unmount()
  })

  it('exposes handleOAuthCallback and forwards URL to iframe', () => {
    const postMessageSpy = vi.fn()
    const connectorRef = ref<{ handleOAuthCallback: (url: string) => void } | null>(null)

    const root = document.createElement('div')
    document.body.appendChild(root)

    const app = createApp({
      render: () => h(QuilttConnector, { ref: connectorRef, connectorId: 'connector_test' }),
    })

    app.mount(root)

    const iframe = root.querySelector('iframe') as HTMLIFrameElement | null
    expect(iframe).toBeTruthy()

    Object.defineProperty(iframe as HTMLIFrameElement, 'contentWindow', {
      value: { postMessage: postMessageSpy },
      configurable: true,
    })

    connectorRef.value?.handleOAuthCallback('https://app.example.com/quiltt/callback')

    expect(postMessageSpy).toHaveBeenCalledWith(
      {
        source: 'quiltt',
        type: 'OAuthCallback',
        data: {
          url: 'https://app.example.com/quiltt/callback',
          params: {},
        },
      },
      'https://connector_test.quiltt.app'
    )

    app.unmount()
  })

  it('removes message listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const root = document.createElement('div')
    document.body.appendChild(root)

    const app = createApp({
      render: () => h(QuilttConnector, { connectorId: 'connector_test' }),
    })

    app.mount(root)
    app.unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function))
  })
})
