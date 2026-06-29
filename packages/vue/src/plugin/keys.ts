/**
 * Injection keys and types for Quiltt Vue plugin
 */

import type { InjectionKey, Ref } from 'vue'

import type { Maybe, QuilttClient, QuilttJWT } from '@quiltt/core'

// Injection keys for Quiltt state
export const QuilttSessionKey: InjectionKey<Ref<Maybe<QuilttJWT> | undefined>> =
  Symbol.for('quiltt-session')
export const QuilttSetSessionKey: InjectionKey<(token: Maybe<string>) => void> =
  Symbol.for('quiltt-set-session')
export const QuilttClientIdKey: InjectionKey<Ref<string | undefined>> =
  Symbol.for('quiltt-client-id')
export const QuilttHeadersKey: InjectionKey<Ref<Record<string, string> | undefined>> =
  Symbol.for('quiltt-headers')

export interface QuilttPluginOptions {
  /**
   * Initial session token
   */
  token?: string
  /**
   * Quiltt Client ID (Environment ID)
   */
  clientId?: string
  /**
   * A custom QuilttClient instance to use instead of the default.
   * Note: When provided, the `headers` option is ignored since the custom client
   * manages its own link chain. To add custom headers with a custom client,
   * include a HeadersLink in your client's customLinks option.
   */
  graphqlClient?: QuilttClient
  /**
   * Custom headers to include with every API request (REST and GraphQL).
   * Only applies when using the default client (i.e., when `graphqlClient` is not provided).
   * For Quiltt internal usage. Not intended for public use.
   * @internal
   */
  headers?: Record<string, string>
}
