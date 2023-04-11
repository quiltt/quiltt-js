import { useCallback } from 'react'

import type { AuthAPI, PasscodePayload, SessionResponse, UnprocessableData, UnprocessableResponse } from '@quiltt/core'

import type { SetSession } from '../'

type AuthenticateSessionCallbacks = {
  onSuccess?: () => unknown
  onFailure?: () => unknown
  onError?: (errors: UnprocessableData) => unknown
}
type AuthenticateSession = (
  payload: PasscodePayload,
  callbacks: AuthenticateSessionCallbacks
) => Promise<unknown>

type UseAuthenticateSession = (auth: AuthAPI, setSession: SetSession) => AuthenticateSession

export const useAuthenticateSession: UseAuthenticateSession = (auth, setSession) => {
  const authenticateSession = useCallback<AuthenticateSession>(
    async (payload, callbacks) => {
      const response = await auth.authenticate(payload)

      switch (response.status) {
        case 201:
          setSession((response as SessionResponse).data.token)
          if (callbacks.onSuccess) return callbacks.onSuccess()
          break

        case 401:
          if (callbacks.onFailure) return callbacks.onFailure()
          break

        case 422:
          if (callbacks.onError) return callbacks.onError((response as UnprocessableResponse).data)
          break

        default:
          throw new Error(`Unexpected auth authenticate response status: ${response.status}`)
      }
    },
    [auth]
  )

  return authenticateSession
}

export default useAuthenticateSession
