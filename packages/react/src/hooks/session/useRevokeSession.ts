import { useCallback } from 'react'

import type { AuthAPI, Maybe, QuilttJWT } from '@quiltt/core'

import type { SetSession } from '@/hooks/useSession'

export type RevokeSession = () => Promise<void>

type UseRevokeSession = (
  auth: AuthAPI,
  session: Maybe<QuilttJWT> | undefined,
  setSession: SetSession
) => RevokeSession

export const useRevokeSession: UseRevokeSession = (auth, session, setSession) => {
  const revokeSession = useCallback<RevokeSession>(async () => {
    if (!session) return

    await auth.revoke(session.token)

    setSession(null)
  }, [auth, session, setSession])

  return revokeSession
}

export default useRevokeSession
