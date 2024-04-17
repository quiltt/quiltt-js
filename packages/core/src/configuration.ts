/// <reference types="vite/client" />

import { name as packageName, version as packageVersion } from '../package.json'

const getImportMetaEnv = (key: string): string | undefined => {
  return import.meta.env[key]
}

/**
 * Retrieves the environment variable by key, with fallback and type conversion,
 * supporting Node.js, Vite, and potentially other runtime environments.
 */
export const getEnv = (key: string, fallback: any = undefined): any => {
  let value: string | undefined

  // Check if running under Node.js and use process.env
  if (typeof process !== 'undefined' && process.env) {
    value = process.env[key]
  }

  // If running under Vite, use import.meta.env
  if (!value) {
    const viteKey = `VITE_${key}`
    value = getImportMetaEnv(viteKey)
  }

  // Return the value after type conversion if necessary or use fallback
  if (value === undefined || value === null) {
    return fallback
  }

  // Convert to boolean if the value is 'true' or 'false'
  if (value === 'true' || value === 'false') {
    return value === 'true'
  }

  // Convert to number if it's numeric
  if (!isNaN(Number(value))) {
    return Number(value)
  }

  return value
}

const QUILTT_API_INSECURE = getEnv('QUILTT_API_INSECURE', false)
const QUILTT_API_DOMAIN = getEnv('QUILTT_API_DOMAIN', 'quiltt.io')
const QUILTT_DEBUG = getEnv('QUILTT_DEBUG', import.meta.env.MODE !== 'production')

const domain = QUILTT_API_DOMAIN || 'quiltt.io'
const protocolHttp = `http${QUILTT_API_INSECURE ? '' : 's'}`
const protocolWebsockets = `ws${QUILTT_API_INSECURE ? '' : 's'}`

export const debugging = QUILTT_DEBUG
export const version = `${packageName}: v${packageVersion}`

export const cdnBase = `${protocolHttp}://cdn.${domain}`
export const endpointAuth = `${protocolHttp}://auth.${domain}/v1/users/session`
export const endpointGraphQL = `${protocolHttp}://api.${domain}/v1/graphql`
export const endpointWebsockets = `${protocolWebsockets}://api.${domain}/websockets`
