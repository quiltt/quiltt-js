import { name as packageName, version as packageVersion } from '../package.json'

const QUILTT_API_INSECURE = (() => {
  try {
    if (process.env.QUILTT_API_INSECURE === 'true' || process.env.QUILTT_API_INSECURE === 'false') {
      return process.env.QUILTT_API_INSECURE === 'true'
    }
    return process.env.QUILTT_API_INSECURE
  } catch {
    return undefined
  }
})()

const QUILTT_API_DOMAIN = (() => {
  try {
    return process.env.QUILTT_API_DOMAIN
  } catch {
    return undefined
  }
})()

const QUILTT_DEBUG = (() => {
  try {
    return !!process.env.QUILTT_DEBUG || process.env.NODE_ENV !== 'production'
  } catch {
    return false
  }
})()

const domain = QUILTT_API_DOMAIN || 'quiltt.io'
const protocolHttp = `http${QUILTT_API_INSECURE ? '' : 's'}`
const protocolWebsockets = `ws${QUILTT_API_INSECURE ? '' : 's'}`

export const debugging = QUILTT_DEBUG
export const version = `${packageName}: v${packageVersion}`

export const cdnBase = `${protocolHttp}://cdn.${domain}`
export const endpointAuth = `${protocolHttp}://auth.${domain}/v1/users/session`
export const endpointGraphQL = `${protocolHttp}://api.${domain}/v1/graphql`
export const endpointWebsockets = `${protocolWebsockets}://api.${domain}/websockets`
