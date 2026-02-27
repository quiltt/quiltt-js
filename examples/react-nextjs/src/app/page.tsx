import {
  TestCustomButton,
  TestCustomContainer,
  TestHTMLLauncher,
  TestJSLauncher,
  TestQuilttButton,
  TestQuilttContainer,
} from './_components'

export default function Home() {
  return (
    <main>
      <div className="launchers">
        <h1 className="heading">Modal launchers</h1>
        <TestHTMLLauncher />
        <TestJSLauncher />
        <TestQuilttButton />
        <TestCustomButton />
      </div>
      <div className="containers">
        <h1 className="heading">Container</h1>
        <TestQuilttContainer />
        <TestCustomContainer />
      </div>
    </main>
  )
}
