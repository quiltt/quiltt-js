import { describe, expect, it, vi } from 'vitest'

import { ApolloLink, gql } from '@apollo/client/core'
import { Observable } from 'rxjs'

import { ForwardableLink } from '@/api/graphql/links/ForwardableLink'

describe('ForwardableLink', () => {
  it('should forward operations to the next link', async () => {
    const mockForward: ApolloLink.ForwardFunction = vi.fn(() => {
      return new Observable<ApolloLink.Result>((observer) => {
        observer.next({ data: { test: 'value' } })
        observer.complete()
      })
    })

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
      ForwardableLink.request(operation, mockForward)?.subscribe({
        next: (result) => {
          expect(result).toEqual({ data: { test: 'value' } })
        },
        complete: () => {
          expect(mockForward).toHaveBeenCalledWith(operation)
          resolve()
        },
      })
    })
  })

  it('should pass through errors from the next link', async () => {
    const mockError = new Error('Network Error')
    const mockForward: ApolloLink.ForwardFunction = vi.fn(() => {
      return new Observable<ApolloLink.Result>((observer) => {
        observer.error(mockError)
      })
    })

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
      ForwardableLink.request(operation, mockForward)?.subscribe({
        error: (error) => {
          expect(error).toBe(mockError)
          expect(mockForward).toHaveBeenCalledWith(operation)
          resolve()
        },
      })
    })
  })

  it('should work correctly in a link chain', async () => {
    const finalLink = new ApolloLink(() => {
      return new Observable<ApolloLink.Result>((observer) => {
        observer.next({ data: { result: 'success' } })
        observer.complete()
      })
    })

    const link = ApolloLink.from([ForwardableLink, finalLink])

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

    const noopForward: ApolloLink.ForwardFunction = () => new Observable(() => {})
    await new Promise<void>((resolve) => {
      link.request(operation, noopForward)?.subscribe({
        next: (result) => {
          expect(result).toEqual({ data: { result: 'success' } })
        },
        complete: () => {
          resolve()
        },
      })
    })
  })

  it('should preserve operation context', async () => {
    const mockForward: ApolloLink.ForwardFunction = (operation) => {
      expect(operation.getContext()).toEqual({ customContext: 'value' })
      return new Observable<ApolloLink.Result>((observer) => {
        observer.next({ data: {} })
        observer.complete()
      })
    }

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
      getContext: () => ({ customContext: 'value' }),
    } as unknown as ApolloLink.Operation

    await new Promise<void>((resolve) => {
      ForwardableLink.request(operation, mockForward)?.subscribe({
        complete: () => {
          resolve()
        },
      })
    })
  })
})
