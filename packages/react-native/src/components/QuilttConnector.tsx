import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Linking, Platform } from 'react-native'
import { StyleSheet } from 'react-native'
import { URL } from 'react-native-url-polyfill' // https://github.com/facebook/react-native/issues/16434
import { WebView } from 'react-native-webview'
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes'

import { ConnectorSDKEventType, useQuilttSession } from '@quiltt/react'
import type { ConnectorSDKCallbackMetadata, ConnectorSDKCallbacks } from '@quiltt/react'

import {
  ErrorReporter,
  getErrorMessage,
  isEncoded,
  normalizeUrlEncoding,
  smartEncodeURIComponent,
} from '@/utils'
import { version } from '@/version'
import { AndroidSafeAreaView } from './AndroidSafeAreaView'
import { ErrorScreen } from './ErrorScreen'
import { LoadingScreen } from './LoadingScreen'

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

    switch (response.status) {
      case 200:
        return { checked: true }

      case 400:
        console.log('Invalid configuration')
        return { checked: true }

      case 404:
        console.error('Connector not found')
        return { checked: true }

      default:
        throw new Error('Connector URL is not routable.')
    }
  } catch (error) {
    // Log error for debugging
    console.error(error)

    // Try again
    if (retryCount < PREFLIGHT_RETRY_COUNT) {
      const delay = 50 * 2 ** retryCount
      await new Promise((resolve) => setTimeout(resolve, delay))
      console.log(`Retrying connection... Attempt ${retryCount + 1}`)
      return checkConnectorUrl(connectorUrl, retryCount + 1)
    }

    // Report error after retries exhausted
    const errorMessage = getErrorMessage(responseStatus, error as Error)
    const errorToSend = (error as Error) || new Error(errorMessage)
    const context = { connectorUrl, responseStatus }
    await errorReporter.notify(errorToSend, context)

    // Return errored preflight check
    return { checked: true, error: errorMessage }
  }
}

/**
 * Handle opening OAuth URLs with proper encoding detection and normalization
 */
export const handleOAuthUrl = (oauthUrl: URL | string | null | undefined) => {
  try {
    // Throw error if oauthUrl is null or undefined
    if (oauthUrl == null) {
      throw new Error('OAuth URL missing')
    }

    // Convert to string if it's a URL object
    const urlString = oauthUrl.toString()

    // Throw error if the resulting string is empty
    if (!urlString || urlString.trim() === '') {
      throw new Error('Empty OAuth URL')
    }

    // Normalize the URL encoding
    const normalizedUrl = normalizeUrlEncoding(urlString)

    // Open the normalized URL
    Linking.openURL(normalizedUrl)
  } catch (error) {
    console.error('OAuth URL handling error')

    // Only try the fallback if oauthUrl is not null
    if (oauthUrl != null) {
      try {
        const fallbackUrl = typeof oauthUrl === 'string' ? oauthUrl : oauthUrl.toString()
        console.log('Attempting fallback OAuth opening')
        Linking.openURL(fallbackUrl)
      } catch (fallbackError) {
        console.error('Fallback OAuth opening failed')
      }
    }
  }
}

type QuilttConnectorProps = {
  connectorId: string
  connectionId?: string
  institution?: string
  oauthRedirectUrl: string
  testId?: string
} & ConnectorSDKCallbacks

