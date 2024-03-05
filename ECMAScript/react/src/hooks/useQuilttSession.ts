import { useCallback } from 'react'

import { useSession } from './useSession'

import { AuthAPI, Maybe, QuilttJWT } from '@quiltt/core'

import {
  AuthenticateSession,
  IdentifySession,
  ImportSession,
  RevokeSession,
  useAuthenticateSession,
  useIdentifySession,
  useImportSession,
  useRevokeSession,
} from './session'
import { useQuilttSettings } from './useQuilttSettings'

export type UseQuilttSession = (environmentId?: string) => {
  session: Maybe<QuilttJWT> | undefined
  importSession: ImportSession
  identifySession: IdentifySession
  authenticateSession: AuthenticateSession
  revokeSession: RevokeSession
  forgetSession: (token?: string) => Promise<void>
}

export const useQuilttSession: UseQuilttSession = (environmentId) => {
  const { clientId } = useQuilttSettings()
  const [session, setSession] = useSession()

  const auth = new AuthAPI(clientId)
  const importSession = useImportSession(auth, session, setSession, environmentId)
  const identifySession = useIdentifySession(auth, setSession)
  const authenticateSession = useAuthenticateSession(auth, setSession)
  const revokeSession = useRevokeSession(auth, session, setSession)

  /**
   * Forget current session.
   * @param token specific token to forget, to help guard against async processes clearing the wrong session
   */
  const forgetSession = useCallback(
    async (token?: string) => {
      if (!token || (session && token && token == session.token)) {
        setSession(null)
      }
    },
    [session, setSession]
  )

  return {
    session,
    importSession,
    identifySession,
    authenticateSession,
    revokeSession,
    forgetSession,
  }
}

export default useQuilttSession
