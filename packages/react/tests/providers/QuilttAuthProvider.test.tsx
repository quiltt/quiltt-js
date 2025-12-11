import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'

import { InMemoryCache, QuilttClient, TerminatingLink } from '@quiltt/core'

import { QuilttAuthProvider } from '@/providers/QuilttAuthProvider'

// Create a mock function outside to track calls
const mockImportSession = vi.fn()

// Mock the useQuilttSession hook
vi.mock('@/hooks', () => ({
  useQuilttSession: () => ({
    session: {}, // Provide a mock session object instead of null
    importSession: mockImportSession,
  }),
}))

// Mock the utils
vi.mock('@/utils', () => ({
  isDeepEqual: vi.fn().mockReturnValue(true),
}))

// Add mocks for Apollo Client
vi.mock('@apollo/client/react/context/ApolloProvider.js', () => ({
  ApolloProvider: ({ children }: any) => children,
}))

vi.mock('@quiltt/core', () => {
  class MockQuilttClient {
    resetStore = vi.fn()
  }
  class MockInMemoryCache {}
  class MockTerminatingLink {}

  return {
    QuilttClient: MockQuilttClient,
    InMemoryCache: MockInMemoryCache,
    TerminatingLink: MockTerminatingLink,
  }
})

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

  it('handles graphqlClient prop correctly', () => {
    const customClient = new QuilttClient({
      customLinks: [TerminatingLink],
      cache: new InMemoryCache(),
    })
    render(
      <QuilttAuthProvider graphqlClient={customClient}>
        <div>Test Child</div>
      </QuilttAuthProvider>
    )
  })

  it('handles token prop correctly', () => {
    const testToken = 'test-token'
    render(
      <QuilttAuthProvider token={testToken}>
        <div>Test Child</div>
      </QuilttAuthProvider>
    )
  })

  it('only calls importSession when token value changes, not when reference changes', () => {
    const token = 'test-token-123'

    // Initial render with token
    const { rerender } = render(
      <QuilttAuthProvider token={token}>
        <div>Test Child</div>
      </QuilttAuthProvider>
    )

    expect(mockImportSession).toHaveBeenCalledTimes(1)
    expect(mockImportSession).toHaveBeenCalledWith(token)

    // Rerender with same token value but new string instance
    rerender(
      <QuilttAuthProvider token={'test-token-123'}>
        <div>Test Child</div>
      </QuilttAuthProvider>
    )

    // Should NOT call importSession again since value is the same
    expect(mockImportSession).toHaveBeenCalledTimes(1)

    // Rerender with different token value
    rerender(
      <QuilttAuthProvider token="different-token">
        <div>Test Child</div>
      </QuilttAuthProvider>
    )

    // Should call importSession with new token
    expect(mockImportSession).toHaveBeenCalledTimes(2)
    expect(mockImportSession).toHaveBeenCalledWith('different-token')
  })

  it('allows re-importing same token after it becomes undefined', () => {
    const token = 'test-token-123'

    // Initial render with token
    const { rerender } = render(
      <QuilttAuthProvider token={token}>
        <div>Test Child</div>
      </QuilttAuthProvider>
    )

    expect(mockImportSession).toHaveBeenCalledTimes(1)
    expect(mockImportSession).toHaveBeenCalledWith(token)

    // Clear token (simulate logout or session end)
    rerender(
      <QuilttAuthProvider token={undefined}>
        <div>Test Child</div>
      </QuilttAuthProvider>
    )

    // importSession shouldn't be called with undefined
    expect(mockImportSession).toHaveBeenCalledTimes(1)

    // Re-import the same token (simulate re-login)
    rerender(
      <QuilttAuthProvider token={token}>
        <div>Test Child</div>
      </QuilttAuthProvider>
    )

    // Should call importSession again since ref was reset when token became undefined
    expect(mockImportSession).toHaveBeenCalledTimes(2)
    expect(mockImportSession).toHaveBeenCalledWith(token)
  })
})
