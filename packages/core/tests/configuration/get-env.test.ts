import { describe, it, expect, vi } from 'vitest'
import { getEnv } from '@/configuration'

describe('getEnv', () => {
  it('should return the correct environment variable from process.env', () => {
    vi.stubGlobal('process', {
      env: {
        TEST_VAR: '123',
      },
    })

    const result = getEnv('TEST_VAR')
    expect(result).toBe(123)
  })

  it('should return the fallback value if the environment variable is not set', () => {
    const result = getEnv('NON_EXISTENT_VAR', 'default')
    expect(result).toBe('default')
  })

  it('should correctly convert boolean environment variables', () => {
    vi.stubGlobal('process', {
      env: {
        BOOL_VAR: 'true',
      },
    })

    const result = getEnv('BOOL_VAR')
    expect(result).toBe(true)
  })

  it('should correctly convert numeric environment variables', () => {
    vi.stubGlobal('process', {
      env: {
        NUM_VAR: '42',
      },
    })

    const result = getEnv('NUM_VAR')
    expect(result).toBe(42)
  })

  it('should return a non-numeric, non-boolean string as is', () => {
    vi.stubGlobal('process', {
      env: {
        STRING_VAR: 'HelloWorld',
      },
    })

    const result = getEnv('STRING_VAR')
    expect(result).toBe('HelloWorld')
  })

  // Example to test Vite's import.meta.env if needed
  describe('getEnv with injected environment', () => {
    it('should return the correct environment variable from an injected env source', () => {
      const mockEnv = {
        VITE_TEST_VAR: 'abc',
      }

      const result = getEnv('TEST_VAR', mockEnv.VITE_TEST_VAR)
      expect(result).toBe('abc')
    })
  })
})
