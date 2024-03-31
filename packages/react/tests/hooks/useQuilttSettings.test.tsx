import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useQuilttSettings, QuilttSettings } from '@/hooks'
import { useContext } from 'react'

// Mock React's useContext to control the returned context value
vi.mock('react', async () => {
  const originalReact = await vi.importActual('react') // Import the actual React module
  return {
    ...originalReact, // Spread all of React's exports to avoid overwriting non-mocked functions
    useContext: vi.fn(), // Mock useContext specifically
  }
})

describe('useQuilttSettings', () => {
  it('returns the context value', async () => {
    const expectedClientId = 'test-client-id'
    // Setup useContext to return a specific value for this test
    vi.mocked(useContext).mockReturnValue({ clientId: expectedClientId })

    // Render the hook and test the returned value
    const { result } = renderHook(() => useQuilttSettings(), {
      // Wrap the hook with the context provider to provide a value
      wrapper: ({ children }) => (
        <QuilttSettings.Provider value={{ clientId: expectedClientId }}>
          {children}
        </QuilttSettings.Provider>
      ),
    })

    expect(result.current.clientId).toBe(expectedClientId)
  })

  // Add more tests as necessary
})
