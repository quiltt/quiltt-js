import { ApolloClient, ApolloLink } from '@apollo/client/core/index.js'
import type { ApolloClientOptions, Operation } from '@apollo/client/core'

import { debugging } from '../../configuration'
import {
  AuthLink,
  BatchHttpLink,
  ErrorLink,
  ForwardableLink,
  HttpLink,
  RetryLink,
  SubscriptionLink,
  VersionLink,
} from './links'

export type QuilttClientOptions<T> = Omit<ApolloClientOptions<T>, 'link'>

export class QuilttClient<T> extends ApolloClient<T> {
  constructor(options: QuilttClientOptions<T>) {
    if (!options.connectToDevTools) options.connectToDevTools = debugging

    const isSubscriptionOperation = (operation: Operation) => {
      return operation.query.definitions.some(
        // @ts-ignore
        ({ kind, operation }) => kind === 'OperationDefinition' && operation === 'subscription'
      )
    }

    const isBatchable = (operation: Operation) => {
      return operation.getContext().batchable ?? true
    }

    const authLink = new AuthLink()
    const subscriptionsLink = new SubscriptionLink()

    const quilttLink = ApolloLink.from([VersionLink, authLink, ErrorLink, RetryLink])
      .split(isSubscriptionOperation, subscriptionsLink, ForwardableLink)
      .split(isBatchable, BatchHttpLink, HttpLink)

    super({
      link: quilttLink,
      ...options,
    })
  }
}

/**
/* Export Apollo GraphQL assets using deep-imports to prevent unnecessary imports
/* and make tree-shaking more effective
*/

/** Client and Tooling */
export { gql } from '@apollo/client/core/index.js'
export { InMemoryCache } from '@apollo/client/cache/index.js'
export type { ApolloError, OperationVariables } from '@apollo/client/core'
export type { NormalizedCacheObject } from '@apollo/client/cache'

/** React hooks used by @quiltt/react-native and @quiltt/react */
export { useMutation, useQuery, useSubscription } from '@apollo/client/react/hooks/index.js'
