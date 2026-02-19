import { createApp, ref } from 'vue'

import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  pingMock: vi.fn(),
  identifyMock: vi.fn(),
  authenticateMock: vi.fn(),
  revokeMock: vi.fn(),
}))

vi.mock('@quiltt/core', async () => {
  const actual = await vi.importActual<typeof import('@quiltt/core')>('@quiltt/core')

  class MockAuthAPI {
    ping = mocks.pingMock
    identify = mocks.identifyMock
    authenticate = mocks.authenticateMock
    revoke = mocks.revokeMock
  }

  return {
    ...actual,
    AuthAPI: MockAuthAPI,
  }
})

import { useQuilttSession } from '@/composables/use-quiltt-session'
import { QuilttClientIdKey, QuilttSessionKey, QuilttSetSessionKey } from '@/plugin/keys'

const createToken = (expOffsetSeconds = 3600, eid = 'entity-id') => {
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
    eid,
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

const mountComposable = <T>(factory: () => T, provide: Array<[symbol, unknown]>) => {
  let result!: T
  const root = document.createElement('div')
  document.body.appendChild(root)

  const app = createApp({
    setup() {
      result = factory()
      return () => null
    },
  })

  provide.forEach(([key, value]) => {
    app.provide(key, value)
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

describe('useQuilttSession', () => {
  afterEach(() => {
    mocks.pingMock.mockReset()
    mocks.identifyMock.mockReset()
    mocks.authenticateMock.mockReset()
    mocks.revokeMock.mockReset()
  })

  it('imports valid session token and stores via injected setter', async () => {
    mocks.pingMock.mockResolvedValue({ status: 200 } as any)

    const sessionRef = ref(null)
    const setSession = vi.fn()

    const { result, unmount } = mountComposable(
      () => useQuilttSession(),
      [
        [QuilttSessionKey as unknown as symbol, sessionRef],
        [QuilttSetSessionKey as unknown as symbol, setSession],
        [QuilttClientIdKey as unknown as symbol, ref('cid_test')],
      ]
    )

    const token = createToken(3600, 'env_1')
    const imported = await result.importSession(token, 'env_1')

    expect(imported).toBe(true)
    expect(mocks.pingMock).toHaveBeenCalledWith(token)
    expect(setSession).toHaveBeenCalledWith(token)

    unmount()
  })

  it('returns false when importing invalid token or wrong environment', async () => {
    const sessionRef = ref(null)
    const setSession = vi.fn()

    const { result, unmount } = mountComposable(
      () => useQuilttSession(),
      [
        [QuilttSessionKey as unknown as symbol, sessionRef],
        [QuilttSetSessionKey as unknown as symbol, setSession],
        [QuilttClientIdKey as unknown as symbol, ref('cid_test')],
      ]
    )

    expect(await result.importSession('not-a-jwt')).toBe(false)

    const token = createToken(3600, 'env_1')
    expect(await result.importSession(token, 'env_2')).toBe(false)

    expect(setSession).not.toHaveBeenCalled()

    unmount()
  })

  it('handles ping status branches during import', async () => {
    const sessionRef = ref(null)
    const setSession = vi.fn()

    const { result, unmount } = mountComposable(
      () => useQuilttSession(),
      [
        [QuilttSessionKey as unknown as symbol, sessionRef],
        [QuilttSetSessionKey as unknown as symbol, setSession],
        [QuilttClientIdKey as unknown as symbol, ref('cid_test')],
      ]
    )

    const token = createToken()

    mocks.pingMock.mockResolvedValueOnce({ status: 401 } as any)
    expect(await result.importSession(token)).toBe(false)

    mocks.pingMock.mockResolvedValueOnce({ status: 500 } as any)
    await expect(result.importSession(token)).rejects.toThrow(/Unexpected response status 500/)

    unmount()
  })

  it('handles identify and authenticate status callbacks', async () => {
    const sessionRef = ref(null)
    const setSession = vi.fn()

    const { result, unmount } = mountComposable(
      () => useQuilttSession(),
      [
        [QuilttSessionKey as unknown as symbol, sessionRef],
        [QuilttSetSessionKey as unknown as symbol, setSession],
        [QuilttClientIdKey as unknown as symbol, ref('cid_test')],
      ]
    )

    const onSuccess = vi.fn()
    const onChallenged = vi.fn()
    const onForbidden = vi.fn()
    const onError = vi.fn()
    const onFailure = vi.fn()

    mocks.identifyMock.mockResolvedValueOnce({
      status: 201,
      data: { token: 'identify_token' },
    } as any)
    await result.identifySession({ email: 'test@example.com' } as any, {
      onSuccess,
      onChallenged,
      onForbidden,
      onError,
    })
    expect(setSession).toHaveBeenCalledWith('identify_token')
    expect(onSuccess).toHaveBeenCalledTimes(1)

    mocks.identifyMock.mockResolvedValueOnce({ status: 202 } as any)
    await result.identifySession({ email: 'test@example.com' } as any, {
      onSuccess,
      onChallenged,
      onForbidden,
      onError,
    })
    expect(onChallenged).toHaveBeenCalledTimes(1)

    mocks.identifyMock.mockResolvedValueOnce({ status: 403 } as any)
    await result.identifySession({ email: 'test@example.com' } as any, {
      onSuccess,
      onChallenged,
      onForbidden,
      onError,
    })
    expect(onForbidden).toHaveBeenCalledTimes(1)

    mocks.identifyMock.mockResolvedValueOnce({ status: 422, data: { errors: [] } } as any)
    await result.identifySession({ email: 'test@example.com' } as any, {
      onSuccess,
      onChallenged,
      onForbidden,
      onError,
    })
    expect(onError).toHaveBeenCalledTimes(1)

    mocks.authenticateMock.mockResolvedValueOnce({
      status: 201,
      data: { token: 'auth_token' },
    } as any)
    await result.authenticateSession({ passcode: '123456' } as any, {
      onSuccess,
      onFailure,
      onError,
    })
    expect(setSession).toHaveBeenCalledWith('auth_token')

    mocks.authenticateMock.mockResolvedValueOnce({ status: 401 } as any)
    await result.authenticateSession({ passcode: '123456' } as any, {
      onSuccess,
      onFailure,
      onError,
    })
    expect(onFailure).toHaveBeenCalledTimes(1)

    mocks.authenticateMock.mockResolvedValueOnce({ status: 422, data: { errors: [] } } as any)
    await result.authenticateSession({ passcode: '123456' } as any, {
      onSuccess,
      onFailure,
      onError,
    })
    expect(onError).toHaveBeenCalledTimes(2)

    unmount()
  })

  it('throws on unexpected identify/authenticate statuses and handles revoke', async () => {
    const sessionRef = ref({ token: 'session_token' } as any)
    const setSession = vi.fn()

    const { result, unmount } = mountComposable(
      () => useQuilttSession(),
      [
        [QuilttSessionKey as unknown as symbol, sessionRef],
        [QuilttSetSessionKey as unknown as symbol, setSession],
        [QuilttClientIdKey as unknown as symbol, ref('cid_test')],
      ]
    )

    mocks.identifyMock.mockResolvedValueOnce({ status: 500 } as any)
    await expect(result.identifySession({ email: 'test@example.com' } as any, {})).rejects.toThrow(
      /Unexpected response status 500/
    )

    mocks.authenticateMock.mockResolvedValueOnce({ status: 500 } as any)
    await expect(result.authenticateSession({ passcode: '123456' } as any, {})).rejects.toThrow(
      /Unexpected response status 500/
    )

    mocks.revokeMock.mockResolvedValueOnce(undefined)
    await result.revokeSession()
    expect(mocks.revokeMock).toHaveBeenCalledWith('session_token')
    expect(setSession).toHaveBeenCalledWith(null)

    unmount()
  })

  it('forgets session only when token matches current session', () => {
    const sessionRef = ref({ token: 'token_current' } as any)
    const setSession = vi.fn()

    const { result, unmount } = mountComposable(
      () => useQuilttSession(),
      [
        [QuilttSessionKey as unknown as symbol, sessionRef],
        [QuilttSetSessionKey as unknown as symbol, setSession],
        [QuilttClientIdKey as unknown as symbol, ref('cid_test')],
      ]
    )

    result.forgetSession('token_other')
    expect(setSession).not.toHaveBeenCalled()

    result.forgetSession('token_current')
    expect(setSession).toHaveBeenCalledWith(null)

    unmount()
  })
})
