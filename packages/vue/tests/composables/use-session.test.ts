import { createApp, nextTick } from 'vue'

import { describe, expect, it } from 'vitest'

import { useSession } from '@/composables/use-session'

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

const mountComposable = <T>(factory: () => T) => {
  let result!: T
  const root = document.createElement('div')
  document.body.appendChild(root)

  const app = createApp({
    setup() {
      result = factory()
      return () => null
    },
  })

  app.mount(root)

  return {
    result,
    unmount: () => {
      app.unmount()
      root.remove()
    },
  }
}

describe('useSession', () => {
  it('sets and clears parsed session from JWT token', async () => {
    const { result, unmount } = mountComposable(() => useSession('session:test'))
    const token = createToken()

    result.setSession(token)
    await nextTick()

    expect(result.session.value?.token).toBe(token)

    result.setSession(null)
    await nextTick()

    expect(result.session.value).toBeNull()

    unmount()
  })

  it('ignores invalid token values and supports functional state updates', async () => {
    const { result, unmount } = mountComposable(() => useSession('session:test:fn'))
    const token = createToken()

    result.setSession(token)
    await nextTick()
    expect(result.session.value?.token).toBe(token)

    result.setSession('invalid-token')
    await nextTick()
    expect(result.session.value?.token).toBe(token)

    result.setSession(() => null)
    await nextTick()
    expect(result.session.value).toBeNull()

    unmount()
  })
})
