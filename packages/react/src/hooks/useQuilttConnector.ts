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
  const connectorCreatedRef = useRef<boolean>(false)

  // Track whether the connector is currently open
  const isConnectorOpenRef = useRef<boolean>(false)

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

    // Check for changes
    const connectionIdChanged = prevConnectionIdRef.current !== currentConnectionId
    const connectorIdChanged = prevConnectorIdRef.current !== connectorId
    const hasChanges = connectionIdChanged || connectorIdChanged || !connectorCreatedRef.current

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
    }
  }, [connectorId, options?.connectionId, options?.institution, status])

  // Internal handlers to track connector state
  const handleOpen = useCallback(
    (metadata: any) => {
      isConnectorOpenRef.current = true
      options?.onOpen?.(metadata)
    },
    [options?.onOpen]
  )

  const handleExit = useCallback(
    (type: any, metadata: any) => {
      isConnectorOpenRef.current = false
      options?.onExit?.(type, metadata)
    },
    [options?.onExit]
  )

  // Register event handlers
  useEffect(() => {
    if (!connector) return

    const handlers = {
      onEvent: options?.onEvent,
      onOpen: handleOpen,
      onLoad: options?.onLoad,
      onExit: handleExit,
      onExitSuccess: options?.onExitSuccess,
      onExitAbort: options?.onExitAbort,
      onExitError: options?.onExitError,
    }

    if (handlers.onEvent) connector.onEvent(handlers.onEvent)
    if (handlers.onOpen) connector.onOpen(handlers.onOpen)
    if (handlers.onLoad) connector.onLoad(handlers.onLoad)
    if (handlers.onExit) connector.onExit(handlers.onExit)
    if (handlers.onExitSuccess) connector.onExitSuccess(handlers.onExitSuccess)
    if (handlers.onExitAbort) connector.onExitAbort(handlers.onExitAbort)
    if (handlers.onExitError) connector.onExitError(handlers.onExitError)

    return () => {
      if (handlers.onEvent) connector.offEvent(handlers.onEvent)
      if (handlers.onOpen) connector.offOpen(handlers.onOpen)
      if (handlers.onLoad) connector.offLoad(handlers.onLoad)
      if (handlers.onExit) connector.offExit(handlers.onExit)
      if (handlers.onExitSuccess) connector.offExitSuccess(handlers.onExitSuccess)
      if (handlers.onExitAbort) connector.offExitAbort(handlers.onExitAbort)
      if (handlers.onExitError) connector.offExitError(handlers.onExitError)
    }
  }, [
    connector,
    options?.onEvent,
    handleOpen,
    options?.onLoad,
    handleExit,
    options?.onExitSuccess,
    options?.onExitAbort,
    options?.onExitError,
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
        console.warn(
          'useQuilttConnector: Component unmounted while connector is still open. ' +
            'This may lead to memory leaks or unexpected behavior. ' +
            'Consider ensuring the connector is properly closed before component unmount.'
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
