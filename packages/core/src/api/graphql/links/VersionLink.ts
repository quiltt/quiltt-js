import { ApolloLink } from '@apollo/client/core/index.js'

import { version } from '@/configuration'
import { getUserAgent } from '@/utils/telemetry'

export const createVersionLink = (platformInfo: string) => {
  const userAgent = getUserAgent(version, platformInfo)

  return new ApolloLink((operation, forward) => {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        'Quiltt-Client-Version': version,
        'User-Agent': userAgent,
      },
    }))
    return forward(operation)
  })
}

// Keep backward compatibility - default Web platform
export const VersionLink = createVersionLink('Web')

export default VersionLink
