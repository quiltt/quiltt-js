'use client'

import { useQuilttConnector } from '@quiltt/react'

export const TestJSLauncher = () => {
  // Load the script
  const { open } = useQuilttConnector('connector', {
    onEvent: (type) => console.log(`Event: ${type}`)
  })

  // Render a custom <a> launcher
  return (
    <button
      onClick={open}
      className="border-2 border-purple-500 hover:bg-purple-500 text-white py-2 px-4 rounded-full cursor-pointer"
    >
      Launch with Javascript
    </button>
  )
}
export default TestJSLauncher
