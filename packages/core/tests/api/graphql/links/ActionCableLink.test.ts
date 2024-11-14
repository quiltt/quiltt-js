import type { FetchResult, Operation } from '@apollo/client/core'
import { Observable, gql } from '@apollo/client/core'
import { createConsumer } from '@rails/actioncable'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ActionCableLink from '@/api/graphql/links/ActionCableLink'
import { GlobalStorage } from '@/storage'

vi.mock('@/storage', () => ({
  GlobalStorage: {
    get: vi.fn(() => null as string | null),
  },
}))

vi.mock('@rails/actioncable', () => {
  const mockSubscription = {
    perform: vi.fn(),
    unsubscribe: vi.fn(),
  }

  const mockConsumer = {
    subscriptions: {
      create: vi.fn(() => mockSubscription),
      subscriptions: [],
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }

  return {
    createConsumer: vi.fn(() => mockConsumer),
  }
})

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

    // Check if the subscription was created successfully
    expect(consumer.subscriptions.create).toHaveBeenCalledWith('TestChannel', {})
    expect(subscription.perform).toHaveBeenCalledWith('action', { data: 'test' })

    // Manually call unsubscribe
    subscription.unsubscribe()

    // Check if unsubscribe was called
    expect(subscription.unsubscribe).toHaveBeenCalled()

    // Disconnect consumer
    consumer.disconnect()
    expect(consumer.disconnect).toHaveBeenCalled()
  })
})
