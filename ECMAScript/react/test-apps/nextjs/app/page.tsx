'use client'

import { useQuilttConnector } from '@quiltt/react'

export default function Home() {
  const { ready } = useQuilttConnector({
    connectorId: 'connector',
    button: `#quiltt-launcher`,
  })

  return (
    <main className="flex h-screen justify-center items-center">
      <button
        disabled={!ready}
        id="quiltt-launcher"
        className="bg-purple-500 hover:bg-purple-900 text-white py-2 px-4 rounded-full"
      >
        Launch Connector
      </button>
    </main>
  )
}
