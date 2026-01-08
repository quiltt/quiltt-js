import { describe, expect, it, vi } from 'vitest'

import type { ApolloLink } from '@apollo/client/core'
import { gql } from '@apollo/client/core'

import TerminatingLink from '@/api/graphql/links/TerminatingLink'

describe('TerminatingLink', () => {
  it('should return null for any operation', () => {
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

    const mockForward = vi.fn()

    const result = TerminatingLink.request(operation, mockForward)

    expect(result).toBeNull()
    expect(mockForward).not.toHaveBeenCalled()
  })

  it('should terminate the link chain', () => {
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
      getContext: () => ({}),
    } as unknown as ApolloLink.Operation

    const mockForward = vi.fn()

    const result = TerminatingLink.request(operation, mockForward)

    expect(result).toBeNull()
  })

  it('should not execute forward function', () => {
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

    const mockForward = vi.fn()

    TerminatingLink.request(operation, mockForward)

    expect(mockForward).not.toHaveBeenCalled()
  })
})
