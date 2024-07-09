import type { Maybe } from './types'

export type JsonWebToken<T> = {
  token: string // Raw JWT Token
  claims: Claims<T>
}

export type Claims<T> = RegisteredClaims & T

export type RegisteredClaims = {
  iss: string // (issuer): Issuer of the JWT
  sub: string // (subject): Subject of the JWT (Person ID)
  aud: string // (audience): Recipient for which the JWT is intended
  exp: number // (expiration time): Time after which the JWT expires
  nbf: number // (not before time): Time before which the JWT must not be accepted for processing
  iat: number // (issued at time): Time at which the JWT was issued; can be used to determine age of the JWT
  jti: string // (JWT ID): Unique identifier; can be used to prevent the JWT from being replayed (allows a token to be used only once)
}

export type PrivateClaims = {
  oid: string // Organization ID
  eid: string // Environment ID
  cid: string // Client ID
  aid: string // Administrator ID
  ver: number // Session Token Version
  rol: string // Administrator Role
}

export type QuilttJWT = JsonWebToken<PrivateClaims>

const MATCHER = /^(?:[\w-]+\.){2}[\w-]+$/

export const JsonWebTokenParse = <T>(
  token: Maybe<string> | undefined
): Maybe<JsonWebToken<T>> | undefined => {
  if (typeof token === 'undefined' || token === null) return token

  if (!MATCHER.test(token)) {
    console.error(`Invalid Session Token: ${token}`)
    return
  }

  const [_header, payload, _signature] = token.split('.')

  try {
    return { token: token, claims: JSON.parse(atob(payload)) }
  } catch (error) {
    console.error(`Invalid Session Token: ${error}`)
  }
}
