import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { FetchResult, Operation } from '@apollo/client/core'
import { gql, Observable } from '@apollo/client/core'
import { createConsumer } from '@rails/actioncable'

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
    vi.mocked(GlobalStorage.get).mockReturnValue('some_token')
  })

  it('should return null if no token is available', () => {
    vi.mocked(GlobalStorage.get).mockReturnValue(null)
    const link = new ActionCableLink({})
    const dummyNextLink = (_operation: Operation) =>
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
    const dummyNextLink = (_operation: Operation) =>
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

    subscription.perform('action', { data: 'test' })

    expect(consumer.subscriptions.create).toHaveBeenCalledWith('TestChannel', {})
    expect(subscription.perform).toHaveBeenCalledWith('action', { data: 'test' })

    subscription.unsubscribe()

    expect(subscription.unsubscribe).toHaveBeenCalled()

    consumer.disconnect()
    expect(consumer.disconnect).toHaveBeenCalled()
  })

  it('should execute Observable callback and create ActionCable subscription when subscribed', async () => {
    const mockSubscription = {
      perform: vi.fn(),
      unsubscribe: vi.fn(),
    }

    const mockConsumer = {
      subscriptions: {
        create: vi.fn((_config, handlers) => {
          setTimeout(() => {
            handlers.received({ result: { data: {} }, more: false })
          }, 0)
          return mockSubscription
        }),
      },
    }

    vi.mocked(createConsumer).mockReturnValue(mockConsumer as any)

    const link = new ActionCableLink({})
    const mockQuery = gql`
      query TestQuery {
        mockField
      }
    `
    const operation = {
      query: mockQuery,
      variables: { test: 'value' },
      operationName: 'TestQuery',
      extensions: {},
      setContext: () => {},
      getContext: () => ({}),
    } as Operation

    const dummyNextLink = (_operation: Operation) =>
      new Observable<FetchResult>((subscriber) => {
        subscriber.next({})
        subscriber.complete()
      })

    const observable = link.request(operation, dummyNextLink)

    expect(observable).toBeInstanceOf(Observable)

    await new Promise<void>((resolve) => {
      observable?.subscribe({
        complete: () => {
          expect(mockConsumer.subscriptions.create).toHaveBeenCalled()
          resolve()
        },
      })
    })
  })

  it('should handle connectionParams as a function', async () => {
    const connectionParamsFn = vi.fn((op: Operation) => ({ customParam: op.operationName }))

    const mockSubscription = {
      perform: vi.fn(),
      unsubscribe: vi.fn(),
    }

    const mockConsumer = {
      subscriptions: {
        create: vi.fn((_config, handlers) => {
          setTimeout(() => {
            handlers.received({ result: { data: {} }, more: false })
          }, 0)
          return mockSubscription
        }),
      },
    }

    vi.mocked(createConsumer).mockReturnValue(mockConsumer as any)

    const link = new ActionCableLink({
      connectionParams: connectionParamsFn,
    })

    const mockQuery = gql`
      query TestQuery {
        mockField
      }
    `
    const operation = {
      query: mockQuery,
      variables: {},
      operationName: 'TestQuery',
    } as Operation

    const dummyNextLink = (_operation: Operation) =>
      new Observable<FetchResult>((subscriber) => {
        subscriber.next({})
        subscriber.complete()
      })

    const observable = link.request(operation, dummyNextLink)

    await new Promise<void>((resolve) => {
      observable?.subscribe({
        complete: () => {
          expect(connectionParamsFn).toHaveBeenCalledWith(operation)
          resolve()
        },
      })
    })
  })

  it('should call channel.perform when connected callback is triggered', async () => {
    const mockPerform = vi.fn()
    const mockSubscription = {
      perform: mockPerform,
      unsubscribe: vi.fn(),
    }

    const mockConsumer = {
      subscriptions: {
        create: vi.fn((_config, handlers) => {
          setTimeout(() => {
            handlers.connected()
            handlers.received({ result: { data: {} }, more: false })
          }, 0)
          return mockSubscription
        }),
      },
    }

    vi.mocked(createConsumer).mockReturnValue(mockConsumer as any)

    const link = new ActionCableLink({})
    const mockQuery = gql`
      query TestQuery {
        mockField
      }
    `
    const operation = {
      query: mockQuery,
      variables: { var1: 'test' },
      operationName: 'TestQuery',
      extensions: {},
      setContext: () => {},
      getContext: () => ({}),
    } as Operation

    const dummyNextLink = (_operation: Operation) =>
      new Observable<FetchResult>((subscriber) => {
        subscriber.next({})
        subscriber.complete()
      })

    const observable = link.request(operation, dummyNextLink)

    await new Promise<void>((resolve) => {
      observable?.subscribe({
        complete: () => {
          expect(mockPerform).toHaveBeenCalledWith('execute', {
            query: 'printed query',
            variables: { var1: 'test' },
            operationId: undefined,
            operationName: 'TestQuery',
          })
          resolve()
        },
      })
    })
  })

  it('should handle received callback with data', async () => {
    const mockSubscription = {
      perform: vi.fn(),
      unsubscribe: vi.fn(),
    }

    const mockConsumer = {
      subscriptions: {
        create: vi.fn((_config, handlers) => {
          setTimeout(() => {
            handlers.received({ result: { data: { test: 'value' } }, more: false })
          }, 0)
          return mockSubscription
        }),
      },
    }

    vi.mocked(createConsumer).mockReturnValue(mockConsumer as any)

    const link = new ActionCableLink({})
    const mockQuery = gql`
      query TestQuery {
        mockField
      }
    `
    const operation = { query: mockQuery, variables: {}, operationName: 'TestQuery' } as Operation

    const dummyNextLink = (_operation: Operation) =>
      new Observable<FetchResult>((subscriber) => {
        subscriber.next({})
        subscriber.complete()
      })

    const observable = link.request(operation, dummyNextLink)

    await new Promise<void>((resolve) => {
      observable?.subscribe({
        next: (result) => {
          expect(result).toEqual({ data: { test: 'value' } })
        },
        complete: () => {
          resolve()
        },
      })
    })
  })

  it('should handle received callback with errors', async () => {
    const mockSubscription = {
      perform: vi.fn(),
      unsubscribe: vi.fn(),
    }

    const mockConsumer = {
      subscriptions: {
        create: vi.fn((_config, handlers) => {
          setTimeout(() => {
            handlers.received({
              result: { errors: [{ message: 'Error occurred' }] },
              more: false,
            })
          }, 0)
          return mockSubscription
        }),
      },
    }

    vi.mocked(createConsumer).mockReturnValue(mockConsumer as any)

    const link = new ActionCableLink({})
    const mockQuery = gql`
      query TestQuery {
        mockField
      }
    `
    const operation = { query: mockQuery, variables: {}, operationName: 'TestQuery' } as Operation

    const dummyNextLink = (_operation: Operation) =>
      new Observable<FetchResult>((subscriber) => {
        subscriber.next({})
        subscriber.complete()
      })

    const observable = link.request(operation, dummyNextLink)

    await new Promise<void>((resolve) => {
      observable?.subscribe({
        next: (result) => {
          expect(result).toEqual({ errors: [{ message: 'Error occurred' }] })
        },
        complete: () => {
          resolve()
        },
      })
    })
  })

  it('should continue receiving when more: true', async () => {
    const mockSubscription = {
      perform: vi.fn(),
      unsubscribe: vi.fn(),
    }

    let callCount = 0
    const mockConsumer = {
      subscriptions: {
        create: vi.fn((_config, handlers) => {
          setTimeout(() => {
            handlers.received({ result: { data: { part1: 'data' } }, more: true })
            setTimeout(() => {
              handlers.received({ result: { data: { part2: 'data' } }, more: false })
            }, 10)
          }, 0)
          return mockSubscription
        }),
      },
    }

    vi.mocked(createConsumer).mockReturnValue(mockConsumer as any)

    const link = new ActionCableLink({})
    const mockQuery = gql`
      query TestQuery {
        mockField
      }
    `
    const operation = { query: mockQuery, variables: {}, operationName: 'TestQuery' } as Operation

    const dummyNextLink = (_operation: Operation) =>
      new Observable<FetchResult>((subscriber) => {
        subscriber.next({})
        subscriber.complete()
      })

    const observable = link.request(operation, dummyNextLink)

    await new Promise<void>((resolve) => {
      observable?.subscribe({
        next: () => {
          callCount++
        },
        complete: () => {
          expect(callCount).toBe(2)
          resolve()
        },
      })
    })
  })

  it('should handle operation with null query', async () => {
    const mockSubscription = {
      perform: vi.fn(),
      unsubscribe: vi.fn(),
    }

    const mockConsumer = {
      subscriptions: {
        create: vi.fn((_config, handlers) => {
          setTimeout(() => {
            handlers.connected()
            handlers.received({ result: { data: {} }, more: false })
          }, 0)
          return mockSubscription
        }),
      },
    }

    vi.mocked(createConsumer).mockReturnValue(mockConsumer as any)

    const link = new ActionCableLink({})
    const operation = {
      query: null,
      variables: {},
      operationName: 'TestQuery',
      extensions: {},
      setContext: () => {},
      getContext: () => ({}),
    } as any

    const dummyNextLink = (_operation: Operation) =>
      new Observable<FetchResult>((subscriber) => {
        subscriber.next({})
        subscriber.complete()
      })

    const observable = link.request(operation, dummyNextLink)

    await new Promise<void>((resolve) => {
      observable?.subscribe({
        complete: () => {
          expect(mockSubscription.perform).toHaveBeenCalledWith('execute', {
            query: null,
            variables: {},
            operationId: undefined,
            operationName: 'TestQuery',
          })
          resolve()
        },
      })
    })
  })

  it('should handle operation with operationId for persisted queries', async () => {
    const mockSubscription = {
      perform: vi.fn(),
      unsubscribe: vi.fn(),
    }

    const mockConsumer = {
      subscriptions: {
        create: vi.fn((_config, handlers) => {
          setTimeout(() => {
            handlers.connected()
            handlers.received({ result: { data: {} }, more: false })
          }, 0)
          return mockSubscription
        }),
      },
    }

    vi.mocked(createConsumer).mockReturnValue(mockConsumer as any)

    const link = new ActionCableLink({})
    const mockQuery = gql`
      query TestQuery {
        mockField
      }
    `
    const operation = {
      query: mockQuery,
      variables: {},
      operationName: 'TestQuery',
      operationId: 'abc123',
      extensions: {},
      setContext: () => {},
      getContext: () => ({}),
    } as any

    const dummyNextLink = (_operation: Operation) =>
      new Observable<FetchResult>((subscriber) => {
        subscriber.next({})
        subscriber.complete()
      })

    const observable = link.request(operation, dummyNextLink)

    await new Promise<void>((resolve) => {
      observable?.subscribe({
        complete: () => {
          expect(mockSubscription.perform).toHaveBeenCalledWith('execute', {
            query: 'printed query',
            variables: {},
            operationId: 'abc123',
            operationName: 'TestQuery',
          })
          resolve()
        },
      })
    })
  })

  it('should skip observer.next when payload has no data or errors', async () => {
    const mockSubscription = {
      perform: vi.fn(),
      unsubscribe: vi.fn(),
    }

    const nextSpy = vi.fn()

    const mockConsumer = {
      subscriptions: {
        create: vi.fn((_config, handlers) => {
          setTimeout(() => {
            handlers.received({ result: {}, more: false })
          }, 0)
          return mockSubscription
        }),
      },
    }

    vi.mocked(createConsumer).mockReturnValue(mockConsumer as any)

    const link = new ActionCableLink({})
    const mockQuery = gql`
      query TestQuery {
        mockField
      }
    `
    const operation = {
      query: mockQuery,
      variables: {},
      operationName: 'TestQuery',
      extensions: {},
      setContext: () => {},
      getContext: () => ({}),
    } as Operation

    const dummyNextLink = (_operation: Operation) =>
      new Observable<FetchResult>((subscriber) => {
        subscriber.next({})
        subscriber.complete()
      })

    const observable = link.request(operation, dummyNextLink)

    await new Promise<void>((resolve) => {
      observable?.subscribe({
        next: nextSpy,
        complete: () => {
          expect(nextSpy).not.toHaveBeenCalled()
          resolve()
        },
      })
    })
  })

  it('should use custom channelName and actionName when provided', async () => {
    const mockPerform = vi.fn()
    const mockSubscription = {
      perform: mockPerform,
      unsubscribe: vi.fn(),
    }

    const mockConsumer = {
      subscriptions: {
        create: vi.fn((config, handlers) => {
          expect(config.channel).toBe('CustomChannel')
          setTimeout(() => {
            handlers.connected()
            handlers.received({ result: { data: {} }, more: false })
          }, 0)
          return mockSubscription
        }),
      },
    }

    vi.mocked(createConsumer).mockReturnValue(mockConsumer as any)

    const link = new ActionCableLink({
      channelName: 'CustomChannel',
      actionName: 'customAction',
    })

    const mockQuery = gql`
      query TestQuery {
        mockField
      }
    `
    const operation = {
      query: mockQuery,
      variables: {},
      operationName: 'TestQuery',
      extensions: {},
      setContext: () => {},
      getContext: () => ({}),
    } as Operation

    const dummyNextLink = (_operation: Operation) =>
      new Observable<FetchResult>((subscriber) => {
        subscriber.next({})
        subscriber.complete()
      })

    const observable = link.request(operation, dummyNextLink)

    await new Promise<void>((resolve) => {
      observable?.subscribe({
        complete: () => {
          expect(mockPerform).toHaveBeenCalledWith('customAction', expect.any(Object))
          resolve()
        },
      })
    })
  })
})
