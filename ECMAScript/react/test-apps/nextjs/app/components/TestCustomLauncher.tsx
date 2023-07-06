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
      className="border-2 border-purple-500 hover:bg-purple-500 text-white py-2 px-4 rounded-full cursor-pointer"
    >
      Launch with custom launcher!
    </a>
  )
}
export default TestCustomLauncher
