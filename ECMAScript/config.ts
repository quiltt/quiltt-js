// @ts-ignore
import { name as packageName, version as packageVersion } from './react/package.json'

const QUILTT_API_INSECURE = (() => {
  try {
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
const protocolWebsockets = `ws${QUILTT_API_DOMAIN ? '' : 's'}`

export const debugging = QUILTT_DEBUG
export const endpointAuth = `${protocolHttp}://auth.${domain}/v1/users/session`
export const endpointGraphQL = `${protocolHttp}://api.${domain}/v1/graphql`
export const endpointWebsockets = `${protocolWebsockets}://api.${domain}/websockets`
export const version = `${packageName}: v${packageVersion}`

const Config = {
  debugging,
  endpointAuth,
  endpointGraphQL,
  endpointWebsockets,
  version,
}

export default Config
