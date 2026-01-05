'use client'

import { QuilttButton } from '@quiltt/react'

export const TestQuilttButton = () => {
  return (
    <QuilttButton
      connectorId="connector"
      className="rounded-md bg-purple-500 px-4 py-2 text-white hover:bg-purple-900"
    >
      Launch with Component
    </QuilttButton>
  )
}
export default TestQuilttButton
