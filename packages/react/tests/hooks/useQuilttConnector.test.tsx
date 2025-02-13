import { renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'

import { useQuilttConnector } from '@/hooks/useQuilttConnector'
import { QuilttSettingsProvider } from '@/providers/QuilttSettingsProvider'

// Mock the entire @quiltt/core module
vi.mock('@quiltt/core', async () => {
  // Optionally, if you need the original module for some parts
  const originalModule = await vi.importActual('@quiltt/core')

  // Mock specific functions or values as needed
  const mockConnector = {
    authenticate: vi.fn().mockImplementation((token) => {
      expect(token).toBe('mockToken')
    }),
    connect: vi.fn().mockImplementation((connectorId, options) => {
      expect(connectorId).toBe('mockConnectorId')
      expect(options).toStrictEqual({ institution: undefined })
    }),
  }

  const JsonWebTokenParse = vi.fn().mockImplementation((token) => {
    // Your mock implementation or return the original function for this mock
    return (originalModule.JsonWebTokenParse as Mock)(token)
  })

  // Return the mocked module, including both overridden and original parts
  return {
    ...originalModule,
    // Your mocked implementations
    ConnectorSDK: {
      // Assuming you have a specific mock for ConnectorSDK
      authenticate: mockConnector.authenticate,
      connect: mockConnector.connect,
    },
    JsonWebTokenParse, // Include the mock for JsonWebTokenParse
  }
})

describe('useQuilttConnector', () => {
  // Create a wrapper component that provides the necessary context
  const Wrapper = ({ children }: PropsWithChildren) => (
    <QuilttSettingsProvider clientId="test-client-id">{children}</QuilttSettingsProvider>
  )

  it('should handle authentication and connection when Quiltt is available', async () => {
    const { result } = renderHook(() => useQuilttConnector('mockConnectorId'), {
      wrapper: Wrapper,
    })
    expect(result.current.open).toBeDefined()
  })

  it('should throw an error when attempting to open without a connector ID', async () => {
    const { result } = renderHook(() => useQuilttConnector(), {
      wrapper: Wrapper,
    })
    expect(() => result.current.open()).toThrowError(
      'Must provide `connectorId` to `open` Quiltt Connector with Method Call'
    )
  })
})
