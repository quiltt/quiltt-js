import { describe, expect, it, vi } from 'vitest'

import { QuilttClientIdKey, QuilttSessionKey, QuilttSetSessionKey } from '@/plugin/keys'
import { QuilttPlugin } from '@/plugin/quiltt-plugin'

const createToken = (expOffsetSeconds = 3600) => {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    exp: now + expOffsetSeconds,
    iat: now,
    iss: 'issuer',
    sub: 'subject',
    rol: 'manager' as const,
    nbf: now,
    aud: 'audience',
    jti: 'token-id',
    cid: 'client-id',
    oid: 'org-id',
    eid: 'entity-id',
    aid: 'app-id',
    ver: 1,
  }

  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return `${header}.${body}.signature`
}

describe('QuilttPlugin', () => {
  it('provides clientId, session, and setSession keys', () => {
    const provide = vi.fn()
    const app = { provide } as any

    QuilttPlugin.install?.(app, { clientId: 'cid_test' })

    expect(provide).toHaveBeenCalledWith(QuilttSessionKey, expect.any(Object))
    expect(provide).toHaveBeenCalledWith(QuilttSetSessionKey, expect.any(Function))
    expect(provide).toHaveBeenCalledWith(QuilttClientIdKey, expect.any(Object))
  })

  it('stores imported token through provided setSession function', () => {
    const provide = vi.fn()
    const app = { provide } as any

    QuilttPlugin.install?.(app, { clientId: 'cid_test' })

    const setSessionCall = provide.mock.calls.find((call) => call[0] === QuilttSetSessionKey)
    expect(setSessionCall).toBeDefined()

    const setSession = setSessionCall?.[1] as (token: string | null) => void
    const token = createToken()

    setSession(token)

    expect(localStorage.getItem('quiltt:session')).toBe(token)
  })
})
