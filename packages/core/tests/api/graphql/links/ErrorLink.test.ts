import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApolloClient, ApolloLink, gql, InMemoryCache } from '@apollo/client/core'
import { Observable } from '@apollo/client/utilities'

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
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

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

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Quiltt][GraphQL Error]: Field error | Path: user.name')
    )
    consoleWarnSpy.mockRestore()
  })

  it('should handle 401 network errors and clear session', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const error = Object.assign(new Error('Unauthorized'), {
      statusCode: 401,
      bodyText: 'Unauthorized',
      response: new Response('Unauthorized', { status: 401 }),
    })

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
      '[Quiltt][Authentication Error]:',
      expect.objectContaining({ statusCode: 401 })
    )
    expect(GlobalStorage.set).toHaveBeenCalledWith('session', null)
    consoleWarnSpy.mockRestore()
  })

  it('should handle non-401 network errors without clearing session', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const error = Object.assign(new Error('Internal Server Error'), {
      statusCode: 500,
      bodyText: 'Internal Server Error',
      response: new Response('Internal Server Error', { status: 500 }),
    })

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
      '[Quiltt][Server Error]:',
      expect.objectContaining({ statusCode: 500 })
    )
    expect(GlobalStorage.set).not.toHaveBeenCalled()
    consoleWarnSpy.mockRestore()
  })

  it('should handle both GraphQL and network errors together', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const error = Object.assign(new Error('Server Error'), {
      statusCode: 500,
      bodyText: 'Server Error',
      response: new Response('Server Error', { status: 500 }),
    })

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

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Quiltt][GraphQL Error]: Query error | Path: data')
    )
    expect(consoleWarnSpy).toHaveBeenCalledWith('[Quiltt][Server Error]:', expect.any(Object))
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

    expect(consoleWarnSpy).toHaveBeenCalledWith('[Quiltt][Network Error]:', expect.any(Error))
    expect(GlobalStorage.set).not.toHaveBeenCalled()
    consoleWarnSpy.mockRestore()
  })
})
