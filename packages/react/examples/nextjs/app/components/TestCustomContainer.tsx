'use client'

import { QuilttContainer } from '@quiltt/react'
import { FC } from 'react'

const CustomContainer: FC = ({ ...props }) => {
  return <div className="border-4 border-purple-500 hover:border-blue-500 h-full" {...props}></div>
}

export const TestCustomContainer = () => {
  return <QuilttContainer as={CustomContainer} connectorId="connector" />
}

export default TestCustomContainer
