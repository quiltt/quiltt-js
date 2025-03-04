import { ErrorReporter, getErrorMessage } from '@/utils'
import { Linking, Platform } from 'react-native'
import type { URL } from 'react-native-url-polyfill'

const errorReporter = new ErrorReporter(`${Platform.OS} ${Platform.Version}`)
const PREFLIGHT_RETRY_COUNT = 3

export type PreFlightCheck = {
  checked: boolean
  error?: string
}

export const checkConnectorUrl = async (
  connectorUrl: string,
  retryCount = 0
): Promise<PreFlightCheck> => {
  let responseStatus: number | undefined
  let error: Error | undefined
  try {
    const response = await fetch(connectorUrl)
    if (!response.ok) {
      responseStatus = response.status
      throw new Error(`The URL ${connectorUrl} is not routable.`)
    }
    console.log(`The URL ${connectorUrl} is routable.`)
    return { checked: true }
  } catch (e) {
    error = e as Error
    console.error(`An error occurred while checking the connector URL: ${error}`)

    if (retryCount < PREFLIGHT_RETRY_COUNT) {
      const delay = 50 * 2 ** retryCount
      await new Promise((resolve) => setTimeout(resolve, delay))
      console.log(`Retrying... Attempt number ${retryCount + 1}`)
      return checkConnectorUrl(connectorUrl, retryCount + 1)
    }
    const errorMessage = getErrorMessage(responseStatus, error as Error)
    const errorToSend = (error as Error) || new Error(errorMessage)
    const context = { connectorUrl, responseStatus }
    if (responseStatus !== 404) await errorReporter.send(errorToSend, context)
    return { checked: true, error: errorMessage }
  }
}

export const handleOAuthUrl = (oauthUrl: URL | string) => {
  console.log(`handleOAuthUrl - Opening URL - ${oauthUrl.toString()}`)
  Linking.openURL(oauthUrl.toString())
}

export const isQuilttEvent = (url: URL) => url.protocol === 'quilttconnector:'
