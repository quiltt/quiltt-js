# @quiltt/vue

[![npm version](https://badge.fury.io/js/@quiltt%2Fvue.svg)](https://badge.fury.io/js/@quiltt%2Fvue)
[![CI](https://github.com/quiltt/quiltt-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/quiltt/quiltt-js/actions/workflows/ci.yml)

Vue 3 composables and components for Quiltt Connector.

## Installation

```shell
npm install @quiltt/vue vue
```

## Quick Start

```typescript
// main.ts
import { createApp } from 'vue'
import { QuilttPlugin } from '@quiltt/vue'

createApp(App).use(QuilttPlugin).mount('#app')
```

```vue
<script setup lang="ts">
import { QuilttButton, useQuilttSession } from '@quiltt/vue'

const { importSession } = useQuilttSession()

// Set session token when available (e.g., after login)
const onLogin = async (token: string) => {
  await importSession(token)
}
</script>

<template>
  <QuilttButton
    connector-id="<CONNECTOR_ID>"
    @exit-success="(m) => console.log('Connected:', m.connectionId)"
  >
    Add Bank Account
  </QuilttButton>
</template>
```

## Components

### QuilttButton

Opens the connector in a modal overlay.

```vue
<QuilttButton connector-id="<CONNECTOR_ID>" @exit-success="handleSuccess">
  Connect Account
</QuilttButton>
```

### QuilttContainer

Renders the connector inline.

```vue
<QuilttContainer connector-id="<CONNECTOR_ID>" @exit-success="handleSuccess" />
```

### QuilttConnector

Full-page iframe for embedded integration.

```vue
<QuilttConnector
  connector-id="<CONNECTOR_ID>"
  @exit-success="handleSuccess"
  @navigate="handleNavigate"
  style="width: 100%; height: 100vh"
/>
```

## Composables

### useQuilttSession

```typescript
import { useQuilttSession } from '@quiltt/vue'

const {
  session,             // Reactive session state
  importSession,       // Import an existing token
  identifySession,     // Start auth flow (email/phone)
  authenticateSession, // Complete auth (passcode)
  revokeSession,       // Invalidate session server-side
  forgetSession,       // Clear session locally
} = useQuilttSession()

await importSession('<SESSION_TOKEN>')
console.log(session.value?.token)
```

### useQuilttConnector

```typescript
import { useQuilttConnector } from '@quiltt/vue'

const { open } = useQuilttConnector('<CONNECTOR_ID>', {
  onExitSuccess: (m) => console.log('Connected:', m.connectionId),
})
```

```vue
<button @click="open">Add Account</button>
```

## Props and Events

| Prop | Type | Description |
|------|------|-------------|
| `connector-id` | `string` | **Required.** Quiltt Connector ID |
| `connection-id` | `string` | Existing connection ID for reconnection |
| `institution` | `string` | Pre-select an institution |
| `app-launcher-uri` | `string` | Deep link URL for OAuth callbacks |

| Event | Payload | Description |
|-------|---------|-------------|
| `@load` | `metadata` | Connector loaded |
| `@exit-success` | `metadata` | Connection successful |
| `@exit-abort` | `metadata` | User cancelled |
| `@exit-error` | `metadata` | Error occurred |

## Reconnection

Pass `connection-id` to reconnect an existing connection:

```vue
<QuilttButton connection-id="<EXISTING_CONNECTION_ID>" ... />
```

## Capacitor / Ionic

For mobile apps, use `@quiltt/capacitor/vue` which adds native OAuth handling:

```typescript
import { QuilttConnector, QuilttConnectorPlugin } from '@quiltt/capacitor/vue'

// Handle OAuth deep links
QuilttConnectorPlugin.addListener('deepLink', ({ url }) => {
  connectorRef.value?.handleOAuthCallback(url)
})
```

See [@quiltt/capacitor](../capacitor#readme) for full documentation.

## Resources

- [Vue SDK Guide](https://www.quiltt.dev/connector/sdk/vue)
- [Issuing Session Tokens](https://www.quiltt.dev/authentication/issuing-session-tokens)
- [Connector Configuration](https://www.quiltt.dev/connector)

## License

MIT
