import { describe, expect, it } from 'vitest'

// Import types
import type {
  ErrorData,
  InstitutionData,
  InstitutionsData,
  Maybe,
  QuilttClientOptions,
  QuilttJWT,
  ResolvableData,
} from '@quiltt/core'
/**
 * Verify that @quiltt/core exports the expected modules and classes
 * and does NOT export utils from the main entry point.
 */
import * as CoreExports from '@quiltt/core'
// Import specific exports to verify they exist
import {
  AuthAPI,
  AuthStrategies,
  ConnectorsAPI,
  GlobalStorage,
  JsonWebTokenParse,
  QuilttClient,
  Timeoutable,
} from '@quiltt/core'

describe('@quiltt/core exports', () => {
  describe('API classes', () => {
    it.each([
      ['AuthAPI', AuthAPI],
      ['ConnectorsAPI', ConnectorsAPI],
      ['QuilttClient', QuilttClient],
    ])('exports %s', (_name, exported) => {
      expect(exported).toBeDefined()
      expect(typeof exported).toBe('function')
    })
  })

  describe('Auth module', () => {
    it.each([
      ['JsonWebTokenParse', JsonWebTokenParse],
      ['AuthStrategies', AuthStrategies],
    ])('exports %s', (_name, exported) => {
      expect(exported).toBeDefined()
    })
  })

  describe('Storage and timing', () => {
    it('exports GlobalStorage instance', () => {
      expect(GlobalStorage).toBeDefined()
      expect(typeof GlobalStorage).toBe('object')
    })

    it('exports Timeoutable class', () => {
      expect(Timeoutable).toBeDefined()
      expect(typeof Timeoutable).toBe('function')
    })
  })

  describe('Types', () => {
    it('exports type utilities', () => {
      // Type-only imports don't create runtime values, so we just verify they compile
      const _maybe: Maybe<string> = null
      const _jwt: QuilttJWT | undefined = undefined
      const _options: QuilttClientOptions | undefined = undefined
      const _error: ErrorData | undefined = undefined
      const _institution: InstitutionData | undefined = undefined
      const _institutions: InstitutionsData | undefined = undefined
      const _resolvable: ResolvableData | undefined = undefined

      expect(true).toBe(true)
    })
  })

  describe('Utils exclusion', () => {
    it('does NOT export utils from main entry point', () => {
      // Utils functions should not be in the default exports
      expect(CoreExports).not.toHaveProperty('getSDKAgent')
      expect(CoreExports).not.toHaveProperty('getBrowserInfo')
      expect(CoreExports).not.toHaveProperty('extractVersionNumber')
    })

    it('exports utils via subpath import', async () => {
      // Utils should still be available via subpath import
      const utils = await import('@quiltt/core/utils')
      expect(utils.getSDKAgent).toBeDefined()
      expect(typeof utils.getSDKAgent).toBe('function')
    })
  })
})
