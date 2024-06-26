'use client'

import { QuilttContainer } from '@quiltt/react'
import type { FC } from 'react'

const CustomContainer: FC = ({ ...props }) => {
  return <div className="h-full border-4 border-purple-500 hover:border-blue-500" {...props} />
}

export const TestCustomContainer = () => {
  return <QuilttContainer as={CustomContainer} connectorId="connector" />
}

export default TestCustomContainer
