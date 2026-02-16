// Hermes doesn't have atob
// https://github.com/facebook/hermes/issues/1178
import { decode } from 'base-64'

if (!global.atob) {
  global.atob = decode
}

// ============================================================================
// Core - Re-export everything from @quiltt/core except utils (we override those)
// ============================================================================
export * from '@quiltt/core/api'
export * from '@quiltt/core/auth'
export * from '@quiltt/core/config'
export * from '@quiltt/core/observables'
export * from '@quiltt/core/storage'
export * from '@quiltt/core/timing'
export * from '@quiltt/core/types'
// ============================================================================
// Apollo Client - Re-export from @quiltt/react
// ============================================================================
export type {
  ApolloQueryResult,
  DocumentNode,
  ErrorPolicy,
  FetchPolicy,
  MutationHookOptions,
  MutationResult,
  NormalizedCacheObject,
  OperationVariables,
  QueryHookOptions,
  QueryResult,
  SubscriptionHookOptions,
  SubscriptionResult,
  TypedDocumentNode,
  WatchQueryFetchPolicy,
} from '@quiltt/react'
export {
  ApolloClient,
  ApolloProvider,
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
  createQueryPreloader,
  gql,
  InMemoryCache,
  LinkError,
  LocalStateError,
  MockedProvider,
  NetworkStatus,
  ObservableQuery,
  ServerError,
  ServerParseError,
  skipToken,
  UnconventionalError,
  useApolloClient,
  useBackgroundQuery,
  useFragment,
  useLazyQuery,
  useLoadableQuery,
  useMutation,
  useQuery,
  useQueryRefHandlers,
  useReactiveVar,
  useReadQuery,
  useSubscription,
  useSuspenseQuery,
} from '@quiltt/react'
// ============================================================================
// React - Re-export specific modules (but NOT providers or utils - we override those)
// ============================================================================
export * from '@quiltt/react/components'
export * from '@quiltt/react/contexts'
export * from '@quiltt/react/hooks'

// ============================================================================
// React Native - Export platform-specific components and providers
// These override the React web versions where applicable
// ============================================================================
export * from './components'
export * from './providers'
