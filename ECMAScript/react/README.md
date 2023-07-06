# @quiltt/react

## Overview

`@quiltt/react` is a comprehensive JavaScript library that provides essential functionality for building applications using React. It extends the capabilities of React by offering various modules, utilities, and types from `@quiltt/core` that can be utilized to enhance your development workflow.

## Installation

To install `@quiltt/react` in your project, you need to have Node.js and npm (Node Package Manager) installed. Then, you can run the following command:

```shell
npm install @quiltt/react
```

## Features

`@quiltt/react` provides the following features:

- Integration with `@quiltt/core` library, which includes modules for JSON Web Tokens (JWT), observables, storage management, timeouts, API handling, and TypeScript types.
- Additional React-specific hooks and utilities for session management, storage, and Quiltt client integration.

## Available Exports

### Core Modules and Types

The following exports are available from `@quiltt/core`:

- JSON Web Token functionality, observable patterns, storage management, timeouts, API handling, and TypeScript types.

### React Hooks

The following hooks are available from `@quiltt/react/hooks`:

- Helpers for handling Quiltt sessions and client integration.
- `useQuilttConnector`: A hook for connecting to the Quiltt backend.
- `useQuilttSession`: A hook for managing Quiltt sessions.
- `useQuilttSettings`: A hook for accessing Quiltt settings.

#### Usage

##### useQuilttConnector

```tsx
import { type FC } from 'react'
import { useQuilttConnector } from '@quiltt/react'

type ConnectorLauncherProps = {
  connectorId: string
}

const ConnectorLauncher: FC<ConnectorLauncherProps> = ({ connectorId }) => {
  const launcherClass = 'connector-launcher'

  const { ready } = useQuilttConnector({
    connectorId,
    button: `.${launcherClass}`,
  })

  return (
    <button type="button" disabled={!ready} className={launcherClass}>
      Launch with Component
    </button>
  )
}
```

##### useQuilttSession

```tsx
import { useEffect } from 'react'
import { useQuilttSession } from '@quiltt/react'

const MyComponent = () => {
  const { session, importSession, authenticateSession, revokeSession } = useQuilttSession()

  useEffect(() => {
    // Import session from local storage or any other source
    importSession()

    // Authenticate session with your backend if necessary
    authenticateSession()

    // Clean up session when component unmounts
    return () => {
      revokeSession()
    }
  }, [importSession, authenticateSession, revokeSession])

  return <div>{session ? <p>Session token: {session.token}</p> : <p>No session available</p>}</div>
}

export default MyComponent
```

##### useQuilttSettings

```tsx
import { QuilttSettings, useQuilttSettings } from '@quiltt/react'

const App = () => {
  // Wrap your application with QuilttSettingsProvider to provide the settings
  return (
    <QuilttSettings.Provider value={{ clientId: 'YOUR_CLIENT_ID' }}>
      <MyComponent />
    </QuilttSettings.Provider>
  )
}

const MyComponent = () => {
  const { clientId } = useQuilttSettings()

  return (
    <div>
      <p>Quiltt Client ID: {clientId}</p>
      {/* Rest of your component */}
    </div>
  )
}

export default App
```

### React Providers

The following providers are available from `@quiltt/react/providers`:

- `QuilttAuthProvider`: A provider component for authenticating with Quiltt.
- `QuilttProvider`: A provider component for initializing Quiltt.
- `QuilttSettingsProvider`: A provider component for managing Quiltt settings.

## License

This project is licensed under the terms of the MIT license. See the [LICENSE](LICENSE.md) file for more information.

For information on how to contribute to this project, please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file.

By contributing to `@quiltt/react`, you can help improve its features and functionality. We appreciate your contributions and thank you for your support!
