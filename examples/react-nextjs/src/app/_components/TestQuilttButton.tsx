'use client'

import { QuilttButton } from '@quiltt/react'

import { connectorId } from './quiltt-config'

export const TestQuilttButton = () => {
  return (
    <QuilttButton connectorId={connectorId} className="component-button" themeMode="dark">
      Launch with Component
    </QuilttButton>
  )
}
export default TestQuilttButton
