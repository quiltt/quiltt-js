import { describe, expect, it, vi } from 'vitest'

import type { ServerError } from '@apollo/client/core'
import { ApolloLink, gql } from '@apollo/client/core'
import { ServerParseError } from '@apollo/client/errors'
import { Observable } from 'rxjs'

import { RetryLink } from '@/api/graphql/links/RetryLink'

const buildOperation = (operationName?: string) =>
  ({
    query: gql`
      query Test {
        data
      }
    `,
    variables: {},
    operationName,
    extensions: {},
    setContext: vi.fn(),
    getContext: () => ({}),
  }) as unknown as ApolloLink.Operation

// An empty body with a 200 status is the webview-teardown transport failure the
// RetryLink branch targets: the request was killed mid-flight, so `JSON.parse('')`
// threw and Apollo raised a `ServerParseError` wearing a misleading 200.
const emptyBody200ParseError = () =>
  new ServerParseError(new SyntaxError('JSON Parse error: Unexpected EOF'), {
    response: { status: 200 } as Response,
    bodyText: '',
  })

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
            bodyText: 'Internal Server Error',
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
    } as unknown as ApolloLink.Operation

    await new Promise<void>((resolve) => {
      link.request(operation, vi.fn() as any)?.subscribe({
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
          bodyText: 'Bad Request',
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
    } as unknown as ApolloLink.Operation

    await new Promise<void>((resolve) => {
      link.request(operation, vi.fn() as any)?.subscribe({
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
    } as unknown as ApolloLink.Operation

    await new Promise<void>((resolve) => {
      link.request(operation, vi.fn() as any)?.subscribe({
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
          bodyText: 'Unauthorized',
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
    } as unknown as ApolloLink.Operation

    await new Promise<void>((resolve) => {
      link.request(operation, vi.fn() as any)?.subscribe({
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
            bodyText: 'Service Unavailable',
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
    } as unknown as ApolloLink.Operation

    await new Promise<void>((resolve) => {
      link.request(operation, vi.fn() as any)?.subscribe({
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
    } as unknown as ApolloLink.Operation

    await new Promise<void>((resolve) => {
      link.request(operation, vi.fn() as any)?.subscribe({
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

  it('should retry an empty-body 200 ServerParseError for a non-Initialize operation', async () => {
    let attemptCount = 0
    const mockLink = new ApolloLink(() => {
      return new Observable((observer) => {
        attemptCount++
        if (attemptCount < 3) {
          observer.error(emptyBody200ParseError())
        } else {
          observer.next({ data: { success: true } })
          observer.complete()
        }
      })
    })

    const link = RetryLink.concat(mockLink)

    await new Promise<void>((resolve, reject) => {
      link.request(buildOperation('connectorPlaidClose'), vi.fn() as any)?.subscribe({
        next: (result) => {
          try {
            expect(result).toEqual({ data: { success: true } })
            expect(attemptCount).toBe(3)
          } catch (assertionError) {
            reject(assertionError)
          }
        },
        error: reject,
        complete: () => {
          resolve()
        },
      })
    })
  })

  it('should not retry an empty-body 200 ServerParseError for an *Initialize operation', async () => {
    let attemptCount = 0
    const mockLink = new ApolloLink(() => {
      return new Observable((observer) => {
        attemptCount++
        observer.error(emptyBody200ParseError())
      })
    })

    const link = RetryLink.concat(mockLink)

    await new Promise<void>((resolve, reject) => {
      link.request(buildOperation('connectorPlaidInitialize'), vi.fn() as any)?.subscribe({
        next: () => reject(new Error('expected the request to error, but it succeeded')),
        error: (error) => {
          try {
            expect(ServerParseError.is(error)).toBe(true)
            expect(attemptCount).toBe(1)
            resolve()
          } catch (assertionError) {
            reject(assertionError)
          }
        },
      })
    })
  })

  it('should not retry a 200 ServerParseError that has a non-empty body', async () => {
    let attemptCount = 0
    const mockLink = new ApolloLink(() => {
      return new Observable((observer) => {
        attemptCount++
        observer.error(
          new ServerParseError(new SyntaxError('Unexpected token <'), {
            response: { status: 200 } as Response,
            bodyText: '<html>Not JSON</html>',
          })
        )
      })
    })

    const link = RetryLink.concat(mockLink)

    await new Promise<void>((resolve, reject) => {
      link.request(buildOperation('connectorPlaidClose'), vi.fn() as any)?.subscribe({
        next: () => reject(new Error('expected the request to error, but it succeeded')),
        error: (error) => {
          try {
            expect(error.statusCode).toBe(200)
            expect(attemptCount).toBe(1)
            resolve()
          } catch (assertionError) {
            reject(assertionError)
          }
        },
      })
    })
  })

  it('should retry an empty-body 200 ServerParseError when operationName is undefined', async () => {
    let attemptCount = 0
    const mockLink = new ApolloLink(() => {
      return new Observable((observer) => {
        attemptCount++
        if (attemptCount < 2) {
          observer.error(emptyBody200ParseError())
        } else {
          observer.next({ data: { success: true } })
          observer.complete()
        }
      })
    })

    const link = RetryLink.concat(mockLink)

    await new Promise<void>((resolve, reject) => {
      link.request(buildOperation(undefined), vi.fn() as any)?.subscribe({
        next: (result) => {
          try {
            expect(result).toEqual({ data: { success: true } })
            expect(attemptCount).toBe(2)
          } catch (assertionError) {
            reject(assertionError)
          }
        },
        error: reject,
        complete: () => {
          resolve()
        },
      })
    })
  })

  it('should retry a 500 ServerParseError with a non-empty body (server error path)', async () => {
    let attemptCount = 0
    const mockLink = new ApolloLink(() => {
      return new Observable((observer) => {
        attemptCount++
        if (attemptCount < 3) {
          observer.error(
            new ServerParseError(new SyntaxError('Unexpected token <'), {
              response: { status: 500 } as Response,
              bodyText: '<html>Internal Server Error</html>',
            })
          )
        } else {
          observer.next({ data: { success: true } })
          observer.complete()
        }
      })
    })

    const link = RetryLink.concat(mockLink)

    await new Promise<void>((resolve, reject) => {
      link.request(buildOperation('connectorPlaidClose'), vi.fn() as any)?.subscribe({
        next: (result) => {
          try {
            expect(result).toEqual({ data: { success: true } })
            expect(attemptCount).toBe(3)
          } catch (assertionError) {
            reject(assertionError)
          }
        },
        error: reject,
        complete: () => {
          resolve()
        },
      })
    })
  })

  it('should retry an empty-body 500 ServerParseError for an *Initialize operation (server error path)', async () => {
    let attemptCount = 0
    const mockLink = new ApolloLink(() => {
      return new Observable((observer) => {
        attemptCount++
        if (attemptCount < 3) {
          observer.error(
            new ServerParseError(new SyntaxError('Unexpected EOF'), {
              response: { status: 500 } as Response,
              bodyText: '',
            })
          )
        } else {
          observer.next({ data: { success: true } })
          observer.complete()
        }
      })
    })

    const link = RetryLink.concat(mockLink)

    // The 200-only gate must not catch this — a genuine 5xx follows the default
    // retry path even for an *Initialize op.
    await new Promise<void>((resolve, reject) => {
      link.request(buildOperation('connectorPlaidInitialize'), vi.fn() as any)?.subscribe({
        next: (result) => {
          try {
            expect(result).toEqual({ data: { success: true } })
            expect(attemptCount).toBe(3)
          } catch (assertionError) {
            reject(assertionError)
          }
        },
        error: reject,
        complete: () => {
          resolve()
        },
      })
    })
  })
})
