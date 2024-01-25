'use client'

import { useCallback, useEffect, useState } from 'react'
import { useQuilttSession } from './useQuilttSession'
import { useScript } from './useScript'
import { ConnectorSDK, ConnectorSDKConnector, ConnectorSDKConnectorOptions } from '@quiltt/core'

const QUILTT_CDN_BASE = (() => {
  try {
    return process.env.QUILTT_CDN_BASE || 'https://cdn.quiltt.io'
  } catch {
    return 'https://cdn.quiltt.io'
  }
})()

declare const Quiltt: ConnectorSDK

export const useQuilttConnector = (
  connectorId?: string,
  options?: ConnectorSDKConnectorOptions
) => {
  const status = useScript(`${QUILTT_CDN_BASE}/v1/connector.js`)
  const { session } = useQuilttSession()
  const [connector, setConnector] = useState<ConnectorSDKConnector>()
  const [isOpening, setIsOpening] = useState<boolean>(false)

  // Set Session
  useEffect(() => {
    if (typeof Quiltt === 'undefined') return

    Quiltt.authenticate(session?.token)
  }, [status, session])

  // Set Connector
  useEffect(() => {
    if (typeof Quiltt === 'undefined' || !connectorId) return

    if (options?.connectionId) {
      setConnector(Quiltt.reconnect(connectorId, { connectionId: options.connectionId }))
    } else {
      setConnector(Quiltt.connect(connectorId))
    }
  }, [status, connectorId, options?.connectionId])

  // onEvent
  useEffect(() => {
    if (!connector || !options?.onEvent) return

    connector.onEvent(options.onEvent)
    return () => connector.offEvent(options.onEvent as any)
  }, [connector, options?.onEvent])

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
  }, [connectorId, setIsOpening])

  return { open }
}
