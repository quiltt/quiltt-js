'use client'

import { useQuilttConnector } from '@quiltt/react'

import { connectorId } from './quiltt-config'

export const TestJSLauncher = () => {
  const { open } = useQuilttConnector(connectorId, {
    onEvent: (type) => console.log(`Event: ${type}`),
  })

  return (
    <button type="button" className="launcher-button" onClick={open}>
      Launch with Javascript
    </button>
  )
}
export default TestJSLauncher
