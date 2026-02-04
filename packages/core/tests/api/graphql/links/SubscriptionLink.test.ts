import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type ApolloLink, gql } from '@apollo/client/core'
import { Observable } from 'rxjs'

import SubscriptionLink from '@/api/graphql/links/SubscriptionLink'
import { GlobalStorage } from '@/storage'

vi.mock('@/storage', () => ({
  GlobalStorage: {
    get: vi.fn(() => null as string | null),
    set: vi.fn(),
  },
}))

vi.mock('@/JsonWebToken', () => ({
  JsonWebTokenParse: vi.fn(),
}))

vi.mock('graphql', () => {
  // Create a custom GraphQLError class for testing
  class MockGraphQLError extends Error {
    extensions?: Record<string, any>
    constructor(message: string, options?: { extensions?: Record<string, any> }) {
      super(message)
      this.name = 'GraphQLError'
      if (options?.extensions) {
        this.extensions = options.extensions
      }
    }
  }

  return {
    GraphQLError: MockGraphQLError,
    print: vi.fn().mockReturnValue('printed query'),
  }
})

vi.mock('@rails/actioncable', () => ({
  createConsumer: vi.fn(),
}))

describe('SubscriptionLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should extend ActionCableLink properly', () => {
    const link = new SubscriptionLink()
    expect(link).toBeInstanceOf(SubscriptionLink)
    expect(link.request).toBeInstanceOf(Function)
  })

  it('should emit GraphQLError if no token is available', async () => {
    vi.mocked(GlobalStorage.get).mockReturnValue(null)
    const link = new SubscriptionLink()
    const dummyNextLink = (_operation: ApolloLink.Operation) =>
      new Observable<ApolloLink.Result>((subscriber) => {
        subscriber.next({})
        subscriber.complete()
      })
    const mockQuery = gql`
      subscription TestSubscription {
        mockField
      }
    `
    const operation = { query: mockQuery } as ApolloLink.Operation
    const observable = link.request(operation, dummyNextLink)

    await new Promise<void>((resolve, reject) => {
      observable.subscribe({
        error: (error) => {
          try {
            expect(error.name).toBe('GraphQLError')
            expect(error.message).toBe('No session token available for subscription')
            expect(error.extensions?.code).toBe('UNAUTHENTICATED')
            expect(error.extensions?.reason).toBe('NO_TOKEN')
            expect(GlobalStorage.get).toHaveBeenCalledWith('session')
            resolve()
          } catch (e) {
            reject(e)
          }
        },
      })
    })
  })

  it('should emit GraphQLError and clear storage when token is expired', async () => {
    const { JsonWebTokenParse } = await import('@/JsonWebToken')
    const mockToken = 'expired.token.here'
    const expiredTimestamp = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago

    vi.mocked(GlobalStorage.get).mockReturnValue(mockToken)
    vi.mocked(JsonWebTokenParse).mockReturnValue({
      token: mockToken,
      claims: {
        exp: expiredTimestamp,
        iat: expiredTimestamp - 7200,
        iss: 'test',
        sub: 'test',
        aud: 'test',
        nbf: expiredTimestamp - 7200,
        jti: 'test',
        oid: 'test',
        eid: 'test',
        cid: 'test',
        aid: 'test',
        ver: 1,
        rol: 'manager',
      } as any,
    })

    const link = new SubscriptionLink()
    const mockQuery = gql`
      subscription TestSubscription {
        mockField
      }
    `
    const operation = {
      query: mockQuery,
      variables: {},
      operationName: 'TestSubscription',
    } as ApolloLink.Operation

    const dummyNextLink = (_operation: ApolloLink.Operation) =>
      new Observable<ApolloLink.Result>((subscriber) => {
        subscriber.next({})
        subscriber.complete()
      })

    const observable = link.request(operation, dummyNextLink)

    await new Promise<void>((resolve, reject) => {
      observable.subscribe({
        error: (error) => {
          try {
            expect(error.name).toBe('GraphQLError')
            expect(error.message).toBe('Session token has expired')
            expect(error.extensions?.code).toBe('UNAUTHENTICATED')
            expect(error.extensions?.reason).toBe('TOKEN_EXPIRED')
            expect(error.extensions?.expiredAt).toBe(expiredTimestamp)
            expect(GlobalStorage.set).toHaveBeenCalledWith('session', null)
            resolve()
          } catch (e) {
            reject(e)
          }
        },
      })
    })
  })
})
