import type { ApolloClientOptions, Operation } from '@apollo/client'
import { ApolloClient, ApolloLink } from '@apollo/client'

import type { UnauthorizedCallback } from './links'

import { debugging } from '../../../../config'
import {
  AuthLink,
  BatchHttpLink,
  ErrorLink,
  ForwardableLink,
  HttpLink,
  PreviewLink,
  RetryLink,
  SubscriptionLink,
  VersionLink,
} from './links'

export type QuilttClientOptions<T> = Omit<ApolloClientOptions<T>, 'link'> & {
  token: string | undefined
  unauthorizedCallback?: UnauthorizedCallback
}

export class QuilttClient<T> extends ApolloClient<T> {
  constructor(options: QuilttClientOptions<T>) {
    if (!options.connectToDevTools) options.connectToDevTools = debugging

    const isSubscriptionOperation = (operation: Operation) => {
      return operation.query.definitions.some(
        // @ts-ignore
        ({ kind, operation }) => kind === 'OperationDefinition' && operation === 'subscription'
      )
    }

    const isPreviewable = (operation: Operation) => {
      return !!operation.getContext().preview
    }

    const isBatchable = (operation: Operation) => {
      return operation.getContext().batchable ?? true
    }

    const authLink = new AuthLink(options.token, options.unauthorizedCallback)
    const subscriptionsLink = new SubscriptionLink(options.token)
    const quilttLink = ApolloLink.from([VersionLink, authLink, ErrorLink, RetryLink])
      .split(isSubscriptionOperation, subscriptionsLink, ForwardableLink)
      .split(isPreviewable, PreviewLink, ForwardableLink)
      .split(isBatchable, BatchHttpLink, HttpLink)

    super({
      link: quilttLink,
      ...options,
    })
  }
}

export { InMemoryCache, gql, useMutation, useQuery, useSubscription } from '@apollo/client'
export type { NormalizedCacheObject, OperationVariables } from '@apollo/client'
