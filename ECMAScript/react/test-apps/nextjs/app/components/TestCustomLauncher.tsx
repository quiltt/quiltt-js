'use client'

import { useQuilttConnector } from '@quiltt/react'

export const TestCustomLauncher = () => {
  // Load the script
  useQuilttConnector()

  // Render a custom <a> launcher
  return (
    <a
      quiltt-button="connector"
      className="border-2 border-purple-500 hover:bg-purple-500 text-white py-2 px-4 rounded-full cursor-pointer"
    >
      Launch with HTML
    </a>
  )
}
export default TestCustomLauncher
