import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Linking, Platform } from 'react-native'
// React Native's URL implementation is incomplete
// https://github.com/facebook/react-native/issues/16434
import { URL } from 'react-native-url-polyfill'
import { WebView } from 'react-native-webview'
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes'

import {
  ConnectorSDKCallbackMetadata,
  ConnectorSDKCallbacks,
  ConnectorSDKEventType,
  useQuilttSession,
} from '@quiltt/react'

import { ErrorReporter, getErrorMessage } from '../utils'
import { version } from '../version'
import { AndroidSafeAreaView } from './AndroidSafeAreaView'
import { ErrorScreen } from './ErrorScreen'
import { LoadingScreen } from './LoadingScreen'

const errorReporter = new ErrorReporter(`${Platform.OS} ${Platform.Version}`)

type QuilttConnectorProps = {
  connectorId: string
  connectionId?: string
  institution?: string
  oauthRedirectUrl: string
} & ConnectorSDKCallbacks

type PreFlightCheck = {
  checked: boolean
  error?: string
}

const PREFLIGHT_RETRY_COUNT = 3

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

  const checkConnectorUrl = useCallback(
    async (retryCount = 0): Promise<PreFlightCheck> => {
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

      // Retry logic in case of error or response not OK
      if (errorOccurred && retryCount < PREFLIGHT_RETRY_COUNT) {
        const delay = 50 * Math.pow(2, retryCount) // Exponential back-off
        await new Promise((resolve) => setTimeout(resolve, delay)) // delay with exponential back-off for each retry
        console.log(`Retrying... Attempt number ${retryCount + 1}`)
        return checkConnectorUrl(retryCount + 1)
      }

      const errorMessage = getErrorMessage(responseStatus, error as Error)
      const errorToSend = (error as Error) || new Error(errorMessage)
      const context = { connectorUrl, responseStatus }
      if (responseStatus !== 404) errorReporter.send(errorToSend, context)
      return { checked: true, error: errorMessage }
    },
    [connectorUrl]
  )

  useEffect(() => {
    if (preFlightCheck.checked) return
    const fetchDataAndSetState = async () => {
      const connectorUrlStatus = await checkConnectorUrl()
      setPreFlightCheck(connectorUrlStatus)
    }
    fetchDataAndSetState()
  }, [checkConnectorUrl, preFlightCheck])

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

  // allowedListUrl & shouldRender ensure we are only rendering Quiltt, MX and Plaid content in Webview
  // For other urls, we assume those are bank urls, which needs to be handle in external browser.
  // @todo Convert it to a list from Quiltt Server to prevent MX/ Plaid changes.
  const allowedListUrl = useMemo(
    () => [
      'quiltt.app',
      'quiltt.dev',
      'moneydesktop.com',
      'cdn.plaid.com/link/v2/stable/link.html',
    ],
    []
  )

  const isQuilttEvent = useCallback((url: URL) => url.protocol === 'quilttconnector:', [])

  const shouldRender = useCallback(
    (url: URL) => {
      if (isQuilttEvent(url)) return false
      if (url.protocol !== 'https:') {
        return false
      }
      return allowedListUrl.some((href) => url.href.includes(href))
    },
    [allowedListUrl, isQuilttEvent]
  )

  const clearLocalStorage = () => {
    const script = 'localStorage.clear();'
    webViewRef.current?.injectJavaScript(script)
  }

  const handleOAuthUrl = useCallback((oauthUrl: URL) => {
    if (oauthUrl.protocol !== 'https:') {
      console.log(`handleOAuthUrl - Skipping non https url - ${oauthUrl.href}`)
      return
    }
    Linking.openURL(oauthUrl.href)
  }, [])

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
          // @todo handle Authenticate
          break
        case 'OauthRequested':
          handleOAuthUrl(new URL(url.searchParams.get('oauthUrl') as string))
          break
        default:
          console.log('unhandled event', url)
          break
      }
    },
    [
      connectorId,
      handleOAuthUrl,
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
    [handleOAuthUrl, handleQuilttEvent, isQuilttEvent, shouldRender]
  )

  if (!preFlightCheck.checked) return <LoadingScreen />
  if (preFlightCheck.error)
    return <ErrorScreen error={preFlightCheck.error} cta={() => onExitError?.({ connectorId })} />

  return (
    <AndroidSafeAreaView>
      <WebView
        ref={webViewRef}
        // Plaid keep sending window.location = 'about:srcdoc' and causes some noise in RN
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
