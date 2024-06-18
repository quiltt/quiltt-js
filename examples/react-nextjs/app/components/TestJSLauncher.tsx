'use client'

import { useQuilttConnector } from '@quiltt/react'

export const TestJSLauncher = () => {
  // Load the script
  const { open } = useQuilttConnector('connector', {
    onEvent: (type) => console.log(`Event: ${type}`),
  })

  return (
    <button
      type="button"
      onClick={open}
      className="cursor-pointer rounded-full border-2 border-purple-500 px-4 py-2 text-white hover:bg-purple-500"
    >
      Launch with Javascript
    </button>
  )
}
export default TestJSLauncher
