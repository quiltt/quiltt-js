'use client'

import {
  TestCustomButton,
  TestCustomContainer,
  TestHTMLLauncher,
  TestJSLauncher,
  TestQuilttButton,
  TestQuilttContainer,
} from './components'

export default function Home() {
  return (
    <main className="flex h-screen items-center justify-center space-x-48">
      <div className="flex flex-col space-y-5">
        <h1 className="py-6 text-center text-2xl">Modal launchers</h1>
        <TestHTMLLauncher />
        <TestJSLauncher />
        <TestQuilttButton />
        <TestCustomButton />
      </div>
      <div className="flex h-3/4 w-1/5 flex-col">
        <h1 className="py-6 text-center text-2xl">Container</h1>
        <TestQuilttContainer />
        <TestCustomContainer />
      </div>
    </main>
  )
}
