# Quiltt Connector React Native SDK

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
