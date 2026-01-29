---
name: quiltt-react-native-best-practices
description: React Native and Expo best practices for the Quiltt SDK. Use when building React Native components, optimizing mobile performance, implementing the Quiltt Connector, or working with native modules. Triggers on tasks involving React Native, Expo, mobile performance, or native platform APIs in the @quiltt/react-native package.
---

# Quiltt React Native Best Practices

Comprehensive best practices for React Native and Expo development in the Quiltt SDK, prioritized by performance impact.

## When to Apply

Reference these guidelines when:

- Building components in `@quiltt/react-native`
- Implementing the Quiltt Connector for mobile
- Optimizing list and scroll performance
- Working with animations
- Configuring native modules or dependencies
- Structuring the React Native example app

## Priority Categories

### 1. Core Rendering (CRITICAL)

Critical patterns that prevent crashes or broken UI.

**Never use && with potentially falsy values:**

```typescript
// ❌ Incorrect - can render "0" as text
function AccountBalance({ balance }: Props) {
  return <View>{balance && <Text>${balance}</Text>}</View>
}

// ✅ Correct - explicit check
function AccountBalance({ balance }: Props) {
  return <View>{balance > 0 ? <Text>${balance}</Text> : null}</View>
}
```

**Wrap all strings in Text components:**

```typescript
// ❌ Incorrect - will crash
function TransactionItem({ description }: Props) {
  return <View>{description}</View>
}

// ✅ Correct - wrapped in Text
function TransactionItem({ description }: Props) {
  return <View><Text>{description}</Text></View>
}
```

### 2. List Performance (HIGH)

Critical for rendering transactions, accounts, and other financial data.

**Use FlashList for large lists:**

```typescript
import { FlashList } from '@shopify/flash-list'

// ✅ Use FlashList for transactions, accounts, etc.
function TransactionsList({ transactions }: Props) {
  return (
    <FlashList
      data={transactions}
      renderItem={({ item }) => <TransactionItem transaction={item} />}
      estimatedItemSize={72}
    />
  )
}
```

**Avoid inline objects in renderItem:**

```typescript
// ❌ Incorrect - creates new object on every render
<FlashList
  data={accounts}
  renderItem={({ item }) => (
    <AccountCard account={item} style={{ padding: 16 }} />
  )}
/>

// ✅ Correct - stable reference
const accountCardStyle = { padding: 16 }

<FlashList
  data={accounts}
  renderItem={({ item }) => (
    <AccountCard account={item} style={accountCardStyle} />
  )}
/>
```

**Memoize list item components:**

```typescript
import { memo } from 'react'

// ✅ Memoized to prevent unnecessary re-renders
const TransactionItem = memo(({ transaction }: Props) => {
  return (
    <View>
      <Text>{transaction.description}</Text>
      <Text>${transaction.amount}</Text>
    </View>
  )
})
```

### 3. Animation (HIGH)

Optimize animations for 60fps performance.

**Only animate transform and opacity:**

```typescript
import Animated from 'react-native-reanimated'

// ❌ Incorrect - animating width triggers layout
const animatedStyle = useAnimatedStyle(() => ({
  width: interpolate(progress.value, [0, 1], [0, 100])
}))

// ✅ Correct - animate transform instead
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scaleX: progress.value }]
}))
```

**Use useDerivedValue for computed animations:**

```typescript
import { useAnimatedStyle, useDerivedValue } from 'react-native-reanimated'

// ✅ Efficient animation computation
function AnimatedCard({ scrollY }: Props) {
  const opacity = useDerivedValue(() => {
    return interpolate(scrollY.value, [0, 100], [1, 0])
  })
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }))
  
  return <Animated.View style={animatedStyle}>...</Animated.View>
}
```

### 4. Navigation (HIGH)

Use native navigators for better performance.

```typescript
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

// ✅ Use native stack navigator
function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Accounts" component={AccountsScreen} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
    </Stack.Navigator>
  )
}
```

### 5. UI Patterns (HIGH)

Platform-appropriate UI implementations.

**Use expo-image for all images:**

