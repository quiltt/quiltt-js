'use client'

import { useQuilttConnector } from '@quiltt/react'

import { connectorId } from './quiltt-config'

export const TestHTMLLauncher = () => {
  useQuilttConnector()

  return (
    <button type="button" quiltt-button={connectorId} className="launcher-button">
      Launch with HTML
    </button>
  )
}
export default TestHTMLLauncher
