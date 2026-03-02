import { describe, expect, it } from 'vitest'

import * as ComponentsIndex from '../src/components/index'
import * as ConnectorComponent from '../src/components/QuilttConnector'
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
    ['src/components/index.ts', ComponentsIndex],
    ['src/components/QuilttConnector.tsx', ConnectorComponent],
    ['src/react.ts', ReactEntry],
    ['src/vue.ts', VueEntry],
  ])('loads %s', (_path, moduleExports) => {
    expect(moduleExports).toBeDefined()
    expect(typeof moduleExports).toBe('object')
  })
})
