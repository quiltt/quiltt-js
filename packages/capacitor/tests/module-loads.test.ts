import { describe, expect, it } from 'vitest'

import * as ReactComponentsIndex from '../src/components/react/index'
import * as ReactConnectorComponent from '../src/components/react/QuilttConnector'
import * as VueComponentsIndex from '../src/components/vue/index'
import * as VueConnectorComponent from '../src/components/vue/QuilttConnector'
import * as DefinitionsModule from '../src/definitions'
import * as RootIndex from '../src/index'
import * as PluginModule from '../src/plugin'
import * as ReactEntry from '../src/react'
import * as VueEntry from '../src/vue'
import * as WebModule from '../src/web'

describe('capacitor modules load', () => {
  it.each([
    ['src/index.ts', RootIndex],
    ['src/plugin.ts', PluginModule],
    ['src/web.ts', WebModule],
    ['src/definitions.ts', DefinitionsModule],
    ['src/components/react/index.ts', ReactComponentsIndex],
    ['src/components/react/QuilttConnector.tsx', ReactConnectorComponent],
    ['src/react.ts', ReactEntry],
    ['src/vue.ts', VueEntry],
    ['src/components/vue/index.ts', VueComponentsIndex],
    ['src/components/vue/QuilttConnector.ts', VueConnectorComponent],
  ])('loads %s', (_path, moduleExports) => {
    expect(moduleExports).toBeDefined()
    expect(typeof moduleExports).toBe('object')
  })
})
