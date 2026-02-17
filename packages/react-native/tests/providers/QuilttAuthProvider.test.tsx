import { View } from 'react-native'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react-native'

import { InMemoryCache, QuilttClient, TerminatingLink } from '@quiltt/core'

import { QuilttAuthProvider } from '@/providers/QuilttAuthProvider'

// Create a mock function to track calls
const mockImportSession = vi.fn()
const mockGetPlatformInfoSync = vi.fn()
const mockCreateVersionLink = vi.fn()

// Mock the @quiltt/react hooks
vi.mock('@quiltt/react', async (importOriginal) => {
  const actual = (await importOriginal()) as any
  return {
    ...actual,
    QuilttAuthProvider: ({ children }: any) => children,
    useQuilttSession: () => ({
      session: {},
      importSession: mockImportSession,
    }),
  }
})

// Mock the telemetry utils
vi.mock('@/utils/telemetry', () => ({
  getPlatformInfoSync: () => mockGetPlatformInfoSync(),
}))

// Mock @quiltt/core
vi.mock('@quiltt/core', async (importOriginal) => {
  const actual = (await importOriginal()) as any

  class MockQuilttClient {
    cache: any
    versionLink: any
    constructor({ cache, versionLink }: any) {
      this.cache = cache
      this.versionLink = versionLink
    }
    resetStore = vi.fn()
  }

  class MockInMemoryCache {}

  return {
    ...actual,
    QuilttClient: MockQuilttClient,
    InMemoryCache: MockInMemoryCache,
    TerminatingLink: class MockTerminatingLink {},
    createVersionLink: (platformInfo: string) => mockCreateVersionLink(platformInfo),
  }
})

describe('QuilttAuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetPlatformInfoSync.mockReturnValue('React/18.0.0; ReactNative/0.72.0; iOS/16.0; Unknown')
    mockCreateVersionLink.mockReturnValue({ kind: 'version-link' })
  })

  it('renders children correctly', () => {
    const { getByTestId } = render(
      <QuilttAuthProvider>
        <View testID="test-child" />
      </QuilttAuthProvider>
    )

    expect(getByTestId('test-child')).toBeTruthy()
  })

  it('uses custom graphqlClient when provided', () => {
    const customClient = new QuilttClient({
      cache: new InMemoryCache(),
      customLinks: [TerminatingLink],
      versionLink: { kind: 'test-version-link' } as any,
    })

    render(
      <QuilttAuthProvider graphqlClient={customClient}>
        <View testID="test-child" />
      </QuilttAuthProvider>
    )

    // Should not call getPlatformInfoSync when custom client is provided
    expect(mockGetPlatformInfoSync).not.toHaveBeenCalled()
    expect(mockCreateVersionLink).not.toHaveBeenCalled()
  })

  it('creates platform-specific client when no custom client provided', () => {
    render(
      <QuilttAuthProvider>
        <View testID="test-child" />
      </QuilttAuthProvider>
    )

    // Should call getPlatformInfoSync to get platform information
    expect(mockGetPlatformInfoSync).toHaveBeenCalledTimes(1)
    expect(mockCreateVersionLink).toHaveBeenCalledWith(
      'React/18.0.0; ReactNative/0.72.0; iOS/16.0; Unknown'
    )
  })

  it('handles token prop correctly', () => {
    const testToken = 'test-token-123'

    render(
      <QuilttAuthProvider token={testToken}>
        <View testID="test-child" />
      </QuilttAuthProvider>
    )

    expect(mockGetPlatformInfoSync).toHaveBeenCalledTimes(1)
  })

  it('does not recreate client on rerender when no custom client provided', () => {
    const { rerender } = render(
      <QuilttAuthProvider>
        <View testID="test-child" />
      </QuilttAuthProvider>
    )

    expect(mockGetPlatformInfoSync).toHaveBeenCalledTimes(1)
    expect(mockCreateVersionLink).toHaveBeenCalledTimes(1)

    // Rerender with different token
    rerender(
      <QuilttAuthProvider token="new-token">
        <View testID="test-child" />
      </QuilttAuthProvider>
    )

    // Should not recreate client on rerender (useMemo should prevent this)
    expect(mockGetPlatformInfoSync).toHaveBeenCalledTimes(1)
    expect(mockCreateVersionLink).toHaveBeenCalledTimes(1)
  })

  it('creates new client when graphqlClient prop changes', () => {
    const customClient1 = new QuilttClient({
      cache: new InMemoryCache(),
      customLinks: [TerminatingLink],
      versionLink: { kind: 'test-version-link-1' } as any,
    })

    const { rerender } = render(
      <QuilttAuthProvider graphqlClient={customClient1}>
        <View testID="test-child" />
      </QuilttAuthProvider>
    )

    expect(mockGetPlatformInfoSync).not.toHaveBeenCalled()

    const customClient2 = new QuilttClient({
      cache: new InMemoryCache(),
      customLinks: [TerminatingLink],
      versionLink: { kind: 'test-version-link-2' } as any,
    })

    // Rerender with different custom client
    rerender(
      <QuilttAuthProvider graphqlClient={customClient2}>
        <View testID="test-child" />
      </QuilttAuthProvider>
    )

    // Should still not call getPlatformInfoSync
    expect(mockGetPlatformInfoSync).not.toHaveBeenCalled()
  })

  it('switches from custom client to platform client', () => {
    const customClient = new QuilttClient({
      cache: new InMemoryCache(),
      customLinks: [TerminatingLink],
      versionLink: { kind: 'test-version-link' } as any,
    })

    const { rerender } = render(
      <QuilttAuthProvider graphqlClient={customClient}>
        <View testID="test-child" />
      </QuilttAuthProvider>
    )

    expect(mockGetPlatformInfoSync).not.toHaveBeenCalled()

    // Rerender without custom client
    rerender(
      <QuilttAuthProvider>
        <View testID="test-child" />
      </QuilttAuthProvider>
    )

    // Should now call getPlatformInfoSync
    expect(mockGetPlatformInfoSync).toHaveBeenCalledTimes(1)
    expect(mockCreateVersionLink).toHaveBeenCalledTimes(1)
  })

  it('passes both token and graphqlClient to underlying provider', () => {
    const customClient = new QuilttClient({
      cache: new InMemoryCache(),
      customLinks: [TerminatingLink],
      versionLink: { kind: 'test-version-link' } as any,
    })
    const testToken = 'test-token-456'

    render(
      <QuilttAuthProvider graphqlClient={customClient} token={testToken}>
        <View testID="test-child" />
      </QuilttAuthProvider>
    )

    expect(mockGetPlatformInfoSync).not.toHaveBeenCalled()
  })

  it('creates client with InMemoryCache and version link', () => {
    render(
      <QuilttAuthProvider>
        <View testID="test-child" />
      </QuilttAuthProvider>
    )

    expect(mockCreateVersionLink).toHaveBeenCalledWith(
      'React/18.0.0; ReactNative/0.72.0; iOS/16.0; Unknown'
    )
  })
})
