import { computed, inject } from 'vue'

import { QuilttClientIdKey, QuilttHeadersKey } from '../plugin/keys'

/**
 * Read plugin-provided Quiltt settings.
 * When used without QuilttPlugin context, values are undefined.
 */
export const useQuilttSettings = () => {
  const clientIdRef = inject(QuilttClientIdKey)
  const headersRef = inject(QuilttHeadersKey)

  return {
    clientId: computed(() => clientIdRef?.value),
    headers: computed(() => headersRef?.value),
  }
}
