import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Platform } from 'react-native'
import { WebView } from 'react-native-webview'
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes'
import SafariWebAuth from 'react-native-safari-web-auth'
// React Native's URL implementation is incomplete
// https://github.com/facebook/react-native/issues/16434
import { URL } from 'react-native-url-polyfill'
import * as Linking from 'expo-linking'

import {
  ConnectorSDKCallbackMetadata,
  ConnectorSDKCallbacks,
  ConnectorSDKEventType,
  useQuilttSession,
} from '@quiltt/react'

import { ErrorReporter, getErrorMessage } from '../utils/error'
import { version } from '../version'

import { AndroidSafeAreaView } from './AndroidSafeAreaView'
import { ErrorScreen } from './ErrorScreen'
import { LoadingScreen } from './LoadingScreen'

const errorReporter = new ErrorReporter(`${Platform.OS} ${Platform.Version}`)
const PREFLIGHT_RETRY_COUNT = 3

type PreFlightCheck = {
  checked: boolean
  error?: string
}

// Ensure the OAuth URL opens in the external browser
const handleOAuthUrl = (oauthUrl: string) => {
  if (!oauthUrl.startsWith('https://')) {
    console.log(`handleOAuthUrl - Skipping non-https URL - ${oauthUrl}`)
    return
  }
  if (Platform.OS === 'ios' && parseInt(Platform.Version.toString(), 10) >= 12) {
    SafariWebAuth.requestAuth(oauthUrl)
  }
  Linking.openURL(oauthUrl)
}

const checkConnectorUrl = async (connectorUrl: string, retryCount = 0): Promise<PreFlightCheck> => {
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
  const encodedOAuthRedirectUrl = useMemo(
    () => encodeURIComponent(oauthRedirectUrl),
    [oauthRedirectUrl]
  )
  const connectorUrl = useMemo(() => {
    const url: URL = new URL(`https://${connectorId}.quiltt.app`)
    url.searchParams.append('mode', 'webview')
    url.searchParams.append('oauth_redirect_url', encodedOAuthRedirectUrl)
    url.searchParams.append('agent', `react-native-${version}`)
    return url.toString()
  }, [connectorId, encodedOAuthRedirectUrl])
  const [preFlightCheck, setPreFlightCheck] = useState<PreFlightCheck>({ checked: false })

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

  const shouldRender = useCallback(
    (url: URL) => {
      if (isQuilttEvent(url)) return false
      return url.protocol === 'https:'
    },
    [isQuilttEvent]
  )

  const clearLocalStorage = () => {
    const script = 'localStorage.clear();'
    webViewRef.current?.injectJavaScript(script)
  }

  const handleQuilttEvent = useCallback(
    (url: URL) => {
      url.searchParams.delete('source')
      url.searchParams.append('connectorId', connectorId)
      const metadata = Object.fromEntries(url.searchParams) as ConnectorSDKCallbackMetadata

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
          handleOAuthUrl(url.searchParams.get('oauthUrl') as string)
          break
        default:
          console.log('unhandled event', url)
          break
      }
    },
    [
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
      handleOAuthUrl(url.href)
      return false
    },
    [handleQuilttEvent, isQuilttEvent, shouldRender]
  )

  if (!preFlightCheck.checked) return <LoadingScreen testId="loading-screen" />
  if (preFlightCheck.error)
    return (
      <ErrorScreen
        testId="error-screen"
        error={preFlightCheck.error}
        cta={() => onExitError?.({ connectorId })}
      />
    )

  return (
    <AndroidSafeAreaView testId={testId}>
      <WebView
        testID="webview"
        ref={webViewRef}
        // Plaid keeps sending window.location = 'about:srcdoc' and causes some noise in RN
        // All whitelists are now handled in requestHandler, handleQuilttEvent and handleOAuthUrl
        originWhitelist={['*']}
        source={{ uri: connectorUrl }}
        onShouldStartLoadWithRequest={requestHandler}
        javaScriptEnabled
        domStorageEnabled // To enable localStorage in Android webview
        webviewDebuggingEnabled
      />
    </AndroidSafeAreaView>
  )
}

QuilttConnector.displayName = 'QuilttConnector'

export { QuilttConnector }
