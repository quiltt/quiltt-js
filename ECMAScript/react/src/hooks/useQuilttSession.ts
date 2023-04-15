import { useCallback } from 'react'

import { useSession } from './useSession'

import { AuthAPI } from '@quiltt/core'

import {
  useAuthenticateSession,
  useIdentifySession,
  useImportSession,
  useRevokeSession,
} from './session'
import { useQuilttSettings } from './useQuilttSettings'

export const useQuilttSession = () => {
  const { clientId } = useQuilttSettings()
  const [session, setSession] = useSession()

  const auth = new AuthAPI(clientId)
  const importSession = useImportSession(auth, session, setSession)
  const identifySession = useIdentifySession(auth, setSession)
  const authenticateSession = useAuthenticateSession(auth, setSession)
  const revokeSession = useRevokeSession(auth, session, setSession)

  // Optionally takes a token, to help guard against async processes clearing the wrong session
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
