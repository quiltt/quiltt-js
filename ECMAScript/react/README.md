# @quiltt/react

[![npm version](https://badge.fury.io/js/@quiltt%2Fcore.svg)](https://badge.fury.io/js/@quiltt%2Fcore)

`@quiltt/react` provides essential functionality for building React.js applications using Quiltt.

## Installation

```shell
$ npm install @quiltt/react
# or
$ yarn add @quiltt/react
# or
$ pnpm add @quiltt/react
```

## Core Modules and Types

The `@quiltt/react` library is built on top of the `@quiltt/core` library, which provides modules and utilities for JSON Web Token functionality, observable patterns, storage management, timeouts, API handling, and TypeScript types.

## React Components

All components automatically handle session token management under the hood, using the `useQuilttSession` hook.

To pre-authenticate the Connector for one of your user profiles, make sure to set your token using the `QuilttProvider` provider or the `useQuilttSession` hook. See the [Authentication guides](https://www.quiltt.dev/guides/authentication) for how to generate a session.

### QuilttButton

Launch the [Quiltt Connector](https://www.quiltt.dev/guides/connector) as a pop-out modal.

By default, the rendered component will be a `<button>` but you can supply your own component via the `as` prop.

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

By default, the rendered component will be a `<div>` but you can supply your own component via the `as` prop.

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

A provider component for passing session and settings down to the rest of your application.

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

A hook to manage the the lifecycle of [Quiltt Connector](https://www.quiltt.dev/guides/connector).

#### Example

```tsx
import { useQuilttConnector } from '@quiltt/react'

const App = () => {
  useQuilttConnector()

  return (
    <button connectorId="{MY_CONNECTOR_ID}" type="button">
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
    console.log('No session available')
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

## License

This project is licensed under the terms of the MIT license. See the [LICENSE](LICENSE.md) file for more information.

## Contributing

For information on how to contribute to this project, please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file.
