'use client'

import { useQuilttConnector } from '@quiltt/react'

import { connectorId } from './quiltt-config'

export const TestCustomButton = () => {
  const { open } = useQuilttConnector(connectorId, {
    onExitSuccess: () => console.log('onExitSuccess'),
  })

  return (
    <button type="button" className="component-button" onClick={open}>
      Launch with Custom Component
    </button>
  )
}
export default TestCustomButton
