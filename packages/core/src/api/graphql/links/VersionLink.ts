import { ApolloLink } from '@apollo/client/core'

import { version } from '@/config'
import { extractVersionNumber, getUserAgent } from '@/utils/telemetry'

export const createVersionLink = (platformInfo: string) => {
  const versionNumber = extractVersionNumber(version)
  const userAgent = getUserAgent(versionNumber, platformInfo)

  return new ApolloLink((operation, forward) => {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        'Quiltt-Client-Version': version,
        'Quiltt-SDK-Agent': userAgent,
        'User-Agent': userAgent,
      },
    }))
    return forward(operation)
  })
}
