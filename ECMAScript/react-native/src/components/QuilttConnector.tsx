import {
  ConnectorSDKCallbackMetadata,
  ConnectorSDKCallbacks,
  ConnectorSDKEventType,
} from '@quiltt/core'
import { useCallback, useRef } from 'react'
import { Linking } from 'react-native'
import { WebView } from 'react-native-webview'
// React Native's URL implementation is incomplete
// https://github.com/facebook/react-native/issues/16434
import { URL } from 'react-native-url-polyfill'
import { AndroidSafeAreaView } from './AndroidSafeAreaView'
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes'
import { useQuilttSession } from '@quiltt/react'
import { version } from '../version'

type QuilttConnectorProps = {
  connectorId: string
  connectionId?: string
  oauthRedirectUrl: string
} & ConnectorSDKCallbacks

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
  const connectorUrl = `https://${connectorId}.quiltt.app/?mode=webview&oauth_redirect_url=${oauthRedirectUrl}&sdk=react-native&version=${version}`

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
    // This is the only way I know to handle this.
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

export default QuilttConnector
