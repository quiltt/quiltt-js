import { useCallback } from 'react'

import type {
  AuthAPI,
  SessionResponse,
  UnprocessableData,
  UnprocessableResponse,
  UsernamePayload,
} from '@quiltt/core'

import type { SetSession } from '../useSession'

type IdentifySessionCallbacks = {
  onSuccess?: () => unknown
  onChallenged?: () => unknown
  onError?: (errors: UnprocessableData) => unknown
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
      const unprocessableResponse = response as UnprocessableResponse

      switch (response.status) {
        case 201: // Created
          setSession((response as SessionResponse).data.token)
          if (callbacks.onSuccess) return callbacks.onSuccess()
          break

        case 202: // Accepted
          if (callbacks.onChallenged) return callbacks.onChallenged()
          break

        case 422: // Unprocessable Content
          if (callbacks.onError) return callbacks.onError(unprocessableResponse.data)
          break

        default:
          throw new Error(`Unexpected auth identify response status: ${response.status}`)
      }
    },
    [auth, setSession]
  )

  return identifySession
}

export default useIdentifySession
