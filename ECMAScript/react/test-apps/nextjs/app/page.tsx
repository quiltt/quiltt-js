'use client'

import { TestCustomButton, TestCustomContainer, TestHTMLLauncher, TestQuilttButton, TestQuilttContainer } from './components'

export default function Home() {
  return (
    <main className="flex h-screen justify-center items-center space-x-48">
      <div className="flex flex-col space-y-5">
        <h1 className="text-2xl text-center py-6">Modal launchers</h1>
        <TestHTMLLauncher />
        <TestQuilttButton />
        <TestCustomButton />
      </div>
      <div className="flex flex-col h-3/4 w-1/5">
        <h1 className="text-2xl text-center py-6">Container</h1>
        <TestQuilttContainer />
        <TestCustomContainer />
      </div>
    </main>
  )
}
