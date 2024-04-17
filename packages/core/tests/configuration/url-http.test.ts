// Tests are split by https/http to simplify the setup and avoid dynamic module reloading within each test.
import { describe, it, expect, beforeEach, vi } from 'vitest'

let config: any

beforeEach(async () => {
  vi.stubGlobal('process', {
    env: { QUILTT_API_INSECURE: 'true' },
  })
  config = await import('@/configuration')
})

describe('Configuration under HTTP', () => {
  it('should use HTTP for CDN Base', () => {
    expect(config.cdnBase).toBe('http://cdn.quiltt.io')
  })

  it('should use WS for Websockets', () => {
    expect(config.endpointWebsockets).toBe('ws://api.quiltt.io/websockets')
  })

  // Additional tests specific to HTTP configuration
})

describe('Endpoint Accessibility under HTTP', () => {
  it('should access auth endpoint over HTTP', () => {
    expect(config.endpointAuth).toBe('http://auth.quiltt.io/v1/users/session')
  })

  it('should access GraphQL endpoint over HTTP', () => {
    expect(config.endpointGraphQL).toBe('http://api.quiltt.io/v1/graphql')
  })
})
