'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type {
  ConnectorSDK,
  ConnectorSDKConnector,
  ConnectorSDKConnectorOptions,
} from '@quiltt/core'
import { cdnBase } from '@quiltt/core'

import { oauthRedirectUrlDeprecationWarning } from '@/constants/deprecation-warnings'
import { useQuilttSession } from '@/hooks/useQuilttSession'
import { useScript } from '@/hooks/useScript'
import { getUserAgent, isDeepEqual } from '@/utils'
import { version } from '@/version'

declare const Quiltt: ConnectorSDK

export const useQuilttConnector = (
  connectorId?: string,
  options?: ConnectorSDKConnectorOptions
) => {
  const userAgent = getUserAgent(version)
  const status = useScript(`${cdnBase}/v1/connector.js?agent=${encodeURIComponent(userAgent)}`, {
    nonce: options?.nonce,
  })

  // This ensures we're not destructuring `session` before the script has loaded
  const useQuilttSessionReturn = useQuilttSession()
  const session = useQuilttSessionReturn?.session || null

  const [connector, setConnector] = useState<ConnectorSDKConnector>()
  const [isOpening, setIsOpening] = useState<boolean>(false)

  // Keep track of the previous values to detect changes
  const prevConnectionIdRef = useRef<string | undefined>(options?.connectionId)
  const prevConnectorIdRef = useRef<string | undefined>(connectorId)
  const prevInstitutionRef = useRef<string | undefined>(options?.institution)
  // Support both appLauncherUrl (preferred) and oauthRedirectUrl (deprecated) for backwards compatibility
  const prevAppLauncherUriRef = useRef<string | undefined>(
    options?.appLauncherUrl ?? options?.oauthRedirectUrl
  )
  const connectorCreatedRef = useRef<boolean>(false)

  // Track whether the connector is currently open
  const isConnectorOpenRef = useRef<boolean>(false)

  // Store callbacks in refs to maintain stable references
  const callbacksRef = useRef<ConnectorSDKConnectorOptions>(options || {})
  useEffect(() => {
    callbacksRef.current = options || {}
  })

  useEffect(() => {
    if (options?.oauthRedirectUrl !== undefined) {
      console.warn(oauthRedirectUrlDeprecationWarning)
    }
  }, [options?.oauthRedirectUrl])

  // Set Session
  // biome-ignore lint/correctness/useExhaustiveDependencies: trigger effects when script status changes too
  useEffect(() => {
    if (typeof Quiltt === 'undefined') return

    Quiltt.authenticate(session?.token)
  }, [status, session?.token])

  // Set Connector
  // biome-ignore lint/correctness/useExhaustiveDependencies: trigger effects when script status changes too
  useEffect(() => {
    if (typeof Quiltt === 'undefined' || !connectorId) return

    const currentConnectionId = options?.connectionId
    const currentInstitution = options?.institution
    // Support both appLauncherUrl (preferred) and oauthRedirectUrl (deprecated) for backwards compatibility
    const currentAppLauncherUri = options?.appLauncherUrl ?? options?.oauthRedirectUrl

    // Check for changes - use deep equality for institution object
    const connectionIdChanged = prevConnectionIdRef.current !== currentConnectionId
    const connectorIdChanged = prevConnectorIdRef.current !== connectorId
    const institutionChanged = !isDeepEqual(prevInstitutionRef.current, currentInstitution)
    const appLauncherUrlChanged = prevAppLauncherUriRef.current !== currentAppLauncherUri
    const hasChanges =
      connectionIdChanged ||
      connectorIdChanged ||
      institutionChanged ||
      appLauncherUrlChanged ||
      !connectorCreatedRef.current

    // Update if there are changes, regardless of what the changes are
    if (hasChanges) {
      if (currentConnectionId) {
        // Always use reconnect when connectionId is available
        setConnector(
          Quiltt.reconnect(connectorId, {
            connectionId: currentConnectionId,
            appLauncherUrl: currentAppLauncherUri,
          })
        )
      } else {
        // Use connect for new connections without connectionId
        setConnector(
          Quiltt.connect(connectorId, {
            institution: currentInstitution,
            appLauncherUrl: currentAppLauncherUri,
          })
        )
      }

      // Update refs
      connectorCreatedRef.current = true
      prevConnectionIdRef.current = currentConnectionId
      prevConnectorIdRef.current = connectorId
      prevInstitutionRef.current = currentInstitution
      prevAppLauncherUriRef.current = currentAppLauncherUri
    }
  }, [
    connectorId,
    options?.connectionId,
    options?.institution,
    options?.appLauncherUrl,
    options?.oauthRedirectUrl,
    status,
  ])

  // Internal handlers to track connector state (stable references)
  const handleOpen = useCallback((metadata: any) => {
    isConnectorOpenRef.current = true
    callbacksRef.current?.onOpen?.(metadata)
  }, [])

  const handleExit = useCallback((type: any, metadata: any) => {
    isConnectorOpenRef.current = false
    callbacksRef.current?.onExit?.(type, metadata)
  }, [])

  // Create stable wrapper functions for callbacks
  const stableOnEvent = useCallback((type: any, metadata: any) => {
    callbacksRef.current?.onEvent?.(type, metadata)
  }, [])

  const stableOnLoad = useCallback((metadata: any) => {
    callbacksRef.current?.onLoad?.(metadata)
  }, [])

  const stableOnExitSuccess = useCallback((metadata: any) => {
    callbacksRef.current?.onExitSuccess?.(metadata)
  }, [])

  const stableOnExitAbort = useCallback((metadata: any) => {
    callbacksRef.current?.onExitAbort?.(metadata)
  }, [])

  const stableOnExitError = useCallback((metadata: any) => {
    callbacksRef.current?.onExitError?.(metadata)
  }, [])

  // Register event handlers (only re-runs when connector changes)
  useEffect(() => {
    if (!connector) return

    // Capture which handlers we're registering to ensure proper cleanup
    const registered = {
      onEvent: callbacksRef.current?.onEvent ? stableOnEvent : null,
      onOpen: callbacksRef.current?.onOpen ? handleOpen : null,
      onLoad: callbacksRef.current?.onLoad ? stableOnLoad : null,
      onExit: callbacksRef.current?.onExit ? handleExit : null,
      onExitSuccess: callbacksRef.current?.onExitSuccess ? stableOnExitSuccess : null,
      onExitAbort: callbacksRef.current?.onExitAbort ? stableOnExitAbort : null,
      onExitError: callbacksRef.current?.onExitError ? stableOnExitError : null,
    }

    if (registered.onEvent) connector.onEvent(registered.onEvent)
    if (registered.onOpen) connector.onOpen(registered.onOpen)
    if (registered.onLoad) connector.onLoad(registered.onLoad)
    if (registered.onExit) connector.onExit(registered.onExit)
    if (registered.onExitSuccess) connector.onExitSuccess(registered.onExitSuccess)
    if (registered.onExitAbort) connector.onExitAbort(registered.onExitAbort)
    if (registered.onExitError) connector.onExitError(registered.onExitError)

    return () => {
      if (registered.onEvent) connector.offEvent(registered.onEvent)
      if (registered.onOpen) connector.offOpen(registered.onOpen)
      if (registered.onLoad) connector.offLoad(registered.onLoad)
      if (registered.onExit) connector.offExit(registered.onExit)
      if (registered.onExitSuccess) connector.offExitSuccess(registered.onExitSuccess)
      if (registered.onExitAbort) connector.offExitAbort(registered.onExitAbort)
      if (registered.onExitError) connector.offExitError(registered.onExitError)
    }
  }, [
    connector,
    stableOnEvent,
    handleOpen,
    stableOnLoad,
    handleExit,
    stableOnExitSuccess,
    stableOnExitAbort,
    stableOnExitError,
  ])

  // This is used to hide any potential race conditions from usage; allowing
  // interaction before the script may have loaded.
  useEffect(() => {
    if (connector && isOpening) {
      setIsOpening(false)
      connector.open()
    }
  }, [connector, isOpening])

  // Cleanup effect - runs when the hook is torn down
  useEffect(() => {
    return () => {
      if (isConnectorOpenRef.current) {
        console.error(
          '[Quiltt] useQuilttConnector: Component unmounted while Connector is still open. ' +
            'This may lead to memory leaks or unexpected behavior. ' +
            'Ensure the Connector is properly closed before component unmount.'
        )
      }
    }
  }, [])

  const open = useCallback(() => {
    if (connectorId) {
      setIsOpening(true)
    } else {
      throw new Error('Must provide `connectorId` to `open` Quiltt Connector with Method Call')
    }
  }, [connectorId])

  return { open }
}
