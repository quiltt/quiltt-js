---
"@quiltt/react": minor
"@quiltt/core": minor
"@quiltt/react-native": minor
---

Add connector institution search and provider migration support.

## New APIs

### `useQuilttResolvable` Hook

Check if external provider institution IDs (e.g., Plaid) can be migrated to your connector.

```typescript
import { useQuilttResolvable } from '@quiltt/react'
import { useEffect } from 'react'

function ResolvableConnector({ plaidInstitutionId, children }) {
  const { checkResolvable, isResolvable, isLoading } = useQuilttResolvable('my-connector-id')

  useEffect(() => {
    checkResolvable({ plaid: plaidInstitutionId })
  }, [plaidInstitutionId])

  if (isLoading) return <div>Checking...</div>
  if (!isResolvable) return null

  return <>{children}</>
}

// Usage
<ResolvableConnector plaidInstitutionId="ins_3">
  <QuilttButton connectorId="my-connector-id" />
</ResolvableConnector>
```
