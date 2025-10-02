import type { PropsWithChildren } from 'react'
import { act } from 'react'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, renderHook, waitFor } from '@testing-library/react'

import { useQuilttConnector } from '@/hooks/useQuilttConnector'
import { QuilttSettingsProvider } from '@/providers/QuilttSettingsProvider'

// Mock the useQuilttSession hook
const mockUseQuilttSession = vi.fn(() => ({
  session: {
    token: 'mockToken',
  } as { token: string } | null,
}))

vi.mock('@/hooks/useQuilttSession', () => ({
  useQuilttSession: () => mockUseQuilttSession(),
}))

// Mock the useScript hook
const mockUseScript = vi.fn((_url?: string) => 'ready')

vi.mock('@/hooks/useScript', () => ({
  useScript: (url: string) => mockUseScript(url),
}))

// Mock the @quiltt/core module
vi.mock('@quiltt/core', async () => {
  const originalModule = await vi.importActual('@quiltt/core')
  return {
    ...originalModule,
    cdnBase: 'https://cdn.quiltt.io',
  }
})

// Mock the global Quiltt object
const createMockConnector = () => ({
  open: vi.fn(),
  onEvent: vi.fn(),
  offEvent: vi.fn(),
  onOpen: vi.fn(),
  offOpen: vi.fn(),
  onLoad: vi.fn(),
  offLoad: vi.fn(),
  onExit: vi.fn(),
  offExit: vi.fn(),
  onExitSuccess: vi.fn(),
  offExitSuccess: vi.fn(),
  onExitAbort: vi.fn(),
  offExitAbort: vi.fn(),
  onExitError: vi.fn(),
  offExitError: vi.fn(),
})

let mockConnector = createMockConnector()

const globalQuiltt = {
  authenticate: vi.fn(),
  connect: vi.fn(() => mockConnector),
  reconnect: vi.fn(() => mockConnector),
}

Object.defineProperty(global, 'Quiltt', {
  value: globalQuiltt,
  writable: true,
  configurable: true,
})

