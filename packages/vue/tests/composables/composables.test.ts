import { afterEach, describe, expect, it, vi } from 'vitest'

import * as ComposablesIndex from '@/composables/index'
import { useQuilttConnector } from '@/composables/use-quiltt-connector'
import { useQuilttInstitutions } from '@/composables/use-quiltt-institutions'
import { useQuilttResolvable } from '@/composables/use-quiltt-resolvable'
import { useQuilttSession } from '@/composables/use-quiltt-session'
import { useQuilttSettings } from '@/composables/use-quiltt-settings'
import { useSession } from '@/composables/use-session'
import { useStorage } from '@/composables/use-storage'

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

  it('throws when connector composable is used without plugin', () => {
    withSuppressedVueWarnings(() => {
      expect(() => useQuilttConnector('connector_test')).toThrowError(/QuilttPlugin/)
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
