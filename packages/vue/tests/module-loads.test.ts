import { describe, expect, it } from 'vitest'

import * as ComponentsIndex from '@/components/index'
import * as ButtonModule from '@/components/QuilttButton'
import * as ConnectorModule from '@/components/QuilttConnector'
import * as ContainerModule from '@/components/QuilttContainer'
import * as ComposablesIndex from '@/composables/index'
import * as UseConnectorModule from '@/composables/useQuilttConnector'
import * as UseInstitutionsModule from '@/composables/useQuilttInstitutions'
import * as UseResolvableModule from '@/composables/useQuilttResolvable'
import * as UseSessionModule from '@/composables/useQuilttSession'
import * as UseSettingsModule from '@/composables/useQuilttSettings'
import * as SessionModule from '@/composables/useSession'
import * as StorageModule from '@/composables/useStorage'
import * as RootIndex from '@/index'
import * as PluginIndex from '@/plugin/index'
import * as KeysModule from '@/plugin/keys'
import * as PluginModule from '@/plugin/QuilttPlugin'
import * as VersionModule from '@/version'

describe('all vue source modules load', () => {
  it.each([
    ['src/index.ts', RootIndex],
    ['src/components/index.ts', ComponentsIndex],
    ['src/composables/index.ts', ComposablesIndex],
    ['src/plugin/index.ts', PluginIndex],
    ['src/plugin/keys.ts', KeysModule],
    ['src/plugin/QuilttPlugin.ts', PluginModule],
    ['src/components/QuilttButton.ts', ButtonModule],
    ['src/components/QuilttContainer.ts', ContainerModule],
    ['src/components/QuilttConnector.ts', ConnectorModule],
    ['src/composables/useQuilttConnector.ts', UseConnectorModule],
    ['src/composables/useQuilttInstitutions.ts', UseInstitutionsModule],
    ['src/composables/useQuilttResolvable.ts', UseResolvableModule],
    ['src/composables/useQuilttSession.ts', UseSessionModule],
    ['src/composables/useQuilttSettings.ts', UseSettingsModule],
    ['src/composables/useSession.ts', SessionModule],
    ['src/composables/useStorage.ts', StorageModule],
    ['src/version.ts', VersionModule],
  ])('loads %s', (_path, moduleExports) => {
    expect(moduleExports).toBeDefined()
    expect(typeof moduleExports).toBe('object')
  })
})
