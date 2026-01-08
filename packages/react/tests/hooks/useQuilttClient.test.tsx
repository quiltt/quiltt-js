import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

import { gql, MockedProvider } from '@quiltt/react'

import { useQuilttClient } from '@/hooks/useQuilttClient'

interface Profile {
  id: string
  name: string
  email: string
}

interface User {
  id: string
  name: string
}

const SAMPLE_QUERY = gql`
  query GetProfile {
    profile {
      id
      name
      email
    }
  }
`

const SAMPLE_MUTATION = gql`
  mutation UpdateProfile($name: String!) {
    updateProfile(name: $name) {
      id
      name
    }
  }
`

describe('useQuilttClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return an Apollo Client instance', () => {
    const { result } = renderHook(() => useQuilttClient(), {
      wrapper: ({ children }) => <MockedProvider mocks={[]}>{children}</MockedProvider>,
    })

    expect(result.current).toBeDefined()
    expect(result.current.query).toBeDefined()
    expect(result.current.mutate).toBeDefined()
    expect(result.current.cache).toBeDefined()
  })

  it('should allow querying data using the client', async () => {
    const mocks = [
      {
        request: {
          query: SAMPLE_QUERY,
        },
        result: {
          data: {
            profile: {
              id: '123',
              name: 'John Doe',
              email: 'john@example.com',
            },
          },
        },
      },
    ]

    const { result } = renderHook(() => useQuilttClient(), {
      wrapper: ({ children }) => <MockedProvider mocks={mocks}>{children}</MockedProvider>,
    })

    const client = result.current
    const response = await client.query<{ profile: Profile }>({ query: SAMPLE_QUERY })

    expect(response.data?.profile).toEqual({
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
    })
  })

  it('should allow mutations using the client', async () => {
    const mocks = [
      {
        request: {
          query: SAMPLE_MUTATION,
          variables: { name: 'Jane Doe' },
        },
        result: {
          data: {
            updateProfile: {
              id: '123',
              name: 'Jane Doe',
            },
          },
        },
      },
    ]

    const { result } = renderHook(() => useQuilttClient(), {
      wrapper: ({ children }) => <MockedProvider mocks={mocks}>{children}</MockedProvider>,
    })

    const client = result.current
    const response = await client.mutate<{ updateProfile: User }>({
      mutation: SAMPLE_MUTATION,
      variables: { name: 'Jane Doe' },
    })

    expect(response.data?.updateProfile).toEqual({
      id: '123',
      name: 'Jane Doe',
    })
  })

  it('should handle GraphQL errors correctly', async () => {
    const mocks = [
      {
        request: {
          query: SAMPLE_QUERY,
        },
        result: {
          errors: [
            {
              message: 'Not authenticated',
              extensions: { code: 'UNAUTHENTICATED' },
            },
          ],
        },
      },
    ]

    const { result } = renderHook(() => useQuilttClient(), {
      wrapper: ({ children }) => <MockedProvider mocks={mocks}>{children}</MockedProvider>,
    })

    const client = result.current

    await expect(client.query({ query: SAMPLE_QUERY })).rejects.toThrow()
  })

  it('should handle network errors correctly', async () => {
    const mocks = [
      {
        request: {
          query: SAMPLE_QUERY,
        },
        error: new Error('Network error'),
      },
    ]

    const { result } = renderHook(() => useQuilttClient(), {
      wrapper: ({ children }) => <MockedProvider mocks={mocks}>{children}</MockedProvider>,
    })

    const client = result.current

    await expect(client.query({ query: SAMPLE_QUERY })).rejects.toThrow('Network error')
  })

  it('should provide access to cache operations', () => {
    const { result } = renderHook(() => useQuilttClient(), {
      wrapper: ({ children }) => <MockedProvider mocks={[]}>{children}</MockedProvider>,
    })

    const client = result.current

    expect(client.cache.readQuery).toBeDefined()
    expect(client.cache.writeQuery).toBeDefined()
    expect(client.cache.readFragment).toBeDefined()
    expect(client.cache.writeFragment).toBeDefined()
  })

  it('should allow writing to cache directly', async () => {
    const { result } = renderHook(() => useQuilttClient(), {
      wrapper: ({ children }) => <MockedProvider mocks={[]}>{children}</MockedProvider>,
    })

    const client = result.current

    // Write data to cache
    client.cache.writeQuery({
      query: SAMPLE_QUERY,
      data: {
        profile: {
          __typename: 'Profile',
          id: '456',
          name: 'Cache User',
          email: 'cache@example.com',
        },
      },
    })

    // Read data from cache
    const cachedData = client.cache.readQuery<{ profile: Profile }>({ query: SAMPLE_QUERY })

    expect(cachedData?.profile).toEqual({
      __typename: 'Profile',
      id: '456',
      name: 'Cache User',
      email: 'cache@example.com',
    })
  })

  it('should support refetching queries', async () => {
    let callCount = 0
    const mocks = [
      {
        request: {
          query: SAMPLE_QUERY,
        },
        result: () => {
          callCount++
          return {
            data: {
              profile: {
                id: '123',
                name: `User ${callCount}`,
                email: 'user@example.com',
              },
            },
          }
        },
      },
      {
        request: {
          query: SAMPLE_QUERY,
        },
        result: () => {
          callCount++
          return {
            data: {
              profile: {
                id: '123',
                name: `User ${callCount}`,
                email: 'user@example.com',
              },
            },
          }
        },
      },
    ]

    const { result } = renderHook(() => useQuilttClient(), {
      wrapper: ({ children }) => <MockedProvider mocks={mocks}>{children}</MockedProvider>,
    })

    const client = result.current

    // First query
    const response1 = await client.query<{ profile: Profile }>({ query: SAMPLE_QUERY })
    expect(response1.data?.profile.name).toBe('User 1')

    // Refetch
    const response2 = await client.query<{ profile: Profile }>({
      query: SAMPLE_QUERY,
      fetchPolicy: 'network-only',
    })
    expect(response2.data?.profile.name).toBe('User 2')
  })

  it('should return the same client instance on re-render', () => {
    const { result, rerender } = renderHook(() => useQuilttClient(), {
      wrapper: ({ children }) => <MockedProvider mocks={[]}>{children}</MockedProvider>,
    })

    const firstClient = result.current
    rerender()
    const secondClient = result.current

    expect(firstClient).toBe(secondClient)
  })

  it('should work with multiple simultaneous queries', async () => {
    const QUERY_A = gql`
      query GetUserA {
        userA {
          id
          name
        }
      }
    `

    const QUERY_B = gql`
      query GetUserB {
        userB {
          id
          name
        }
      }
    `

    const mocks = [
      {
        request: { query: QUERY_A },
        result: {
          data: { userA: { id: '1', name: 'User A' } },
        },
      },
      {
        request: { query: QUERY_B },
        result: {
          data: { userB: { id: '2', name: 'User B' } },
        },
      },
    ]

    const { result } = renderHook(() => useQuilttClient(), {
      wrapper: ({ children }) => <MockedProvider mocks={mocks}>{children}</MockedProvider>,
    })

    const client = result.current

    const [responseA, responseB] = await Promise.all([
      client.query<{ userA: User }>({ query: QUERY_A }),
      client.query<{ userB: User }>({ query: QUERY_B }),
    ])

    expect(responseA.data?.userA.name).toBe('User A')
    expect(responseB.data?.userB.name).toBe('User B')
  })

  it('should support cache reset', async () => {
    const mocks = [
      {
        request: { query: SAMPLE_QUERY },
        result: {
          data: {
            profile: {
              id: '123',
              name: 'John Doe',
              email: 'john@example.com',
            },
          },
        },
      },
    ]

    const { result } = renderHook(() => useQuilttClient(), {
      wrapper: ({ children }) => <MockedProvider mocks={mocks}>{children}</MockedProvider>,
    })

    const client = result.current

    // Query to populate cache
    await client.query<{ profile: Profile }>({ query: SAMPLE_QUERY })

    // Verify cache has data
    const cachedBefore = client.cache.readQuery<{ profile: Profile }>({ query: SAMPLE_QUERY })
    expect(cachedBefore?.profile).toBeDefined()

    // Reset cache
    await client.resetStore()

    // Verify cache is empty
    const cachedAfter = client.cache.readQuery<{ profile: Profile }>({ query: SAMPLE_QUERY })
    expect(cachedAfter).toBeNull()
  })
})
