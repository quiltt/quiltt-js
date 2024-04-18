import { describe, it, expect, beforeEach } from 'vitest'
import { name as packageName, version as packageVersion } from '../package.json'

// Function to load the configuration with cache busting
const loadConfig = async (envConfig: Record<string, string | undefined>) => {
  // Set environment variables
  for (const key of Object.keys(envConfig)) {
    process.env[key] = envConfig[key]
  }

  // Cache busting by appending a query string based on the current timestamp
  const configModulePath = `@/configuration?update=${Date.now()}`
  return import(configModulePath)
}

describe('Configuration Constants', () => {
  it('should format the version correctly', async () => {
    const config = await loadConfig({})
    expect(config.version).toBe(`${packageName}: v${packageVersion}`)
  })

  it('should reflect the correct debugging status based on environment', async () => {
    const config = await loadConfig({ NODE_ENV: 'development' })
    expect(config.debugging).toBeTruthy()
  })
})

describe.each([
  ['true', 'http', 'ws'],
  ['false', 'https', 'wss'],
])('Configuration under insecure=%s', (insecure, httpProtocol, wsProtocol) => {
  let config: any

  beforeEach(async () => {
    config = await loadConfig({ QUILTT_API_INSECURE: insecure })
  })

  it(`should use ${httpProtocol.toUpperCase()} for CDN and endpoints`, () => {
    expect(config.cdnBase.startsWith(`${httpProtocol}://`)).toBeTruthy()
    expect(config.endpointAuth.startsWith(`${httpProtocol}://`)).toBeTruthy()
    expect(config.endpointGraphQL.startsWith(`${httpProtocol}://`)).toBeTruthy()
  })

  it(`should use ${wsProtocol.toUpperCase()} for Websockets`, () => {
    expect(config.endpointWebsockets.startsWith(`${wsProtocol}://`)).toBeTruthy()
  })
})
