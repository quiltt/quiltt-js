import { describe, expect, it, vi } from 'vitest'

import type { NextLink, Operation } from '@apollo/client/core'
import { ApolloLink, gql, Observable } from '@apollo/client/core'

import ForwardableLink from '@/api/graphql/links/ForwardableLink'

describe('ForwardableLink', () => {
  it('should forward operations to the next link', async () => {
    const mockForward = vi.fn(() => {
      return new Observable((observer) => {
        observer.next({ data: { test: 'value' } })
        observer.complete()
      })
    }) as NextLink

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
    const mockForward = vi.fn(() => {
      return new Observable((observer) => {
        observer.error(mockError)
      })
    }) as NextLink

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
      return new Observable((observer) => {
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
    } as unknown as Operation

    await new Promise<void>((resolve) => {
      link.request(operation)?.subscribe({
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
    const mockForward = vi.fn((operation: Operation) => {
      expect(operation.getContext()).toEqual({ customContext: 'value' })
      return new Observable((observer) => {
        observer.next({ data: {} })
        observer.complete()
      })
    }) as NextLink

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
    } as unknown as Operation

    await new Promise<void>((resolve) => {
      ForwardableLink.request(operation, mockForward)?.subscribe({
        complete: () => {
          resolve()
        },
      })
    })
  })

  it('should handle operations with variables', async () => {
    const testVariables = { id: '123', name: 'test' }
    const mockForward = vi.fn((operation: Operation) => {
      expect(operation.variables).toEqual(testVariables)
      return new Observable((observer) => {
        observer.next({ data: {} })
        observer.complete()
      })
    }) as NextLink

    const operation = {
      query: gql`
        query Test($id: ID!, $name: String!) {
          data(id: $id, name: $name)
        }
      `,
      variables: testVariables,
      operationName: 'Test',
      extensions: {},
      setContext: vi.fn(),
      getContext: () => ({}),
    } as unknown as Operation

    await new Promise<void>((resolve) => {
      ForwardableLink.request(operation, mockForward)?.subscribe({
        complete: () => {
          resolve()
        },
      })
    })
  })
})
