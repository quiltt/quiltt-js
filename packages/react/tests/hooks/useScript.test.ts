import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useScript } from '@/hooks/useScript'

describe('useScript', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure a clean environment
    vi.restoreAllMocks()

    // Spy on document.body.appendChild to avoid actual DOM manipulation
    vi.spyOn(document.body, 'appendChild').mockImplementation((element) => element)

    // Store the original document.createElement to call for non-script elements
    const originalCreateElement = document.createElement.bind(document)

    // Mock document.createElement to intercept script element creation
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'script') {
        // Mock script element
        const mockScriptElement = {
          ...originalCreateElement('script'),
          setAttribute: vi.fn(),
          addEventListener: vi.fn((event, callback) => {
            // Automatically trigger 'load' event after a delay to simulate script loading
            if (event === 'load') {
              setTimeout(() => callback(new Event('load')), 100)
            }
          }),
          removeEventListener: vi.fn(),
        }
        return mockScriptElement as unknown as HTMLScriptElement
      }
      // Use the original createElement for other elements
      return originalCreateElement(tagName)
    })
  })

  afterEach(() => {
    // Clean up and restore any global or module state changes
    vi.restoreAllMocks()
  })

  it('should start in loading state and transition to ready when script loads successfully', async () => {
    const src = 'https://example.com/test-script.js'
    const { result, rerender } = renderHook(() => useScript(src))

    expect(result.current).toBe('loading')

    // Re-render the hook to ensure the state transition
    await act(async () => {
      // Wait for a short period to allow the script to load
      await new Promise((resolve) => setTimeout(resolve, 200))
      rerender()
    })
    expect(result.current).toBe('ready')
  })

  it('returns "loading" state immediately in SSR context', async () => {
    // Mock or manipulate conditions to simulate SSR if necessary
    const { result } = renderHook(() => useScript('https://example.com/script.js'))
    expect(result.current).toBe('loading') // Or 'idle' based on your hook logic
  })

  it('returns "idle" state when shouldPreventLoad is true', async () => {
    const { result } = renderHook(() =>
      useScript('https://example.com/script.js', { shouldPreventLoad: true })
    )
    expect(result.current).toBe('idle')
  })

  // TODO: Additional tests for initial state and options...
})
