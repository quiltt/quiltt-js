import { renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { describe, expect, it } from 'vitest'

import { useQuilttSettings } from '@/hooks/useQuilttSettings'
import { QuilttSettingsProvider } from '@/providers/QuilttSettingsProvider'

describe('useQuilttSettings', () => {
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
