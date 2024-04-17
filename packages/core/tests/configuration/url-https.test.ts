// Tests are split by https/http to simplify the setup and avoid dynamic module reloading within each test.
import { describe, it, expect, beforeEach, vi } from 'vitest'

let config: any

beforeEach(async () => {
  vi.stubGlobal('process', {
    env: { QUILTT_API_INSECURE: 'false' },
  })
  config = await import('@/configuration')
})

describe('Configuration under HTTPS', () => {
  it('should use HTTPS for CDN Base', () => {
    expect(config.cdnBase).toBe('https://cdn.quiltt.io')
  })

  it('should use WSS for Websockets', () => {
    expect(config.endpointWebsockets).toBe('wss://api.quiltt.io/websockets')
  })

  // Additional tests specific to HTTPS configuration
})

describe('Endpoint Accessibility under HTTPS', () => {
  it('should access auth endpoint over HTTPS', () => {
    expect(config.endpointAuth).toBe('https://auth.quiltt.io/v1/users/session')
  })

  it('should access GraphQL endpoint over HTTPS', () => {
    expect(config.endpointGraphQL).toBe('https://api.quiltt.io/v1/graphql')
  })
})
