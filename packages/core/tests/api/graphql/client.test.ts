import { describe, expect, it } from 'vitest'

import type { Operation } from '@apollo/client/core'
import { ApolloLink, gql } from '@apollo/client/core'

import { InMemoryCache, QuilttClient } from '@/api/graphql/client'
import { createVersionLink } from '@/api/graphql/links'

const createMockOperation = (query: any, context: Record<string, any> = {}): Operation => ({
  query,
  variables: {},
  operationName: 'TestOperation',
  extensions: {},
  setContext: () => {},
  getContext: () => context,
})

describe('QuilttClient', () => {
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
      // Custom link logic (no-op for this test)
      return forward ? forward(operation) : null
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

    const queryObs = link.request(createMockOperation(QUERY))
    const subObs = link.request(createMockOperation(SUBSCRIPTION))

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

    const batchableObs = link.request(createMockOperation(QUERY, { batchable: true }))
    const nonBatchableObs = link.request(createMockOperation(QUERY, { batchable: false }))
    const defaultObs = link.request(createMockOperation(QUERY))

    expect(batchableObs).toBeDefined()
    expect(nonBatchableObs).toBeDefined()
    expect(defaultObs).toBeDefined()
  })
})
