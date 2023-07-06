'use client'

import type { FC } from 'react'

import { useQuilttConnector } from '@quiltt/react'

export const TestCustomLauncher = () => {
  // Load the script
  useQuilttConnector()

  // Render a custom <a> launcher
  return (
    <a
      data-quiltt-button="connector"
      className="bg-purple-500 hover:bg-purple-900 text-white py-2 px-4 rounded-full"
    >
      Launch with custom launcher!
    </a>
  )
}
export default TestCustomLauncher
