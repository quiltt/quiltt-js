// Hermes doesn't have atob
// https://github.com/facebook/hermes/issues/1178
import { decode } from 'base-64'

if (!global.atob) {
  global.atob = decode
}

export * from '@quiltt/core'
export {
  QuilttSettingsProvider,
  useQuilttClient,
  useQuilttConnector,
  useQuilttSession,
  useQuilttSettings,
  useSession,
  useStorage,
} from '@quiltt/react'

export * from './components'
export * from './providers'
