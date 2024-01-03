# @quiltt/react-native

[![npm version](https://badge.fury.io/js/@quiltt%2Freact-native.svg)](https://badge.fury.io/js/@quiltt%2Freact-native)
[![CI](https://github.com/quiltt/quiltt-public/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/quiltt/quiltt-public/actions/workflows/ci.yml)

`@quiltt/react-native` provides React Native Components for integrating Quiltt Connector into React Native and Expo applications.

## Installation

`@quiltt/react-native` expects `react`, `react-native`,`react-native-webview`, `base-64` and `react-native-url-polyfill` as peer dependencies.

```shell
$ npm install base-64 react-native-webview react-native-url-polyfill
$ npm install @quiltt/react-native
# or
$ yarn add base-64 react-native-webview react-native-url-polyfill
$ yarn add @quiltt/react-native
# or
# Please note that you will need to add `node-linker=hoisted` in `.npmrc` if you are using pnpm in expo app.`
$ pnpm add base-64 react-native-webview react-native-url-polyfill
$ pnpm add @quiltt/react-native
```

### QuilttConnector

Launch the [Quiltt Connector](https://www.quiltt.dev/guides/connector) in a webview.

`@quiltt/react-native` does not include any navigation library, you might want to navigate to a new "page" when using QuilttConnector to get the best result.

For simple usage of `react-navigation`, please see [App.tsx](ECMAScript/react-native/example/App.tsx) and [ConnectorScreen.tsx](ECMAScript/react-native/example/screens/ConnectorScreen.tsx).

#### Example

```typescript
import { useState } from 'react'
import { QuilttProvider } from '@quiltt/react'
import { QuilttConnector } from '@quiltt/react-native'

export const App = () => {
  // See: https://www.quiltt.dev/api-reference/rest/auth#/paths/~1v1~1users~1sessions/post
  const token = 'GET_THIS_TOKEN_FROM_YOUR_SERVER'
  const [connectionId, setConnectionId] = useState<string>()
  const oAuthRedirectUrl = "quilttexample://open.reactnative.app"
  const handleExitSuccess = (metadata) => {
    setConnectionId(metadata?.connectionId)
  }

  return (
    <QuilttProvider token={token}>
      <QuilttConnector
        connectorId="<CONNECTOR_ID>"
        oAuthRedirectUrl={oAuthRedirectUrl}
        onExitSuccess={handleExitSuccess}
      />
    </QuilttProvider>
  )
}

export default App
```
