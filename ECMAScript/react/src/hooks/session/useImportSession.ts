import { useCallback } from 'react'

import type { AuthAPI, Maybe, QuilttJWT } from '@quiltt/core'

import type { SetSession } from '../useSession'

export type ImportSession = (token: string) => Promise<boolean>

type UseImportSession = (
  auth: AuthAPI,
  session: Maybe<QuilttJWT> | undefined,
  setSession: SetSession
) => ImportSession

export const useImportSession: UseImportSession = (auth, session, setSession) => {
  const importSession = useCallback<ImportSession>(
    async (token) => {
      if (!token) return !!session
      if (session && session.token == token) return true

      const response = await auth.ping(token)

      switch (response.status) {
        case 200:
          setSession(token)
          return true
          break

        case 401:
          return false
          break

        default:
          throw new Error(`Unexpected auth ping response status: ${response.status}`)
      }
    },
    [auth, session, setSession]
  )

  return importSession
}

export default useImportSession
