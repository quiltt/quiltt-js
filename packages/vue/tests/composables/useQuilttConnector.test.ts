import { createApp, nextTick, ref } from 'vue'

import { afterEach, describe, expect, it, vi } from 'vitest'

const flags = vi.hoisted(() => ({
  throwMissingPlugin: false,
}))

const sessionRef = ref<{ token?: string } | null>({ token: 'session_token' })

vi.mock('@/composables/useQuilttSession', () => ({
  useQuilttSession: () => {
    if (flags.throwMissingPlugin) {
      throw new Error('missing plugin context')
    }

    return {
      session: sessionRef,
    }
  },
}))

import { useQuilttConnector } from '@/composables/useQuilttConnector'

const mountComposable = <T>(factory: () => T) => {
  let result!: T
  const root = document.createElement('div')
  document.body.appendChild(root)

  const app = createApp({
    setup() {
      result = factory()
      return () => null
    },
  })

  app.mount(root)

  return {
    result,
    unmount: () => {
      app.unmount()
      root.remove()
    },
  }
}

describe('useQuilttConnector', () => {
  afterEach(() => {
    flags.throwMissingPlugin = false
  })

  it('throws when opening without connectorId', () => {
    ;(globalThis as any).Quiltt = {
      authenticate: vi.fn(),
      connect: vi.fn(),
      reconnect: vi.fn(),
    }

    const { result, unmount } = mountComposable(() => useQuilttConnector())

    expect(() => result.open()).toThrowError(/connectorId/i)

    unmount()
    delete (globalThis as any).Quiltt
  })

  it('authenticates and opens connector when Quiltt SDK is available', async () => {
    const connector = {
      open: vi.fn(),
      onEvent: vi.fn(),
      onOpen: vi.fn(),
      onLoad: vi.fn(),
      onExit: vi.fn(),
      onExitSuccess: vi.fn(),
      onExitAbort: vi.fn(),
      onExitError: vi.fn(),
    }

    ;(globalThis as any).Quiltt = {
      authenticate: vi.fn(),
      connect: vi.fn(() => connector),
      reconnect: vi.fn(() => connector),
    }

    const { result, unmount } = mountComposable(() =>
      useQuilttConnector('connector_test', {
        institution: 'inst_1',
      })
    )

    await nextTick()
    await nextTick()

    result.open()
    await nextTick()
    await nextTick()

    expect((globalThis as any).Quiltt.authenticate).toHaveBeenCalledWith('session_token')
    expect((globalThis as any).Quiltt.connect).toHaveBeenCalledWith(
      'connector_test',
      expect.objectContaining({ institution: 'inst_1' })
    )
    expect(connector.open).toHaveBeenCalledTimes(1)

    unmount()
    delete (globalThis as any).Quiltt
  })

  it('uses reconnect when connectionId exists and warns if unmounted while open', async () => {
    const onOpenCallbacks: Array<(metadata: unknown) => void> = []
    const onExitCallbacks: Array<(type: unknown, metadata: unknown) => void> = []

    const connector = {
      open: vi.fn(),
      onEvent: vi.fn(),
      onOpen: vi.fn((callback: (metadata: unknown) => void) => onOpenCallbacks.push(callback)),
      onLoad: vi.fn(),
      onExit: vi.fn((callback: (type: unknown, metadata: unknown) => void) =>
        onExitCallbacks.push(callback)
      ),
      onExitSuccess: vi.fn(),
      onExitAbort: vi.fn(),
      onExitError: vi.fn(),
    }

    ;(globalThis as any).Quiltt = {
      authenticate: vi.fn(),
      connect: vi.fn(() => connector),
      reconnect: vi.fn(() => connector),
    }

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { unmount } = mountComposable(() =>
      useQuilttConnector('connector_test', {
        connectionId: 'connection_test',
        oauthRedirectUrl: 'myapp://oauth-callback',
        onOpen: vi.fn(),
        onExit: vi.fn(),
      })
    )

    await nextTick()
    await nextTick()

    expect((globalThis as any).Quiltt.reconnect).toHaveBeenCalledWith(
      'connector_test',
      expect.objectContaining({
        connectionId: 'connection_test',
        appLauncherUrl: 'myapp://oauth-callback',
      })
    )

    onOpenCallbacks[0]?.({})
    unmount()

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Component unmounted while Connector is still open')
    )

    onExitCallbacks[0]?.('Exit', {})

    consoleErrorSpy.mockRestore()
    delete (globalThis as any).Quiltt
  })

  it('does not throw when session plugin context is unavailable', async () => {
    flags.throwMissingPlugin = true

    const connector = {
      open: vi.fn(),
      onEvent: vi.fn(),
      onOpen: vi.fn(),
      onLoad: vi.fn(),
      onExit: vi.fn(),
      onExitSuccess: vi.fn(),
      onExitAbort: vi.fn(),
      onExitError: vi.fn(),
    }

    ;(globalThis as any).Quiltt = {
      authenticate: vi.fn(),
      connect: vi.fn(() => connector),
      reconnect: vi.fn(() => connector),
    }

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { result, unmount } = mountComposable(() => useQuilttConnector('connector_test'))

    await nextTick()
    await nextTick()

    result.open()
    await nextTick()
    await nextTick()

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('QuilttPlugin not found in the current app context'),
      expect.any(Error)
    )
    expect((globalThis as any).Quiltt.authenticate).toHaveBeenCalledWith(undefined)
    expect(connector.open).toHaveBeenCalledTimes(1)

    unmount()
    consoleWarnSpy.mockRestore()
    delete (globalThis as any).Quiltt
  })
})
