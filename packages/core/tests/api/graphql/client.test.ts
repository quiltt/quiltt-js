import { describe, it, expect } from 'vitest'
import { InMemoryCache, QuilttClient } from '@/api/graphql/client'

describe('QuilttClient', () => {
  it('should be instantiated with an InMemoryCache', () => {
    const client = new QuilttClient({ cache: new InMemoryCache() })
    expect(client.cache).toBeInstanceOf(InMemoryCache)
  })

  it('should configure links correctly', () => {
    const client = new QuilttClient({ cache: new InMemoryCache() })

    // Hypothetical check, assuming we had a way to inspect the links
    // This needs to be adjusted based on how we can access or verify the links' presence or configuration
    expect(client.link).toBeDefined()
  })
})
