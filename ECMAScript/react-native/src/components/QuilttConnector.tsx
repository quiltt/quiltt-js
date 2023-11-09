import {
  ConnectorSDKCallbackMetadata,
  ConnectorSDKCallbacks,
  ConnectorSDKEventType,
} from '@quiltt/core'
import { useCallback, useRef } from 'react'
import { Linking } from 'react-native'
import { WebView } from 'react-native-webview'
import { AndroidSafeAreaView } from './AndroidSafeAreaView'
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes'
import { useQuilttSession } from '@quiltt/react'

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
  const connectorUrl = `https://${connectorId}.quiltt.app/?mode=webview&oauth_redirect_url=${oauthRedirectUrl}&sdk=react-native` // @todo append version from package.json

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

  const eventHandler = (request: ShouldStartLoadRequest) => {
    const url = new URL(request.url)
    if (url.protocol === 'quilttconnector:') {
      handleQuilttEvent(url)
      return false
    }
    return true
  }

  const clearLocalStorage = () => {
    const script = 'localStorage.clear();'
    webViewRef.current?.injectJavaScript(script)
  }

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
      case 'OauthRequested':
        Linking.openURL(url.searchParams.get('oauthUrl') as string)
        break
      default:
        console.log('unhandled event', url)
        break
    }
  }

  return (
    <AndroidSafeAreaView>
      <WebView
        ref={webViewRef}
        originWhitelist={['https://*', 'quilttconnector://*']} // Maybe relax this to *?
        source={{ uri: connectorUrl }}
        onShouldStartLoadWithRequest={eventHandler}
        javaScriptEnabled
        domStorageEnabled // To enable localStorage in Android webview
        webviewDebuggingEnabled // Not sure if this works
      />
    </AndroidSafeAreaView>
  )
}

export default QuilttConnector
