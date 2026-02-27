'use client'

import { QuilttContainer } from '@quiltt/react'

import { connectorId } from './quiltt-config'

export const TestCustomContainer = () => {
  return <QuilttContainer connectorId={connectorId} className="container-frame" as="section" />
}

export default TestCustomContainer
