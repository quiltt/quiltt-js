import { describe, expect, it, vi } from 'vitest'

import type { Operation, ServerError } from '@apollo/client/core'
import { ApolloLink, gql, Observable } from '@apollo/client/core'

import RetryLink from '@/api/graphql/links/RetryLink'

describe('RetryLink', () => {
  it('should retry requests that fail with 500+ status codes', async () => {
    let attemptCount = 0
    const mockLink = new ApolloLink(() => {
      return new Observable((observer) => {
        attemptCount++
        if (attemptCount < 3) {
          const error: ServerError = {
            name: 'ServerError',
            message: 'Internal Server Error',
            statusCode: 500,
            result: {},
            response: {} as Response,
          }
          observer.error(error)
        } else {
          observer.next({ data: { success: true } })
          observer.complete()
        }
      })
    })

    const link = RetryLink.concat(mockLink)

    const operation = {
      query: gql`
        query Test {
          data
        }
      `,
      variables: {},
      operationName: 'Test',
      extensions: {},
      setContext: vi.fn(),
      getContext: () => ({}),
    } as unknown as Operation

    await new Promise<void>((resolve) => {
      link.request(operation)?.subscribe({
        next: (result) => {
          expect(result).toEqual({ data: { success: true } })
          expect(attemptCount).toBe(3)
        },
        complete: () => {
          resolve()
        },
      })
    })
  })

  it('should not retry requests that fail with 4xx status codes', async () => {
    let attemptCount = 0
    const mockLink = new ApolloLink(() => {
      return new Observable((observer) => {
        attemptCount++
        const error: ServerError = {
          name: 'ServerError',
          message: 'Bad Request',
          statusCode: 400,
          result: {},
          response: {} as Response,
        }
        observer.error(error)
      })
    })

    const link = RetryLink.concat(mockLink)

    const operation = {
      query: gql`
        query Test {
          data
        }
      `,
      variables: {},
      operationName: 'Test',
      extensions: {},
      setContext: vi.fn(),
      getContext: () => ({}),
    } as unknown as Operation

    await new Promise<void>((resolve) => {
      link.request(operation)?.subscribe({
        error: (error) => {
          expect(error.statusCode).toBe(400)
          expect(attemptCount).toBe(1)
          resolve()
        },
      })
    })
  })

  it('should retry errors without status codes', async () => {
    let attemptCount = 0
    const mockLink = new ApolloLink(() => {
      return new Observable((observer) => {
        attemptCount++
        if (attemptCount < 2) {
          observer.error(new Error('Network Error'))
        } else {
          observer.next({ data: { success: true } })
          observer.complete()
        }
      })
    })

    const link = RetryLink.concat(mockLink)

    const operation = {
      query: gql`
        query Test {
          data
        }
      `,
      variables: {},
      operationName: 'Test',
      extensions: {},
      setContext: vi.fn(),
      getContext: () => ({}),
    } as unknown as Operation

    await new Promise<void>((resolve) => {
      link.request(operation)?.subscribe({
        next: (result) => {
          expect(result).toEqual({ data: { success: true } })
          expect(attemptCount).toBe(2)
        },
        complete: () => {
          resolve()
        },
      })
    })
  })

  it('should not retry 401 unauthorized errors', async () => {
    let attemptCount = 0
    const mockLink = new ApolloLink(() => {
      return new Observable((observer) => {
        attemptCount++
        const error: ServerError = {
          name: 'ServerError',
          message: 'Unauthorized',
          statusCode: 401,
          result: {},
          response: {} as Response,
        }
        observer.error(error)
      })
    })

    const link = RetryLink.concat(mockLink)

    const operation = {
      query: gql`
        query Test {
          data
        }
      `,
      variables: {},
      operationName: 'Test',
      extensions: {},
      setContext: vi.fn(),
      getContext: () => ({}),
    } as unknown as Operation

    await new Promise<void>((resolve) => {
      link.request(operation)?.subscribe({
        error: (error) => {
          expect(error.statusCode).toBe(401)
          expect(attemptCount).toBe(1)
          resolve()
        },
      })
    })
  })

  it('should retry 503 service unavailable errors', async () => {
    let attemptCount = 0
    const mockLink = new ApolloLink(() => {
      return new Observable((observer) => {
        attemptCount++
        if (attemptCount < 3) {
          const error: ServerError = {
            name: 'ServerError',
            message: 'Service Unavailable',
            statusCode: 503,
            result: {},
            response: {} as Response,
          }
          observer.error(error)
        } else {
          observer.next({ data: { success: true } })
          observer.complete()
        }
      })
    })

    const link = RetryLink.concat(mockLink)

    const operation = {
      query: gql`
        query Test {
          data
        }
      `,
      variables: {},
      operationName: 'Test',
      extensions: {},
      setContext: vi.fn(),
      getContext: () => ({}),
    } as unknown as Operation

    await new Promise<void>((resolve) => {
      link.request(operation)?.subscribe({
        next: (result) => {
          expect(result).toEqual({ data: { success: true } })
          expect(attemptCount).toBe(3)
        },
        complete: () => {
          resolve()
        },
      })
    })
  })

  it('should pass through successful requests without retrying', async () => {
    let attemptCount = 0
    const mockLink = new ApolloLink(() => {
      return new Observable((observer) => {
        attemptCount++
        observer.next({ data: { success: true } })
        observer.complete()
      })
    })

    const link = RetryLink.concat(mockLink)

    const operation = {
      query: gql`
        query Test {
          data
        }
      `,
      variables: {},
      operationName: 'Test',
      extensions: {},
      setContext: vi.fn(),
      getContext: () => ({}),
    } as unknown as Operation

    await new Promise<void>((resolve) => {
      link.request(operation)?.subscribe({
        next: (result) => {
          expect(result).toEqual({ data: { success: true } })
          expect(attemptCount).toBe(1)
        },
        complete: () => {
          resolve()
        },
      })
    })
  })
})
