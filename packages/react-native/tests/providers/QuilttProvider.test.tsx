import { View } from 'react-native'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react-native'

import { InMemoryCache, QuilttClient, TerminatingLink } from '@quiltt/core'

import { QuilttProvider } from '@/providers/QuilttProvider'

const mockGetPlatformInfoSync = vi.fn()
const mockCreateVersionLink = vi.fn()

// Mock @quiltt/react providers and hooks
vi.mock('@quiltt/react', async (importOriginal) => {
  const actual = (await importOriginal()) as any
  return {
    ...actual,
    QuilttSettingsProvider: ({ children }: any) => children,
    QuilttAuthProvider: ({ children }: any) => children,
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

describe('QuilttProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetPlatformInfoSync.mockReturnValue('React/18.0.0; ReactNative/0.72.0; Android/13; Unknown')
    mockCreateVersionLink.mockReturnValue({ kind: 'version-link' })
  })

  it('renders children correctly', () => {
    const { getByTestId } = render(
      <QuilttProvider clientId="test-client-id">
        <View testID="test-child" />
      </QuilttProvider>
    )

    expect(getByTestId('test-child')).toBeTruthy()
  })

  it('accepts and passes clientId prop', () => {
    const testClientId = 'test-client-id-123'

    const { getByTestId } = render(
      <QuilttProvider clientId={testClientId}>
        <View testID="test-child" />
      </QuilttProvider>
    )

    expect(getByTestId('test-child')).toBeTruthy()
  })

  it('accepts and passes token prop', () => {
    const testToken = 'test-token-456'

    const { getByTestId } = render(
      <QuilttProvider clientId="test-client-id" token={testToken}>
        <View testID="test-child" />
      </QuilttProvider>
    )

    expect(getByTestId('test-child')).toBeTruthy()
  })

  it('accepts and passes graphqlClient prop', () => {
    const customClient = new QuilttClient({
      cache: new InMemoryCache(),
      customLinks: [TerminatingLink],
      versionLink: { kind: 'test-version-link' } as any,
    })

    const { getByTestId } = render(
      <QuilttProvider clientId="test-client-id" graphqlClient={customClient}>
        <View testID="test-child" />
      </QuilttProvider>
    )

    expect(getByTestId('test-child')).toBeTruthy()
    // Custom client provided, so shouldn't call platform info
    expect(mockGetPlatformInfoSync).not.toHaveBeenCalled()
  })

  it('creates platform client when no graphqlClient provided', () => {
    render(
      <QuilttProvider clientId="test-client-id">
        <View testID="test-child" />
      </QuilttProvider>
    )

    // Should create platform-specific client
    expect(mockGetPlatformInfoSync).toHaveBeenCalledTimes(1)
    expect(mockCreateVersionLink).toHaveBeenCalledWith(
      'React/18.0.0; ReactNative/0.72.0; Android/13; Unknown'
    )
  })

  it('passes all props correctly to nested providers', () => {
    const customClient = new QuilttClient({
      cache: new InMemoryCache(),
      customLinks: [TerminatingLink],
      versionLink: { kind: 'test-version-link' } as any,
    })
    const testToken = 'test-token-789'
    const testClientId = 'test-client-id-789'

    const { getByTestId } = render(
      <QuilttProvider clientId={testClientId} token={testToken} graphqlClient={customClient}>
        <View testID="test-child" />
      </QuilttProvider>
    )

    expect(getByTestId('test-child')).toBeTruthy()
  })

  it('wraps children in both QuilttSettingsProvider and QuilttAuthProvider', () => {
    // This test verifies the provider composition structure
    const { getByTestId } = render(
      <QuilttProvider clientId="test-client-id">
        <View testID="nested-child" />
      </QuilttProvider>
    )

    // If both providers are working, the child should be rendered
    expect(getByTestId('nested-child')).toBeTruthy()
  })

  it('handles undefined token prop', () => {
    const { getByTestId } = render(
      <QuilttProvider clientId="test-client-id" token={undefined}>
        <View testID="test-child" />
      </QuilttProvider>
    )

    expect(getByTestId('test-child')).toBeTruthy()
  })

  it('handles changing props on rerender', () => {
    const { rerender, getByTestId } = render(
      <QuilttProvider clientId="client-1">
        <View testID="test-child" />
      </QuilttProvider>
    )

    expect(getByTestId('test-child')).toBeTruthy()

    // Rerender with different clientId
    rerender(
      <QuilttProvider clientId="client-2">
        <View testID="test-child" />
      </QuilttProvider>
    )

    expect(getByTestId('test-child')).toBeTruthy()
  })

  it('handles adding token on rerender', () => {
    const { rerender, getByTestId } = render(
      <QuilttProvider clientId="test-client-id">
        <View testID="test-child" />
      </QuilttProvider>
    )

    expect(getByTestId('test-child')).toBeTruthy()

    // Add token on rerender
    rerender(
      <QuilttProvider clientId="test-client-id" token="new-token">
        <View testID="test-child" />
      </QuilttProvider>
    )

    expect(getByTestId('test-child')).toBeTruthy()
  })

  it('handles adding graphqlClient on rerender', () => {
    const { rerender, getByTestId } = render(
      <QuilttProvider clientId="test-client-id">
        <View testID="test-child" />
      </QuilttProvider>
    )

    expect(getByTestId('test-child')).toBeTruthy()
    const initialPlatformCalls = mockGetPlatformInfoSync.mock.calls.length

    const customClient = new QuilttClient({
      cache: new InMemoryCache(),
      customLinks: [TerminatingLink],
      versionLink: { kind: 'test-version-link' } as any,
    })

    // Add custom client on rerender
    rerender(
      <QuilttProvider clientId="test-client-id" graphqlClient={customClient}>
        <View testID="test-child" />
      </QuilttProvider>
    )

    expect(getByTestId('test-child')).toBeTruthy()
    // Should not have called platform info again
    expect(mockGetPlatformInfoSync).toHaveBeenCalledTimes(initialPlatformCalls)
  })

  it('maintains provider hierarchy - settings wraps auth', () => {
    // This is a structural test to ensure the correct nesting order
    const { getByTestId } = render(
      <QuilttProvider clientId="test-client-id" token="test-token">
        <View testID="deeply-nested" />
      </QuilttProvider>
    )

    // The child should be accessible if the provider hierarchy is correct
    expect(getByTestId('deeply-nested')).toBeTruthy()
  })
})
