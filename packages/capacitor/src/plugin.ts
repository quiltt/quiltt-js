import { registerPlugin } from '@capacitor/core'

import type { QuilttConnectorPlugin } from './definitions'

/**
 * Native Capacitor plugin for deep link handling and URL opening
 * Used internally by QuilttConnector component for OAuth flows
 */
export const QuilttConnector = registerPlugin<QuilttConnectorPlugin>('QuilttConnector', {
  web: () => import('./web').then((m) => new m.QuilttConnectorWeb()),
})
