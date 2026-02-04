// Adapted from https://github.com/rmosolgo/graphql-ruby/blob/master/javascript_client/src/subscriptions/ActionCableLink.ts
import { ApolloLink } from '@apollo/client/core'
import type { Consumer } from '@rails/actioncable'
import { createConsumer } from '@rails/actioncable'
import { GraphQLError, print } from 'graphql'
import { Observable } from 'rxjs'

import { endpointWebsockets } from '@/configuration'
import { JsonWebTokenParse } from '@/JsonWebToken'
import { GlobalStorage } from '@/storage'

type RequestResult = ApolloLink.Result<{ [key: string]: unknown }>
type ConnectionParams = object | ((operation: ApolloLink.Operation) => object)
type SubscriptionCallbacks = {
  connected?: (args?: { reconnected: boolean }) => void
  disconnected?: () => void
  received?: (payload: unknown) => void
}

class ActionCableLink extends ApolloLink {
  cables: { [id: string]: Consumer }
  channelName: string
  actionName: string
  connectionParams: ConnectionParams
  callbacks: SubscriptionCallbacks

  constructor(options: {
    channelName?: string
    actionName?: string
    connectionParams?: ConnectionParams
    callbacks?: SubscriptionCallbacks
  }) {
    super()
    this.cables = {}
    this.channelName = options.channelName || 'GraphqlChannel'
    this.actionName = options.actionName || 'execute'
    this.connectionParams = options.connectionParams || {}
    this.callbacks = options.callbacks || {}
  }

  // Interestingly, this link does _not_ call through to `next` because
  // instead, it sends the request to ActionCable.
  request(
    operation: ApolloLink.Operation,
    _next: ApolloLink.ForwardFunction
  ): Observable<RequestResult> {
    const token = GlobalStorage.get('session')

    if (!token) {
      return new Observable((observer) => {
        observer.error(
          new GraphQLError('No session token available for subscription', {
            extensions: {
              code: 'UNAUTHENTICATED',
              reason: 'NO_TOKEN',
            },
          })
        )
      })
    }

    // Check if token is expired
    const jwt = JsonWebTokenParse(token)
    if (jwt?.claims.exp) {
      const nowInSeconds = Math.floor(Date.now() / 1000)
      if (jwt.claims.exp < nowInSeconds) {
        // Clear expired token - this triggers observers and React re-renders
        GlobalStorage.set('session', null)

        return new Observable((observer) => {
          observer.error(
            new GraphQLError('Session token has expired', {
              extensions: {
                code: 'UNAUTHENTICATED',
                reason: 'TOKEN_EXPIRED',
                expiredAt: jwt.claims.exp,
              },
            })
          )
        })
      }
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

      const callbacks = this.callbacks
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
          connected: (args?: { reconnected: boolean }) => {
            channel.perform(actionName, {
              query: operation.query ? print(operation.query) : null,
              variables: operation.variables,
              // This is added for persisted operation support:
              operationId: (operation as { operationId?: string }).operationId,
              operationName: operation.operationName,
            })
            callbacks.connected?.(args)
          },

          received: (payload: { result: RequestResult; more: any }) => {
            if (payload?.result?.data || payload?.result?.errors) {
              observer.next(payload.result)
            }

            if (!payload.more) {
              observer.complete()
            }

            callbacks.received?.(payload)
          },
          disconnected: () => {
            callbacks.disconnected?.()
          },
        }
      )
      // Make the ActionCable subscription behave like an Apollo subscription
      return Object.assign(channel, { closed: false })
    })
  }
}

export default ActionCableLink
