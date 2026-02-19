/**
 * Injection keys and types for Quiltt Vue plugin
 */

import type { InjectionKey, Ref } from 'vue'

import type { Maybe, QuilttJWT } from '@quiltt/core'

// Injection keys for Quiltt state
export const QuilttSessionKey: InjectionKey<Ref<Maybe<QuilttJWT> | undefined>> =
  Symbol('quiltt-session')
export const QuilttSetSessionKey: InjectionKey<(token: Maybe<string>) => void> =
  Symbol('quiltt-set-session')
export const QuilttClientIdKey: InjectionKey<Ref<string | undefined>> = Symbol('quiltt-client-id')

export interface QuilttPluginOptions {
  /**
   * Initial session token
   */
  token?: string
  /**
   * Quiltt Client ID (Environment ID)
   */
  clientId?: string
}
