import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react'

import type { ConnectorSDKCallbackMetadata, ConnectorSDKCallbacks } from '@quiltt/react'
import { ConnectorSDKEventType, cdnBase, useQuilttSession } from '@quiltt/react'

import { QuilttConnector as QuilttConnectorPlugin } from '../plugin'

export type QuilttConnectorHandle = {
  handleOAuthCallback: (url: string) => void
}

type QuilttConnectorProps = {
  connectorId: string
  connectionId?: string
  institution?: string
  /**
   * The app launcher URL for mobile OAuth flows.
   * This URL should be a Universal Link (iOS) or App Link (Android) that redirects back to your app.
   */
  appLauncherUri?: string
  style?: React.CSSProperties
  className?: string
} & ConnectorSDKCallbacks

const trustedQuilttHostSuffixes = ['quiltt.io', 'quiltt.dev']

const isTrustedQuilttOrigin = (origin: string): boolean => {
  try {
    const originUrl = new URL(origin)
    if (originUrl.protocol !== 'https:') {
      return false
    }

    const hostname = originUrl.hostname.toLowerCase()
    return trustedQuilttHostSuffixes.some(
      (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`)
    )
  } catch {
    return false
  }
}

/**
 * QuilttConnector component for Capacitor apps
 * Embeds the Quiltt Connector in an iframe and handles OAuth flows via native plugins
 */
export const QuilttConnector = forwardRef<QuilttConnectorHandle, QuilttConnectorProps>(
  (
    {
      connectorId,
      connectionId,
      institution,
      appLauncherUri,
      style,
      className,
      onEvent,
      onLoad,
      onExit,
      onExitSuccess,
      onExitAbort,
      onExitError,
    },
    ref
  ) => {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const { session } = useQuilttSession()

    // Build connector URL
    const connectorUrl = useMemo(() => {
      const url = new URL(`/v1/connectors/${connectorId}`, cdnBase)

      if (session?.token) {
        url.searchParams.set('token', session.token)
      }
      if (connectionId) {
        url.searchParams.set('connectionId', connectionId)
      }
      if (institution) {
        url.searchParams.set('institution', institution)
      }
      if (appLauncherUri) {
        url.searchParams.set('app_launcher_uri', appLauncherUri)
      }
      // Set mode to indicate we're in a Capacitor app
      url.searchParams.set('mode', 'capacitor')

      return url.toString()
    }, [connectorId, session?.token, connectionId, institution, appLauncherUri])

    const postOAuthCallbackToIframe = useCallback((callbackUrl: string) => {
      if (!iframeRef.current?.contentWindow) {
        return
      }

      iframeRef.current.contentWindow.postMessage(
        {
          type: 'quiltt:connector:oauthCallback',
          payload: { url: callbackUrl },
        },
        '*'
      )

      try {
        const callback = new URL(callbackUrl)
        const params: Record<string, string> = {}
        callback.searchParams.forEach((value, key) => {
          params[key] = value
        })

        iframeRef.current.contentWindow.postMessage(
          {
            source: 'quiltt',
            type: 'OAuthCallback',
            data: {
              url: callbackUrl,
              params,
            },
          },
          '*'
        )
      } catch {
        iframeRef.current.contentWindow.postMessage(
          {
            source: 'quiltt',
            type: 'OAuthCallback',
            data: {
              url: callbackUrl,
              params: {},
            },
          },
          '*'
        )
      }
    }, [])

    // Handle messages from the iframe
    const handleMessage = useCallback(
      (event: MessageEvent) => {
        // Validate origin
        if (!isTrustedQuilttOrigin(event.origin)) {
          return
        }

        const { type, payload } = event.data || {}
        if (!type) return

        // Parse metadata from payload
        const metadata: ConnectorSDKCallbackMetadata = {
          connectorId,
          ...payload,
        }

        switch (type) {
          case 'quiltt:connector:load':
            onEvent?.(ConnectorSDKEventType.Load, metadata)
            onLoad?.(metadata)
            break

          case 'quiltt:connector:exitSuccess':
            onEvent?.(ConnectorSDKEventType.ExitSuccess, metadata)
            onExit?.(ConnectorSDKEventType.ExitSuccess, metadata)
            onExitSuccess?.(metadata)
            break

          case 'quiltt:connector:exitAbort':
            onEvent?.(ConnectorSDKEventType.ExitAbort, metadata)
            onExit?.(ConnectorSDKEventType.ExitAbort, metadata)
            onExitAbort?.(metadata)
            break

          case 'quiltt:connector:exitError':
            onEvent?.(ConnectorSDKEventType.ExitError, metadata)
            onExit?.(ConnectorSDKEventType.ExitError, metadata)
            onExitError?.(metadata)
            break

          case 'quiltt:connector:navigate':
            // OAuth URL - open in system browser
            if (payload?.url) {
              QuilttConnectorPlugin.openUrl({ url: payload.url })
            }
            break

          default:
            // console.log(`Unhandled event: ${eventType}`)
            break
        }
      },
      [connectorId, onEvent, onLoad, onExit, onExitSuccess, onExitAbort, onExitError]
    )

    // Set up message listener
    useEffect(() => {
      window.addEventListener('message', handleMessage)
      return () => window.removeEventListener('message', handleMessage)
    }, [handleMessage])

    // Listen for OAuth callbacks via deep links
    useEffect(() => {
      const listener = QuilttConnectorPlugin.addListener('deepLink', (event) => {
        if (event.url) {
          postOAuthCallbackToIframe(event.url)
        }
      })

      // Check if app was launched with a URL
      QuilttConnectorPlugin.getLaunchUrl().then((result) => {
        if (result?.url) {
          postOAuthCallbackToIframe(result.url)
        }
      })

      return () => {
        listener.then((l) => l.remove())
      }
    }, [postOAuthCallbackToIframe])

    // Expose method to handle OAuth callbacks from parent component
    useImperativeHandle(
      ref,
      () => ({
        handleOAuthCallback: (callbackUrl: string) => {
          postOAuthCallbackToIframe(callbackUrl)
        },
      }),
      [postOAuthCallbackToIframe]
    )

    return (
      <iframe
        ref={iframeRef}
        src={connectorUrl}
        title="Quiltt Connector"
        allow="publickey-credentials-get *"
        className={className}
        style={{
          border: 'none',
          width: '100%',
          height: '100%',
          ...style,
        }}
      />
    )
  }
)

QuilttConnector.displayName = 'QuilttConnector'
