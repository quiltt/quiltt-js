'use client'

import type { FC, PropsWithChildren } from 'react'
import { useMemo, useRef } from 'react'

import type { QuilttSettingsContext } from '@/contexts/QuilttSettings'
import { QuilttSettings } from '@/contexts/QuilttSettings'
import { isDeepEqual } from '@/utils'

export type QuilttSettingsProviderProps = PropsWithChildren & {
  /** The Client ID to use for the passwordless Auth API */
  clientId?: string
  /**
   * Custom headers to include with every API request (REST and GraphQL).
   * For Quiltt internal usage. Not intended for public use.
   * @internal
   */
  headers?: Record<string, string>
}

export const QuilttSettingsProvider: FC<QuilttSettingsProviderProps> = ({
  clientId,
  headers,
  children,
}) => {
  // Stabilize headers using deep comparison to prevent unnecessary context changes
  // when consumers pass inline object literals
  const previousHeadersRef = useRef<Record<string, string> | undefined>(undefined)
  const stableHeaders = useMemo(() => {
    if (isDeepEqual(headers, previousHeadersRef.current)) {
      return previousHeadersRef.current
    }
    previousHeadersRef.current = headers
    return headers
  }, [headers])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<QuilttSettingsContext>(
    () => ({
      clientId,
      headers: stableHeaders,
    }),
    [clientId, stableHeaders]
  )

  return <QuilttSettings.Provider value={contextValue}>{children}</QuilttSettings.Provider>
}

export default QuilttSettingsProvider
