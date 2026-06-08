import { describe, expect, it, vi } from 'vitest'

import { type ApolloLink, gql } from '@apollo/client/core'
import { Observable } from 'rxjs'

import { KeepaliveLink } from '@/api/graphql/links/KeepaliveLink'

// Mirror Apollo's `operation.setContext` merge semantics so we can inspect the
// context the link produces. `setContext` accepts either a partial object or an
// updater function, and shallow-merges the result onto the existing context.
const buildOperation = (operationName?: string, initialContext: Record<string, any> = {}) => {
  let context = { ...initialContext }
  return {
    query: gql`
      query Test {
        data
      }
    `,
    variables: {},
    operationName,
    extensions: {},
    setContext: (next: any) => {
      context = { ...context, ...(typeof next === 'function' ? next(context) : next) }
      return context
    },
    getContext: () => context,
  } as unknown as ApolloLink.Operation
}

const forwardOnce = () =>
  vi.fn(
    () =>
      new Observable<ApolloLink.Result>((observer) => {
        observer.next({ data: {} })
        observer.complete()
      })
  )

describe('KeepaliveLink', () => {
  it('sets keepalive on a *Close operation', async () => {
    const operation = buildOperation('connectorPlaidClose')
    const forward = forwardOnce()

    await new Promise<void>((resolve, reject) => {
      KeepaliveLink.request(operation, forward as any)?.subscribe({
        error: reject,
        complete: resolve,
      })
    })

    expect(forward).toHaveBeenCalledWith(operation)
    expect(operation.getContext().fetchOptions).toEqual({ keepalive: true })
  })

  it('does not set keepalive on a non-Close operation', async () => {
    const operation = buildOperation('connectorPlaidInitialize')
    const forward = forwardOnce()

    await new Promise<void>((resolve, reject) => {
      KeepaliveLink.request(operation, forward as any)?.subscribe({
        error: reject,
        complete: resolve,
      })
    })

    expect(forward).toHaveBeenCalledWith(operation)
    expect(operation.getContext().fetchOptions).toBeUndefined()
  })

  it('preserves existing fetchOptions when adding keepalive', async () => {
    const operation = buildOperation('connectorMxClose', {
      fetchOptions: { credentials: 'include' },
    })
    const forward = forwardOnce()

    await new Promise<void>((resolve, reject) => {
      KeepaliveLink.request(operation, forward as any)?.subscribe({
        error: reject,
        complete: resolve,
      })
    })

    expect(operation.getContext().fetchOptions).toEqual({
      credentials: 'include',
      keepalive: true,
    })
  })

  it('forwards the operation untouched when operationName is undefined', async () => {
    const operation = buildOperation(undefined)
    const forward = forwardOnce()

    await new Promise<void>((resolve, reject) => {
      KeepaliveLink.request(operation, forward as any)?.subscribe({
        error: reject,
        complete: resolve,
      })
    })

    expect(forward).toHaveBeenCalledWith(operation)
    expect(operation.getContext().fetchOptions).toBeUndefined()
  })
})
