import type { App } from 'vue'
import { PayGateClient } from '@filano/paygate-core'
import type { PayGatePluginOptions } from './types'
import { PAYGATE_CLIENT_KEY } from './composables'

export function createPayGate(options: PayGatePluginOptions) {
  const client = new PayGateClient(options)

  return {
    install(app: App) {
      app.provide(PAYGATE_CLIENT_KEY, client)
      
      // Ajouter le client aux propriétés globales pour l'Options API
      app.config.globalProperties.$paygate = client
    },
    client
  }
}

// Plugin par défaut pour installation directe
export default {
  install(app: App, options: PayGatePluginOptions) {
    const { install } = createPayGate(options)
    install(app)
  }
}