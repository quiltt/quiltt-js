import { ApolloLink } from '@apollo/client/core'

import { version } from '@/config'
import { extractVersionNumber, getSDKAgent } from '@/utils/telemetry'

export const createVersionLink = (platformInfo: string) => {
  const versionNumber = extractVersionNumber(version)
  const sdkAgent = getSDKAgent(versionNumber, platformInfo)

  return new ApolloLink((operation, forward) => {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        'Quiltt-Client-Version': version,
        'Quiltt-SDK-Agent': sdkAgent,
        ...headers,
      },
    }))
    return forward(operation)
  })
}
