import { useCallback } from 'react'
import type { RefObject } from 'react'

import { URL } from 'react-native-url-polyfill'
import type { WebView } from 'react-native-webview'
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes'

import { ConnectorSDKEventType } from '@quiltt/react'
import type { ConnectorSDKCallbackMetadata, ConnectorSDKCallbacks } from '@quiltt/react'

import { handleOAuthUrl, isQuilttEvent } from '@/utils/url-helpers'
import { Platform } from 'react-native'

type WebViewHandlersProps = {
  webViewRef: RefObject<WebView>
  connectorId: string
  connectionId?: string
  institution?: string
  sessionToken?: string
} & ConnectorSDKCallbacks

export const useWebViewHandlers = ({
  webViewRef,
  connectorId,
  connectionId,
  institution,
  sessionToken,
  onEvent,
  onLoad,
  onExit,
  onExitSuccess,
  onExitAbort,
  onExitError,
}: WebViewHandlersProps) => {
  // Script to disable scrolling on header
  const disableHeaderScrollScript = /* javascript */ `
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
  }, [webViewRef.current?.injectJavaScript])

  // Inject the ReactNativeWebView bridge script at startup
  const injectWebViewBridge = useCallback(() => {
    const script = /* javascript */ `
      (function() {
        // Only inject if we're in a React Native WebView
        if (!window.ReactNativeWebView) {
          window.ReactNativeWebView = {
            postMessage: function(data) {
              window.ReactNativeWebView.postMessage(data);
            }
          };
        }
        
        // Override window.open to capture OAuth URLs
        const originalWindowOpen = window.open;
        window.open = function(url, target, features) {
          // Check if this looks like an OAuth URL
          if (url && (url.includes('oauth') || url.includes('authorize'))) {
            // Send message to React Native
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'Navigate',
              action: 'popup',
              url: url
            }));
            
            // Return a mock window to prevent errors
            return {
              focus: function() {},
              close: function() {}
            };
          }
          
          // Fall back to original behavior for non-OAuth URLs
          return originalWindowOpen(url, target, features);
        };
        
        // Also intercept Finicity Connect SDK popup handling if available
        if (window.Connect && typeof window.Connect.launch === 'function') {
          const originalConnect = window.Connect;
          window.Connect = {
            ...originalConnect,
            launch: function(url, callbacks, options) {
              // Add our custom onUrl handler that works with the React Native bridge
              if (callbacks && typeof callbacks === 'object') {
                const originalOnUrl = callbacks.onUrl;
                callbacks.onUrl = function(type, url) {
                  if (type === 'OPEN' && url) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'Navigate',
                      action: 'popup',
                      url: url
                    }));
                    return true; // We handled it
                  }
                  // Call original handler if it exists
                  return originalOnUrl ? originalOnUrl(type, url) : false;
                };
              }
              return originalConnect.launch(url, callbacks, options);
            }
          };
        }
        true;
      })();
    `
    webViewRef.current?.injectJavaScript(script)
  }, [webViewRef.current?.injectJavaScript])

  const initInjectedJavaScript = useCallback(() => {
    const script = /* javascript */ `\
      const options = {\
        source: 'quiltt',\
        type: 'Options',\
        token: '${sessionToken}',\
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
  }, [connectionId, connectorId, institution, sessionToken, webViewRef.current?.injectJavaScript])

  const shouldRender = useCallback((url: URL) => !isQuilttEvent(url), [])

  const clearLocalStorage = useCallback(() => {
    const script = 'localStorage.clear();'
    webViewRef.current?.injectJavaScript(script)
  }, [webViewRef.current?.injectJavaScript])

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
            injectWebViewBridge() // Inject our bridge when the page loads
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
          case 'Navigate':
            if (url.searchParams.get('action') === 'popup' && url.searchParams.get('url')) {
              handleOAuthUrl(new URL(url.searchParams.get('url') as string))
            }
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
      injectWebViewBridge,
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
      // So we use `handleOAuthUrl` as a catch all and assume all url got to this step is Plaid or Finicity OAuth url
      handleOAuthUrl(url)
      return false
    },
    [handleQuilttEvent, shouldRender]
  )

  // Handle messages posted from the WebView
  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      console.log('Message from WebView:', data)

      if (data.type === 'Navigate' && data.action === 'popup' && data.url) {
        // Handle OAuth popup navigation from Finicity widget
        handleOAuthUrl(new URL(data.url))
        return
      }
    } catch (error) {
      console.error('Error processing WebView message:', error)
    }
  }, [])

  return {
    onLoadEnd,
    requestHandler,
    handleWebViewMessage,
  }
}
