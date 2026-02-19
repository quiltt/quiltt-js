import { createApp, h, ref } from 'vue'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sessionRef = ref<{ token: string } | null>({ token: 'session_token' })

vi.mock('@/composables/use-quiltt-session', () => ({
  useQuilttSession: () => ({
    session: sessionRef,
  }),
}))

import { QuilttConnector } from '@/components/quiltt-connector'

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
          appLauncherUri: 'myapp://oauth-callback',
        }),
    })

    app.mount(root)

    const iframe = root.querySelector('iframe') as HTMLIFrameElement | null
    expect(iframe).toBeTruthy()

    const src = iframe?.getAttribute('src') || ''
    expect(src).toContain('/v1/connectors/connector_test')
    expect(src).toContain('token=session_token')
    expect(src).toContain('connectionId=connection_test')
    expect(src).toContain('institution=institution_test')
    expect(src).toContain('app_launcher_uri=myapp%3A%2F%2Foauth-callback')
    expect(src).toContain('mode=webview')

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
        origin: 'https://quiltt.dev',
        data: {
          type: 'quiltt:connector:exitSuccess',
          payload: { connectionId: 'connection_test' },
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
        origin: 'https://quiltt.dev',
        data: {
          type: 'quiltt:connector:navigate',
          payload: { url: 'myapp://oauth-callback' },
        },
      })
    )

    expect(onNavigate).toHaveBeenCalledWith('myapp://oauth-callback')

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: 'https://example.com',
        data: {
          type: 'quiltt:connector:exitSuccess',
          payload: { connectionId: 'blocked_connection' },
        },
      })
    )

    expect(onExitSuccess).toHaveBeenCalledTimes(1)

    app.unmount()
  })
})
