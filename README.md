# PayGate JavaScript SDK

[![npm version](https://img.shields.io/npm/v/@filano/paygate-core.svg)](https://www.npmjs.com/package/@filano/paygate-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/filano/paygate-js-sdk/workflows/CI/badge.svg)](https://github.com/filano/paygate-js-sdk/actions)

SDK JavaScript moderne et complet pour intégrer **PayGateGlobal** dans vos applications web. Support natif des réseaux de paiement mobile **FLOOZ (Moov)** et **T-Money (Togocel)** au Togo.

> 📦 **Package communautaire** développé par [Filano](https://me.fedapay.com/filano_don) pour simplifier l'intégration de PayGateGlobal dans l'écosystème JavaScript.

## ✨ Fonctionnalités

- 🎯 **Multi-frameworks** - React, Vue, Nuxt, Next.js + JavaScript pur
- 🔒 **TypeScript** - Support complet avec types auto-générés
- ⚡ **Moderne** - ESM, Tree-shaking, optimisé pour les bundlers
- 🌐 **SSR/SSG** - Compatible server-side rendering
- 📱 **Responsive** - Composants optimisés pour mobile
- 🔧 **Flexible** - Hooks, composables, API utilities
- 🧪 **Testable** - Suite de tests complète
- 📚 **Documentation** - Guide complet et exemples

## 📦 Packages

| Package | Description | Version |
|---------|-------------|---------|
| [@filano/paygate-core](./packages/core) | Client JavaScript de base | ![npm](https://img.shields.io/npm/v/@filano/paygate-core) |
| [@filano/paygate-react](./packages/react) | Hooks et composants React | ![npm](https://img.shields.io/npm/v/@filano/paygate-react) |
| [@filano/paygate-vue](./packages/vue) | Composables et plugin Vue | ![npm](https://img.shields.io/npm/v/@filano/paygate-vue) |
| [@filano/paygate-nuxt](./packages/nuxt) | Module Nuxt 3/4 | ![npm](https://img.shields.io/npm/v/@filano/paygate-nuxt) |
| [@filano/paygate-next](./packages/next) | Plugin Next.js 12-15 | ![npm](https://img.shields.io/npm/v/@filano/paygate-next) |

## 🚀 Démarrage rapide

### Installation

Choisissez le package adapté à votre framework :

```bash
# JavaScript pur / Node.js
npm install @filano/paygate-core

# React
npm install @filano/paygate-react

# Vue.js
npm install @filano/paygate-vue

# Nuxt 3/4
npm install @filano/paygate-nuxt

# Next.js
npm install @filano/paygate-next
```

### Configuration

```bash
# .env
PAYGATE_TOKEN=your-paygate-token
```

### Utilisation

<details>
<summary><strong>JavaScript Core</strong></summary>

```js
import { PayGateClient } from '@filano/paygate-core'

const client = new PayGateClient({
  authToken: process.env.PAYGATE_TOKEN
})

// Initier un paiement
const payment = await client.initiatePayment({
  phoneNumber: '+22890123456',
  amount: 1000,
  identifier: 'ORDER_123',
  network: 'FLOOZ',
  description: 'Achat produit'
})

console.log('Référence:', payment.txReference)
```
</details>

<details>
<summary><strong>React</strong></summary>

```jsx
import { PayGateProvider, usePayGate } from '@filano/paygate-react'

function App() {
  return (
    <PayGateProvider authToken="your-token">
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
</details>

<details>
<summary><strong>Vue.js</strong></summary>

```vue
<template>
  <button @click="handlePayment" :disabled="loading">
    {{ loading ? 'Traitement...' : 'Payer 1000 FCFA' }}
  </button>
</template>

<script setup>
import { usePayGate } from '@filano/paygate-vue'

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
</details>

<details>
<summary><strong>Nuxt</strong></summary>

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@filano/paygate-nuxt'],
  paygate: {
    authToken: process.env.PAYGATE_TOKEN
  }
})
```

```vue
<!-- pages/payment.vue -->
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
</details>

<details>
<summary><strong>Next.js</strong></summary>

```tsx
// app/layout.tsx
import { PayGateProvider } from '@filano/paygate-next/client'

export default function Layout({ children }) {
  return (
    <PayGateProvider authToken="your-token">
      {children}
    </PayGateProvider>
  )
}
```

```tsx
// app/page.tsx
'use client'
import { usePayGate } from '@filano/paygate-next/client'

export default function Page() {
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
</details>

## 🔧 Compatibilité

### Frameworks supportés

- **React** 16.8+, 17, 18, 19 (Hooks requis)
- **Vue** 3.0+, 3.5+ (Composition API)
- **Nuxt** 3.0+, 4.0+ (App Router)
- **Next.js** 12, 13, 14, 15 (Pages & App Router)

### Environnements

- **Node.js** 16, 18, 20, 22+
- **Browsers** modernes (ES2020+)
- **TypeScript** 4.5+, 5.0+
- **Bundlers** Vite, Webpack, Rollup, Parcel

## 🏗️ Architecture

```
paygate-js-sdk/
├── packages/
│   ├── core/           # Client JavaScript de base
│   ├── react/          # Hooks et composants React
│   ├── vue/            # Composables et plugin Vue
│   ├── nuxt/           # Module Nuxt avec auto-imports
│   └── next/           # Plugin Next.js avec API routes
├── docs/               # Documentation VitePress
└── examples/           # Exemples d'intégration
```

## 🌍 Réseaux supportés

| Réseau | Code | Opérateur | Pays |
|--------|------|-----------|------|
| **FLOOZ** | `FLOOZ` | Moov Africa Togo | 🇹🇬 Togo |
| **T-Money** | `TMONEY` | Togocel | 🇹🇬 Togo |

## 📖 Documentation

- 📚 **[Guide complet](./docs/)** - Documentation détaillée
- 🚀 **[Démarrage rapide](./docs/guide/quick-start.md)** - Installation en 5 minutes
- ⚙️ **[Configuration](./docs/guide/configuration.md)** - Options avancées
- 🔧 **[API Reference](./docs/api/)** - Documentation complète de l'API
- 💡 **[Exemples](./examples/)** - Cas d'usage concrets

## 🧪 Tests

Le SDK inclut une suite de tests complète :

```bash
# Installer les dépendances
pnpm install

# Lancer tous les tests
pnpm test

# Tests avec coverage
pnpm test:coverage

# Tests spécifiques à un package
pnpm test --filter @filano/paygate-react
```

## 🔄 Développement

```bash
# Cloner le repository
git clone https://github.com/filano/paygate-js-sdk.git
cd paygate-js-sdk

# Installer les dépendances (pnpm requis)
pnpm install

# Développement avec watch mode
pnpm dev

# Build tous les packages
pnpm build

# Lancer les tests
pnpm test

# Documentation locale
pnpm docs:dev
```

## 📝 Changelog

Voir [CHANGELOG.md](./CHANGELOG.md) pour l'historique des versions.

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](./CONTRIBUTING.md) pour les guidelines.

### Comment contribuer

1. **Fork** le projet
2. **Créez** une branche feature (`git checkout -b feature/awesome-feature`)
3. **Committez** vos changements (`git commit -m 'Add awesome feature'`)
4. **Pushez** sur la branche (`git push origin feature/awesome-feature`)
5. **Ouvrez** une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir [LICENSE](./LICENSE) pour plus de détails.

## 🌍 À propos de PayGateGlobal

**PayGateGlobal** est le **premier intégrateur de paiement en ligne au Togo** et le moyen le plus rapide de recevoir des paiements en ligne via les portefeuilles mobiles africains.

### 💰 Tarification
- **FLOOZ (Moov Togo)** : 2,5% par transaction
- **T-Money (Togocel)** : 3% par transaction

### 🌍 Couverture
- **Togo** 🇹🇬 - FLOOZ et T-Money
- **Expansion en cours** vers d'autres pays d'Afrique de l'Ouest

## 🙏 Support

### Support PayGateGlobal Officiel
- 🌐 **Site web** : [https://paygateglobal.com/](https://paygateglobal.com/)
- 📧 **Email** : info@paygateglobal.com
- 📞 **Téléphones** : 
  - +228 96 96 21 21
  - +228 92 60 50 32
- 📍 **Localisation** : Lomé, Togo

### Support du SDK Communautaire
- 🐛 **Issues** : [GitHub Issues](https://github.com/filano/paygate-js-sdk/issues)
- 💬 **Discussions** : [GitHub Discussions](https://github.com/filano/paygate-js-sdk/discussions)
- 📖 **Documentation** : [Guide complet](./docs/)

### 💝 Soutenir le Développement

Si ce SDK vous fait gagner du temps, vous pouvez soutenir son développement :

- 💝 **[Faire un don via FedaPay](https://me.fedapay.com/filano_don)**
- ⭐ **[Star le projet sur GitHub](https://github.com/filano/paygate-js-sdk)**
- 📢 **Partagez avec la communauté** JavaScript africaine
- 🔗 **Utilisez nos autres packages** : [Laravel PayGate](https://github.com/filanodev/laravel-paygate-global)

## 🎯 Roadmap

- [ ] Support Stripe-like checkout
- [ ] Plugin WordPress/WooCommerce
- [ ] SDK React Native
- [ ] Extension VSCode
- [ ] CLI pour scaffolding
- [ ] Support d'autres réseaux africains

## 👨‍💻 Auteur

**Filano** - Développeur Full Stack passionné par l'écosystème JavaScript et les solutions de paiement en Afrique.

- 🌐 Website: [filano.dev](https://filano.dev)
- 💼 LinkedIn: [linkedin.com/in/filano](https://linkedin.com/in/filano)
- 🐦 Twitter: [@filano_dev](https://twitter.com/filano_dev)
- 💝 Donation: [me.fedapay.com/filano_don](https://me.fedapay.com/filano_don)

---

<div align="center">

**PayGate JS SDK** - Simplifie l'intégration de PayGateGlobal dans l'écosystème JavaScript

Développé avec ❤️ pour la communauté des développeurs africains

</div>