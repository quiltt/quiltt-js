import { useCallback } from 'react'
import type { RefObject } from 'react'

import { Linking } from 'react-native'
import { URL } from 'react-native-url-polyfill'
import type { WebView } from 'react-native-webview'
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes'

import { ConnectorSDKEventType } from '@quiltt/react'
import type { ConnectorSDKCallbackMetadata, ConnectorSDKCallbacks } from '@quiltt/react'

import { isQuilttEvent } from '@/utils/url-helpers'
import { Platform } from 'react-native'

// Add a logger utility to keep logging consistent
const logEvent = (area: string, message: string, data?: any) => {
  console.log(`[Quiltt:${area}] ${message}`, data || '')
}

// Add a more visible logger specifically for OAuth debugging
const logOAuth = (area: string, message: string, data?: any) => {
  console.log(`[Quiltt:OAuth:${area}] 🔑 ${message}`, data || '')
}

// Enhanced handleOAuthUrl function
export const handleOAuthUrl = (url: URL | string): void => {
  const urlString = typeof url === 'string' ? url : url.toString()
  logOAuth('Handler', `Opening OAuth URL: ${urlString}`)

  // Validate URL before opening
  if (!urlString || !urlString.startsWith('http')) {
    console.error(`[Quiltt:OAuth] Invalid OAuth URL: ${urlString}`)
    return
  }

  // Use React Native's Linking API to open the URL
  Linking.canOpenURL(urlString)
    .then((supported) => {
      if (supported) {
        logOAuth('Handler', 'URL can be opened by the device')
        Linking.openURL(urlString).catch((err) => {
          console.error(`[Quiltt:OAuth:Error] Failed to open URL: ${err}`)
        })
      } else {
        console.error(`[Quiltt:OAuth:Error] Cannot open URL: ${urlString}`)
      }
    })
    .catch((err) => {
      console.error(`[Quiltt:OAuth:Error] Error checking URL support: ${err}`)
    })
}

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
  logEvent('Init', 'Initializing WebView handlers', {
    connectorId,
    connectionId,
    institution,
    hasSessionToken: !!sessionToken,
  })

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
        console.log('[Quiltt:WebView] Header fixed positioning applied');
      } else {
        console.log('[Quiltt:WebView] No header found to apply fixed positioning');
      }
    })();
  `

  // Script to specifically handle Finicity OAuth popups
  const finicitySafeOAuthScript = /* javascript */ `
    (function() {
      console.log('[Quiltt:Finicity] Installing Finicity-specific OAuth handler');
      
      // Flag to track installation to avoid duplicate installations
      if (window.__finicitySafeOAuthInstalled) {
        console.log('[Quiltt:Finicity] Handler already installed, skipping');
        return;
      }
      
      // Track actual OAuth URLs that Finicity tries to open
      window.__finicitySafeOAuthInstalled = true;
      window.__lastFinicityOAuthUrl = null;
      
      // Monitor for Finicity Connect object to be available
      const checkForFinicityConnect = setInterval(() => {
        if (window.Connect) {
          console.log('[Quiltt:Finicity] Found Connect object, installing handlers');
          clearInterval(checkForFinicityConnect);
          
          // Original launch method
          const originalLaunch = window.Connect.launch;
          
          // Replace with enhanced version
          window.Connect.launch = function(url, callbacks, options) {
            console.log('[Quiltt:Finicity] Connect.launch intercepted:', url);
            
            // Create enhanced callbacks with our handlers
            const enhancedCallbacks = { ...callbacks };
            
            // Enhance onUrl handler - this gets OAuth URLs
            if (callbacks && callbacks.onUrl) {
              const originalOnUrl = callbacks.onUrl;
              enhancedCallbacks.onUrl = function(type, urlValue) {
                console.log('[Quiltt:Finicity] onUrl called:', type, urlValue);
                
                // OPEN type with a URL is the OAuth flow
                if (type === 'OPEN' && urlValue) {
                  console.log('[Quiltt:Finicity] 🔑 OAuth URL detected in onUrl:', urlValue);
                  
                  // Store for error recovery
                  window.__lastFinicityOAuthUrl = urlValue;
                  
                  // Send to React Native
                  if (window.ReactNativeWebView) {
                    try {
                      console.log('[Quiltt:Finicity] Sending OAuth URL to React Native');
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'OAuthUrl',
                        url: urlValue,
                        source: 'finicity-onUrl'
                      }));
                      return true; // Tell Finicity we handled it
                    } catch (err) {
                      console.error('[Quiltt:Finicity] Failed to send URL to React Native:', err);
                    }
                  }
                }
                
                // Call original handler for other cases
                return originalOnUrl(type, urlValue);
              };
            }
            
            // Enhance onUser handler - alternative OAuth notification path
            if (callbacks && callbacks.onUser) {
              const originalOnUser = callbacks.onUser;
              enhancedCallbacks.onUser = function(payload) {
                console.log('[Quiltt:Finicity] onUser called:', payload);
                
                // LaunchOAuth action contains OAuth URL
                if (payload && payload.action === 'LaunchOAuth') {
                  const oauthUrl = payload.url || payload.oauthUrl;
                  
                  if (oauthUrl) {
                    console.log('[Quiltt:Finicity] 🔑 OAuth URL found in onUser:', oauthUrl);
                    
                    // Store for error recovery
                    window.__lastFinicityOAuthUrl = oauthUrl;
                    
                    // Send to React Native
                    if (window.ReactNativeWebView) {
                      try {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'OAuthUrl',
                          url: oauthUrl,
                          source: 'finicity-onUser'
                        }));
                      } catch (err) {
                        console.error('[Quiltt:Finicity] Failed to send URL to React Native:', err);
                      }
                    }
                  }
                }
                
                // Call original handler
                if (originalOnUser) {
                  return originalOnUser(payload);
                }
              };
            }
            
            // Enhance onError handler - catch popup blocked errors
            if (callbacks && callbacks.onError) {
              const originalOnError = callbacks.onError;
              enhancedCallbacks.onError = function(payload) {
                console.log('[Quiltt:Finicity] onError called:', payload);
                
                // Check for OAuth popup errors (1403)
                if (payload.code === 1403 || 
                    (payload.message && payload.message.includes('OAuth popup blocked'))) {
                  console.error('[Quiltt:Finicity] ❌ OAuth popup blocked error detected:', payload);
                  
                  // Try to recover using last known OAuth URL
                  if (window.__lastFinicityOAuthUrl && window.ReactNativeWebView) {
                    console.log('[Quiltt:Finicity] Attempting recovery with stored URL:', 
                                window.__lastFinicityOAuthUrl);
                    
                    try {
                      // Send again in case it was missed
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'OAuthUrl',
                        url: window.__lastFinicityOAuthUrl,
                        source: 'finicity-error-recovery'
                      }));
                    } catch (err) {
                      console.error('[Quiltt:Finicity] Error recovery failed:', err);
                    }
                  }
                }
                
                // Call original handler
                if (originalOnError) {
                  return originalOnError(payload);
                }
              };
            }
            
            // Create enhanced options object that works better with React Native
            const enhancedOptions = {
              ...options,
              // Force popup mode so we can intercept
              popup: true
            };
            
            // Call original launch with our enhancements
            return originalLaunch(url, enhancedCallbacks, enhancedOptions);
          };
          
          // Also override Finicity's popup handling directly
          const originalWindowOpen = window.open;
          window.open = function(url, target, features) {
            console.log('[Quiltt:Finicity] window.open intercepted:', url);
            
            // Check for likely OAuth URLs
            if (url && (
              url.includes('oauth') || 
              url.includes('authorize') || 
              url.includes('authentication') ||
              // Add Finicity-specific domains
              url.includes('connect2.finicity.com')
            )) {
              console.log('[Quiltt:Finicity] 🔑 Potential OAuth URL in window.open:', url);
              
              // Store for error recovery
              window.__lastFinicityOAuthUrl = url;
              
              // Send to React Native
              if (window.ReactNativeWebView) {
                try {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'OAuthUrl',
                    url: url,
                    source: 'finicity-window-open'
                  }));
                } catch (err) {
                  console.error('[Quiltt:Finicity] Failed to send URL to React Native:', err);
                }
                
                // Return mock window
                return {
                  focus: function() { console.log('[Quiltt:Finicity] Mock window.focus called'); },
                  close: function() { console.log('[Quiltt:Finicity] Mock window.close called'); },
                  closed: false
                };
              }
            }
            
            // Use original for non-OAuth URLs
            return originalWindowOpen(url, target, features);
          };
          
          // Add event listener for error messages
          window.addEventListener('error', function(event) {
            // Look for OAuth popup errors in error messages
            if (event.message && (
              event.message.includes('1403') || 
              event.message.includes('OAuth popup blocked') ||
              event.message.includes('popup')
            )) {
              console.error('[Quiltt:Finicity] Caught OAuth-related error:', event.message);
              
              // Try recovery with stored URL
              if (window.__lastFinicityOAuthUrl && window.ReactNativeWebView) {
                console.log('[Quiltt:Finicity] Attempting recovery after error with URL:', 
                            window.__lastFinicityOAuthUrl);
                
                try {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'OAuthUrl',
                    url: window.__lastFinicityOAuthUrl,
                    source: 'finicity-error-event'
                  }));
                } catch (err) {
                  console.error('[Quiltt:Finicity] Error recovery failed:', err);
                }
              }
            }
          });
          
          console.log('[Quiltt:Finicity] OAuth handlers successfully installed');
        }
      }, 100);
      
      // Set a timeout to abandon checks after 10 seconds
      setTimeout(() => {
        clearInterval(checkForFinicityConnect);
        console.log('[Quiltt:Finicity] Timed out waiting for Finicity Connect object');
      }, 10000);
    })();
  `

  const onLoadEnd = useCallback(() => {
    logEvent('LoadEnd', 'WebView load completed')
    if (Platform.OS === 'ios') {
      logEvent('iOS', 'Injecting header scroll fix script')
      webViewRef.current?.injectJavaScript(disableHeaderScrollScript)
    }
  }, [webViewRef.current?.injectJavaScript])

  // Inject the ReactNativeWebView bridge script at startup
  const injectWebViewBridge = useCallback(() => {
    logEvent('Bridge', 'Injecting WebView bridge script')
    const script = /* javascript */ `
      (function() {
        console.log('[Quiltt:WebViewJS] Starting bridge injection');
        
        // Only inject if we're in a React Native WebView
        if (!window.ReactNativeWebView) {
          console.log('[Quiltt:WebViewJS] ReactNativeWebView not found, creating mock');
          window.ReactNativeWebView = {
            postMessage: function(data) {
              console.log('[Quiltt:WebViewJS] Mock postMessage called with:', data);
              window.ReactNativeWebView.postMessage(data);
            }
          };
        } else {
          console.log('[Quiltt:WebViewJS] ReactNativeWebView bridge exists');
          
          // Test the bridge with a simple message
          try {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'BridgeTest',
              message: 'Testing WebView bridge'
            }));
            console.log('[Quiltt:WebViewJS] Test message sent successfully');
          } catch (error) {
            console.error('[Quiltt:WebViewJS] Error sending test message:', error);
          }
        }
        
        // Override window.open with detailed logging
        const originalWindowOpen = window.open;
        window.open = function(url, target, features) {
          console.log('[Quiltt:WebViewJS] window.open intercepted:', { url, target, features });
          
          // Check if this looks like an OAuth URL
          if (url && (
            url.includes('oauth') || 
            url.includes('authorize') || 
            url.includes('authentication') ||
            url.includes('login') ||
            url.includes('signin')
          )) {
            console.log('[Quiltt:WebViewJS] OAuth URL detected in window.open');
            
            try {
              // Send message to React Native
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'OAuthUrl',
                url: url,
                source: 'window.open'
              }));
              console.log('[Quiltt:WebViewJS] OAuth URL sent to native handler');
            } catch (error) {
              console.error('[Quiltt:WebViewJS] Error sending OAuth URL to native:', error);
            }
            
            // Return a mock window with logging
            return {
              focus: function() {
                console.log('[Quiltt:WebViewJS] Mock window.focus called');
              },
              close: function() {
                console.log('[Quiltt:WebViewJS] Mock window.close called');
              }
            };
          }
          
          console.log('[Quiltt:WebViewJS] Using original window.open implementation');
          // Fall back to original behavior for non-OAuth URLs
          return originalWindowOpen(url, target, features);
        };
        
        console.log('[Quiltt:WebViewJS] Bridge injection completed');
        true;
      })();
    `
    webViewRef.current?.injectJavaScript(script)
  }, [webViewRef.current?.injectJavaScript])

  // Function to inject Finicity OAuth fix
  const injectFinicitySafeOAuth = useCallback(() => {
    logEvent('Finicity', 'Injecting Finicity OAuth fix')
    webViewRef.current?.injectJavaScript(finicitySafeOAuthScript)
  }, [webViewRef.current?.injectJavaScript])

  const initInjectedJavaScript = useCallback(() => {
    logEvent('Init', 'Injecting options into WebView')
    const script = /* javascript */ `\
      console.log('[Quiltt:WebViewJS] Injecting options');
      const options = {\
        source: 'quiltt',\
        type: 'Options',\
        token: '${sessionToken}',\
        connectorId: '${connectorId}',\
        connectionId: '${connectionId}',\
        institution: '${institution}', \
      };\
      console.log('[Quiltt:WebViewJS] Raw options:', JSON.stringify(options));
      const compactedOptions = Object.keys(options).reduce((acc, key) => {\
        if (options[key] !== 'undefined') {\
          acc[key] = options[key];\
        }\
        return acc;\
      }, {});\
      console.log('[Quiltt:WebViewJS] Compacted options:', JSON.stringify(compactedOptions));
      window.postMessage(compactedOptions);\
      console.log('[Quiltt:WebViewJS] Options posted to window');\
    `
    webViewRef.current?.injectJavaScript(script)
  }, [connectionId, connectorId, institution, sessionToken, webViewRef.current?.injectJavaScript])

  const shouldRender = useCallback((url: URL) => {
    const result = !isQuilttEvent(url)
    logEvent('Navigation', `Should render URL: ${result}`, url.toString())
    return result
  }, [])

  const clearLocalStorage = useCallback(() => {
    logEvent('Storage', 'Clearing localStorage')
    const script = `
      console.log('[Quiltt:WebViewJS] Clearing localStorage');
      const itemCount = localStorage.length;
      localStorage.clear();
      console.log('[Quiltt:WebViewJS] Cleared ' + itemCount + ' items from localStorage');
    `
    webViewRef.current?.injectJavaScript(script)
  }, [webViewRef.current?.injectJavaScript])

  const handleQuilttEvent = useCallback(
    (url: URL) => {
      const eventType = url.host
      logEvent('Event', `Handling Quiltt event: ${eventType}`, url.toString())

      url.searchParams.delete('source')
      url.searchParams.append('connectorId', connectorId)
      const metadata = Object.fromEntries(url.searchParams) as ConnectorSDKCallbackMetadata

      logEvent('Event', 'Event metadata:', metadata)

      requestAnimationFrame(() => {
        switch (eventType) {
          case 'Load':
            logEvent('Event:Load', 'Processing Load event')
            initInjectedJavaScript()
            injectWebViewBridge() // Inject our bridge when the page loads
            injectFinicitySafeOAuth() // Add this line here instead
            onEvent?.(ConnectorSDKEventType.Load, metadata)
            onLoad?.(metadata)
            break
          case 'ExitAbort':
            logEvent('Event:ExitAbort', 'Processing ExitAbort event')
            clearLocalStorage()
            onEvent?.(ConnectorSDKEventType.ExitAbort, metadata)
            onExit?.(ConnectorSDKEventType.ExitAbort, metadata)
            onExitAbort?.(metadata)
            break
          case 'ExitError':
            logEvent('Event:ExitError', 'Processing ExitError event')
            clearLocalStorage()
            onEvent?.(ConnectorSDKEventType.ExitError, metadata)
            onExit?.(ConnectorSDKEventType.ExitError, metadata)
            onExitError?.(metadata)
            break
          case 'ExitSuccess':
            logEvent('Event:ExitSuccess', 'Processing ExitSuccess event')
            clearLocalStorage()
            onEvent?.(ConnectorSDKEventType.ExitSuccess, metadata)
            onExit?.(ConnectorSDKEventType.ExitSuccess, metadata)
            onExitSuccess?.(metadata)
            break
          case 'Authenticate':
            logEvent('Event:Authenticate', 'Processing Authenticate event')
            // TODO: handle Authenticate
            break
          case 'OauthRequested': {
            const oauthUrl = url.searchParams.get('oauthUrl') as string
            logOAuth('Event', 'OAuth URL requested', oauthUrl)
            handleOAuthUrl(oauthUrl)
            break
          }
          case 'Navigate':
            if (url.searchParams.get('action') === 'popup' && url.searchParams.get('url')) {
              const popupUrl = url.searchParams.get('url') as string
              logOAuth('Event', 'Popup navigation requested', popupUrl)
              handleOAuthUrl(popupUrl)
            } else {
              logEvent('Event:Navigate', 'Navigate event without popup action', {
                action: url.searchParams.get('action'),
                url: url.searchParams.get('url'),
              })
            }
            break
          default:
            logEvent('Event:Unknown', `Unhandled event type: ${eventType}`, url.toString())
            break
        }
      })
    },
    [
      clearLocalStorage,
      connectorId,
      initInjectedJavaScript,
      injectWebViewBridge,
      injectFinicitySafeOAuth,
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
      logEvent('Request', 'New navigation request', {
        url: request.url,
        navigationType: request.navigationType,
        isTopFrame: request.isTopFrame,
      })

      try {
        const url = new URL(request.url)

        // Check for OAuth URLs in the main navigation too
        if (request.url.includes('oauth') || request.url.includes('authorize')) {
          logOAuth('Navigation', 'Potential OAuth URL in main navigation', request.url)

          // Only intercept if it's a top frame navigation that looks like an OAuth redirect
          if (
            request.isTopFrame &&
            (request.navigationType === 'click' || request.navigationType === 'other')
          ) {
            logOAuth('Navigation', 'Intercepting OAuth navigation')
            handleOAuthUrl(request.url)
            return false // Don't load in WebView
          }
        }

        if (isQuilttEvent(url)) {
          logEvent('Request', 'Quiltt event detected, handling internally')
          handleQuilttEvent(url)
          return false
        }

        if (shouldRender(url)) {
          logEvent('Request', 'URL should render in WebView')
          return true
        }

        // Plaid set oauth url by doing window.location.href = url
        // So we use `handleOAuthUrl` as a catch all and assume all url got to this step is Plaid or Finicity OAuth url
        logOAuth('Fallback', 'Potential OAuth URL at fallback handler', url.toString())
        handleOAuthUrl(url)
        return false
      } catch (error) {
        logEvent('Request:Error', 'Error processing request URL', {
          error: error instanceof Error ? error.message : String(error),
          url: request.url,
        })
        return true // Default to allowing navigation on error
      }
    },
    [handleQuilttEvent, shouldRender]
  )

  // Enhanced WebView message handler for OAuth
  const handleWebViewMessage = useCallback((event: any) => {
    logEvent('Message', 'Received message from WebView', event.nativeEvent.data)

    try {
      const data = JSON.parse(event.nativeEvent.data)
      logEvent('Message', 'Parsed WebView message', data)

      // Handle different message types
      switch (data.type) {
        case 'BridgeTest':
          logEvent('Message', 'Bridge test message received')
          break

        case 'OAuthUrl':
          if (data.url) {
            logOAuth('Message', 'Direct OAuth URL message received', data.url)
            handleOAuthUrl(data.url)
          } else {
            logEvent('Message:Error', 'OAuth message missing URL')
          }
          break

        case 'Navigate':
          if (data.action === 'popup' && data.url) {
            logOAuth('Message', 'Popup navigation from message', data.url)
            handleOAuthUrl(data.url)
          } else {
            logEvent('Message', 'Navigate message without popup action', data)
          }
          break

        default:
          logEvent('Message', 'Unknown message type:', data.type)
      }
    } catch (error) {
      logEvent('Message:Error', 'Error processing WebView message', {
        error: error instanceof Error ? error.message : String(error),
        data: event.nativeEvent.data,
      })
    }
  }, [])

  return {
    onLoadEnd,
    requestHandler,
    handleWebViewMessage,
  }
}