const QuilttConnector = ({
  connectorId,
  connectionId,
  institution,
  oauthRedirectUrl,
  onEvent,
  onLoad,
  onExit,
  onExitSuccess,
  onExitAbort,
  onExitError,
  testId,
}: QuilttConnectorProps) => {
  const webViewRef = useRef<WebView>(null)
  const { session } = useQuilttSession()
  const [preFlightCheck, setPreFlightCheck] = useState<PreFlightCheck>({ checked: false })

  // Script to disable scrolling on header
  const disableHeaderScrollScript = `
    (function() {
      const header = document.querySelector('header');
      if (header) {
        header.style.position = 'fixed';
        header.style.top = '0';
        header.style.left = '0';
        header.style.right = '0';
        header.style.zIndex = '1000';
      }
    })();
  `

  const onLoadEnd = useCallback(() => {
    if (Platform.OS === 'ios') {
      webViewRef.current?.injectJavaScript(disableHeaderScrollScript)
    }
  }, [])

  // Ensure oauthRedirectUrl is encoded properly - only once
  const safeOAuthRedirectUrl = useMemo(() => {
    return smartEncodeURIComponent(oauthRedirectUrl)
  }, [oauthRedirectUrl])

  const connectorUrl = useMemo(() => {
    const url = new URL(`https://${connectorId}.quiltt.app`)

    // For normal parameters, just append them directly
    url.searchParams.append('mode', 'webview')
    url.searchParams.append('agent', `react-native-${version}`)

    // For the oauth_redirect_url, we need to be careful
    // If it's already encoded, we need to decode it once to prevent
    // the automatic encoding that happens with searchParams.append
    if (isEncoded(safeOAuthRedirectUrl)) {
      const decodedOnce = decodeURIComponent(safeOAuthRedirectUrl)
      url.searchParams.append('oauth_redirect_url', decodedOnce)
    } else {
      url.searchParams.append('oauth_redirect_url', safeOAuthRedirectUrl)
    }

    return url.toString()
  }, [connectorId, safeOAuthRedirectUrl])

  useEffect(() => {
    if (preFlightCheck.checked) return
    const fetchDataAndSetState = async () => {
      const connectorUrlStatus = await checkConnectorUrl(connectorUrl)
      setPreFlightCheck(connectorUrlStatus)
    }
    fetchDataAndSetState()
  }, [connectorUrl, preFlightCheck])

  const initInjectedJavaScript = useCallback(() => {
    const script = `\
      const options = {\
        source: 'quiltt',\
        type: 'Options',\
        token: '${session?.token}',\
        connectorId: '${connectorId}',\
        connectionId: '${connectionId}',\
        institution: '${institution}', \
      };\
      const compactedOptions = Object.keys(options).reduce((acc, key) => {\
        if (options[key] !== 'undefined') {\
          acc[key] = options[key];\
        }\
        return acc;\
      }, {});\
      window.postMessage(compactedOptions);\
    `
    webViewRef.current?.injectJavaScript(script)
  }, [connectionId, connectorId, institution, session?.token])

  const isQuilttEvent = useCallback((url: URL) => url.protocol === 'quilttconnector:', [])

  const shouldRender = useCallback((url: URL) => !isQuilttEvent(url), [isQuilttEvent])

  const clearLocalStorage = useCallback(() => {
    const script = 'localStorage.clear();'
    webViewRef.current?.injectJavaScript(script)
  }, [])

  const handleQuilttEvent = useCallback(
    (url: URL) => {
      url.searchParams.delete('source')
      url.searchParams.append('connectorId', connectorId)
      const metadata = Object.fromEntries(url.searchParams) as ConnectorSDKCallbackMetadata

      requestAnimationFrame(() => {
        const eventType = url.host
        switch (eventType) {
          case 'Load':
            console.log('Event: Load')
            initInjectedJavaScript()
            onEvent?.(ConnectorSDKEventType.Load, metadata)
            onLoad?.(metadata)
            break
          case 'ExitAbort':
            console.log('Event: ExitAbort')
            clearLocalStorage()
            onEvent?.(ConnectorSDKEventType.ExitAbort, metadata)
            onExit?.(ConnectorSDKEventType.ExitAbort, metadata)
            onExitAbort?.(metadata)
            break
          case 'ExitError':
            console.log('Event: ExitError')
            clearLocalStorage()
            onEvent?.(ConnectorSDKEventType.ExitError, metadata)
            onExit?.(ConnectorSDKEventType.ExitError, metadata)
            onExitError?.(metadata)
            break
          case 'ExitSuccess':
            console.log('Event: ExitSuccess')
            clearLocalStorage()
            onEvent?.(ConnectorSDKEventType.ExitSuccess, metadata)
            onExit?.(ConnectorSDKEventType.ExitSuccess, metadata)
            onExitSuccess?.(metadata)
            break
          case 'Authenticate':
            console.log('Event: Authenticate')
            // TODO: handle Authenticate
            break
          case 'Navigate': {
            console.log('Event: Navigate')
            const navigateUrl = url.searchParams.get('url')

            if (navigateUrl) {
              if (isEncoded(navigateUrl)) {
                try {
                  const decodedUrl = decodeURIComponent(navigateUrl)
                  handleOAuthUrl(decodedUrl)
                } catch (error) {
                  console.error('Navigate URL decoding failed, using original')
                  handleOAuthUrl(navigateUrl)
                }
              } else {
                handleOAuthUrl(navigateUrl)
              }
            } else {
              console.error('Navigate URL missing from request')
            }
            break
          }
          // NOTE: The `OauthRequested` is deprecated and should not be used
          default:
            console.log(`Unhandled event: ${eventType}`)
            break
        }
      })
    },
    [
      clearLocalStorage,
      connectorId,
      initInjectedJavaScript,
      onEvent,
      onExit,
      onExitAbort,
      onExitError,
      onExitSuccess,
      onLoad,
    ]
  )

  const requestHandler = useCallback(
    (request: ShouldStartLoadRequest) => {
      const url = new URL(request.url)

      if (isQuilttEvent(url)) {
        handleQuilttEvent(url)
        return false
      }

      if (shouldRender(url)) {
        return true
      }

      // Plaid set oauth url by doing window.location.href = url
      // So we use `handleOAuthUrl` as a catch all and assume all url got to this step is Plaid OAuth url
      handleOAuthUrl(url)
      return false
    },
    [handleQuilttEvent, isQuilttEvent, shouldRender]
  )

  if (!preFlightCheck.checked) {
    return <LoadingScreen testId="loading-screen" />
  }

  if (preFlightCheck.error) {
    return (
      <ErrorScreen
        testId="error-screen"
        error={preFlightCheck.error}
        cta={() => onExitError?.({ connectorId })}
      />
    )
  }

  return (
    <AndroidSafeAreaView testId={testId}>
      <WebView
        ref={webViewRef}
        // Plaid keeps sending window.location = 'about:srcdoc' and causes some noise in RN
        style={styles.webview}
        originWhitelist={['*']}
        source={{ uri: connectorUrl }}
        onShouldStartLoadWithRequest={requestHandler}
        onLoadEnd={onLoadEnd}
        javaScriptEnabled
        domStorageEnabled // To enable localStorage in Android webview
        webviewDebuggingEnabled
        bounces={false} // Controls the bouncing effect when scrolling past content boundaries (iOS only)
        scrollEnabled={true} // Enables scrolling within the WebView
        automaticallyAdjustContentInsets={false} // Disables automatic padding adjustments based on navigation bars/safe areas
        contentInsetAdjustmentBehavior="never" // Controls how the WebView adjusts its content layout relative to safe areas and system UI
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        testID="webview"
        {...(Platform.OS === 'ios'
          ? {
              decelerationRate: 'normal',
              keyboardDisplayRequiresUserAction: false,
              dataDetectorTypes: 'none',
              allowsInlineMediaPlayback: true,
              allowsBackForwardNavigationGestures: false,
              startInLoadingState: true,
              scrollEventThrottle: 16, // Optimize scroll performance
              overScrollMode: 'never', // Prevent overscroll effect
            }
          : {
              androidLayerType: 'hardware',
              cacheEnabled: true,
              cacheMode: 'LOAD_CACHE_ELSE_NETWORK',
            })}
      />
    </AndroidSafeAreaView>
  )
}

// Add styles for the WebView container
const styles = StyleSheet.create({
  webviewContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
    overflow: 'hidden', // Prevent content from overflowing
  },
})

QuilttConnector.displayName = 'QuilttConnector'

export { QuilttConnector }
