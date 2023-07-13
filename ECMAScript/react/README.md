# @quiltt/react

[![npm version](https://badge.fury.io/js/@quiltt%2Freact.svg)](https://badge.fury.io/js/@quiltt%2Freact)
[![CI](https://github.com/quiltt/quiltt-public/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/quiltt/quiltt-public/actions/workflows/ci.yml)

`@quiltt/react` provides React Components and Hooks for integrating Quiltt into React-based applications.

## Installation

```shell
$ npm install @quiltt/react
# or
$ yarn add @quiltt/react
# or
$ pnpm add @quiltt/react
```

## Core Modules and Types

The `@quiltt/react` library ships with `@quiltt/core`, which provides an Auth API and essential functionality for building Javascript-based applications with Quiltt. See the [Core README](../core/README.md) for more information.

## React Components

All components automatically handle Session token management under the hood, using the `useQuilttSession` hook.

To pre-authenticate the Connector for one of your user profiles, make sure to set your token using the `QuilttProvider` provider or the `useQuilttSession` hook. See the [Authentication guides](https://www.quiltt.dev/guides/authentication) for how to generate a Session.

### QuilttButton

Launch the [Quiltt Connector](https://www.quiltt.dev/guides/connector) as a pop-out modal.

By default, the rendered component will be a `<button>` element, but you can supply your own component via the `as` prop. You can also pass forward any props to the rendered component.

#### Example

```tsx
import { QuilttButton } from '@quiltt/react'

export const App = () => {
  return (
    <QuilttButton
      connectorId="{YOUR_CONNECTOR_ID}"
      className="my-css-class"
      styles={{ borderWidth: '2px' }}
    >
      Add Account
    </QuilttButton>
  )
}
export default App
```

### QuilttContainer

Launch the [Quiltt Connector](https://www.quiltt.dev/guides/connector) inside a container.

By default, the rendered component will be a `<div>` element, but you can supply your own component via the `as` prop. You can also pass forward any props to the rendered component.

##### Example

```tsx
import { QuilttContainer } from '@quiltt/react'

export const App = () => {
  return (
    <QuilttContainer
      connectorId="{YOUR_CONNECTOR_ID}"
      className="my-css-class"
      styles={{ height: '100%' }}
    />
  )
}

export default App
```

### QuilttProvider

A provider component for passing Session and settings down to the rest of your application.

#### Example

```tsx
import { QuilttProvider } from '@quiltt/react'

const Layout = ({ children }) => {
  return <QuilttProvider token="{SESSION_TOKEN}">{children}</QuilttProvider>
}

export default Layout
```

## React Hooks

For maximum control over the lifecycle of Quiltt Connector and Quiltt Sessions, you can also use hooks directly.

### useQuilttConnector

A hook to manage the lifecycle of [Quiltt Connector](https://www.quiltt.dev/guides/connector).

#### Example

```tsx
import { useQuilttConnector } from '@quiltt/react'

const App = () => {
  useQuilttConnector()

  return (
    <button quilttButton="{MY_CONNECTOR_ID}" type="button">
      Launch Connector
    </button>
  )
}
```

### useQuilttSession

A hook to manage the lifecycle of Quiltt Sessions.

See the [Authentication guides](https://www.quiltt.dev/guides/authentication) for more information.

#### Example

```tsx
import { useCallback, useEffect } from 'react'

import { useQuilttSession } from '@quiltt/react'

const App = () => {
  const { session, importSession, revokeSession } = useQuilttSession()

  useEffect(() => {
    // Import session from API call, local storage, query param, etc.
    importSession('{SESSION_TOKEN}')
  }, [importSession])

  const logOut = useCallback(() => {
    // Revoke and clear the Quiltt session
    revokeSession()

    // do other stuff!
  }, [revokeSession])

  if (session) {
    console.log('Session token: ', session.token)
  } else {
    console.log('No Session available')
  }

  return (
    <>
      <div>Hello world!</div>
      <button onClick={logOut}>Log Out</button>
    </>
  )
}

export default App
```

## Typescript support

`@quiltt/react` is written in Typescript and ships with its own type definitions. It also ships with the type definitions from `@quiltt/core`.

## License

This project is licensed under the terms of the MIT license. See the [LICENSE](LICENSE.md) file for more information.

## Contributing

For information on how to contribute to this project, please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file.
