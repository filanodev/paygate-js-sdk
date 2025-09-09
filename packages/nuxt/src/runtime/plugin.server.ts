import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { PayGateClient } from '@filanodev/paygate-core'
import type { PayGateConfig } from '@filanodev/paygate-core'

export default defineNuxtPlugin({
  name: 'paygate-server',
  async setup(nuxtApp) {
    const config = useRuntimeConfig()
    const paygateConfig: PayGateConfig = config.public.paygate

    // Créer le client PayGate pour le serveur
    const client = new PayGateClient(paygateConfig)

    // Injecter dans l'app Nuxt
    nuxtApp.provide('paygate', client)

    return {
      provide: {
        paygate: client
      }
    }
  }
})