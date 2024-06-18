'use client'

import { useQuilttConnector } from '@quiltt/react'

export const TestHTMLLauncher = () => {
  // Load the script
  useQuilttConnector()

  return (
    <a
      // biome-ignore lint/a11y/useValidAnchor: <explanation>
      href="#"
      quiltt-button="connector"
      className="cursor-pointer rounded-full border-2 border-purple-500 px-4 py-2 text-white hover:bg-purple-500"
    >
      Launch with HTML
    </a>
  )
}
export default TestHTMLLauncher
