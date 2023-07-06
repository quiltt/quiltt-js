'use client'

import { QuilttButton } from '@quiltt/react'

export const TestQuilttButton = () => {
  return (
    <QuilttButton
      connectorId="connector"
      className="bg-purple-500 hover:bg-purple-900 text-white py-2 px-4 rounded-md"
    >
      Launch with Component
    </QuilttButton>
  )
}
export default TestQuilttButton
