import { Linking, Platform } from 'react-native'
import { URL } from 'react-native-url-polyfill'
import { ErrorReporter } from '../error'

const errorReporter = new ErrorReporter(`${Platform.OS} ${Platform.Version}`)

export const handleOAuthUrl = async (
  oauthUrl: URL,
  context?: Record<string, unknown>
): Promise<void> => {
  const parsedUrl = new URL(oauthUrl.href)
  try {
    // Check if the URL protocol is HTTPS
    if (parsedUrl.protocol !== 'https:') {
      console.warn(`handleOAuthUrl - Skipping non-HTTPS URL - ${parsedUrl.href}`)
      return
    }

    // Open the URL using Linking module
    await Linking.openURL(parsedUrl.href)
  } catch (error) {
    console.error('handleOAuthUrl - Error opening URL:', error)

    // Report error to HoneyBadger
    const errorContext = { ...context, oauthUrl: parsedUrl.href, passedUrl: oauthUrl.toString() }
    await errorReporter.send(error as Error, errorContext)
  }
}
