import { afterEach, describe, expect, it, vi } from 'vitest'

import * as ComposablesIndex from '@/composables/index'
import { useQuilttConnector } from '@/composables/useQuilttConnector'
import { useQuilttInstitutions } from '@/composables/useQuilttInstitutions'
import { useQuilttResolvable } from '@/composables/useQuilttResolvable'
import { useQuilttSession } from '@/composables/useQuilttSession'
import { useQuilttSettings } from '@/composables/useQuilttSettings'
import { useSession } from '@/composables/useSession'
import { useStorage } from '@/composables/useStorage'

let warnSpy: ReturnType<typeof vi.spyOn> | undefined

const withSuppressedVueWarnings = (assertion: () => void) => {
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  assertion()
}

afterEach(() => {
  warnSpy?.mockRestore()
  warnSpy = undefined
})

describe('composables modules', () => {
  it('exports all composables from composables index', () => {
    expect(ComposablesIndex.useQuilttConnector).toBe(useQuilttConnector)
    expect(ComposablesIndex.useQuilttInstitutions).toBe(useQuilttInstitutions)
    expect(ComposablesIndex.useQuilttResolvable).toBe(useQuilttResolvable)
    expect(ComposablesIndex.useQuilttSession).toBe(useQuilttSession)
    expect(ComposablesIndex.useQuilttSettings).toBe(useQuilttSettings)
    expect(ComposablesIndex.useSession).toBe(useSession)
    expect(ComposablesIndex.useStorage).toBe(useStorage)
  })

  it('throws when session composable is used without plugin', () => {
    withSuppressedVueWarnings(() => {
      expect(() => useQuilttSession()).toThrowError(/QuilttPlugin/)
    })
  })

  it('does not throw when connector composable is used without plugin', () => {
    withSuppressedVueWarnings(() => {
      expect(() => useQuilttConnector('connector_test')).not.toThrow()
    })
  })

  it('throws when institutions composable is used without plugin', () => {
    withSuppressedVueWarnings(() => {
      expect(() => useQuilttInstitutions('connector_test')).toThrowError(/QuilttPlugin/)
    })
  })

  it('throws when resolvable composable is used without plugin', () => {
    withSuppressedVueWarnings(() => {
      expect(() => useQuilttResolvable('connector_test')).toThrowError(/QuilttPlugin/)
    })
  })
})
