import { GlobalStorage } from '@/Storage'
import type { FetchResult, NextLink, Operation } from '@apollo/client/core/index.js'
import { ApolloLink, Observable } from '@apollo/client/core/index.js'
import { print } from 'graphql'
import { endpointWebsockets } from '../../../config'
import type { Consumer } from './actioncable'
import { createConsumer } from './actioncable'

type RequestResult = FetchResult<
  { [key: string]: unknown },
  Record<string, unknown>,
  Record<string, unknown>
>
type ConnectionParams = object | ((operation: Operation) => object)

class ActionCableLink extends ApolloLink {
  cables: { [id: string]: Consumer }
  channelName: string
  actionName: string
  connectionParams: ConnectionParams

  constructor(options: {
    channelName?: string
    actionName?: string
    connectionParams?: ConnectionParams
  }) {
    super()
    this.cables = {}
    this.channelName = options.channelName || 'GraphqlChannel'
    this.actionName = options.actionName || 'execute'
    this.connectionParams = options.connectionParams || {}
  }

  // Interestingly, this link does _not_ call through to `next` because
  // instead, it sends the request to ActionCable.
  request(operation: Operation, _next: NextLink): Observable<RequestResult> | null {
    const token = GlobalStorage.get('session')

    if (!token) {
      console.warn(`QuilttLink attempted to send an unauthenticated Subscription`)
      return null
    }

    if (!this.cables[token]) {
      this.cables[token] = createConsumer(endpointWebsockets + (token ? `?token=${token}` : ''))
    }

    return new Observable((observer) => {
      const channelId = Math.round(Date.now() + Math.random() * 100000).toString(16)
      const actionName = this.actionName
      const connectionParams =
        typeof this.connectionParams === 'function'
          ? this.connectionParams(operation)
          : this.connectionParams

      const channel = this.cables[token].subscriptions.create(
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
            channel.perform(actionName, {
              query: operation.query ? print(operation.query) : null,
              variables: operation.variables,
              // This is added for persisted operation support:
              operationId: (operation as { operationId?: string }).operationId,
              operationName: operation.operationName,
            })
          },

          received: (payload: { result: RequestResult; more: any }) => {
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
