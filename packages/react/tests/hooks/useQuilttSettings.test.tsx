import type { PropsWithChildren } from 'react'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

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

  it('returns the context value', () => {
    const expectedClientId = 'test-client-id'

    const Wrapper = ({ children }: PropsWithChildren) => (
      <QuilttSettingsProvider clientId={expectedClientId}>{children}</QuilttSettingsProvider>
    )

    const { result } = renderHook(() => useQuilttSettings(), {
      wrapper: Wrapper,
    })

    expect(result.current.clientId).toBe(expectedClientId)
  })
})
