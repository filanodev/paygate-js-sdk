# Installation rapide

Commencez à utiliser PayGate SDK en moins de 5 minutes ! 

## 1. Choisir votre framework

::: code-group
```bash [React]
npm install @filanodev/paygate-react
```

```bash [Vue.js]
npm install @filanodev/paygate-vue
```

```bash [Nuxt]
npm install @filanodev/paygate-nuxt
```

```bash [Next.js]
npm install @filanodev/paygate-next
```

```bash [JavaScript Pur]
npm install @filanodev/paygate-core
```
:::

## 2. Configuration

Créez un fichier `.env` avec vos credentials PayGateGlobal :

```bash
PAYGATE_TOKEN=your-paygate-token
```

::: tip 💡 Obtenir un token
Créez votre compte sur [PayGateGlobal](https://paygateglobal.com/) pour obtenir votre token d'authentification.
:::

## 3. Intégration

### React

::: code-group
```jsx [App.jsx]
import { PayGateProvider } from '@filanodev/paygate-react'
import PaymentButton from './PaymentButton'

function App() {
  return (
    <PayGateProvider
      authToken={process.env.REACT_APP_PAYGATE_TOKEN}
          >
      <PaymentButton />
    </PayGateProvider>
  )
}

export default App
```

```jsx [PaymentButton.jsx]
import { usePayGate } from '@filanodev/paygate-react'

function PaymentButton() {
  const { initiatePayment, loading, lastPayment, error } = usePayGate()
  
  const handlePayment = async () => {
    const result = await initiatePayment({
      phoneNumber: '+22890123456',
      amount: 1000,
      identifier: `ORDER_${Date.now()}`,
      network: 'FLOOZ',
      description: 'Premier paiement test'
    })
    
    if (result) {
      alert(`Paiement initié ! Référence: ${result.txReference}`)
    }
  }
  
  return (
    <div>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Traitement...' : 'Payer 1000 FCFA'}
      </button>
      
      {error && <p style={{color: 'red'}}>Erreur: {error}</p>}
      
      {lastPayment && (
        <p style={{color: 'green'}}>
          ✅ Paiement initié: {lastPayment.txReference}
        </p>
      )}
    </div>
  )
}

export default PaymentButton
```
:::

### Vue.js

::: code-group
```js [main.js]
import { createApp } from 'vue'
import { PayGatePlugin } from '@filanodev/paygate-vue'
import App from './App.vue'

const app = createApp(App)

app.use(PayGatePlugin, {
  authToken: import.meta.env.VITE_PAYGATE_TOKEN,
  })

app.mount('#app')
```

```vue [App.vue]
<template>
  <div>
    <h1>PayGate Vue Demo</h1>
    
    <button @click="handlePayment" :disabled="loading">
      {{ loading ? 'Traitement...' : 'Payer 1000 FCFA' }}
    </button>
    
    <p v-if="error" style="color: red">
      Erreur: {{ error }}
    </p>
    
    <p v-if="lastPayment" style="color: green">
      ✅ Paiement initié: {{ lastPayment.txReference }}
    </p>
  </div>
</template>

<script setup>
import { usePayGate } from '@filanodev/paygate-vue'

const { initiatePayment, loading, lastPayment, error } = usePayGate()

const handlePayment = async () => {
  const result = await initiatePayment({
    phoneNumber: '+22890123456',
    amount: 1000,
    identifier: `ORDER_${Date.now()}`,
    network: 'FLOOZ',
    description: 'Premier paiement test'
  })
  
  if (result) {
    alert(`Paiement initié ! Référence: ${result.txReference}`)
  }
}
</script>
```
:::

### Nuxt

::: code-group
```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@filanodev/paygate-nuxt'],
  
  paygate: {
    authToken: process.env.PAYGATE_TOKEN,
      }
})
```

```vue [pages/payment.vue]
<template>
  <div>
    <h1>PayGate Nuxt Demo</h1>
    
    <button @click="handlePayment" :disabled="loading">
      {{ loading ? 'Traitement...' : 'Payer 1000 FCFA' }}
    </button>
    
    <p v-if="error" style="color: red">
      Erreur: {{ error }}
    </p>
    
    <p v-if="lastPayment" style="color: green">
      ✅ Paiement initié: {{ lastPayment.txReference }}
    </p>
  </div>
</template>

<script setup>
// Auto-importé grâce au module Nuxt
const { initiatePayment, loading, lastPayment, error } = usePayGate()

const handlePayment = async () => {
  const result = await initiatePayment({
    phoneNumber: '+22890123456',
    amount: 1000,
    identifier: `ORDER_${Date.now()}`,
    network: 'FLOOZ',
    description: 'Premier paiement test'
  })
  
  if (result) {
    alert(`Paiement initié ! Référence: ${result.txReference}`)
  }
}
</script>
```
:::

### Next.js

::: code-group
```tsx [app/layout.tsx]
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
                  >
          {children}
        </PayGateProvider>
      </body>
    </html>
  )
}
```

```tsx [app/page.tsx]
'use client'

import { usePayGate } from '@filanodev/paygate-next/client'

export default function HomePage() {
  const { initiatePayment, loading, lastPayment, error } = usePayGate()
  
  const handlePayment = async () => {
    const result = await initiatePayment({
      phoneNumber: '+22890123456',
      amount: 1000,
      identifier: `ORDER_${Date.now()}`,
      network: 'FLOOZ',
      description: 'Premier paiement test'
    })
    
    if (result) {
      alert(`Paiement initié ! Référence: ${result.txReference}`)
    }
  }
  
  return (
    <div>
      <h1>PayGate Next.js Demo</h1>
      
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Traitement...' : 'Payer 1000 FCFA'}
      </button>
      
      {error && <p style={{color: 'red'}}>Erreur: {error}</p>}
      
      {lastPayment && (
        <p style={{color: 'green'}}>
          ✅ Paiement initié: {lastPayment.txReference}
        </p>
      )}
    </div>
  )
}
```
:::

### JavaScript Pur

```js
import { PayGateClient } from '@filanodev/paygate-core'

const client = new PayGateClient({
  authToken: 'your-paygate-token',
  })

// Initier un paiement
const payment = await client.initiatePayment({
  phoneNumber: '+22890123456',
  amount: 1000,
  identifier: `ORDER_${Date.now()}`,
  network: 'FLOOZ',
  description: 'Premier paiement test'
})

console.log('Paiement initié:', payment.txReference)

// Vérifier le statut
const status = await client.checkStatus(payment.txReference)
console.log('Statut:', status.message)
```

## 4. Test et validation

### Numéros de test (Sandbox)

Utilisez ces numéros pour tester vos intégrations :

| Réseau | Numéro | Comportement |
|--------|---------|--------------|
| FLOOZ | `+22890123456` | ✅ Succès immédiat |
| FLOOZ | `+22890123457` | ⏳ En attente |
| FLOOZ | `+22890123458` | ❌ Échec |
| T-Money | `+22870123456` | ✅ Succès immédiat |
| T-Money | `+22870123457` | ⏳ En attente |
| T-Money | `+22870123458` | ❌ Échec |

### Vérification du statut

```js
// Après initiation, vérifiez le statut
const checkPaymentStatus = async (txReference) => {
  const status = await client.checkStatus(txReference)
  
  switch (status.status) {
    case 0:
      console.log('✅ Paiement réussi')
      break
    case 1:
    case 2:
    case 3:
      console.log('⏳ Paiement en cours...')
      break
    case 4:
    case 5:
    case 6:
      console.log('❌ Paiement échoué')
      break
    case 7:
      console.log('⏰ Paiement expiré')
      break
    default:
      console.log('❓ Statut inconnu')
  }
}
```

## 5. Composants prêts à l'emploi

### Formulaire de paiement complet

::: code-group
```jsx [React]
import { PaymentForm } from '@filanodev/paygate-react'

function CheckoutPage() {
  const handleSuccess = (result) => {
    console.log('Paiement réussi:', result.txReference)
    // Rediriger vers la page de succès
  }

  const handleError = (error) => {
    console.error('Erreur:', error)
    // Afficher une notification d'erreur
  }

  return (
    <PaymentForm
      onSuccess={handleSuccess}
      onError={handleError}
      submitLabel="Finaliser le paiement"
      defaultDescription="Commande #12345"
    />
  )
}
```

```vue [Vue]
<template>
  <PaymentForm
    @success="handleSuccess"
    @error="handleError"
    submit-label="Finaliser le paiement"
    default-description="Commande #12345"
  />
</template>

<script setup>
import { PaymentForm } from '@filanodev/paygate-vue'

const handleSuccess = (result) => {
  console.log('Paiement réussi:', result.txReference)
}

const handleError = (error) => {
  console.error('Erreur:', error)
}
</script>
```
:::

### Vérificateur de statut

::: code-group
```jsx [React]
import { StatusChecker } from '@filanodev/paygate-react'

function StatusPage() {
  const handleStatusUpdate = (status) => {
    console.log('Nouveau statut:', status)
  }

  return (
    <StatusChecker
      showPolling={true}
      pollInterval={5000}
      onStatusUpdated={handleStatusUpdate}
    />
  )
}
```

```vue [Vue]
<template>
  <StatusChecker
    :show-polling="true"
    :poll-interval="5000"
    @status-updated="handleStatusUpdate"
  />
</template>

<script setup>
import { StatusChecker } from '@filanodev/paygate-vue'

const handleStatusUpdate = (status) => {
  console.log('Nouveau statut:', status)
}
</script>
```
:::

## 6. Déploiement

### Variables d'environnement de production

```bash
# Production
PAYGATE_TOKEN=prod_your_real_token_here
PAYGATE_ENVIRONMENT=production
```

::: warning ⚠️ Sécurité
- Utilisez des tokens différents pour sandbox et production
- Ne committez jamais vos tokens dans le code source
- Activez toujours SSL en production (`verifySSL: true`)
:::

### Exemple de déploiement

```js
// config/paygate.js
const config = {
  authToken: process.env.PAYGATE_TOKEN,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  verifySSL: process.env.NODE_ENV === 'production'
}

export default config
```

## Prochaines étapes

🎉 **Félicitations !** Vous avez intégré PayGate SDK dans votre application.

Continuez avec :
- [Configuration avancée](/guide/configuration) - Personnalisez votre intégration
- [Gestion des erreurs](/guide/error-handling) - Gérez les cas d'erreur
- [Webhooks](/guide/webhooks) - Recevez des notifications automatiques
- [Exemples](/examples/) - Découvrez des cas d'usage concrets

---

**Besoin d'aide ?** 
- 📖 Consultez la [documentation complète](/guide/)
- 💬 Posez vos questions sur [GitHub Discussions](https://github.com/filano/paygate-js-sdk/discussions)
- 🐛 Signalez un bug via [GitHub Issues](https://github.com/filano/paygate-js-sdk/issues)