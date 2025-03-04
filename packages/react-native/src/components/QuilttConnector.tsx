import { useMemo, useRef } from 'react'

import { Linking, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import type { WebViewMessageEvent } from 'react-native-webview'

import { useQuilttSession } from '@quiltt/react'
import type { ConnectorSDKCallbacks } from '@quiltt/react'

import { getPlatformSpecificWebViewProps } from '@/constants/webview-props'
import { useConnectorUrl } from '@/hooks/useConnectorUrl'
import { usePreFlightCheck } from '@/hooks/usePreFlightCheck'
import { useWebViewHandlers } from '@/hooks/useWebViewHandlers'
import { AndroidSafeAreaView } from './AndroidSafeAreaView'
import { ErrorScreen } from './ErrorScreen'
import { LoadingScreen } from './LoadingScreen'

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

  const connectorUrl = useConnectorUrl(connectorId, encodedOAuthRedirectUrl)

  const preFlightCheck = usePreFlightCheck(connectorUrl)

  // Get handlers from our hook
  const { onLoadEnd, requestHandler, handleWebViewMessage } = useWebViewHandlers({
    webViewRef,
    connectorId,
    connectionId,
    institution,
    sessionToken: session?.token,
    onEvent,
    onLoad,
    onExit,
    onExitSuccess,
    onExitAbort,
    onExitError,
  })

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)

      // Handle Navigate messages with popup action (from Finicity)
      if (data.type === 'Navigate' && data.action === 'popup' && data.url) {
        console.log('[Quiltt:OAuth] Received popup navigation request', data.url)

        // Open the URL using the Linking API
        Linking.canOpenURL(data.url)
          .then((supported) => {
            if (supported) {
              console.log('[Quiltt:OAuth] Opening URL in system browser')
              Linking.openURL(data.url)
            } else {
              console.error('[Quiltt:OAuth] Cannot open URL:', data.url)
            }
          })
          .catch((err) => {
            console.error('[Quiltt:OAuth] Error opening URL:', err)
          })

        return
      }

      // Pass to standard handler for other message types
      handleWebViewMessage(event)
    } catch (e) {
      // If parsing fails, still try the standard handler
      handleWebViewMessage(event)
    }
  }

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
        style={styles.webview}
        originWhitelist={['*']}
        source={{ uri: connectorUrl }}
        onShouldStartLoadWithRequest={requestHandler}
        onLoadEnd={onLoadEnd}
        onMessage={handleMessage} // Use our enhanced message handler
        javaScriptEnabled
        domStorageEnabled // To enable localStorage in Android webview
        webviewDebuggingEnabled
        bounces={false} // Controls the bouncing effect when scrolling past content boundaries (iOS only)
        scrollEnabled={true} // Enables scrolling within the WebView
        automaticallyAdjustContentInsets={false} // Disables automatic padding adjustments based on navigation bars/safe areas
        contentInsetAdjustmentBehavior="never" // Controls how the WebView adjusts its content layout relative to safe areas and system UI
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        // Platform specific props
        {...getPlatformSpecificWebViewProps()}
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
