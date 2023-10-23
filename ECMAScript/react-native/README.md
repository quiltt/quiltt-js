# Quiltt Connector React Native SDK

```typescript
import { useState } from 'react'
import { QuilttConnector } from '@quiltt/react-native'

export const App = () => {
  const [connectionId, setConnectionId] = useState<string>()
  const oAuthRedirectUrl = "quilttexample://open.reactnative.app"
  const handleExitSuccess = (metadata) => {
    setConnectionId(metadata?.connectionId)
  }

  return (
    <QuilttConnector
      connectorId="<CONNECTOR_ID>"
      oAuthRedirectUrl={oAuthRedirectUrl}
      onExitSuccess={handleExitSuccess}
    />
  )
}

export default App
```
