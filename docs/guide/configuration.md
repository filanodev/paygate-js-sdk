# Configuration

## Variables d'environnement

Toutes les intégrations PayGate nécessitent un token d'authentification.

### Variables requises

::: code-group
```bash [.env]
# Token d'authentification PayGateGlobal
PAYGATE_TOKEN=your-paygate-token-here

# Optionnel : Désactiver SSL pour le développement local
PAYGATE_VERIFY_SSL=false
```

```bash [.env.local (Next.js)]
# Next.js - Variables publiques avec NEXT_PUBLIC_
NEXT_PUBLIC_PAYGATE_TOKEN=your-token

# Variables serveur (sans NEXT_PUBLIC_)
PAYGATE_TOKEN=your-token
```

```bash [.env (Nuxt)]
# Nuxt - Variables publiques automatiques
NUXT_PUBLIC_PAYGATE_TOKEN=your-token

# Variables privées serveur
PAYGATE_TOKEN=your-token
```
:::

### Obtenir votre token

1. **Créez un compte** sur [PayGateGlobal](https://paygateglobal.com/)
2. **Accédez au dashboard** développeur
3. **Générez un token** pour votre application

## Configuration par framework

### Core JavaScript

```js
import { PayGateClient } from '@filanodev/paygate-core'

const client = new PayGateClient({
  authToken: process.env.PAYGATE_TOKEN,
  verifySSL: true // false pour dev local uniquement
})
```

### React

```jsx
// App.jsx
import { PayGateProvider } from '@filanodev/paygate-react'

function App() {
  return (
    <PayGateProvider
      authToken={process.env.REACT_APP_PAYGATE_TOKEN}
      verifySSL={process.env.NODE_ENV === 'production'}
    >
      <YourApp />
    </PayGateProvider>
  )
}
```

### Vue.js

```js
// main.js
import { createApp } from 'vue'
import { PayGatePlugin } from '@filanodev/paygate-vue'
import App from './App.vue'

const app = createApp(App)

app.use(PayGatePlugin, {
  authToken: import.meta.env.VITE_PAYGATE_TOKEN,
  verifySSL: import.meta.env.PROD
})

app.mount('#app')
```

### Nuxt

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@filanodev/paygate-nuxt'],
  
  paygate: {
    authToken: process.env.PAYGATE_TOKEN,
    verifySSL: process.env.NODE_ENV === 'production',
    
    // Options avancées
    autoImports: true,
    prefix: 'paygate',
    serverUtils: true
  }
})
```

### Next.js

::: code-group
```tsx [App Router]
// app/layout.tsx
import { PayGateProvider } from '@filanodev/paygate-next/client'

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <PayGateProvider
          authToken={process.env.NEXT_PUBLIC_PAYGATE_TOKEN!}
          verifySSL={process.env.NODE_ENV === 'production'}
        >
          {children}
        </PayGateProvider>
      </body>
    </html>
  )
}
```

```tsx [Pages Router]
// pages/_app.tsx
import type { AppProps } from 'next/app'
import { PayGateProvider } from '@filanodev/paygate-next/client'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PayGateProvider
      authToken={process.env.NEXT_PUBLIC_PAYGATE_TOKEN!}
      verifySSL={process.env.NODE_ENV === 'production'}
    >
      <Component {...pageProps} />
    </PayGateProvider>
  )
}
```
:::

## Options de configuration

### PayGateConfig

```ts
interface PayGateConfig {
  // Token d'authentification (requis)
  authToken: string
  
  // Environnement d'exécution
  environment: 'sandbox' | 'production'
  
  // Vérification SSL (optionnel, défaut: true)
  verifySSL?: boolean
}
```

### Options par environnement

#### Environnement Sandbox

```js
{
  authToken: 'sandbox_token_here',
  environment: 'sandbox',
  verifySSL: false // Peut être désactivé pour les tests
}
```

**Caractéristiques :**
- 💰 **Pas de frais réels**
- 🔄 **Transactions simulées**
- 🧪 **Idéal pour les tests**
- ⚡ **Réponses rapides**

#### Environnement Production

```js
{
  authToken: 'production_token_here',
  environment: 'production',
  verifySSL: true // Toujours true en production
}
```

**Caractéristiques :**
- 💸 **Transactions réelles**
- 🔒 **SSL obligatoire**
- 📊 **Monitoring complet**
- ⏱️ **Latence réseau réelle**

## Configuration avancée

### Client personnalisé avec options

```js
import { PayGateClient } from '@filanodev/paygate-core'

const client = new PayGateClient({
  authToken: process.env.PAYGATE_TOKEN,
  environment: 'sandbox',
  verifySSL: true,
  
  // Options custom (si supportées dans le futur)
  timeout: 30000, // 30 secondes
  retries: 3,
  baseUrl: 'https://api.custom.com' // URL personnalisée
})
```

### Configuration par composant

```jsx
// React - Configuration locale
import { PayGateProvider } from '@filanodev/paygate-react'

