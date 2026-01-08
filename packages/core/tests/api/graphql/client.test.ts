import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApolloClient, ApolloLink, gql } from '@apollo/client/core'
import { OperationTypeNode } from 'graphql'
import { Observable } from 'rxjs'

import { InMemoryCache, QuilttClient } from '@/api/graphql/client'
import { TerminatingLink } from '@/api/graphql/links/TerminatingLink'
import { GlobalStorage } from '@/storage'

vi.mock('@/storage', () => ({
  GlobalStorage: {
    get: vi.fn(),
    set: vi.fn(),
  },
}))

const createMockOperation = (
  query: any,
  context: Record<string, any> = {}
): ApolloLink.Operation => {
  const mockClient = new ApolloClient({
    cache: new InMemoryCache(),
    link: TerminatingLink,
  })
  return {
    query,
    variables: {},
    operationName: 'TestOperation',
    operationType: OperationTypeNode.QUERY,
    extensions: {},
    setContext: vi.fn(),
    getContext: () => context as any,
    client: mockClient,
  }
}

describe('QuilttClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock GlobalStorage to return a valid token for all tests
    vi.mocked(GlobalStorage.get).mockReturnValue('test-token-123')
  })

  it('should be instantiated with an InMemoryCache', () => {
    const client = new QuilttClient({ cache: new InMemoryCache() })
    expect(client.cache).toBeInstanceOf(InMemoryCache)
  })

  it('should configure links correctly', () => {
    const client = new QuilttClient({ cache: new InMemoryCache() })
    expect(client.link).toBeDefined()
    expect('split' in (client.link as ApolloLink)).toBe(true) // ApolloLink instance method
  })

  it('allows custom links to be provided', () => {
    const customLink = new ApolloLink((operation, forward) => {
      // Custom link logic - just pass through
      return forward(operation)
    })

    const client = new QuilttClient({ cache: new InMemoryCache(), customLinks: [customLink] })

    // @todo: test that the custom link is actually used in the link chain
    expect(client.link).toBeInstanceOf(ApolloLink)
  })

  it('should handle subscription operations', async () => {
    const client = new QuilttClient({ cache: new InMemoryCache() })

    const SUBSCRIPTION = gql`
      subscription OnDataUpdated {
        dataUpdated {
          id
          value
        }
      }
    `

    const observable = client.subscribe({ query: SUBSCRIPTION })

    expect(observable).toBeDefined()
  })

  it('should route queries through appropriate links based on operation type', () => {
    const client = new QuilttClient({ cache: new InMemoryCache() })

    const QUERY = gql`
      query GetData {
        data {
          id
        }
      }
    `

    const SUBSCRIPTION = gql`
      subscription OnDataUpdated {
        dataUpdated {
          id
        }
      }
    `

    const link = client.link as ApolloLink
    const mockForward = vi.fn((op) =>
      TerminatingLink.request(op, () => new Observable((observer) => observer.complete()))
    )

    const queryObs = link.request(createMockOperation(QUERY), mockForward)
    const subObs = link.request(createMockOperation(SUBSCRIPTION), mockForward)

    expect(queryObs).toBeDefined()
    expect(subObs).toBeDefined()
  })

  it('should handle batchable context in operations', () => {
    const client = new QuilttClient({ cache: new InMemoryCache() })

    const QUERY = gql`
      query GetData {
        data {
          id
        }
      }
    `

    const link = client.link as ApolloLink
    const mockForward = vi.fn((op) =>
      TerminatingLink.request(op, () => new Observable((observer) => observer.complete()))
    )

    const batchableObs = link.request(createMockOperation(QUERY, { batchable: true }), mockForward)
    const nonBatchableObs = link.request(
      createMockOperation(QUERY, { batchable: false }),
      mockForward
    )
    const defaultObs = link.request(createMockOperation(QUERY), mockForward)

    expect(batchableObs).toBeDefined()
    expect(nonBatchableObs).toBeDefined()
    expect(defaultObs).toBeDefined()
  })
})
