import { useCallback } from 'react'

import type {
  AuthAPI,
  PasscodePayload,
  SessionResponse,
  UnprocessableData,
  UnprocessableResponse,
} from '@quiltt/core'

import type { SetSession } from '@/hooks/useSession'

type AuthenticateSessionCallbacks = {
  onSuccess?: () => unknown
  onFailure?: () => unknown
  onError?: (errors: UnprocessableData) => unknown
}
export type AuthenticateSession = (
  payload: PasscodePayload,
  callbacks: AuthenticateSessionCallbacks
) => Promise<unknown>

type UseAuthenticateSession = (auth: AuthAPI, setSession: SetSession) => AuthenticateSession

export const useAuthenticateSession: UseAuthenticateSession = (auth, setSession) => {
  const authenticateSession: AuthenticateSession = useCallback(
    async (payload, callbacks) => {
      const response = await auth.authenticate(payload)

      switch (response.status) {
        case 201: {
          const sessionData = (response as SessionResponse).data
          if (!sessionData) throw new Error(`AuthAPI.authenticate: Missing data on 201`)
          setSession(sessionData.token)
          if (callbacks.onSuccess) return callbacks.onSuccess()
          break
        }

        case 401:
          if (callbacks.onFailure) return callbacks.onFailure()
          break

        case 422: {
          const errorData = (response as UnprocessableResponse).data
          if (!errorData) throw new Error(`AuthAPI.authenticate: Missing data on 422`)
          if (callbacks.onError) return callbacks.onError(errorData)
          break
        }

        default:
          throw new Error(`AuthAPI.authenticate: Unexpected response status ${response.status}`)
      }
    },
    [auth, setSession]
  )

  return authenticateSession
}
