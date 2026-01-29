---
name: quiltt-react-best-practices
description: React and Next.js performance optimization guidelines adapted for Quiltt. Use when writing, reviewing, or refactoring React/Next.js code in the @quiltt/react package or examples to ensure optimal performance patterns. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements.
---

# Quiltt React Best Practices

Performance optimization guidelines for React and Next.js code in the Quiltt SDK. These rules are prioritized by impact to help guide code reviews and automated refactoring.

## When to Apply

Reference these guidelines when:

- Writing new React components in `@quiltt/react`
- Implementing data fetching with Apollo GraphQL
- Reviewing code for performance issues in example applications
- Refactoring existing React/Next.js code
- Optimizing bundle size or load times

## Priority Categories

### 1. Eliminating Waterfalls (CRITICAL)

Waterfalls are the #1 performance killer. Each sequential await adds full network latency.

**Key Rules:**

- Defer await until the value is actually needed
- Use `Promise.all()` for independent operations
- Parallelize GraphQL queries when possible
- Use React Suspense boundaries to stream content

**Example - Incorrect (sequential):**

```typescript
async function loadUserData(userId: string) {
  const user = await fetchUser(userId)
  const accounts = await fetchAccounts(userId)
  const transactions = await fetchTransactions(userId)
  return { user, accounts, transactions }
}
```

**Example - Correct (parallel):**

```typescript
async function loadUserData(userId: string) {
  const [user, accounts, transactions] = await Promise.all([
    fetchUser(userId),
    fetchAccounts(userId),
    fetchTransactions(userId),
  ])
  return { user, accounts, transactions }
}
```

### 2. Bundle Size Optimization (CRITICAL)

Reducing initial bundle size improves Time to Interactive and Largest Contentful Paint.

**Key Rules:**

- Avoid barrel file imports - import directly from source files
- Use `next/dynamic` for heavy components
- Defer loading of non-critical third-party libraries
- Lazy load Apollo client features when possible

**Example - Incorrect (barrel imports):**

```typescript
import { Button, Card, Modal, Dropdown } from '@/components'
```

**Example - Correct (direct imports):**

```typescript
import { Button } from '@/components/button'
import { Card } from '@/components/card'
```

### 3. GraphQL & Apollo Client (HIGH)

Optimize Apollo Client usage for better performance and caching.

**Key Rules:**

- Use GraphQL fragments to avoid over-fetching
- Leverage Apollo's cache for deduplication
- Avoid refetching data unnecessarily
- Use `useSuspenseQuery` for better loading states

**Example - Incorrect (over-fetching):**

```typescript
const { data } = useQuery(GET_USER, {
  variables: { id: userId }
})
// Using only data.user.name but fetching 50 fields
return <div>{data?.user?.name}</div>
```

**Example - Correct (minimal fields):**

```typescript
const { data } = useQuery(GET_USER_NAME, {
  variables: { id: userId }
})
return <div>{data?.user?.name}</div>

// Query definition
const GET_USER_NAME = gql`
  query GetUserName($id: ID!) {
    user(id: $id) {
      id
      name
    }
  }
`
```

### 4. Re-render Optimization (MEDIUM)

Minimize unnecessary re-renders to improve runtime performance.

**Key Rules:**

- Calculate derived state during rendering, not in effects
- Use `useMemo` for expensive computations only
- Extract components that don't need parent state
- Use functional setState for stable callbacks

**Example - Incorrect (unnecessary effect):**

```typescript
function UserProfile({ firstName, lastName }: Props) {
  const [fullName, setFullName] = useState('')
  
  useEffect(() => {
    setFullName(`${firstName} ${lastName}`)
  }, [firstName, lastName])
  
  return <div>{fullName}</div>
}
```

**Example - Correct (derived during render):**

```typescript
function UserProfile({ firstName, lastName }: Props) {
  const fullName = `${firstName} ${lastName}`
  return <div>{fullName}</div>
}
```

### 5. Rendering Performance (MEDIUM)

Optimize the rendering process to reduce browser work.

**Key Rules:**

- Hoist static JSX elements outside components
- Use explicit conditional rendering (ternary over &&)
- Prefer `useTransition` over manual loading states
- Avoid hydration mismatches

**Example - Incorrect (inline static JSX):**

```typescript
function ProfileCard({ user }: Props) {
  return (
    <div>
      <div className="header">Profile</div>
      <div>{user.name}</div>
    </div>
  )
}
```

**Example - Correct (hoisted static JSX):**

```typescript
const ProfileHeader = <div className="header">Profile</div>

function ProfileCard({ user }: Props) {
  return (
    <div>
      {ProfileHeader}
      <div>{user.name}</div>
    </div>
  )
}
```

### 6. TypeScript Best Practices (MEDIUM)

Leverage TypeScript for better performance and developer experience.

**Key Rules:**

- Use strict mode throughout the codebase
- Define explicit return types for public functions
- Leverage Apollo's code generation for type safety
- Use const assertions for literal types

## Quiltt-Specific Patterns

### QuilttProvider Setup

Always wrap your app with `QuilttProvider` at the root:

```typescript
import { QuilttProvider } from '@quiltt/react'

function App() {
  return (
    <QuilttProvider auth={{ connectorId: process.env.CONNECTOR_ID }}>
      <YourApp />
    </QuilttProvider>
  )
}
```

### Authentication Flow

Use hooks for authentication instead of manual token management:

```typescript
import { useQuilttAuth, useQuilttSession } from '@quiltt/react'

function AuthButton() {
  const { authenticate, revokeSession } = useQuilttAuth()
  const { token, profile } = useQuilttSession()
  
  if (token) {
    return <button onClick={revokeSession}>Logout</button>
  }
  
  return <button onClick={authenticate}>Login</button>
}
```

### GraphQL Query Patterns

Leverage Apollo hooks with proper error handling:

```typescript
import { useQuery } from '@apollo/client'
import { GET_ACCOUNTS } from '@/graphql/queries'

function AccountsList() {
  const { data, loading, error } = useQuery(GET_ACCOUNTS)
  
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  return (
    <div>
      {data?.accounts.map(account => (
        <AccountCard key={account.id} account={account} />
      ))}
    </div>
  )
}
```

## Testing Considerations

- Write unit tests alongside component files
- Use Testing Library for component tests
- Mock Apollo Client in tests
- Test loading, error, and success states

## References

- [React Documentation](https://react.dev)
- [Next.js Documentation](https://nextjs.org)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react)
- [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)
