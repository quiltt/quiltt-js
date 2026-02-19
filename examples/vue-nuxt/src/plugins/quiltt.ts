import { QuilttPlugin } from '@quiltt/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const { public: runtimePublic } = useRuntimeConfig()

  nuxtApp.vueApp.use(QuilttPlugin, {
    clientId: runtimePublic.quilttClientId,
    token: runtimePublic.quilttAuthToken,
  })
})
