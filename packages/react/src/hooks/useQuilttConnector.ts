'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type {
  ConnectorSDK,
  ConnectorSDKConnector,
  ConnectorSDKConnectorOptions,
} from '@quiltt/core'
import { cdnBase } from '@quiltt/core'

import { useQuilttSession } from '@/hooks/useQuilttSession'
import { useScript } from '@/hooks/useScript'
import { isDeepEqual } from '@/utils/isDeepEqual'
import { version } from '@/version'

declare const Quiltt: ConnectorSDK

export const useQuilttConnector = (
  connectorId?: string,
  options?: ConnectorSDKConnectorOptions
) => {
  const status = useScript(`${cdnBase}/v1/connector.js?agent=react-${version}`, {
    nonce: options?.nonce,
  })

  // This ensures we're not destructuring `session` before the script has loaded
  const useQuilttSessionReturn = useQuilttSession()
  const session = useQuilttSessionReturn?.session || null

  const [connector, setConnector] = useState<ConnectorSDKConnector>()
  const [isOpening, setIsOpening] = useState<boolean>(false)

  // Keep track of the previous connectionId to detect changes
  const prevConnectionIdRef = useRef<string | undefined>(options?.connectionId)
  const prevConnectorIdRef = useRef<string | undefined>(connectorId)
  const prevInstitutionRef = useRef<string | undefined>(options?.institution)
  const connectorCreatedRef = useRef<boolean>(false)

  // Track whether the connector is currently open
  const isConnectorOpenRef = useRef<boolean>(false)

  // Store callbacks in refs to maintain stable references
  const callbacksRef = useRef<ConnectorSDKConnectorOptions>(options || {})
  useEffect(() => {
    callbacksRef.current = options || {}
  })

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

    // Check for changes - use deep equality for institution object
    const connectionIdChanged = prevConnectionIdRef.current !== currentConnectionId
    const connectorIdChanged = prevConnectorIdRef.current !== connectorId
    const institutionChanged = !isDeepEqual(prevInstitutionRef.current, currentInstitution)
    const hasChanges =
      connectionIdChanged ||
      connectorIdChanged ||
      institutionChanged ||
      !connectorCreatedRef.current

    // Update if there are changes, regardless of what the changes are
    if (hasChanges) {
      if (currentConnectionId) {
        // Always use reconnect when connectionId is available
        setConnector(Quiltt.reconnect(connectorId, { connectionId: currentConnectionId }))
      } else {
        // Use connect for new connections without connectionId
        setConnector(Quiltt.connect(connectorId, { institution: currentInstitution }))
      }

      // Update refs
      connectorCreatedRef.current = true
      prevConnectionIdRef.current = currentConnectionId
      prevConnectorIdRef.current = connectorId
      prevInstitutionRef.current = currentInstitution
    }
  }, [connectorId, options?.connectionId, options?.institution, status])

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

    // Use stable callback wrappers
    if (callbacksRef.current?.onEvent) connector.onEvent(stableOnEvent)
    if (callbacksRef.current?.onOpen) connector.onOpen(handleOpen)
    if (callbacksRef.current?.onLoad) connector.onLoad(stableOnLoad)
    if (callbacksRef.current?.onExit) connector.onExit(handleExit)
    if (callbacksRef.current?.onExitSuccess) connector.onExitSuccess(stableOnExitSuccess)
    if (callbacksRef.current?.onExitAbort) connector.onExitAbort(stableOnExitAbort)
    if (callbacksRef.current?.onExitError) connector.onExitError(stableOnExitError)

    return () => {
      if (callbacksRef.current?.onEvent) connector.offEvent(stableOnEvent)
      if (callbacksRef.current?.onOpen) connector.offOpen(handleOpen)
      if (callbacksRef.current?.onLoad) connector.offLoad(stableOnLoad)
      if (callbacksRef.current?.onExit) connector.offExit(handleExit)
      if (callbacksRef.current?.onExitSuccess) connector.offExitSuccess(stableOnExitSuccess)
      if (callbacksRef.current?.onExitAbort) connector.offExitAbort(stableOnExitAbort)
      if (callbacksRef.current?.onExitError) connector.offExitError(stableOnExitError)
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
