import type { FetchResult, NextLink, Operation } from '@apollo/client/core/index.js'
import { ApolloLink, Observable } from '@apollo/client/core/index.js'
import type { Consumer, Subscription } from './actioncable'

import { print } from 'graphql'

type RequestResult = FetchResult<{ [key: string]: any }, Record<string, any>, Record<string, any>>
type ConnectionParams = object | ((operation: Operation) => object)

class ActionCableLink extends ApolloLink {
  cable: Consumer
  channelName: string
  actionName: string
  connectionParams: ConnectionParams

  constructor(options: {
    cable: Consumer
    channelName?: string
    actionName?: string
    connectionParams?: ConnectionParams
  }) {
    super()
    this.cable = options.cable
    this.channelName = options.channelName || 'GraphqlChannel'
    this.actionName = options.actionName || 'execute'
    this.connectionParams = options.connectionParams || {}
  }

  // Interestingly, this link does _not_ call through to `next` because
  // instead, it sends the request to ActionCable.
  request(operation: Operation, _next: NextLink): Observable<RequestResult> {
    return new Observable((observer) => {
      const channelId = Math.round(Date.now() + Math.random() * 100000).toString(16)
      const actionName = this.actionName
      const connectionParams =
        typeof this.connectionParams === 'function'
          ? this.connectionParams(operation)
          : this.connectionParams

      const channel = this.cable.subscriptions.create(
        Object.assign(
          {},
          {
            channel: this.channelName,
            channelId: channelId,
          },
          connectionParams
        ),
        {
          connected: () => {
            (this as unknown as Subscription).perform(actionName, {
              query: operation.query ? print(operation.query) : null,
              variables: operation.variables,
              // This is added for persisted operation support:
              operationId: (operation as { operationId?: string }).operationId,
              operationName: operation.operationName,
            })
          },

          received: (payload: any) => {
            if (payload?.result?.data || payload?.result?.errors) {
              observer.next(payload.result)
            }

            if (!payload.more) {
              observer.complete()
            }
          },
        }
      )
      // Make the ActionCable subscription behave like an Apollo subscription
      return Object.assign(channel, { closed: false })
    })
  }
}

export default ActionCableLink
