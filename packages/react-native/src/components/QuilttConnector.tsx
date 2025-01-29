import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Linking, Platform } from 'react-native'
import { StyleSheet } from 'react-native'
import { URL } from 'react-native-url-polyfill' // https://github.com/facebook/react-native/issues/16434
import { WebView } from 'react-native-webview'
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes'

import { ConnectorSDKEventType, useQuilttSession } from '@quiltt/react'
import type { ConnectorSDKCallbackMetadata, ConnectorSDKCallbacks } from '@quiltt/react'

import { ErrorReporter, getErrorMessage } from '../utils'
import { version } from '../version'
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

type QuilttConnectorProps = {
  testId?: string
  connectorId: string
  connectionId?: string
  institution?: string
  oauthRedirectUrl: string
} & ConnectorSDKCallbacks

const QuilttConnector = ({
  testId,
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

  const encodedOAuthRedirectUrl = useMemo(
    () => encodeURIComponent(oauthRedirectUrl),
    [oauthRedirectUrl]
  )

  const connectorUrl = useMemo(() => {
    const url = new URL(`https://${connectorId}.quiltt.app`)
    url.searchParams.append('mode', 'webview')
    url.searchParams.append('oauth_redirect_url', encodedOAuthRedirectUrl)
    url.searchParams.append('agent', `react-native-${version}`)
    return url.toString()
  }, [connectorId, encodedOAuthRedirectUrl])

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
            initInjectedJavaScript()
            onEvent?.(ConnectorSDKEventType.Load, metadata)
            onLoad?.(metadata)
            break
          case 'ExitAbort':
            clearLocalStorage()
            onEvent?.(ConnectorSDKEventType.ExitAbort, metadata)
            onExit?.(ConnectorSDKEventType.ExitAbort, metadata)
            onExitAbort?.(metadata)
            break
          case 'ExitError':
            clearLocalStorage()
            onEvent?.(ConnectorSDKEventType.ExitError, metadata)
            onExit?.(ConnectorSDKEventType.ExitError, metadata)
            onExitError?.(metadata)
            break
          case 'ExitSuccess':
            clearLocalStorage()
            onEvent?.(ConnectorSDKEventType.ExitSuccess, metadata)
            onExit?.(ConnectorSDKEventType.ExitSuccess, metadata)
            onExitSuccess?.(metadata)
            break
          case 'Authenticate':
            // TODO: handle Authenticate
            break
          case 'OauthRequested':
            handleOAuthUrl(new URL(url.searchParams.get('oauthUrl') as string))
            break
          default:
            console.log('unhandled event', url)
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
      if (shouldRender(url)) return true
      // Plaid set oauth url by doing window.location.href = url
      // So we use `handleOAuthUrl` as a catch all and assume all url got to this step is Plaid OAuth url
      handleOAuthUrl(url)
      return false
    },
    [handleQuilttEvent, isQuilttEvent, shouldRender]
  )

  if (!preFlightCheck.checked) return <LoadingScreen testId="loading-screen" />
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
        testID="webview"
        ref={webViewRef}
        // Plaid keeps sending window.location = 'about:srcdoc' and causes some noise in RN
        // All whitelists are now handled in requestHandler, handleQuilttEvent and handleOAuthUrl
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
