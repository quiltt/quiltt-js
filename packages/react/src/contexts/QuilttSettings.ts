'use client'

import { createContext } from 'react'

export type QuilttSettingsContext = {
  clientId?: string
  /**
   * Custom headers to include with every API request (REST and GraphQL).
   * For Quiltt internal usage. Not intended for public use.
   * @internal
   */
  headers?: Record<string, string>
}

export const QuilttSettings = createContext<QuilttSettingsContext>({})