```typescript
import { Image } from 'expo-image'

// ✅ Better performance and features
function InstitutionLogo({ uri }: Props) {
  return (
    <Image
      source={{ uri }}
      style={{ width: 48, height: 48 }}
      contentFit="contain"
      transition={200}
    />
  )
}
```

**Use Pressable over TouchableOpacity:**

```typescript
import { Pressable, StyleSheet } from 'react-native'

// ✅ More performant and flexible
function AccountCard({ account, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed
      ]}
    >
      <Text>{account.name}</Text>
    </Pressable>
  )
}
```

### 6. State Management (MEDIUM)

Optimize state updates and subscriptions.

**Minimize state subscriptions:**

```typescript
// ❌ Incorrect - subscribes to entire store
function AccountBalance() {
  const accounts = useStore(state => state.accounts)
  const balance = accounts[0]?.balance
  return <Text>${balance}</Text>
}

// ✅ Correct - subscribe only to what you need
function AccountBalance() {
  const balance = useStore(state => state.accounts[0]?.balance)
  return <Text>${balance}</Text>
}
```

**Use dispatcher pattern for callbacks:**

```typescript
// ✅ Stable callback reference
function AccountsList() {
  const dispatch = useDispatch()
  
  const handleAccountPress = useCallback((accountId: string) => {
    dispatch({ type: 'SELECT_ACCOUNT', payload: accountId })
  }, [dispatch])
  
  return (
    <FlashList
      data={accounts}
      renderItem={({ item }) => (
        <AccountCard account={item} onPress={handleAccountPress} />
      )}
    />
  )
}
```

### 7. Monorepo Patterns (MEDIUM)

Best practices for monorepo structure with React Native.

**Keep native dependencies in app package:**

```json
// ✅ In examples/react-native-expo/package.json
{
  "dependencies": {
    "expo": "^50.0.0",
    "expo-image": "^1.10.0",
    "react-native-reanimated": "^3.6.0"
  }
}

// ✅ In packages/react-native/package.json (no native deps)
{
  "peerDependencies": {
    "expo": ">=50.0.0",
    "react-native": ">=0.73.0"
  }
}
```

**Use single dependency versions:**

```yaml
# ✅ In pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'examples/*'

# Use catalog for consistent versions
```

## Quiltt-Specific Patterns

### QuilttConnector Component

The main component for connecting financial accounts:

```typescript
import { QuilttConnector } from '@quiltt/react-native'

function ConnectAccountScreen() {
  const handleSuccess = (data: ConnectorSDKCallbackMetadata) => {
    console.log('Connection successful:', data)
    // Navigate to accounts screen
  }
  
  const handleError = (error: Error) => {
    console.error('Connection failed:', error)
    // Show error message
  }
  
  return (
    <QuilttConnector
      connectorId={process.env.EXPO_PUBLIC_CONNECTOR_ID}
      token={sessionToken}
      onSuccess={handleSuccess}
      onError={handleError}
    />
  )
}
```

### Session Management

```typescript
import { useQuilttAuth } from '@quiltt/react-native'

function AuthProvider({ children }: Props) {
  const { authenticate, token, revokeSession } = useQuilttAuth({
    connectorId: process.env.EXPO_PUBLIC_CONNECTOR_ID
  })
  
  return (
    <AuthContext.Provider value={{ authenticate, token, revokeSession }}>
      {children}
    </AuthContext.Provider>
  )
}
```

## Testing

- Use Detox for E2E testing (configured in `examples/react-native-expo/`)
- Test on both iOS and Android simulators
- Mock native modules in unit tests
- Test connector integration flows

## Platform Considerations

### iOS-Specific

- Use `contentInsetAdjustmentBehavior` for safe areas
- Test with different screen sizes (iPhone SE to Pro Max)

### Android-Specific

- Handle back button navigation
- Test on different Android API levels
- Consider notch/cutout variations

## Performance Monitoring

- Use Expo's performance monitoring tools
- Profile animations with Chrome DevTools
- Monitor list scroll performance
- Track bundle size with Metro bundler

## References

- [React Native Documentation](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated)
- [FlashList Documentation](https://shopify.github.io/flash-list)
- [Vercel React Native Skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-native-skills)
