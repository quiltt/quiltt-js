import type { PropsWithChildren } from 'react'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

import { useQuilttConnector } from '@/hooks/useQuilttConnector'
import { QuilttSettingsProvider } from '@/providers/QuilttSettingsProvider'

// Mock the useQuilttSession hook
vi.mock('@/hooks/useQuilttSession', () => ({
  useQuilttSession: vi.fn(() => ({
    session: {
      token: 'mockToken',
    },
  })),
}))

// Mock the useScript hook
vi.mock('@/hooks/useScript', () => ({
  useScript: vi.fn(() => 'ready'),
}))

// Mock the @quiltt/core module (only what we need)
vi.mock('@quiltt/core', async () => {
  const originalModule = await vi.importActual('@quiltt/core')
  return {
    ...originalModule,
    cdnBase: 'https://cdn.quiltt.io',
  }
})

// Mock the global Quiltt object (this is what the hook actually uses)
const mockConnector = {
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
}

const globalQuiltt = {
  authenticate: vi.fn(),
  connect: vi.fn(() => mockConnector),
  reconnect: vi.fn(() => mockConnector),
}

// Add the global Quiltt mock
Object.defineProperty(global, 'Quiltt', {
  value: globalQuiltt,
  writable: true,
})

describe('useQuilttConnector', () => {
  // Create a wrapper component that provides the necessary context
  const Wrapper = ({ children }: PropsWithChildren) => (
    <QuilttSettingsProvider clientId="test-client-id">{children}</QuilttSettingsProvider>
  )

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle authentication and connection when Quiltt is available', async () => {
    const { result } = renderHook(() => useQuilttConnector('mockConnectorId'), {
      wrapper: Wrapper,
    })

    expect(result.current).toBeDefined()
    expect(result.current.open).toBeDefined()
    expect(typeof result.current.open).toBe('function')
  })

  it('should throw an error when attempting to open without a connector ID', async () => {
    const { result } = renderHook(() => useQuilttConnector(), {
      wrapper: Wrapper,
    })

    expect(result.current).toBeDefined()
    expect(result.current.open).toBeDefined()
    expect(() => result.current.open()).toThrowError(
      'Must provide `connectorId` to `open` Quiltt Connector with Method Call'
    )
  })
})
