import { getErrorMessage, ErrorReporter } from '../error'
import { Platform } from 'react-native'

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
  let responseStatus
  let error
  let errorOccurred = false
  try {
    const response = await fetch(connectorUrl)
    if (!response.ok) {
      console.error(`The URL ${connectorUrl} is not routable.`)
      responseStatus = response.status
      errorOccurred = true
    } else {
      console.log(`The URL ${connectorUrl} is routable.`)
      return { checked: true }
    }
  } catch (e) {
    error = e
    console.error(`An error occurred while checking the connector URL: ${error}`)
    errorOccurred = true
  }

  if (errorOccurred && retryCount < PREFLIGHT_RETRY_COUNT) {
    const delay = 50 * Math.pow(2, retryCount)
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
