'use client'

import { useQuilttConnector } from '@quiltt/react'

export const TestHTMLLauncher = () => {
  // Load the script
  useQuilttConnector()

  return (
    <a
      quiltt-button="connector"
      className="border-2 border-purple-500 hover:bg-purple-500 text-white py-2 px-4 rounded-full cursor-pointer"
    >
      Launch with HTML
    </a>
  )
}
export default TestHTMLLauncher
