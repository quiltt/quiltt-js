'use client'

import { createContext } from 'react'

type QuilttProviderRenderContext = {
  /**
   * Flag indicating that QuilttProvider is in the ancestor tree.
   * Due to React context propagation, this is true for ALL descendants,
   * not just those in the same component as the provider.
   * Used to detect potential anti-patterns in component composition.
   */
  isRenderingProvider?: boolean
}

export const QuilttProviderRender = createContext<QuilttProviderRenderContext>({})
