# PayGate JavaScript SDK

::: tip 📦 Package Communautaire
Ce SDK a été développé par [Filano](https://me.fedapay.com/filano_don) pour aider la communauté des développeurs JavaScript à intégrer PayGateGlobal plus facilement dans leurs projets.
:::

## Qu'est-ce que PayGate SDK?

PayGate SDK est une collection de packages JavaScript modernes qui simplifient l'intégration de **PayGateGlobal** dans vos applications. Il supporte les principaux réseaux de paiement mobile du Togo : **FLOOZ (Moov)** et **T-Money (Togocel)**.

## Fonctionnalités principales

- ✅ **Multi-frameworks** - React, Vue, Nuxt, Next.js
- 🔒 **TypeScript** - Support complet avec types
- ⚡ **Moderne** - ESM, Tree-shaking, Bundle optimisé  
- 🌐 **SSR/SSG** - Compatible server-side rendering
- 🎯 **Developer Experience** - API simple et intuitive
- 📱 **Responsive** - Composants prêts pour mobile
- 🔧 **Flexible** - Hooks, composables, utilitaires

## Démarrage rapide

### Installation

::: code-group
```bash [Core]
npm install @filanodev/paygate-core
```

```bash [React]
npm install @filanodev/paygate-react
```

```bash [Vue]
npm install @filanodev/paygate-vue
```

```bash [Nuxt]
npm install @filanodev/paygate-nuxt
```

```bash [Next.js]
npm install @filanodev/paygate-next
```
:::

### Utilisation simple

::: code-group
```js [Core]
import { PayGateClient } from '@filanodev/paygate-core'

const client = new PayGateClient({
  authToken: 'your-token',
  })

const payment = await client.initiatePayment({
  phoneNumber: '+22890123456',
  amount: 1000,
  identifier: 'ORDER_123',
  network: 'FLOOZ',
  description: 'Achat produit'
})

console.log('Référence:', payment.txReference)
```

```jsx [React]
import { usePayGate, PayGateProvider } from '@filanodev/paygate-react'

function App() {
  return (
    <PayGateProvider authToken="your-token" >
      <PaymentComponent />
    </PayGateProvider>
  )
}

function PaymentComponent() {
  const { initiatePayment, loading } = usePayGate()
  
  const handlePayment = () => {
    initiatePayment({
      phoneNumber: '+22890123456',
      amount: 1000,
      identifier: 'ORDER_123',
      network: 'FLOOZ',
      description: 'Achat produit'
    })
  }

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Traitement...' : 'Payer 1000 FCFA'}
    </button>
  )
}
```

```vue [Vue]
<template>
  <button @click="handlePayment" :disabled="loading">
    {{ loading ? 'Traitement...' : 'Payer 1000 FCFA' }}
  </button>
</template>

<script setup>
import { usePayGate } from '@filanodev/paygate-vue'

const { initiatePayment, loading } = usePayGate()

const handlePayment = async () => {
  await initiatePayment({
    phoneNumber: '+22890123456',
    amount: 1000,
    identifier: 'ORDER_123',
    network: 'FLOOZ',
    description: 'Achat produit'
  })
}
</script>
```

```ts [Nuxt]
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@filanodev/paygate-nuxt'],
  paygate: {
    authToken: process.env.PAYGATE_TOKEN,
      }
})

// pages/payment.vue
<template>
  <button @click="handlePayment" :disabled="loading">
    {{ loading ? 'Traitement...' : 'Payer 1000 FCFA' }}
  </button>
</template>

<script setup>
// Auto-importé par le module
const { initiatePayment, loading } = usePayGate()

const handlePayment = async () => {
  await initiatePayment({
    phoneNumber: '+22890123456',
    amount: 1000,
    identifier: 'ORDER_123',
    network: 'FLOOZ',
    description: 'Achat produit'
  })
}
</script>
```

```tsx [Next.js]
// app/layout.tsx
import { PayGateProvider } from '@filanodev/paygate-next/client'

export default function Layout({ children }) {
  return (
    <PayGateProvider authToken="your-token" >
      {children}
    </PayGateProvider>
  )
}

// app/payment/page.tsx
'use client'
import { usePayGate } from '@filanodev/paygate-next/client'

export default function PaymentPage() {
  const { initiatePayment, loading } = usePayGate()
  
  const handlePayment = () => {
    initiatePayment({
      phoneNumber: '+22890123456',
      amount: 1000,
      identifier: 'ORDER_123',
      network: 'FLOOZ',
      description: 'Achat produit'
    })
  }

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Traitement...' : 'Payer 1000 FCFA'}
    </button>
  )
}
```
:::

## Packages disponibles

| Package | Description | Version |
|---------|-------------|---------|
| [@filanodev/paygate-core](/packages/core) | Client JavaScript de base | ![npm](https://img.shields.io/npm/v/@filanodev/paygate-core) |
| [@filanodev/paygate-react](/packages/react) | Hooks et composants React | ![npm](https://img.shields.io/npm/v/@filanodev/paygate-react) |
| [@filanodev/paygate-vue](/packages/vue) | Composables et plugin Vue | ![npm](https://img.shields.io/npm/v/@filanodev/paygate-vue) |
| [@filanodev/paygate-nuxt](/packages/nuxt) | Module Nuxt 3/4 | ![npm](https://img.shields.io/npm/v/@filanodev/paygate-nuxt) |
| [@filanodev/paygate-next](/packages/next) | Plugin Next.js 12-15 | ![npm](https://img.shields.io/npm/v/@filanodev/paygate-next) |

## Compatibilité

### Frameworks supportés

- **React** 16.8+ (Hooks), 17, 18, 19
- **Vue** 3.0+, 3.5+
- **Nuxt** 3.0+, 4.0+
- **Next.js** 12, 13, 14, 15

### Environnements

- **Node.js** 16, 18, 20, 22+
- **Browsers** modernes (ES2020+)
- **TypeScript** 4.5+, 5.0+
- **Bundlers** Vite, Webpack, Rollup, etc.

## Réseaux supportés

| Réseau | Code | Opérateur | Couverture |
|--------|------|-----------|------------|
| FLOOZ | `FLOOZ` | Moov Africa Togo | 🇹🇬 Togo |
| T-Money | `TMONEY` | Togocel | 🇹🇬 Togo |

## Support et contribution

### Support PayGateGlobal officiel
- 🌐 Site web : [https://paygateglobal.com/](https://paygateglobal.com/)
- 📧 Email : info@paygateglobal.com

### Support du SDK communautaire
- 🐛 Issues : [GitHub Issues](https://github.com/filano/paygate-js-sdk/issues)
- 💬 Discussions : [GitHub Discussions](https://github.com/filano/paygate-js-sdk/discussions)
- ⭐ Star le projet : [GitHub](https://github.com/filano/paygate-js-sdk)

### Donation
Si ce SDK vous aide dans vos projets, vous pouvez soutenir le développement :
- 💝 [Faire un don via FedaPay](https://me.fedapay.com/filano_don)

## Prochaines étapes

- [Configuration complète](/guide/configuration)
- [Concepts de base](/guide/concepts)
- [Initier votre premier paiement](/guide/initiate-payment)
- [Exemples d'intégration](/examples/)

---

<div style="text-align: center; margin-top: 2rem; color: #666;">
  <p>Développé avec ❤️ pour la communauté JavaScript africaine</p>
  <p><strong>PayGate JS SDK</strong> - Simplifie l'intégration de PayGateGlobal</p>
</div>