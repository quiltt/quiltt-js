import type { ApolloClientOptions } from '@apollo/client'
import { ApolloClient } from '@apollo/client'

import type { UnauthorizedCallback } from './links'

import { debugging } from '../../../config'
import { QuilttLink } from './links'

export type QuilttClientOptions<T> = Omit<ApolloClientOptions<T>, "link"> & {
  token: string | undefined
  unauthorizedCallback?: UnauthorizedCallback
}

export class QuilttClient<T> extends ApolloClient<T> {
  constructor(options: QuilttClientOptions<T>) {
    if (!options.connectToDevTools) options.connectToDevTools = debugging

    super({
      link: new QuilttLink(options.token, options.unauthorizedCallback),
      ...options
    })
  }
}

export { InMemoryCache, gql, useMutation, useQuery, useSubscription } from '@apollo/client'
export type { NormalizedCacheObject, OperationVariables } from '@apollo/client'

