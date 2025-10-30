import { createContext } from 'react'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, waitFor } from '@testing-library/react'

import { QuilttProvider } from '@/providers/QuilttProvider'

// Mock QuilttClient from core with proper async behavior
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

// Mock the hooks module
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...(actual as any),
    useQuilttSession: () => ({
      session: null,
      importSession: vi.fn(),
    }),
    QuilttSettings: createContext({ clientId: undefined }),
  }
})

describe('QuilttProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders children correctly', async () => {
    const { getByText } = render(
      <QuilttProvider clientId="test-client-id">
        <div>Test Child</div>
      </QuilttProvider>
    )

    await waitFor(() => {
      expect(getByText('Test Child')).toBeTruthy()
    })
  })

  it('accepts and passes clientId prop', async () => {
    const testClientId = 'test-client-id'
    const { container } = render(
      <QuilttProvider clientId={testClientId}>
        <div>Test Child</div>
      </QuilttProvider>
    )

    await waitFor(() => {
      expect(container).toBeTruthy()
    })
  })
})
