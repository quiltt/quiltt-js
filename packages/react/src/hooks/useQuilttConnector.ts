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

  // onEvent
  useEffect(() => {
    if (!connector || !options?.onEvent) return

    connector.onEvent(options.onEvent)
    return () => connector.offEvent(options.onEvent as any)
  }, [connector, options?.onEvent])

  // onOpen
  useEffect(() => {
    if (!connector || !options?.onOpen) return

    connector.onOpen(options.onOpen)
    return () => connector.offOpen(options.onOpen as any)
  }, [connector, options?.onOpen])

  // onLoad
  useEffect(() => {
    if (!connector || !options?.onLoad) return

    connector.onLoad(options.onLoad)
    return () => connector.offLoad(options.onLoad as any)
  }, [connector, options?.onLoad])

  // onExit
  useEffect(() => {
    if (!connector || !options?.onExit) return

    connector.onExit(options.onExit)
    return () => connector.offExit(options.onExit as any)
  }, [connector, options?.onExit])

  // onExitSuccess
  useEffect(() => {
    if (!connector || !options?.onExitSuccess) return

    connector.onExitSuccess(options.onExitSuccess)
    return () => connector.offExitSuccess(options.onExitSuccess as any)
  }, [connector, options?.onExitSuccess])

  // onExitAbort
  useEffect(() => {
    if (!connector || !options?.onExitAbort) return

    connector.onExitAbort(options.onExitAbort)
    return () => connector.offExitAbort(options.onExitAbort as any)
  }, [connector, options?.onExitAbort])

  // onExitError
  useEffect(() => {
    if (!connector || !options?.onExitError) return

    connector.onExitError(options.onExitError)
    return () => connector.offExitError(options.onExitError as any)
  }, [connector, options?.onExitError])

  // This is used to hide any potential race conditions from usage; allowing
  // interaction before the script may have loaded.
  useEffect(() => {
    if (connector && isOpening) {
      setIsOpening(false)
      connector.open()
    }
  }, [connector, isOpening])

  const open = useCallback(() => {
    if (connectorId) {
      setIsOpening(true)
    } else {
      throw new Error('Must provide `connectorId` to `open` Quiltt Connector with Method Call')
    }
  }, [connectorId])

  return { open }
}