describe('useQuilttConnector', () => {
  // Create a wrapper component that provides the necessary context
  const Wrapper = ({ children }: PropsWithChildren) => (
    <QuilttSettingsProvider clientId="test-client-id">{children}</QuilttSettingsProvider>
  )

  beforeEach(() => {
    // Create fresh mock connector for each test
    mockConnector = createMockConnector()
    globalQuiltt.connect.mockReturnValue(mockConnector)
    globalQuiltt.reconnect.mockReturnValue(mockConnector)

    vi.clearAllMocks()

    // Reset to default mock implementations
    mockUseQuilttSession.mockReturnValue({
      session: {
        token: 'mockToken',
      },
    })
    mockUseScript.mockReturnValue('ready')

    // Ensure Quiltt is defined
    Object.defineProperty(global, 'Quiltt', {
      value: globalQuiltt,
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    cleanup()
  })

  describe('Initialization', () => {
    it('should return open function', () => {
      const { result } = renderHook(() => useQuilttConnector('mockConnectorId'), {
        wrapper: Wrapper,
      })

      expect(result.current).toBeDefined()
      expect(result.current.open).toBeDefined()
      expect(typeof result.current.open).toBe('function')
    })

    it('should authenticate with session token when Quiltt is available', async () => {
      renderHook(() => useQuilttConnector('mockConnectorId'), {
        wrapper: Wrapper,
      })

      await waitFor(() => {
        expect(globalQuiltt.authenticate).toHaveBeenCalledWith('mockToken')
      })
    })

    it('should authenticate with undefined when session is null', async () => {
      mockUseQuilttSession.mockReturnValue({ session: null })

      renderHook(() => useQuilttConnector('mockConnectorId'), {
        wrapper: Wrapper,
      })

      await waitFor(() => {
        expect(globalQuiltt.authenticate).toHaveBeenCalledWith(undefined)
      })
    })

    it('should not create connector when connectorId is not provided', () => {
      renderHook(() => useQuilttConnector(), {
        wrapper: Wrapper,
      })

      expect(globalQuiltt.connect).not.toHaveBeenCalled()
      expect(globalQuiltt.reconnect).not.toHaveBeenCalled()
    })

    it('should handle when Quiltt is not yet loaded', () => {
      // @ts-expect-error - intentionally setting to undefined
      delete global.Quiltt

      const { result } = renderHook(() => useQuilttConnector('mockConnectorId'), {
        wrapper: Wrapper,
      })

      expect(result.current.open).toBeDefined()
      expect(globalQuiltt.authenticate).not.toHaveBeenCalled()
      expect(globalQuiltt.connect).not.toHaveBeenCalled()
    })

    it('should re-authenticate when session token changes', async () => {
      const { rerender } = renderHook(() => useQuilttConnector('mockConnectorId'), {
        wrapper: Wrapper,
      })

      await waitFor(() => {
        expect(globalQuiltt.authenticate).toHaveBeenCalledWith('mockToken')
      })

      vi.clearAllMocks()
      mockUseQuilttSession.mockReturnValue({ session: { token: 'newToken' } })
      rerender()

      await waitFor(() => {
        expect(globalQuiltt.authenticate).toHaveBeenCalledWith('newToken')
      })
    })

    it('should authenticate when script status changes from loading to ready', async () => {
      mockUseScript.mockReturnValue('loading')

      const { rerender } = renderHook(() => useQuilttConnector('mockConnectorId'), {
        wrapper: Wrapper,
      })

      await new Promise((resolve) => setTimeout(resolve, 0))
      vi.clearAllMocks()

      mockUseScript.mockReturnValue('ready')
      rerender()

      await waitFor(() => {
        expect(globalQuiltt.authenticate).toHaveBeenCalledWith('mockToken')
      })
    })
  })

  describe('Connector Creation', () => {
    it('should call connect when connectionId is not provided', async () => {
      renderHook(() => useQuilttConnector('mockConnectorId'), {
        wrapper: Wrapper,
      })

      await waitFor(() => {
        expect(globalQuiltt.connect).toHaveBeenCalledWith('mockConnectorId', {
          institution: undefined,
        })
      })
    })

    it('should call reconnect when connectionId is provided', async () => {
      renderHook(
        () =>
          useQuilttConnector('mockConnectorId', {
            connectionId: 'conn-123',
          }),
        {
          wrapper: Wrapper,
        }
      )

      await waitFor(() => {
        expect(globalQuiltt.reconnect).toHaveBeenCalledWith('mockConnectorId', {
          connectionId: 'conn-123',
        })
      })
    })

    it('should pass institution option when provided', async () => {
      renderHook(
        () =>
          useQuilttConnector('mockConnectorId', {
            institution: 'chase',
          }),
        {
          wrapper: Wrapper,
        }
      )

      await waitFor(() => {
        expect(globalQuiltt.connect).toHaveBeenCalledWith('mockConnectorId', {
          institution: 'chase',
        })
      })
    })

    it('should recreate connector when connectorId changes', async () => {
      const { rerender } = renderHook(({ id }) => useQuilttConnector(id), {
        wrapper: Wrapper,
        initialProps: { id: 'connector-1' },
      })

      await waitFor(() => {
        expect(globalQuiltt.connect).toHaveBeenCalledWith('connector-1', {
          institution: undefined,
        })
      })

      vi.clearAllMocks()

      rerender({ id: 'connector-2' })

      await waitFor(() => {
        expect(globalQuiltt.connect).toHaveBeenCalledWith('connector-2', {
          institution: undefined,
        })
      })
    })

    it('should recreate connector when connectionId changes', async () => {
      const { rerender } = renderHook(
        ({ connectionId }) => useQuilttConnector('mockConnectorId', { connectionId }),
        {
          wrapper: Wrapper,
          initialProps: { connectionId: 'conn-1' },
        }
      )

      await waitFor(() => {
        expect(globalQuiltt.reconnect).toHaveBeenCalledWith('mockConnectorId', {
          connectionId: 'conn-1',
        })
      })

      vi.clearAllMocks()

      rerender({ connectionId: 'conn-2' })

      await waitFor(() => {
        expect(globalQuiltt.reconnect).toHaveBeenCalledWith('mockConnectorId', {
          connectionId: 'conn-2',
        })
      })
    })

    it('should switch from connect to reconnect when connectionId is added', async () => {
      const { rerender } = renderHook(
        ({ connectionId }) => useQuilttConnector('mockConnectorId', { connectionId }),
        {
          wrapper: Wrapper,
          initialProps: { connectionId: undefined } as { connectionId?: string },
        }
      )

      await waitFor(() => {
        expect(globalQuiltt.connect).toHaveBeenCalled()
      })

      vi.clearAllMocks()

      rerender({ connectionId: 'conn-123' })

      await waitFor(() => {
        expect(globalQuiltt.reconnect).toHaveBeenCalledWith('mockConnectorId', {
          connectionId: 'conn-123',
        })
      })
    })

    it('should switch from reconnect to connect when connectionId is removed', async () => {
      const { rerender } = renderHook(
        ({ connectionId }) => useQuilttConnector('mockConnectorId', { connectionId }),
        {
          wrapper: Wrapper,
          initialProps: { connectionId: 'conn-123' } as { connectionId?: string },
        }
      )

      await waitFor(() => {
        expect(globalQuiltt.reconnect).toHaveBeenCalledWith('mockConnectorId', {
          connectionId: 'conn-123',
        })
      })

      vi.clearAllMocks()

      rerender({ connectionId: undefined })

      await waitFor(() => {
        expect(globalQuiltt.connect).toHaveBeenCalledWith('mockConnectorId', {
          institution: undefined,
        })
      })
    })

    it('should handle both institution and connectionId options together', async () => {
      renderHook(
        () =>
          useQuilttConnector('mockConnectorId', {
            connectionId: 'conn-123',
            institution: 'chase',
          }),
        {
          wrapper: Wrapper,
        }
      )

      await waitFor(() => {
        expect(globalQuiltt.reconnect).toHaveBeenCalledWith('mockConnectorId', {
          connectionId: 'conn-123',
        })
      })
    })
  })

  describe('Event Handlers', () => {
    it('should register all event handlers when provided', async () => {
      const handlers = {
        onEvent: vi.fn(),
        onOpen: vi.fn(),
        onLoad: vi.fn(),
        onExit: vi.fn(),
        onExitSuccess: vi.fn(),
        onExitAbort: vi.fn(),
        onExitError: vi.fn(),
      }

      const { unmount } = renderHook(() => useQuilttConnector('mockConnectorId', handlers), {
        wrapper: Wrapper,
      })

      await waitFor(() => {
        expect(mockConnector.onEvent).toHaveBeenCalledWith(handlers.onEvent)
        expect(mockConnector.onOpen).toHaveBeenCalledWith(expect.any(Function))
        expect(mockConnector.onLoad).toHaveBeenCalledWith(handlers.onLoad)
        expect(mockConnector.onExit).toHaveBeenCalledWith(expect.any(Function))
        expect(mockConnector.onExitSuccess).toHaveBeenCalledWith(handlers.onExitSuccess)
        expect(mockConnector.onExitAbort).toHaveBeenCalledWith(handlers.onExitAbort)
        expect(mockConnector.onExitError).toHaveBeenCalledWith(handlers.onExitError)
      })

      unmount()
    })

    it('should not register handlers that are not provided', async () => {
      const { unmount } = renderHook(() => useQuilttConnector('mockConnectorId', {}), {
        wrapper: Wrapper,
      })

      await waitFor(() => {
        expect(globalQuiltt.connect).toHaveBeenCalled()
      })

      expect(mockConnector.onEvent).not.toHaveBeenCalled()
      expect(mockConnector.onLoad).not.toHaveBeenCalled()
      expect(mockConnector.onExitSuccess).not.toHaveBeenCalled()

      unmount()
    })

    it('should unregister event handlers on cleanup', async () => {
      const handlers = {
        onEvent: vi.fn(),
        onOpen: vi.fn(),
        onLoad: vi.fn(),
        onExit: vi.fn(),
      }

      const { unmount } = renderHook(() => useQuilttConnector('mockConnectorId', handlers), {
        wrapper: Wrapper,
      })

      await waitFor(() => {
        expect(mockConnector.onEvent).toHaveBeenCalled()
      })

      vi.clearAllMocks()

      unmount()

      expect(mockConnector.offEvent).toHaveBeenCalledWith(handlers.onEvent)
      expect(mockConnector.offOpen).toHaveBeenCalledWith(expect.any(Function))
      expect(mockConnector.offLoad).toHaveBeenCalledWith(handlers.onLoad)
      expect(mockConnector.offExit).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should call user onOpen handler when connector opens', async () => {
      const onOpen = vi.fn()
      const onExit = vi.fn()
      const metadata = { foo: 'bar' }

      const { unmount } = renderHook(
        () => useQuilttConnector('mockConnectorId', { onOpen, onExit }),
        {
          wrapper: Wrapper,
        }
      )

      await waitFor(() => {
        expect(mockConnector.onOpen).toHaveBeenCalled()
      })

      const internalOnOpen = mockConnector.onOpen.mock.calls[0][0]
      const internalOnExit = mockConnector.onExit.mock.calls[0][0]

      internalOnOpen(metadata)
      expect(onOpen).toHaveBeenCalledWith(metadata)

      internalOnExit('success', {})
      unmount()
    })

    it('should call user onExit handler when connector exits', async () => {
      const onExit = vi.fn()
      const type = 'success'
      const metadata = { foo: 'bar' }

      const { unmount } = renderHook(() => useQuilttConnector('mockConnectorId', { onExit }), {
        wrapper: Wrapper,
      })

      await waitFor(() => {
        expect(mockConnector.onExit).toHaveBeenCalled()
      })

      const internalOnExit = mockConnector.onExit.mock.calls[0][0]
      internalOnExit(type, metadata)

      expect(onExit).toHaveBeenCalledWith(type, metadata)

      unmount()
    })

    it('should update handlers when they change', async () => {
      const onEvent1 = vi.fn()
      const onEvent2 = vi.fn()

      const { rerender, unmount } = renderHook(
        ({ onEvent }) => useQuilttConnector('mockConnectorId', { onEvent }),
        {
          wrapper: Wrapper,
          initialProps: { onEvent: onEvent1 },
        }
      )

      await waitFor(() => {
        expect(mockConnector.onEvent).toHaveBeenCalledWith(onEvent1)
      })

      vi.clearAllMocks()

      rerender({ onEvent: onEvent2 })

      await waitFor(() => {
        expect(mockConnector.offEvent).toHaveBeenCalledWith(onEvent1)
        expect(mockConnector.onEvent).toHaveBeenCalledWith(onEvent2)
      })

      unmount()
    })
  })

  describe('Opening Connector', () => {
    it('should throw error when opening without connectorId', () => {
      const { result, unmount } = renderHook(() => useQuilttConnector(), {
        wrapper: Wrapper,
      })

      expect(() => result.current.open()).toThrowError(
        'Must provide `connectorId` to `open` Quiltt Connector with Method Call'
      )

      unmount()
    })

    it('should call connector.open() when open is called', async () => {
      const onExit = vi.fn()
      const { result, unmount } = renderHook(
        () => useQuilttConnector('mockConnectorId', { onExit }),
        {
          wrapper: Wrapper,
        }
      )

      await waitFor(() => {
        expect(globalQuiltt.connect).toHaveBeenCalled()
      })

      await act(async () => {
        result.current.open()
      })

      await waitFor(() => {
        expect(mockConnector.open).toHaveBeenCalled()
      })

      const internalOnExit = mockConnector.onExit.mock.calls[0][0]
      internalOnExit('success', {})

      unmount()
    })

    it('should handle race condition when opening before connector is ready', async () => {
      mockUseScript.mockReturnValue('loading')

      const onExit = vi.fn()
      const { result, rerender, unmount } = renderHook(
        () => useQuilttConnector('mockConnectorId', { onExit }),
        {
          wrapper: Wrapper,
        }
      )

      await new Promise((resolve) => setTimeout(resolve, 10))

      await act(async () => {
        result.current.open()
      })

      await new Promise((resolve) => setTimeout(resolve, 10))

      // The hook already called open(), it's just waiting for connector to be ready
      // So we expect at least one call to open (it gets queued)
      // Let's just verify the behavior works correctly

      mockUseScript.mockReturnValue('ready')
      rerender()

      await waitFor(() => {
        expect(mockConnector.open).toHaveBeenCalled()
      })

      const internalOnExit = mockConnector.onExit.mock.calls[0][0]
      internalOnExit('success', {})

      unmount()
    })

    it('should only call open once when called multiple times rapidly', async () => {
      const onExit = vi.fn()
      const { result, unmount } = renderHook(
        () => useQuilttConnector('mockConnectorId', { onExit }),
        {
          wrapper: Wrapper,
        }
      )

      await waitFor(() => {
        expect(globalQuiltt.connect).toHaveBeenCalled()
      })

      await act(async () => {
        result.current.open()
        result.current.open()
        result.current.open()
      })

      await waitFor(() => {
        expect(mockConnector.open).toHaveBeenCalled()
      })

      expect(mockConnector.open).toHaveBeenCalledTimes(1)

      const internalOnExit = mockConnector.onExit.mock.calls[0][0]
      internalOnExit('success', {})

      unmount()
    })
  })

  describe('Cleanup and Memory Management', () => {
    it('should log an error if unmounted while connector is open', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const onOpen = vi.fn()

      const { unmount } = renderHook(() => useQuilttConnector('mockConnectorId', { onOpen }), {
        wrapper: Wrapper,
      })

      await waitFor(() => {
        expect(mockConnector.onOpen).toHaveBeenCalled()
      })

      // Simulate opening the connector
      const internalOnOpen = mockConnector.onOpen.mock.calls[0][0]
      internalOnOpen({ foo: 'bar' })

      // Unmount while open
      unmount()

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Component unmounted while Connector is still open')
      )

      errorSpy.mockRestore()
    })

    it('should not throw error if unmounted after connector is closed', async () => {
      const onOpen = vi.fn()
      const onExit = vi.fn()

      const { unmount } = renderHook(
        () => useQuilttConnector('mockConnectorId', { onOpen, onExit }),
        {
          wrapper: Wrapper,
        }
      )

      await waitFor(() => {
        expect(mockConnector.onOpen).toHaveBeenCalled()
        expect(mockConnector.onExit).toHaveBeenCalled()
      })

      const internalOnOpen = mockConnector.onOpen.mock.calls[0][0]
      const internalOnExit = mockConnector.onExit.mock.calls[0][0]

      internalOnOpen({ foo: 'bar' })
      internalOnExit('success', { foo: 'bar' })

      expect(() => unmount()).not.toThrow()
    })

    it('should not throw error if never opened', () => {
      const { unmount } = renderHook(() => useQuilttConnector('mockConnectorId'), {
        wrapper: Wrapper,
      })

      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Script Loading', () => {
    it('should load script with correct URL', () => {
      const { unmount } = renderHook(() => useQuilttConnector('mockConnectorId'), {
        wrapper: Wrapper,
      })

      // useScript is called with just the URL string
      expect(mockUseScript).toHaveBeenCalledWith(
        expect.stringContaining('https://cdn.quiltt.io/v1/connector.js?agent=react-')
      )

      unmount()
    })

    it('should call useScript with connectorId', () => {
      const { unmount } = renderHook(() => useQuilttConnector('mockConnectorId'), {
        wrapper: Wrapper,
      })

      expect(mockUseScript).toHaveBeenCalled()
      const callArg = mockUseScript.mock.calls[0][0]
      expect(callArg).toContain('https://cdn.quiltt.io/v1/connector.js?agent=react-')

      unmount()
    })
  })
})
