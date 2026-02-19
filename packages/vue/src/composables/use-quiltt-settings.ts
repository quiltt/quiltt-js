import { computed, inject } from 'vue'

import { QuilttClientIdKey } from '../plugin/keys'

export const useQuilttSettings = () => {
  const clientIdRef = inject(QuilttClientIdKey)

  return {
    clientId: computed(() => clientIdRef?.value),
  }
}
