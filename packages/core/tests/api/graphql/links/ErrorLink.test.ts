import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ServerError } from '@apollo/client/core'
import { ApolloClient, ApolloLink, gql, InMemoryCache, Observable } from '@apollo/client/core'

import ErrorLink from '@/api/graphql/links/ErrorLink'
import { GlobalStorage } from '@/storage'

vi.mock('@/storage', () => ({
  GlobalStorage: {
    set: vi.fn(),
    get: vi.fn(),
  },
}))

describe('ErrorLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should log GraphQL errors', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const mockLink = new ApolloLink(() => {
      return new Observable((observer) => {
        observer.next({
          errors: [
            {
              message: 'Field error',
              locations: [{ line: 1, column: 2 }],
              path: ['user', 'name'],
            },
          ],
        })
        observer.complete()
      })
    })

    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ErrorLink.concat(mockLink),
    })

    try {
      await client.query({
        query: gql`
          query Test {
            user {
              name
            }
          }
        `,
      })
    } catch (_e) {
      // Expected to throw due to GraphQL errors
    }

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('[GraphQL error]: Message: Field error')
    )
    consoleLogSpy.mockRestore()
  })

  it('should handle 401 network errors and clear session', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const error: ServerError = {
      name: 'ServerError',
      message: 'Unauthorized',
      statusCode: 401,
      result: {},
      response: {} as Response,
    }

    const mockLink = new ApolloLink(() => {
      return new Observable((observer) => {
        observer.error(error)
      })
    })

    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ErrorLink.concat(mockLink),
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
      // Expected to throw
    }

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[Authentication error]:',
      expect.objectContaining({ statusCode: 401 })
    )
    expect(GlobalStorage.set).toHaveBeenCalledWith('session', null)
    consoleWarnSpy.mockRestore()
  })

  it('should handle non-401 network errors without clearing session', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const error: ServerError = {
      name: 'ServerError',
      message: 'Internal Server Error',
      statusCode: 500,
      result: {},
      response: {} as Response,
    }

    const mockLink = new ApolloLink(() => {
      return new Observable((observer) => {
        observer.error(error)
      })
    })

    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ErrorLink.concat(mockLink),
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
      // Expected to throw
    }

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[Network error]:',
      expect.objectContaining({ statusCode: 500 })
    )
    expect(GlobalStorage.set).not.toHaveBeenCalled()
    consoleWarnSpy.mockRestore()
  })

  it('should handle both GraphQL and network errors together', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const error: ServerError = {
      name: 'ServerError',
      message: 'Server Error',
      statusCode: 500,
      result: {},
      response: {} as Response,
    }

    const mockLink = new ApolloLink(() => {
      return new Observable((observer) => {
        observer.next({
          errors: [
            {
              message: 'Query error',
              locations: [{ line: 1, column: 1 }],
              path: ['data'],
            },
          ],
        })
        observer.error(error)
      })
    })

    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ErrorLink.concat(mockLink),
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
      // Expected to throw
    }

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('[GraphQL error]: Message: Query error')
    )
    expect(consoleWarnSpy).toHaveBeenCalledWith('[Network error]:', expect.any(Object))
    consoleLogSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })

  it('should handle network errors without statusCode', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const mockLink = new ApolloLink(() => {
      return new Observable((observer) => {
        observer.error(new Error('Connection refused'))
      })
    })

    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: ErrorLink.concat(mockLink),
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
      // Expected to throw
    }

    expect(consoleWarnSpy).toHaveBeenCalledWith('[Network error]:', expect.any(Error))
    expect(GlobalStorage.set).not.toHaveBeenCalled()
    consoleWarnSpy.mockRestore()
  })
})
