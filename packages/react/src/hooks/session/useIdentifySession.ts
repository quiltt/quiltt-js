import { useCallback } from 'react'

import type {
  AuthAPI,
  SessionResponse,
  UnprocessableData,
  UnprocessableResponse,
  UsernamePayload,
} from '@quiltt/core'

import type { SetSession } from '@/hooks/useSession'

type IdentifySessionCallbacks = {
  onSuccess?: () => unknown
  onChallenged?: () => unknown
  onError?: (errors: UnprocessableData) => unknown
  onForbidden?: () => unknown
}
export type IdentifySession = (
  payload: UsernamePayload,
  callbacks: IdentifySessionCallbacks
) => Promise<unknown>

type UseIdentifySession = (auth: AuthAPI, setSession: SetSession) => IdentifySession

export const useIdentifySession: UseIdentifySession = (auth, setSession) => {
  const identifySession = useCallback<IdentifySession>(
    async (payload, callbacks) => {
      const response = await auth.identify(payload)

      switch (response.status) {
        case 201: // Created
          setSession((response as SessionResponse).data.token)
          if (callbacks.onSuccess) return callbacks.onSuccess()
          break

        case 202: // Accepted
          if (callbacks.onChallenged) return callbacks.onChallenged()
          break

        case 403: // Forbidden (signups disabled)
          if (callbacks.onForbidden) return callbacks.onForbidden()
          break

        case 422: // Unprocessable Content
          if (callbacks.onError) return callbacks.onError((response as UnprocessableResponse).data)
          break

        default:
          throw new Error(`AuthAPI.identify: Unexpected response status ${response.status}`)
      }
    },
    [auth, setSession]
  )

  return identifySession
}

export default useIdentifySession
