import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApolloClient, gql, HttpLink, InMemoryCache } from '@apollo/client'

import ErrorLink from '@/api/graphql/links/ErrorLink'

vi.mock('@/storage', () => ({
  GlobalStorage: {
    set: vi.fn(),
  },
}))

// Mock HttpLink as a simple example; in practice, you would adjust this based on your setup
vi.mock('@apollo/client', async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import('@apollo/client')>()),
    HttpLink: vi.fn(() => ({
      request: vi.fn(() => {
        throw new Error('Network error')
      }),
    })),
  }
})

describe('ErrorLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle network errors by invoking the ErrorLink correctly', async () => {
    vi.spyOn(console, 'warn')
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ErrorLink.concat(new HttpLink()), // HttpLink would normally handle HTTP requests
    })

    try {
      await client.query({
        query: gql`
          query Test {
            data
          }
        `,
      })
    } catch (_e) {
      // Expecting an error to be caught here
    }

    // Assuming network error handling prints a warning
    expect(vi.mocked(console.warn)).toHaveBeenCalled()
    // expect(vi.mocked(GlobalStorage.set)).toHaveBeenCalledWith('session', null)
  })
})
