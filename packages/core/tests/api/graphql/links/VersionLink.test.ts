import { describe, expect, it, vi } from 'vitest'

import type { ApolloLink } from '@apollo/client/core'
import { gql } from '@apollo/client/core'
import { Observable } from 'rxjs'

import { createVersionLink } from '@/api/graphql/links/VersionLink'
import { version } from '@/config'

type NextLink = (operation: ApolloLink.Operation) => Observable<ApolloLink.Result>

describe('VersionLink', () => {
  it('should add Quiltt-Client-Version header to the request', () => {
    const versionLink = createVersionLink('Test')

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
      getContext: () => ({ headers: {} }),
    } as unknown as ApolloLink.Operation

    const mockForward = vi.fn(() => new Observable((observer) => observer.complete())) as NextLink

    versionLink.request(operation, mockForward)

    expect(operation.setContext).toHaveBeenCalledWith(expect.any(Function))

    // Get the function that was passed to setContext
    const setContextFn = (operation.setContext as ReturnType<typeof vi.fn>).mock.calls[0][0]
    const result = setContextFn({ headers: {} })

    expect(result).toEqual({
      headers: {
        'Quiltt-Client-Version': version,
        'Quiltt-SDK-Agent': expect.stringContaining('Quiltt/'),
      },
    })
    expect(mockForward).toHaveBeenCalledWith(operation)
  })

  it('should preserve existing headers', () => {
    const versionLink = createVersionLink('Test')

    const existingHeaders = {
      Authorization: 'Bearer token123',
      'Content-Type': 'application/json',
    }

    const operation = {
      query: gql`
        mutation UpdateData {
          update
        }
      `,
      variables: { id: '123' },
      operationName: 'UpdateData',
      extensions: {},
      setContext: vi.fn(),
      getContext: () => ({ headers: existingHeaders }),
    } as unknown as ApolloLink.Operation

    const mockForward = vi.fn(() => new Observable((observer) => observer.complete())) as NextLink

    versionLink.request(operation, mockForward)

    expect(operation.setContext).toHaveBeenCalledWith(expect.any(Function))

    // Get the function that was passed to setContext
    const setContextFn = (operation.setContext as ReturnType<typeof vi.fn>).mock.calls[0][0]
    const result = setContextFn({ headers: existingHeaders })

    expect(result).toEqual({
      headers: {
        ...existingHeaders,
        'Quiltt-Client-Version': version,
        'Quiltt-SDK-Agent': expect.stringContaining('Quiltt/'),
      },
    })
  })

  it('should handle operations with no existing headers', () => {
    const versionLink = createVersionLink('Test')

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

    const mockForward = vi.fn(() => new Observable((observer) => observer.complete())) as NextLink

    versionLink.request(operation, mockForward)

    expect(operation.setContext).toHaveBeenCalledWith(expect.any(Function))

    // Get the function that was passed to setContext with no headers
    const setContextFn = (operation.setContext as ReturnType<typeof vi.fn>).mock.calls[0][0]
    const result = setContextFn({})

    expect(result).toEqual({
      headers: {
        'Quiltt-Client-Version': version,
        'Quiltt-SDK-Agent': expect.stringContaining('Quiltt/'),
      },
    })
  })

  it('should call forward with the operation', () => {
    const versionLink = createVersionLink('Test')

    const operation = {
      query: gql`
        subscription OnUpdate {
          updates
        }
      `,
      variables: {},
      operationName: 'OnUpdate',
      extensions: {},
      setContext: vi.fn(),
      getContext: () => ({}),
    } as unknown as ApolloLink.Operation

    const mockForward = vi.fn(() => new Observable((observer) => observer.complete())) as NextLink

    const result = versionLink.request(operation, mockForward)

    expect(mockForward).toHaveBeenCalledTimes(1)
    expect(mockForward).toHaveBeenCalledWith(operation)
    expect(result).toBeDefined()
  })

  it('should return the observable from forward', () => {
    const versionLink = createVersionLink('Test')

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

    const mockObservable = new Observable((observer) => {
      observer.next({ data: { test: 'value' } })
      observer.complete()
    })

    const mockForward = vi.fn(() => mockObservable) as NextLink

    const result = versionLink.request(operation, mockForward)

    expect(result).toBe(mockObservable)
  })
})
