'use client'

import { QuilttContainer } from '@quiltt/react'

import { connectorId } from './quiltt-config'

export const TestQuilttContainer = () => {
  return <QuilttContainer connectorId={connectorId} className="container-frame" as="div" />
}

export default TestQuilttContainer
