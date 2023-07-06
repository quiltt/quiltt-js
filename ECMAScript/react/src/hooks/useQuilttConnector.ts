'use client'

import { useEffect } from 'react'
import { useQuilttSession } from './useQuilttSession'

const QUILTT_CDN_BASE = process.env.QUILTT_CDN_BASE || 'https://cdn.quiltt.io'

// Script Element Singleton
let scriptElement: HTMLScriptElement

export const useQuilttConnector = () => {
  const { session } = useQuilttSession()

  // Create Script Element
  useEffect(() => {
    if (scriptElement) return

    scriptElement = document.createElement('script')
    scriptElement.src = `${QUILTT_CDN_BASE}/v1/connector.js`

    if (session?.token) {
      scriptElement.setAttribute('quiltt-token', session.token)
    }

    document.head.appendChild(scriptElement)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update Script Element
  useEffect(() => {
    if (!scriptElement) return

    if (session?.token && session.token !== scriptElement.getAttribute('quiltt-token')) {
      scriptElement.setAttribute('quiltt-token', session.token)
    } else if (!session?.token && scriptElement.getAttribute('quiltt-token')) {
      scriptElement.removeAttribute('quiltt-token')
    }
  }, [session?.token])
}
