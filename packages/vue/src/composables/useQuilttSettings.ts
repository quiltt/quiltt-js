import { computed, inject } from 'vue'

import { QuilttClientIdKey } from '../plugin/keys'

/**
 * Read plugin-provided Quiltt settings.
 * When used without QuilttPlugin context, values are undefined.
 */
export const useQuilttSettings = () => {
  const clientIdRef = inject(QuilttClientIdKey)

  return {
    clientId: computed(() => clientIdRef?.value),
  }
}
