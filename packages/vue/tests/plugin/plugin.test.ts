import { afterEach, describe, expect, it, vi } from 'vitest'

import { QuilttClientIdKey, QuilttSessionKey, QuilttSetSessionKey } from '@/plugin/keys'
import { QuilttPlugin } from '@/plugin/QuilttPlugin'

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
  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('initializes session from localStorage when token option is not provided', () => {
    const token = createToken()
    localStorage.setItem('quiltt:session', token)

    const provide = vi.fn()
    const app = { provide } as any

    QuilttPlugin.install?.(app, { clientId: 'cid_test' })

    const sessionCall = provide.mock.calls.find((call) => call[0] === QuilttSessionKey)
    const sessionRef = sessionCall?.[1] as { value: unknown }
    expect(sessionRef.value).toBeTruthy()
  })

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

  it('clears session and storage when setSession is called with null', () => {
    const provide = vi.fn()
    const app = { provide } as any

    QuilttPlugin.install?.(app, { clientId: 'cid_test' })

    const setSessionCall = provide.mock.calls.find((call) => call[0] === QuilttSetSessionKey)
    const setSession = setSessionCall?.[1] as (token: string | null) => void

    setSession(createToken())
    expect(localStorage.getItem('quiltt:session')).toBeTruthy()

    setSession(null)
    expect(localStorage.getItem('quiltt:session')).toBeNull()
  })

  it('syncs session updates from storage events', () => {
    const provide = vi.fn()
    const app = { provide } as any

    QuilttPlugin.install?.(app, { clientId: 'cid_test' })

    const sessionCall = provide.mock.calls.find((call) => call[0] === QuilttSessionKey)
    const sessionRef = sessionCall?.[1] as { value: any }

    const token = createToken(120)
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'quiltt:session',
        newValue: token,
      })
    )

    expect(sessionRef.value).toBeTruthy()
    expect(sessionRef.value.token).toBe(token)
  })

  it('ignores storage events for unrelated keys', () => {
    const provide = vi.fn()
    const app = { provide } as any

    QuilttPlugin.install?.(app, { clientId: 'cid_test' })

    const sessionCall = provide.mock.calls.find((call) => call[0] === QuilttSessionKey)
    const sessionRef = sessionCall?.[1] as { value: any }
    const originalValue = sessionRef.value

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'another:key',
        newValue: createToken(120),
      })
    )

    expect(sessionRef.value).toBe(originalValue)
  })

  it('expires session and clears storage when token timeout is reached', () => {
    vi.useFakeTimers()

    const provide = vi.fn()
    const app = { provide } as any

    QuilttPlugin.install?.(app, { clientId: 'cid_test' })

    const setSessionCall = provide.mock.calls.find((call) => call[0] === QuilttSetSessionKey)
    const sessionCall = provide.mock.calls.find((call) => call[0] === QuilttSessionKey)

    const setSession = setSessionCall?.[1] as (token: string | null) => void
    const sessionRef = sessionCall?.[1] as { value: any }
    const token = createToken(1)

    setSession(token)
    expect(localStorage.getItem('quiltt:session')).toBe(token)

    vi.advanceTimersByTime(1100)

    expect(sessionRef.value).toBeNull()
    expect(localStorage.getItem('quiltt:session')).toBeNull()

    vi.useRealTimers()
  })

  it('clears already expired tokens immediately', () => {
    const provide = vi.fn()
    const app = { provide } as any

    QuilttPlugin.install?.(app, { clientId: 'cid_test' })

    const setSessionCall = provide.mock.calls.find((call) => call[0] === QuilttSetSessionKey)
    const sessionCall = provide.mock.calls.find((call) => call[0] === QuilttSessionKey)

    const setSession = setSessionCall?.[1] as (token: string | null) => void
    const sessionRef = sessionCall?.[1] as { value: any }

    setSession(createToken(-60))

    expect(sessionRef.value).toBeNull()
    expect(localStorage.getItem('quiltt:session')).toBeNull()
  })

  it('handles storage access errors gracefully', () => {
    const provide = vi.fn()
    const app = { provide } as any

    expect(() => QuilttPlugin.install?.(app, { clientId: 'cid_test' })).not.toThrow()

    const setSessionCall = provide.mock.calls.find((call) => call[0] === QuilttSetSessionKey)
    const setSession = setSessionCall?.[1] as (token: string | null) => void
    expect(() => setSession(createToken())).not.toThrow()
  })

  it('clears expired initial token from options during immediate watch', () => {
    localStorage.setItem('quiltt:session', createToken(300))

    const provide = vi.fn()
    const app = { provide } as any

    QuilttPlugin.install?.(app, {
      clientId: 'cid_test',
      token: createToken(-10),
    })

    const sessionCall = provide.mock.calls.find((call) => call[0] === QuilttSessionKey)
    const sessionRef = sessionCall?.[1] as { value: any }

    expect(sessionRef.value).toBeNull()
    expect(localStorage.getItem('quiltt:session')).toBeNull()
  })

  it('expires initial valid token from options through watch timeout callback', () => {
    vi.useFakeTimers()

    const provide = vi.fn()
    const app = { provide } as any

    QuilttPlugin.install?.(app, {
      clientId: 'cid_test',
      token: createToken(1),
    })

    const sessionCall = provide.mock.calls.find((call) => call[0] === QuilttSessionKey)
    const sessionRef = sessionCall?.[1] as { value: any }

    expect(sessionRef.value).toBeTruthy()
    vi.advanceTimersByTime(1100)
    expect(sessionRef.value).toBeNull()
  })

  it('handles environments without window/localStorage', () => {
    const originalWindow = globalThis.window
    const originalLocalStorage = globalThis.localStorage

    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      configurable: true,
    })
    Object.defineProperty(globalThis, 'localStorage', {
      value: undefined,
      configurable: true,
    })

    const provide = vi.fn()
    const app = { provide } as any

    expect(() => QuilttPlugin.install?.(app, { clientId: 'cid_test' })).not.toThrow()

    const setSessionCall = provide.mock.calls.find((call) => call[0] === QuilttSetSessionKey)
    const setSession = setSessionCall?.[1] as (token: string | null) => void
    expect(() => setSession(createToken())).not.toThrow()

    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      configurable: true,
    })
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
    })
  })

  it('cleans up listeners and timers via onUnmount callback', () => {
    vi.useFakeTimers()

    const provide = vi.fn()
    const onUnmount = vi.fn<(cb: () => void) => void>()
    const addEventSpy = vi.spyOn(window, 'addEventListener')
    const removeEventSpy = vi.spyOn(window, 'removeEventListener')

    const app = { provide, onUnmount } as any

    QuilttPlugin.install?.(app, { clientId: 'cid_test' })

    const onUnmountCallback = onUnmount.mock.calls[0]?.[0] as (() => void) | undefined
    expect(onUnmountCallback).toBeTypeOf('function')

    const setSessionCall = provide.mock.calls.find((call) => call[0] === QuilttSetSessionKey)
    const setSession = setSessionCall?.[1] as (token: string | null) => void

    setSession(createToken(60))

    onUnmountCallback?.()
    onUnmountCallback?.()

    expect(addEventSpy).toHaveBeenCalledWith('storage', expect.any(Function))
    expect(removeEventSpy).toHaveBeenCalledWith('storage', expect.any(Function))
    expect(removeEventSpy).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })

  it('wraps app.unmount to run cleanup when onUnmount is unavailable', () => {
    const provide = vi.fn()
    const addEventSpy = vi.spyOn(window, 'addEventListener')
    const removeEventSpy = vi.spyOn(window, 'removeEventListener')
    const originalUnmount = vi.fn(() => 'unmounted')

    const app = {
      provide,
      unmount: originalUnmount,
    } as any

    QuilttPlugin.install?.(app, { clientId: 'cid_test' })

    const result = app.unmount('arg1')

    expect(result).toBe('unmounted')
    expect(originalUnmount).toHaveBeenCalledWith('arg1')
    expect(addEventSpy).toHaveBeenCalledWith('storage', expect.any(Function))
    expect(removeEventSpy).toHaveBeenCalledWith('storage', expect.any(Function))
  })
})
