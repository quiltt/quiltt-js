import { describe, expect, it } from 'vitest'

import * as ComponentsIndex from '@/components/index'
import * as ButtonModule from '@/components/quiltt-button'
import * as ConnectorModule from '@/components/quiltt-connector'
import * as ContainerModule from '@/components/quiltt-container'
import * as ComposablesIndex from '@/composables/index'
import * as UseConnectorModule from '@/composables/use-quiltt-connector'
import * as UseInstitutionsModule from '@/composables/use-quiltt-institutions'
import * as UseResolvableModule from '@/composables/use-quiltt-resolvable'
import * as UseSessionModule from '@/composables/use-quiltt-session'
import * as UseSettingsModule from '@/composables/use-quiltt-settings'
import * as SessionModule from '@/composables/use-session'
import * as StorageModule from '@/composables/use-storage'
import * as RootIndex from '@/index'
import * as PluginIndex from '@/plugin/index'
import * as KeysModule from '@/plugin/keys'
import * as PluginModule from '@/plugin/quiltt-plugin'
import * as VersionModule from '@/version'

describe('all vue source modules load', () => {
  it.each([
    ['src/index.ts', RootIndex],
    ['src/components/index.ts', ComponentsIndex],
    ['src/composables/index.ts', ComposablesIndex],
    ['src/plugin/index.ts', PluginIndex],
    ['src/plugin/keys.ts', KeysModule],
    ['src/plugin/quiltt-plugin.ts', PluginModule],
    ['src/components/quiltt-button.ts', ButtonModule],
    ['src/components/quiltt-container.ts', ContainerModule],
    ['src/components/quiltt-connector.ts', ConnectorModule],
    ['src/composables/use-quiltt-connector.ts', UseConnectorModule],
    ['src/composables/use-quiltt-institutions.ts', UseInstitutionsModule],
    ['src/composables/use-quiltt-resolvable.ts', UseResolvableModule],
    ['src/composables/use-quiltt-session.ts', UseSessionModule],
    ['src/composables/use-quiltt-settings.ts', UseSettingsModule],
    ['src/composables/use-session.ts', SessionModule],
    ['src/composables/use-storage.ts', StorageModule],
    ['src/version.ts', VersionModule],
  ])('loads %s', (_path, moduleExports) => {
    expect(moduleExports).toBeDefined()
    expect(typeof moduleExports).toBe('object')
  })
})
