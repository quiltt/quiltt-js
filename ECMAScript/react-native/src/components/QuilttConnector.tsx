import {
  ConnectorSDKCallbackMetadata,
  ConnectorSDKCallbacks,
  ConnectorSDKEventType,
} from '@quiltt/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Linking, View, Text, ActivityIndicator, Platform } from 'react-native'
import { WebView } from 'react-native-webview'
// React Native's URL implementation is incomplete
// https://github.com/facebook/react-native/issues/16434
import { URL } from 'react-native-url-polyfill'
import { AndroidSafeAreaView } from './AndroidSafeAreaView'
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes'
import { useQuilttSession } from '@quiltt/react'
import { ErrorReporter } from '../utils/ErrorReporter'

import { version } from '../version'

const errorReporter = new ErrorReporter(`${Platform.OS} ${Platform.Version}`)

type QuilttConnectorProps = {
  connectorId: string
  connectionId?: string
  oauthRedirectUrl: string
} & ConnectorSDKCallbacks

type PreFlightCheck = {
  checked: boolean
  error?: string
}

const PREFLIGHT_RETRY_COUNT = 3

export const QuilttConnector = ({
  connectorId,
  connectionId,
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
  oauthRedirectUrl = encodeURIComponent(oauthRedirectUrl)
  const connectorUrl = `https://${connectorId}.quiltt.app/?mode=webview&oauth_redirect_url=${oauthRedirectUrl}&agent=react-native-${version}`
  console.log('connectorUrl', connectorUrl)
  const [preFlightCheck, setPreFlightCheck] = useState<PreFlightCheck>({ checked: false })

  const checkConnectorUrl = useCallback(
    async (retryCount = 0): Promise<PreFlightCheck> => {
      try {
        const response = await fetch(connectorUrl)
        if (!response.ok) {
          console.error(`The URL ${connectorUrl} is not routable.`)
          // Make retryCount a constant
          // backoff by delay
          if (retryCount < PREFLIGHT_RETRY_COUNT) {
            await new Promise((resolve) => setTimeout(resolve, 50 * retryCount)) // delay for 50ms for each retry
            console.log(`Retrying... Attempt number ${retryCount + 1}`)
            return checkConnectorUrl(retryCount + 1)
          }
          errorReporter.send(
            new Error(
              `Retry exhausted, failed to fetch connectorUrl: ${connectorUrl}, status: ${response.status}`
            )
          )
          return { checked: true, error: 'Failed to reach connector url.' }
        }
        console.log(`The URL ${connectorUrl} is routable.`)
        return { checked: true }
      } catch (error) {
        console.error(`An error occurred while checking the connector URL: ${error}`)
        // Retry logic in case of error
        if (retryCount < PREFLIGHT_RETRY_COUNT) {
          await new Promise((resolve) => setTimeout(resolve, 50 * retryCount)) // delay for 50ms for each retry
          console.log(`Retrying... Attempt number ${retryCount + 1}`)
          return checkConnectorUrl(retryCount + 1)
        }
        const context = { connectorUrl }
        errorReporter.send(error as Error, context)
        return { checked: true, error: 'An error occurred while checking the connector URL.' }
      }
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
  }, [connectionId, connectorId, session?.token])

  // allowedListUrl & shouldRender ensure we are only rendering Quiltt, MX and Plaid content in Webview
  // For other urls, we assume those are bank urls, which needs to be handle in external browser.
  // @todo Convert it to a list from Quiltt Server to prevent MX/ Plaid changes.
  const allowedListUrl = [
    'quiltt.app',
    'quiltt.dev',
    'moneydesktop.com',
    'cdn.plaid.com/link/v2/stable/link.html',
  ]
  const shouldRender = (url: URL) => {
    if (isQuilttEvent(url)) return false
    return allowedListUrl.some((href) => url.href.includes(href))
  }

  const requestHandler = (request: ShouldStartLoadRequest) => {
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
  }

  const clearLocalStorage = () => {
    const script = 'localStorage.clear();'
    webViewRef.current?.injectJavaScript(script)
  }

  const isQuilttEvent = (url: URL) => url.protocol === 'quilttconnector:'

  const handleQuilttEvent = (url: URL) => {
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
  }

  const handleOAuthUrl = (oauthUrl: URL) => {
    if (oauthUrl.protocol !== 'https:') {
      console.log(`handleOAuthUrl - Skipping non https url - ${oauthUrl.href}`)
      return
    }
    Linking.openURL(oauthUrl.href)
  }

  if (!preFlightCheck.checked) {
    return (
      <AndroidSafeAreaView>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </AndroidSafeAreaView>
    )
  }

  if (preFlightCheck.error) {
    return (
      <AndroidSafeAreaView>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            borderRadius: 10,
            backgroundColor: '#fff',
          }}
        >
          <Text style={{ fontSize: 24, marginBottom: 10 }}>Error</Text>
          <Text style={{ fontSize: 18 }}>{preFlightCheck.error}</Text>
        </View>
      </AndroidSafeAreaView>
    )
  } else {
    return (
      <AndroidSafeAreaView>
        <WebView
          ref={webViewRef}
          originWhitelist={['https://*', 'quilttconnector://*']} // Maybe relax this to *?
          source={{ uri: connectorUrl }}
          onShouldStartLoadWithRequest={requestHandler}
          javaScriptEnabled
          domStorageEnabled // To enable localStorage in Android webview
          webviewDebuggingEnabled // Not sure if this works
        />
      </AndroidSafeAreaView>
    )
  }
}

export default QuilttConnector
