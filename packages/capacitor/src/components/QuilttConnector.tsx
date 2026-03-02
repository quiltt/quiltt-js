import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'

import type { ConnectorSDKCallbackMetadata, ConnectorSDKCallbacks } from '@quiltt/react'
import { ConnectorSDKEventType, useQuilttSession } from '@quiltt/react'

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
  appLauncherUrl?: string
  style?: React.CSSProperties
  className?: string
} & ConnectorSDKCallbacks

const trustedQuilttHostSuffixes = ['quiltt.io', 'quiltt.dev', 'quiltt.app']

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

const decodeIfEncoded = (value: string): string => {
  try {
    const decoded = decodeURIComponent(value)
    return decoded === value ? value : decoded
  } catch {
    return value
  }
}

const normalizeUrlValue = (value: string): string => decodeIfEncoded(value.trim())

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
      appLauncherUrl,
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
    const [isLoaded, setIsLoaded] = useState(false)
    const [loadError, setLoadError] = useState<string | null>(null)

    // Connector origin for secure postMessage targeting
    const connectorOrigin = useMemo(() => `https://${connectorId}.quiltt.app`, [connectorId])

    // Build connector URL
    const connectorUrl = useMemo(() => {
      const url = new URL(connectorOrigin)

      if (session?.token) {
        url.searchParams.set('token', session.token)
      }
      if (connectionId) {
        url.searchParams.set('connectionId', connectionId)
      }
      if (institution) {
        url.searchParams.set('institution', institution)
      }
      if (appLauncherUrl) {
        url.searchParams.set('app_launcher_url', normalizeUrlValue(appLauncherUrl))
      }

      if (typeof window !== 'undefined') {
        url.searchParams.set('embed_location', window.location.href)
      }

      // Set mode for inline iframe embedding
      url.searchParams.set('mode', 'INLINE')

      return url.toString()
    }, [connectorOrigin, session?.token, connectionId, institution, appLauncherUrl])

    useEffect(() => {
      setIsLoaded(false)
      setLoadError(null)

      const abortController = new AbortController()

      const runPreflight = async () => {
        try {
          await fetch(connectorUrl, {
            method: 'GET',
            mode: 'no-cors',
            credentials: 'omit',
            signal: abortController.signal,
          })
        } catch {
          setLoadError('Unable to reach Quiltt Connector. Check network and connector settings.')
        }
      }

      void runPreflight()

      return () => {
        abortController.abort()
      }
    }, [connectorUrl])

    useEffect(() => {
      if (isLoaded || loadError) {
        return
      }

      const timeoutId = window.setTimeout(() => {
        setLoadError('Connector took too long to load. Please retry.')
      }, 15000)

      return () => {
        window.clearTimeout(timeoutId)
      }
    }, [isLoaded, loadError])

    const postOAuthCallbackToIframe = useCallback(
      (callbackUrl: string) => {
        if (!iframeRef.current?.contentWindow) {
          return
        }

        const normalizedCallbackUrl = normalizeUrlValue(callbackUrl)

        try {
          const callback = new URL(normalizedCallbackUrl)
          const params: Record<string, string> = {}
          callback.searchParams.forEach((value, key) => {
            params[key] = value
          })

          iframeRef.current.contentWindow.postMessage(
            {
              source: 'quiltt',
              type: 'OAuthCallback',
              data: {
                url: normalizedCallbackUrl,
                params,
              },
            },
            connectorOrigin
          )
        } catch {
          iframeRef.current.contentWindow.postMessage(
            {
              source: 'quiltt',
              type: 'OAuthCallback',
              data: {
                url: normalizedCallbackUrl,
                params: {},
              },
            },
            connectorOrigin
          )
        }
      },
      [connectorOrigin]
    )

    // Handle messages from the iframe
    // The platform MessageBus sends: { source: 'quiltt', type: 'Load'|'ExitSuccess'|..., ...metadata }
    const handleMessage = useCallback(
      (event: MessageEvent) => {
        // Validate origin
        if (!isTrustedQuilttOrigin(event.origin)) {
          return
        }

        const data = event.data || {}
        // Validate message is from Quiltt MessageBus
        if (data.source !== 'quiltt' || !data.type) return

        const { type, connectionId: msgConnectionId, profileId, connectorSession, url } = data

        // Build metadata from message fields
        const metadata: ConnectorSDKCallbackMetadata = {
          connectorId,
          ...(profileId && { profileId }),
          ...(msgConnectionId && { connectionId: msgConnectionId }),
          ...(connectorSession && { connectorSession }),
        }

        switch (type) {
          case 'Load':
            setIsLoaded(true)
            setLoadError(null)
            onEvent?.(ConnectorSDKEventType.Load, metadata)
            onLoad?.(metadata)
            break

          case 'ExitSuccess':
            onEvent?.(ConnectorSDKEventType.ExitSuccess, metadata)
            onExit?.(ConnectorSDKEventType.ExitSuccess, metadata)
            onExitSuccess?.(metadata)
            break

          case 'ExitAbort':
            onEvent?.(ConnectorSDKEventType.ExitAbort, metadata)
            onExit?.(ConnectorSDKEventType.ExitAbort, metadata)
            onExitAbort?.(metadata)
            break

          case 'ExitError':
            onEvent?.(ConnectorSDKEventType.ExitError, metadata)
            onExit?.(ConnectorSDKEventType.ExitError, metadata)
            onExitError?.(metadata)
            break

          case 'Navigate':
            // OAuth URL - open in system browser
            if (url) {
              QuilttConnectorPlugin.openUrl({ url })
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
      <div
        className={className}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          ...style,
        }}
      >
        <iframe
          ref={iframeRef}
          src={connectorUrl}
          title="Quiltt Connector"
          allow="publickey-credentials-get *"
          style={{
            border: 'none',
            width: '100%',
            height: '100%',
          }}
          onError={() => {
            setLoadError('Unable to load Quiltt Connector iframe.')
          }}
        />

        {loadError ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              textAlign: 'center',
              backgroundColor: '#fff',
            }}
          >
            {loadError}
          </div>
        ) : null}
      </div>
    )
  }
)

QuilttConnector.displayName = 'QuilttConnector'
