// ============================================================================
// Core Module - Apollo Client core functionality
// ============================================================================
export type {
  ApolloQueryResult,
  DocumentNode,
  ErrorPolicy,
  FetchPolicy,
  NormalizedCacheObject,
  OperationVariables,
  TypedDocumentNode,
  WatchQueryFetchPolicy,
} from '@apollo/client'
export {
  ApolloClient,
  gql,
  InMemoryCache,
  NetworkStatus,
  ObservableQuery,
} from '@apollo/client'
// ============================================================================
// Errors Module - Error handling utilities
// ============================================================================
export {
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
  LinkError,
  LocalStateError,
  ServerError,
  ServerParseError,
  UnconventionalError,
} from '@apollo/client/errors'
// ============================================================================
// React Module - React hooks and components
// ============================================================================
export type {
  MutationHookOptions,
  MutationResult,
  QueryHookOptions,
  QueryResult,
  SubscriptionHookOptions,
  SubscriptionResult,
} from '@apollo/client/react'
export {
  ApolloProvider,
  createQueryPreloader,
  skipToken,
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
} from '@apollo/client/react'
export { MockedProvider } from '@apollo/client/testing/react'
export * from '@quiltt/core'

export * from './components'
export * from './hooks'
export * from './providers'
