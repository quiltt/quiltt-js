import { renderHook } from '@testing-library/react-hooks'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { usePreFlightCheck } from '@/hooks/usePreFlightCheck'
import { checkConnectorUrl } from '@/utils/url-helpers'

// Mock the URL helpers explicitly
vi.mock('@/utils/url-helpers', () => ({
  checkConnectorUrl: vi.fn(),
}))

describe('usePreFlightCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the mock implementation for each test
    vi.mocked(checkConnectorUrl).mockReset()
  })

  it('should start with initial unchecked state', () => {
    const { result } = renderHook(() => usePreFlightCheck('https://test.quiltt.app'))
    expect(result.current).toEqual({ checked: false })
  })

  it('should update state after successful check', async () => {
    // Mock implementation for successful check
    vi.mocked(checkConnectorUrl).mockResolvedValue({ checked: true })

    const { result, waitForNextUpdate } = renderHook(() =>
      usePreFlightCheck('https://success.quiltt.app')
    )

    // Initial state
    expect(result.current).toEqual({ checked: false })

    // Wait for the effect to run
    await waitForNextUpdate()

    // Final state after successful check
    expect(result.current).toEqual({ checked: true })
  })

  it('should capture error from failed check', async () => {
    // Mock implementation for failed check
    vi.mocked(checkConnectorUrl).mockResolvedValue({ checked: true, error: 'Test error' })

    const { result, waitForNextUpdate } = renderHook(() =>
      usePreFlightCheck('https://error.quiltt.app')
    )

    // Initial state
    expect(result.current).toEqual({ checked: false })

    // Wait for the effect to run
    await waitForNextUpdate()

    // Final state with error
    expect(result.current).toEqual({ checked: true, error: 'Test error' })
  })
})
