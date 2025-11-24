'use client'

import { createContext } from 'react'

type QuilttProviderRenderContext = {
  /**
   * Indicates if we're currently rendering inside QuilttProvider's render function.
   * Used to detect when SDK components are rendered in the same component as the provider.
   */
  isRenderingProvider?: boolean
}

export const QuilttProviderRender = createContext<QuilttProviderRenderContext>({})
