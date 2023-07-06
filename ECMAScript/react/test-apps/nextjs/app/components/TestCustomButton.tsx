'use client'

import { FC, PropsWithChildren, ReactNode } from 'react'
import { QuilttButton } from '@quiltt/react'

const CustomButton = ({ children, ...props }: any) => {
  return <button className="bg-purple-500 hover:bg-purple-900 text-white py-2 px-4 rounded-md" {...props}>
    {children}
  </button>
}

export const TestCustomButton = () => {
  return (
    <QuilttButton as={CustomButton} connectorId="connector">
      Launch with Custom Component
    </QuilttButton>
  )
}
export default TestCustomButton