function CheckoutPage() {
  const checkoutConfig = {
    authToken: 'specific-token',
    environment: 'production',
    verifySSL: true
  }
  
  return (
    <PayGateProvider {...checkoutConfig}>
      <CheckoutForm />
    </PayGateProvider>
  )
}
```

### Multi-tenancy

```js
// Gestion de plusieurs comptes PayGate
const clients = {
  tenant1: new PayGateClient({
    authToken: process.env.TENANT1_PAYGATE_TOKEN,
    environment: 'production'
  }),
  
  tenant2: new PayGateClient({
    authToken: process.env.TENANT2_PAYGATE_TOKEN,
    environment: 'sandbox'
  })
}

// Utilisation
const payment = await clients.tenant1.initiatePayment(params)
```

## Sécurité

### Protection des tokens

::: warning ⚠️ Sécurité des tokens
- ❌ **Ne jamais exposer** les tokens de production côté client
- ✅ **Utilisez des variables d'environnement** pour les tokens
- ✅ **Séparez** les tokens sandbox et production
- ✅ **Implémentez** une rotation régulière des tokens
:::

### Côté client vs serveur

::: code-group
```js [❌ Côté client - DANGEREUX]
// N'exposez JAMAIS un token de production côté client
const client = new PayGateClient({
  authToken: 'prod_secret_token', // ❌ EXPOSÉ
  environment: 'production'
})
```

```js [✅ Côté serveur - SÉCURISÉ]
// API route ou serveur
const client = new PayGateClient({
  authToken: process.env.PAYGATE_TOKEN, // ✅ SÉCURISÉ
  environment: 'production'
})
```
:::

### Variables d'environnement sécurisées

::: code-group
```bash [✅ Production]
# Variables côté serveur uniquement
PAYGATE_TOKEN=prod_very_secret_token
PAYGATE_ENVIRONMENT=production

# Variables publiques (si nécessaire)
NEXT_PUBLIC_PAYGATE_ENVIRONMENT=production
# PAS de token public en production
```

```bash [✅ Développement]
# OK pour exposer en sandbox
NEXT_PUBLIC_PAYGATE_TOKEN=sandbox_token
NEXT_PUBLIC_PAYGATE_ENVIRONMENT=sandbox
PAYGATE_VERIFY_SSL=false
```
:::

## Validation de la configuration

### Vérification automatique

```js
import { PayGateClient } from '@filanodev/paygate-core'

try {
  const client = new PayGateClient({
    authToken: '', // ❌ Vide
    environment: 'sandbox'
  })
} catch (error) {
  console.error('Configuration invalide:', error.message)
  // Erreur: Token d'authentification requis
}
```

### Validation manuelle

```js
function validateConfig(config) {
  const errors = []
  
  if (!config.authToken) {
    errors.push('Token d\'authentification manquant')
  }
  
  if (!['sandbox', 'production'].includes(config.environment)) {
    errors.push('Environnement invalide (sandbox ou production)')
  }
  
  if (config.environment === 'production' && config.verifySSL === false) {
    errors.push('SSL obligatoire en production')
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration invalide: ${errors.join(', ')}`)
  }
  
  return true
}
```

### Test de connectivité

```js
async function testConnection(client) {
  try {
    // Test avec la vérification de solde
    const balance = await client.checkBalance()
    console.log('✅ Connexion PayGate réussie')
    console.log('💰 Solde:', balance)
    return true
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message)
    return false
  }
}

// Utilisation
const client = new PayGateClient(config)
await testConnection(client)
```

## Dépannage

### Erreurs courantes

#### Token invalide
```bash
Error: Unauthorized - Invalid token
```
**Solution :** Vérifiez que votre token est correct et actif.

#### Environnement incorrect
```bash
Error: Environment mismatch
```
**Solution :** Assurez-vous que le token correspond à l'environnement.

#### SSL en production
```bash
Error: SSL verification failed
```
**Solution :** Activez `verifySSL: true` en production.

#### Variable manquante
```bash
Error: PAYGATE_TOKEN is not defined
```
**Solution :** Vérifiez vos variables d'environnement.

### Debug

```js
// Activer les logs en développement
if (process.env.NODE_ENV === 'development') {
  console.log('PayGate Config:', {
    environment: config.environment,
    tokenLength: config.authToken.length,
    verifySSL: config.verifySSL
  })
}
```

## Prochaines étapes

- [Concepts de base](/guide/concepts) - Comprendre les concepts PayGate
- [Initier un paiement](/guide/initiate-payment) - Votre premier paiement
- [Gestion des erreurs](/guide/error-handling) - Gérer les erreurs