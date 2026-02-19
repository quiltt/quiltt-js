# @quiltt/capacitor

[![npm version](https://badge.fury.io/js/@quiltt%2Fcapacitor.svg)](https://badge.fury.io/js/@quiltt%2Fcapacitor)
[![CI](https://github.com/quiltt/quiltt-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/quiltt/quiltt-js/actions/workflows/ci.yml)

Quiltt Connector SDK for Capacitor and Ionic apps on iOS, Android, and web.

## Installation

```shell
npm install @quiltt/capacitor
npx cap sync
```

## Quick Start

```tsx
import { QuilttProvider, QuilttConnector } from '@quiltt/capacitor'
import type { ConnectorSDKCallbackMetadata } from '@quiltt/capacitor'

export const App = () => {
  const handleExitSuccess = (metadata: ConnectorSDKCallbackMetadata) => {
    console.log('Connected:', metadata.connectionId)
  }

  return (
    <QuilttProvider token="<SESSION_TOKEN>">
      <QuilttConnector
        connectorId="<CONNECTOR_ID>"
        appLauncherUri="myapp://oauth"
        onExitSuccess={handleExitSuccess}
        style={{ flex: 1 }}
      />
    </QuilttProvider>
  )
}
```

The `QuilttConnector` component automatically handles OAuth flows—opening bank authentication in the system browser and listening for deep link callbacks when users return.

## Platform Configuration

Configure deep links so your app can receive OAuth callbacks from bank authentication.

### iOS

Add to `ios/App/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>myapp</string>
    </array>
  </dict>
</array>
```

### Android

Add to your activity in `android/app/src/main/AndroidManifest.xml`:

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="myapp" />
</intent-filter>
```

## Usage

### QuilttConnector (Recommended)

Full-screen embedded connector with automatic OAuth handling:

```tsx
import { QuilttConnector } from '@quiltt/capacitor'

<QuilttConnector
  connectorId="<CONNECTOR_ID>"
  appLauncherUri="myapp://oauth"
  onExitSuccess={(metadata) => console.log('Connected:', metadata.connectionId)}
  onExitAbort={() => navigation.goBack()}
  style={{ flex: 1 }}
/>
```

### QuilttButton

Modal-based connector for quick integration:

```tsx
import { QuilttButton } from '@quiltt/capacitor'

<QuilttButton connectorId="<CONNECTOR_ID>" onExitSuccess={handleSuccess}>
  Add Account
</QuilttButton>
```

### Reconnection Flow

Pass a `connectionId` to reconnect an existing connection:

```tsx
<QuilttConnector
  connectorId="<CONNECTOR_ID>"
  connectionId="<EXISTING_CONNECTION_ID>"
  appLauncherUri="myapp://oauth"
  onExitSuccess={handleSuccess}
/>
```

## API Reference

### QuilttConnector Props

| Prop | Type | Description |
|------|------|-------------|
| `connectorId` | `string` | **Required.** Your Quiltt Connector ID |
| `connectionId` | `string` | Existing connection ID for reconnection |
| `institution` | `string` | Pre-select a specific institution |
| `appLauncherUri` | `string` | Deep link URL for OAuth callbacks (e.g., `myapp://oauth`) |
| `style` | `CSSProperties` | Inline styles for the container |
| `className` | `string` | CSS class name |
| `onLoad` | `(metadata) => void` | Connector loaded |
| `onExitSuccess` | `(metadata) => void` | Connection successful |
| `onExitAbort` | `(metadata) => void` | User cancelled |
| `onExitError` | `(metadata) => void` | Error occurred |
| `onEvent` | `(event, metadata) => void` | All events |

### QuilttConnectorPlugin

Native plugin for advanced use cases:

```typescript
import { QuilttConnectorPlugin } from '@quiltt/capacitor'

// Open URL in system browser
await QuilttConnectorPlugin.openUrl({ url: 'https://...' })

// Get URL that launched the app
const { url } = await QuilttConnectorPlugin.getLaunchUrl()

// Listen for deep links
const listener = await QuilttConnectorPlugin.addListener('deepLink', ({ url }) => {
  console.log('Deep link:', url)
})
```

### Re-exported from @quiltt/react

All `@quiltt/react` exports are available, including:

- `QuilttProvider`, `QuilttButton`, `QuilttContainer`
- `useQuilttAuth`, `useQuilttSession`, `useQuilttConnector`
- Apollo Client utilities (`useQuery`, `useMutation`, `gql`)

## Troubleshooting

**OAuth redirects not working**
- Verify `appLauncherUri` matches your configured URL scheme
- Ensure platform deep link configuration is correct
- Run `npx cap sync` after configuration changes

**Blank screen after bank auth**
- Check browser console for CORS or loading errors
- Verify your Connector ID is correct

## Documentation

- [Capacitor SDK Guide](https://www.quiltt.dev/connector/sdk/capacitor)
- [Issuing Session Tokens](https://www.quiltt.dev/authentication/issuing-session-tokens)
- [Connector Configuration](https://www.quiltt.dev/connector)

## License

MIT. See [LICENSE](LICENSE.md).

## Related Packages

- [`@quiltt/react`](../react#readme) - React components and hooks
- [`@quiltt/react-native`](../react-native#readme) - React Native SDK
- [`@quiltt/core`](../core#readme) - Core types and utilities
