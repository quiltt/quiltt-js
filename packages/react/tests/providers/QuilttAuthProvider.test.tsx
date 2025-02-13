import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { QuilttAuthProvider } from '@/providers/QuilttAuthProvider'

// Mock the useQuilttSession hook
vi.mock('@/hooks', () => ({
  useQuilttSession: () => ({
    session: {}, // Provide a mock session object instead of null
    importSession: vi.fn(),
  }),
  isDeepEqual: vi.fn().mockReturnValue(true), // Add this if needed
}))

// Add mocks for Apollo Client
vi.mock('@apollo/client/react/context/ApolloProvider.js', () => ({
  ApolloProvider: ({ children }: any) => children,
}))

vi.mock('@quiltt/core', () => ({
  QuilttClient: vi.fn().mockImplementation(() => ({
    resetStore: vi.fn(),
  })),
  InMemoryCache: vi.fn(),
}))

describe('QuilttAuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children correctly', () => {
    const { getByText } = render(
      <QuilttAuthProvider>
        <div>Test Child</div>
      </QuilttAuthProvider>
    )

    expect(getByText('Test Child')).toBeTruthy()
  })

  it('handles token prop correctly', () => {
    const testToken = 'test-token'
    render(
      <QuilttAuthProvider token={testToken}>
        <div>Test Child</div>
      </QuilttAuthProvider>
    )
  })
})
