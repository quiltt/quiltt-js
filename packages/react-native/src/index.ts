// Hermes doesn't have atob
// https://github.com/facebook/hermes/issues/1178
import { decode } from 'base-64'

if (!global.atob) {
  global.atob = decode
}

export * from '@quiltt/core'
// Re-export Apollo Client types (via @quiltt/react)
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
// Re-export Apollo Client utilities and hooks (via @quiltt/react)
// Re-export Quiltt-specific providers and hooks
export {
  gql,
  NetworkStatus,
  QuilttAuthProvider,
  QuilttProvider,
  QuilttSettingsProvider,
  useLazyQuery,
  useMutation,
  useQuery,
  useQuilttClient,
  useQuilttConnector,
  useQuilttSession,
  useQuilttSettings,
  useSession,
  useStorage,
  useSubscription,
} from '@quiltt/react'

export * from './components'
