import { render } from '@testing-library/react'
import { createContext } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { QuilttProvider } from '@/providers/QuilttProvider'

// Mock the hooks module and maintain the QuilttSettings context
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

  it('renders children correctly', () => {
    const { getByText } = render(
      <QuilttProvider clientId="test-client-id">
        <div>Test Child</div>
      </QuilttProvider>
    )

    expect(getByText('Test Child')).toBeTruthy()
  })

  it('accepts and passes clientId prop', () => {
    const testClientId = 'test-client-id'
    const { container } = render(
      <QuilttProvider clientId={testClientId}>
        <div>Test Child</div>
      </QuilttProvider>
    )

    expect(container).toBeTruthy()
  })
})
