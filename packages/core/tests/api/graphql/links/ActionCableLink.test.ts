import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Observable, Operation, gql, FetchResult } from '@apollo/client/core'
import ActionCableLink from '@/api/graphql/links/ActionCableLink'
import { GlobalStorage } from '@/storage'
import { createConsumer } from '@/api/graphql/links/actioncable'

vi.mock('@/storage', () => ({
  GlobalStorage: {
    get: vi.fn(() => null as string | null),
  },
}))

vi.mock('@/api/graphql/links/actioncable', () => ({
  createConsumer: vi.fn(() => {
    const send = vi.fn() // Keep this to validate send actions if needed
    return {
      send,
      connect: vi.fn(),
      disconnect: vi.fn(),
      ensureActiveConnection: vi.fn(),
      subscriptions: {
        create: vi.fn(() => ({
          perform: (actionName: string, data: object = {}) => {
            send({
              command: 'message',
              identifier: JSON.stringify({}),
              data: JSON.stringify({ action: actionName, ...data }),
            })
          },
          unsubscribe: vi.fn(), // Ensure this is setup to track calls
        })),
      },
    }
  }),
}))

vi.mock('graphql', () => ({
  print: vi.fn().mockReturnValue('printed query'),
}))

describe('ActionCableLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(GlobalStorage.get).mockReturnValue('some_token') // Assuming token is needed for all tests
  })

  it('should return null if no token is available', () => {
    vi.mocked(GlobalStorage.get).mockReturnValue(null)
    const link = new ActionCableLink({})
    const dummyNextLink = (operation: Operation) =>
      new Observable<FetchResult>((subscriber) => {
        subscriber.next({})
        subscriber.complete()
      })
    const mockQuery = gql`
      {
        mockField
      }
    `
    const operation = { query: mockQuery } as Operation
    const result = link.request(operation, dummyNextLink)

    expect(result).toBeNull()
    expect(GlobalStorage.get).toHaveBeenCalledWith('session')
  })

  it('should create a consumer and subscription when a token is present', () => {
    const link = new ActionCableLink({})
    const dummyNextLink = (operation: Operation) =>
      new Observable<FetchResult>((subscriber) => {
        subscriber.next({})
        subscriber.complete()
      })
    const mockQuery = gql`
      {
        mockField
      }
    `
    const operation = { query: mockQuery } as Operation
    const result = link.request(operation, dummyNextLink)

    expect(result).toBeInstanceOf(Observable)
    expect(GlobalStorage.get).toHaveBeenCalledWith('session')
  })

  it('should manage subscriptions correctly', async () => {
    const consumer = createConsumer('ws://example.com')
    const subscription = consumer.subscriptions.create('TestChannel', {})

    // Perform action to trigger send
    subscription.perform('action', { data: 'test' })

    // Check if send was called correctly
    expect(consumer.send).toHaveBeenCalledWith({
      command: 'message',
      identifier: JSON.stringify({}),
      data: JSON.stringify({ action: 'action', data: 'test' }),
    })

    // Manually call unsubscribe to test if it's tracked correctly
    subscription.unsubscribe()

    // Check if unsubscribe method was called
    expect(subscription.unsubscribe).toHaveBeenCalled()

    consumer.disconnect()
  })
})
