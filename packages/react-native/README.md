# @quiltt/react-native

[![npm version](https://badge.fury.io/js/@quiltt%2Freact-native.svg)](https://badge.fury.io/js/@quiltt%2Freact-native)
[![CI](https://github.com/quiltt/quiltt-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/quiltt/quiltt-js/actions/workflows/ci.yml)

`@quiltt/react-native` provides React Native Components for integrating Quiltt Connector into React Native and Expo applications.

## Installation

`@quiltt/react-native` expects `react`, `react-native`,`react-native-webview`, `base-64` and `react-native-url-polyfill` as peer dependencies.

With `npm`:

```shell
$ npm install base-64 react-native-webview react-native-url-polyfill
$ npm install @quiltt/react-native
```

With `yarn`:

```shell
$ yarn add base-64 react-native-webview react-native-url-polyfill
$ yarn add @quiltt/react-native
```

With `pnpm`:

```shell
# Make sure to add `node-linker=hoisted` to your `.npmrc` when using pnpm in an Expo app.
$ pnpm add base-64 react-native-webview react-native-url-polyfill
$ pnpm add @quiltt/react-native
```

## Documentation

For full SDK documentation and more code examples, see the Connector [React Native guide](https://www.quiltt.dev/connector/sdk/react-native).

### QuilttConnector

Launch the [Quiltt Connector](https://www.quiltt.dev/connector) in a webview.

`@quiltt/react-native` does not ship with a navigation library, so you might want to navigate to a new "page" when using QuilttConnector.

#### Example

```tsx
import { QuilttProvider } from '@quiltt/react'
import { QuilttConnector } from '@quiltt/react-native'
import type { ConnectorSDKCallbackMetadata } from '@quiltt/react'

export const App = () => {
  // See: https://www.quiltt.dev/authentication/issuing-session-tokens
  const sessionToken = '<TOKEN_OBTAINED_FROM_THE_SERVER>'

  // Use a universal link or deep link to redirect back to your app
  const oauthRedirectUrl = 'https://myapp.com/my_universal_link'

  const handleExitSuccess = (metadata: ConnectorSDKCallbackMetadata) => {
    console.log('Successfully created connection!', {
      connectionId: metadata.connectionId,
    })
  }

  return (
    <QuilttProvider token={sessionToken}>
      <QuilttConnector
        connectorId="<CONNECTOR_ID>"
        oauthRedirectUrl={oauthRedirectUrl}

        // See the JavaScript API docs for the full list of available callbacks...
        onExitSuccess={handleExitSuccess}
      />
    </QuilttProvider>
  )
}

export default App
```
