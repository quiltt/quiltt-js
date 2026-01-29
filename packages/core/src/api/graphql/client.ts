import { ApolloClient, ApolloLink } from '@apollo/client/core'
import type { DefinitionNode, OperationDefinitionNode } from 'graphql'

import { debugging } from '@/configuration'

import {
  AuthLink,
  BatchHttpLink,
  ErrorLink,
  ForwardableLink,
  HttpLink,
  RetryLink,
  SubscriptionLink,
} from './links'

export type QuilttClientOptions = Omit<ApolloClient.Options, 'link'> & {
  /** An array of initial links to inject before the default Quiltt Links */
  customLinks?: ApolloLink[]
  /** Platform-specific version link (required) */
  versionLink: ApolloLink
}

export class QuilttClient extends ApolloClient {
  constructor(options: QuilttClientOptions) {
    const finalOptions = {
      ...options,
      devtools: {
        enabled: options.devtools?.enabled ?? debugging,
      },
    }

    const initialLinks = options.customLinks ? [...options.customLinks] : []

    const isOperationDefinition = (def: DefinitionNode): def is OperationDefinitionNode =>
      def.kind === 'OperationDefinition'

    const isSubscriptionOperation = (operation: ApolloLink.Operation) => {
      return operation.query.definitions.some(
        (definition) => isOperationDefinition(definition) && definition.operation === 'subscription'
      )
    }

    const isBatchable = (operation: ApolloLink.Operation) => {
      return operation.getContext().batchable ?? true
    }

    const authLink = new AuthLink()
    const subscriptionsLink = new SubscriptionLink()

    const quilttLink = ApolloLink.from([
      ...initialLinks,
      options.versionLink,
      authLink,
      ErrorLink,
      RetryLink,
    ] as ApolloLink[])
      .split(isSubscriptionOperation, subscriptionsLink as ApolloLink, ForwardableLink)
      .split(isBatchable, BatchHttpLink, HttpLink)

    super({
      link: quilttLink as ApolloLink,
      ...finalOptions,
    })
  }
}

/**
/* Export Apollo GraphQL assets using deep-imports to prevent unnecessary imports
/* and make tree-shaking more effective
*/

/** Client and Tooling */
export type { NormalizedCacheObject } from '@apollo/client/cache'
export { InMemoryCache } from '@apollo/client/cache'
export type { OperationVariables } from '@apollo/client/core'
export { gql } from '@apollo/client/core'
/** React hooks used by @quiltt/react-native and @quiltt/react */
export { useMutation, useQuery, useSubscription } from '@apollo/client/react'
