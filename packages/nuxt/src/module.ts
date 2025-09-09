import { defineNuxtModule, addPlugin, addImports, createResolver, addTypeTemplate } from '@nuxt/kit'
import type { PayGateConfig } from '@filano/paygate-core'

export interface ModuleOptions extends PayGateConfig {
  /**
   * Injecter automatiquement les composables PayGate
   * @default true
   */
  autoImports?: boolean

  /**
   * Préfixe pour les composables auto-importés
   * @default 'paygate'
   */
  prefix?: string

  /**
   * Activer les utilitaires server-side
   * @default true
   */
  serverUtils?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@filano/paygate-nuxt',
    configKey: 'paygate',
    compatibility: {
      nuxt: '^3.0.0 || ^4.0.0'
    }
  },
  defaults: {
    authToken: '',
    environment: 'sandbox',
    verifySSL: true,
    autoImports: true,
    prefix: 'paygate',
    serverUtils: true
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Ajouter les types runtime
    nuxt.options.runtimeConfig.public.paygate = {
      authToken: options.authToken,
      environment: options.environment,
      verifySSL: options.verifySSL
    }

    // Plugin client-side
    addPlugin({
      src: resolver.resolve('./runtime/plugin.client.ts'),
      mode: 'client'
    })

    // Plugin server-side si activé
    if (options.serverUtils) {
      addPlugin({
        src: resolver.resolve('./runtime/plugin.server.ts'),
        mode: 'server'
      })
    }

    // Auto-imports des composables
    if (options.autoImports) {
      const prefix = options.prefix ? `${options.prefix}` : ''
      
      addImports([
        {
          name: 'usePayGate',
          as: `use${prefix.charAt(0).toUpperCase() + prefix.slice(1)}`,
          from: resolver.resolve('./runtime/composables')
        },
        {
          name: 'usePaymentInitiation',
          as: `use${prefix.charAt(0).toUpperCase() + prefix.slice(1)}PaymentInitiation`,
          from: resolver.resolve('./runtime/composables')
        },
        {
          name: 'usePaymentStatus',
          as: `use${prefix.charAt(0).toUpperCase() + prefix.slice(1)}PaymentStatus`,
          from: resolver.resolve('./runtime/composables')
        }
      ])
    }

    // Ajouter les types TypeScript
    addTypeTemplate({
      filename: 'types/paygate.d.ts',
      content: `
import type { PayGateClient, PayGateConfig, PaymentResponse, PaymentStatus } from '@filano/paygate-core'

declare global {
  interface NuxtApp {
    $paygate: PayGateClient
  }
}

declare module '#app' {
  interface NuxtApp {
    $paygate: PayGateClient
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $paygate: PayGateClient
  }
}

export {}
      `
    })

    // Transpiler les dépendances
    nuxt.options.build = nuxt.options.build || {}
    nuxt.options.build.transpile = nuxt.options.build.transpile || []
    nuxt.options.build.transpile.push('@filano/paygate-core')
  }
})