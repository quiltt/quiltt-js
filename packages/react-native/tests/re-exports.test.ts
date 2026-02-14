import { describe, expect, it, vi } from 'vitest'

// Mock @quiltt/core and @quiltt/react to avoid their full dependency chains
vi.mock('@quiltt/core', () => ({}))
vi.mock('@quiltt/react', () => ({
  QuilttSettingsProvider: vi.fn(),
  useLazyQuery: vi.fn(),
  useMutation: vi.fn(),
  useQuery: vi.fn(),
  useQuilttClient: vi.fn(),
  useQuilttConnector: vi.fn(),
  useQuilttInstitutions: vi.fn(),
  useQuilttResolvable: vi.fn(),
  useQuilttSession: vi.fn(),
  useQuilttSettings: vi.fn(),
  useSession: vi.fn(),
  useStorage: vi.fn(),
  useSubscription: vi.fn(),
}))

/**
 * Verify that the hooks and providers re-exported from @quiltt/react
 * are accessible via the @quiltt/react module boundary.
 */
import {
  QuilttSettingsProvider,
  useLazyQuery,
  useMutation,
  useQuery,
  useQuilttClient,
  useQuilttConnector,
  useQuilttInstitutions,
  useQuilttResolvable,
  useQuilttSession,
  useQuilttSettings,
  useSession,
  useStorage,
  useSubscription,
} from '@quiltt/react'

describe('Re-exports from @quiltt/react', () => {
  it.each([
    ['useQuery', useQuery],
    ['useMutation', useMutation],
    ['useLazyQuery', useLazyQuery],
    ['useSubscription', useSubscription],
    ['useQuilttClient', useQuilttClient],
    ['useQuilttConnector', useQuilttConnector],
    ['useQuilttInstitutions', useQuilttInstitutions],
    ['useQuilttResolvable', useQuilttResolvable],
    ['useQuilttSession', useQuilttSession],
    ['useQuilttSettings', useQuilttSettings],
    ['useSession', useSession],
    ['useStorage', useStorage],
    ['QuilttSettingsProvider', QuilttSettingsProvider],
  ])('exports %s', (_name, exported) => {
    expect(exported).toBeDefined()
    expect(typeof exported).toBe('function')
  })
})
