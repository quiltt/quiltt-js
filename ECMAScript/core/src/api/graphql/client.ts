import type { ApolloClientOptions, Operation } from '@apollo/client/index.js'
import { ApolloClient, ApolloLink } from '@apollo/client/index.js'

import type { UnauthorizedCallback } from './links'

import { debugging } from '../../config'
import {
  AuthLink,
  BatchHttpLink,
  ErrorLink,
  ForwardableLink,
  HttpLink,
  PreviewLink,
  RetryLink,
  SubscriptionLink,
  TerminatingLink,
  VersionLink,
} from './links'

export type QuilttClientOptions<T> = Omit<ApolloClientOptions<T>, 'link'> & {
  token: string | undefined
  unauthorizedCallback?: UnauthorizedCallback
}

export class QuilttClient<T> extends ApolloClient<T> {
  subscriptionsLink: SubscriptionLink | undefined

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
    const subscriptionsLink = options.token ? new SubscriptionLink(options.token) : TerminatingLink
    const quilttLink = ApolloLink.from([VersionLink, authLink, ErrorLink, RetryLink])
      .split(isSubscriptionOperation, subscriptionsLink, ForwardableLink)
      .split(isPreviewable, PreviewLink, ForwardableLink)
      .split(isBatchable, BatchHttpLink, HttpLink)

    super({
      link: quilttLink,
      ...options,
    })

    if (options.token) {
      this.subscriptionsLink = subscriptionsLink as SubscriptionLink
    }
  }

  disconnect() {
    if (this.subscriptionsLink) {
      this.subscriptionsLink.disconnect()
    }

    this.clearStore()
  }
}

export { InMemoryCache, gql, useMutation, useQuery, useSubscription } from '@apollo/client/index.js'
export type { NormalizedCacheObject, OperationVariables } from '@apollo/client/index.js'

