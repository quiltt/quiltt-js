import { describe, expect, it } from 'vitest'

import * as VueExports from '@/index'
import {
  AuthAPI,
  ConnectorsAPI,
  QuilttButton,
  QuilttConnector,
  QuilttContainer,
  QuilttPlugin,
  QuilttSessionKey,
  useQuilttConnector,
  useQuilttInstitutions,
  useQuilttResolvable,
  useQuilttSession,
  useQuilttSettings,
  useSession,
  useStorage,
} from '@/index'

describe('@quiltt/vue exports', () => {
  it.each([
    ['AuthAPI', AuthAPI],
    ['ConnectorsAPI', ConnectorsAPI],
  ])('re-exports %s from @quiltt/core', (_name, exported) => {
    expect(exported).toBeDefined()
    expect(typeof exported).toBe('function')
  })

  it.each([
    ['QuilttPlugin', QuilttPlugin],
    ['QuilttSessionKey', QuilttSessionKey],
    ['QuilttButton', QuilttButton],
    ['QuilttContainer', QuilttContainer],
    ['QuilttConnector', QuilttConnector],
  ])('exports Vue module %s', (_name, exported) => {
    expect(exported).toBeDefined()
  })

  it.each([
    ['useQuilttSession', useQuilttSession],
    ['useQuilttConnector', useQuilttConnector],
    ['useQuilttInstitutions', useQuilttInstitutions],
    ['useQuilttResolvable', useQuilttResolvable],
    ['useQuilttSettings', useQuilttSettings],
    ['useSession', useSession],
    ['useStorage', useStorage],
  ])('exports composable %s', (_name, exported) => {
    expect(exported).toBeDefined()
    expect(typeof exported).toBe('function')
  })

  it('exposes subpath imports', async () => {
    const [composables, components, plugin] = await Promise.all([
      import('@/composables/index'),
      import('@/components/index'),
      import('@/plugin/index'),
    ])

    expect(composables.useQuilttSession).toBeDefined()
    expect(components.QuilttButton).toBeDefined()
    expect(plugin.QuilttPlugin).toBeDefined()
  })

  it('keeps main package surface importable as object', () => {
    expect(VueExports).toBeDefined()
    expect(typeof VueExports).toBe('object')
  })
})
