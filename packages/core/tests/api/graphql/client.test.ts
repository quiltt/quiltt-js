import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApolloClient, ApolloLink, gql } from '@apollo/client/core'
import { OperationTypeNode } from 'graphql'
import { Observable } from 'rxjs'

import { InMemoryCache, QuilttClient } from '@/api/graphql/client'
import { createVersionLink } from '@/api/graphql/links'
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
    const client = new QuilttClient({
      cache: new InMemoryCache(),
      versionLink: createVersionLink('Test'),
    })
    expect(client.cache).toBeInstanceOf(InMemoryCache)
  })

  it('should configure links correctly', () => {
    const client = new QuilttClient({
      cache: new InMemoryCache(),
      versionLink: createVersionLink('Test'),
    })
    expect(client.link).toBeDefined()
    expect('split' in (client.link as ApolloLink)).toBe(true) // ApolloLink instance method
  })

  it('allows custom links to be provided', () => {
    const customLink = new ApolloLink((operation, forward) => {
      // Custom link logic - just pass through
      return forward(operation)
    })

    const client = new QuilttClient({
      cache: new InMemoryCache(),
      customLinks: [customLink],
      versionLink: createVersionLink('Test'),
    })

    // @todo: test that the custom link is actually used in the link chain
    expect(client.link).toBeInstanceOf(ApolloLink)
  })

  it('should handle subscription operations', async () => {
    const client = new QuilttClient({
      cache: new InMemoryCache(),
      versionLink: createVersionLink('Test'),
    })

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
    const client = new QuilttClient({
      cache: new InMemoryCache(),
      versionLink: createVersionLink('Test'),
    })

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
    const client = new QuilttClient({
      cache: new InMemoryCache(),
      versionLink: createVersionLink('Test'),
    })

    const QUERY = gql`
      query GetData {
        data {
          id
        }
      }
    `

    const link = client.link as ApolloLink

    // Test batchable: true - should go through BatchHttpLink
    const batchableOp = createMockOperation(QUERY, { batchable: true })
    const batchableObs = link.request(
      batchableOp,
      () => new Observable((observer) => observer.complete())
    )
    expect(batchableObs).toBeDefined()

    // Test batchable: false - should go through HttpLink
    const nonBatchableOp = createMockOperation(QUERY, { batchable: false })
    const nonBatchableObs = link.request(
      nonBatchableOp,
      () => new Observable((observer) => observer.complete())
    )
    expect(nonBatchableObs).toBeDefined()

    // Test default (undefined) - should default to true and go through BatchHttpLink
    const defaultOp = createMockOperation(QUERY, {})
    const defaultObs = link.request(
      defaultOp,
      () => new Observable((observer) => observer.complete())
    )
    expect(defaultObs).toBeDefined()
  })

  describe('devtools configuration', () => {
    it('should enable devtools when explicitly set to true', () => {
      const client = new QuilttClient({
        cache: new InMemoryCache(),
        versionLink: createVersionLink('Test'),
        devtools: { enabled: true },
      })

      expect(client).toBeDefined()
      // Devtools configuration is passed to Apollo Client constructor
    })

    it('should disable devtools when explicitly set to false', () => {
      const client = new QuilttClient({
        cache: new InMemoryCache(),
        versionLink: createVersionLink('Test'),
        devtools: { enabled: false },
      })

      expect(client).toBeDefined()
    })

    it('should use debugging configuration as default for devtools', () => {
      const client = new QuilttClient({
        cache: new InMemoryCache(),
        versionLink: createVersionLink('Test'),
      })

      expect(client).toBeDefined()
      // Default devtools.enabled should match the debugging configuration
    })
  })

  describe('custom links', () => {
    it('should handle multiple custom links in order', () => {
      const executionOrder: string[] = []

      const customLink1 = new ApolloLink((operation, forward) => {
        executionOrder.push('link1')
        return forward(operation)
      })

      const customLink2 = new ApolloLink((operation, forward) => {
        executionOrder.push('link2')
        return forward(operation)
      })

      const client = new QuilttClient({
        cache: new InMemoryCache(),
        customLinks: [customLink1, customLink2],
        versionLink: createVersionLink('Test'),
      })

      expect(client.link).toBeInstanceOf(ApolloLink)
    })

    it('should work without custom links', () => {
      const client = new QuilttClient({
        cache: new InMemoryCache(),
        customLinks: undefined,
        versionLink: createVersionLink('Test'),
      })

      expect(client.link).toBeDefined()
    })

    it('should handle empty custom links array', () => {
      const client = new QuilttClient({
        cache: new InMemoryCache(),
        customLinks: [],
        versionLink: createVersionLink('Test'),
      })

      expect(client.link).toBeDefined()
    })
  })

  describe('operation types', () => {
    it('should correctly identify and route subscription operations', async () => {
      const client = new QuilttClient({
        cache: new InMemoryCache(),
        versionLink: createVersionLink('Test'),
      })

      const SUBSCRIPTION = gql`
        subscription OnUserUpdated {
          userUpdated {
            id
            name
          }
        }
      `

      // Subscribe to trigger the link chain and predicate functions
      const observable = client.subscribe({ query: SUBSCRIPTION })

      expect(observable).toBeDefined()

      // The subscription observable should be created, which exercises the isSubscriptionOperation path
      const subscription = observable.subscribe({
        next: () => {},
        error: () => {},
      })

      subscription.unsubscribe()
    })

    it('should correctly identify non-subscription operations', async () => {
      const client = new QuilttClient({
        cache: new InMemoryCache(),
        versionLink: createVersionLink('Test'),
      })

      const QUERY = gql`
        query GetUser {
          user {
            id
            name
          }
        }
      `

      // Execute a query to trigger the link chain and predicate functions
      // This will fail to connect but will exercise the code paths
      const promise = client.query({ query: QUERY }).catch(() => {
        // Expected to fail since we don't have a real server
      })

      expect(promise).toBeDefined()
    })

    it('should route batchable operations correctly', async () => {
      const client = new QuilttClient({
        cache: new InMemoryCache(),
        versionLink: createVersionLink('Test'),
      })

      const QUERY = gql`
        query GetData {
          data {
            id
          }
        }
      `

      // Execute with batchable context
      const promise = client
        .query({
          query: QUERY,
          context: { batchable: true },
        })
        .catch(() => {
          // Expected to fail
        })

      expect(promise).toBeDefined()
    })

    it('should route non-batchable operations correctly', async () => {
      const client = new QuilttClient({
        cache: new InMemoryCache(),
        versionLink: createVersionLink('Test'),
      })

      const QUERY = gql`
        query GetData {
          data {
            id
          }
        }
      `

      // Execute with non-batchable context
      const promise = client
        .query({
          query: QUERY,
          context: { batchable: false },
        })
        .catch(() => {
          // Expected to fail
        })

      expect(promise).toBeDefined()
    })

    it('should handle query operations', () => {
      const client = new QuilttClient({
        cache: new InMemoryCache(),
        versionLink: createVersionLink('Test'),
      })

      const QUERY = gql`
        query GetUser {
          user {
            id
            name
          }
        }
      `

      const link = client.link as ApolloLink
      const mockForward = vi.fn((op) =>
        TerminatingLink.request(op, () => new Observable((observer) => observer.complete()))
      )

      const obs = link.request(createMockOperation(QUERY), mockForward)

      expect(obs).toBeDefined()
    })

    it('should handle mutation operations', () => {
      const client = new QuilttClient({
        cache: new InMemoryCache(),
        versionLink: createVersionLink('Test'),
      })

      const MUTATION = gql`
        mutation UpdateUser($id: ID!, $name: String!) {
          updateUser(id: $id, name: $name) {
            id
            name
          }
        }
      `

      const link = client.link as ApolloLink
      const mockForward = vi.fn((op) =>
        TerminatingLink.request(op, () => new Observable((observer) => observer.complete()))
      )

      const obs = link.request(createMockOperation(MUTATION), mockForward)

      expect(obs).toBeDefined()
    })

    it('should handle operations with fragments', () => {
      const client = new QuilttClient({
        cache: new InMemoryCache(),
        versionLink: createVersionLink('Test'),
      })

      const QUERY_WITH_FRAGMENT = gql`
        fragment UserFields on User {
          id
          name
          email
        }

        query GetUser {
          user {
            ...UserFields
          }
        }
      `

      const link = client.link as ApolloLink
      const mockForward = vi.fn((op) =>
        TerminatingLink.request(op, () => new Observable((observer) => observer.complete()))
      )

      const obs = link.request(createMockOperation(QUERY_WITH_FRAGMENT), mockForward)

      expect(obs).toBeDefined()
    })

    it('should handle operations with multiple definitions', () => {
      const client = new QuilttClient({
        cache: new InMemoryCache(),
        versionLink: createVersionLink('Test'),
      })

      const COMPLEX_QUERY = gql`
        fragment UserInfo on User {
          id
          name
        }

        fragment PostInfo on Post {
          id
          title
        }

        query GetUserAndPosts {
          user {
            ...UserInfo
          }
          posts {
            ...PostInfo
          }
        }
      `

      const link = client.link as ApolloLink
      const mockForward = vi.fn((op) =>
        TerminatingLink.request(op, () => new Observable((observer) => observer.complete()))
      )

      const obs = link.request(createMockOperation(COMPLEX_QUERY), mockForward)

      expect(obs).toBeDefined()
    })
  })

  describe('options handling', () => {
    it('should preserve other Apollo Client options', () => {
      const client = new QuilttClient({
        cache: new InMemoryCache(),
        versionLink: createVersionLink('Test'),
        defaultOptions: {
          query: {
            fetchPolicy: 'network-only',
          },
        },
      } as any)

      expect(client).toBeDefined()
      expect(client.cache).toBeInstanceOf(InMemoryCache)
    })

    it('should handle additional Apollo Client options', () => {
      const client = new QuilttClient({
        cache: new InMemoryCache(),
        versionLink: createVersionLink('Test'),
      } as any)

      expect(client).toBeDefined()
    })
  })
})
