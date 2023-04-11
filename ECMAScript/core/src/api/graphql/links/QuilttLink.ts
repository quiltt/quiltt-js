import type { Operation } from '@apollo/client'
import { ApolloLink } from '@apollo/client'

import { BatchHttpLink } from './BatchHttpLink'
import { ErrorLink } from './ErrorLink'
import { ForwardableLink } from './ForwardableLink'
import { HttpLink } from './HttpLink'
import { PreviewLink } from './PreviewLink'
import { RetryLink } from './RetryLink'
import { VersionLink } from './VersionLink'
import type { UnauthorizedCallback } from './AuthLink'
import { AuthLink } from './AuthLink'
import { SubscriptionLink } from './SubscriptionLink'

export class QuilttLink extends ApolloLink {
  constructor(token: string | undefined, unauthorizedCallback?: UnauthorizedCallback) {
    if(!token) {
      super(() => {
        console.warn(`QuilttLink attempted to send an unauthenticated Query`)
        return null
      })
      return
    } else {
      super((operation, forward) => forward(operation))
    }

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

    const authLink = new AuthLink(token, unauthorizedCallback)
    const subscriptionsLink = new SubscriptionLink(token)

    this.concat(VersionLink)
        .concat(authLink)
        .concat(ErrorLink)
        .concat(RetryLink)
        .split(isSubscriptionOperation, subscriptionsLink, ForwardableLink)
        .split(isPreviewable, PreviewLink, ForwardableLink)
        .split(isBatchable, BatchHttpLink, HttpLink)
  }
}

export default QuilttLink
