'use client'

import type { ButtonHTMLAttributes } from 'react'

import { QuilttButton } from '@quiltt/react'

type CustomButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

const CustomButton = ({ children, ...props }: CustomButtonProps) => {
  return (
    <button
      className="rounded-md bg-purple-500 px-4 py-2 text-white hover:bg-purple-900"
      {...props}
    >
      {children}
    </button>
  )
}

export const TestCustomButton = () => {
  return (
    <QuilttButton
      as={CustomButton}
      connectorId="connector"
      onExitSuccess={() => console.log('onExitSuccess')}
    >
      Launch with Custom Component
    </QuilttButton>
  )
}
export default TestCustomButton
