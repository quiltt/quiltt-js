import type { PropsWithChildren } from 'react'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, renderHook, waitFor } from '@testing-library/react'

import { useQuilttSettings } from '@/hooks/useQuilttSettings'
import { QuilttSettingsProvider } from '@/providers/QuilttSettingsProvider'

// Mock QuilttClient from core
vi.mock('@quiltt/core', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...(actual as any),
    QuilttClient: vi.fn().mockImplementation(() => ({
      apolloClient: {
        resetStore: vi.fn().mockResolvedValue(undefined),
        clearStore: vi.fn().mockResolvedValue(undefined),
        stop: vi.fn(),
        cache: {
          reset: vi.fn(),
        },
      },
    })),
  }
})

describe('useQuilttSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('returns the context value', async () => {
    const expectedClientId = 'test-client-id'

    const Wrapper = ({ children }: PropsWithChildren) => (
      <QuilttSettingsProvider clientId={expectedClientId}>{children}</QuilttSettingsProvider>
    )

    const { result } = renderHook(() => useQuilttSettings(), {
      wrapper: Wrapper,
    })

    await waitFor(() => {
      expect(result.current.clientId).toBe(expectedClientId)
    })
  })
})
