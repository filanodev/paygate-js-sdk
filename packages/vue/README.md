# @filano/paygate-vue

[![npm version](https://img.shields.io/npm/v/@filano/paygate-vue.svg)](https://www.npmjs.com/package/@filano/paygate-vue)

Plugin Vue.js pour l'intégration de PayGateGlobal avec composables et composants - Support FLOOZ et T-Money.

> 📝 **Package communautaire** développé par [Filano](https://me.fedapay.com/filano_don) pour aider les développeurs Vue.js à intégrer plus rapidement PayGateGlobal.

## Installation

```bash
npm install @filano/paygate-vue
# ou
yarn add @filano/paygate-vue
# ou
pnpm add @filano/paygate-vue
```

## Configuration

### Option 1 : Plugin global (recommandé)

```javascript
// main.js
import { createApp } from 'vue'
import PayGatePlugin from '@filano/paygate-vue'
import App from './App.vue'

const app = createApp(App)

app.use(PayGatePlugin, {
  authToken: 'your-paygate-token',
  verifySSL: false // pour le développement local uniquement
})

app.mount('#app')
```

### Option 2 : Création manuelle

```javascript
// main.js
import { createApp } from 'vue'
import { createPayGate } from '@filano/paygate-vue'
import App from './App.vue'

const app = createApp(App)
const paygate = createPayGate({
  authToken: 'your-paygate-token'
})

app.use(paygate)
app.mount('#app')
```

## Usage avec Composition API

### Composable principal

```vue
<template>
  <div>
    <button @click="handlePayment" :disabled="loading">
      {{ loading ? 'Traitement...' : 'Payer 1000 FCFA' }}
    </button>

    <div v-if="error" class="error">
      {{ error }}
      <button @click="clearError">×</button>
    </div>

    <div v-if="lastPayment">
      Paiement initié: {{ lastPayment.txReference }}
    </div>
  </div>
</template>

<script setup>
import { usePayGate } from '@filano/paygate-vue'

const { 
  initiatePayment, 
  loading, 
  error, 
  lastPayment, 
  clearError 
} = usePayGate()

const handlePayment = async () => {
  await initiatePayment({
    phoneNumber: '+22890123456',
    amount: 1000,
    identifier: `ORDER_${Date.now()}`,
    network: 'FLOOZ',
    description: 'Test paiement Vue.js'
  })
}
</script>
```

### Composable pour initiation de paiement

```vue
<script setup>
import { usePaymentInitiation } from '@filano/paygate-vue'

const { 
  initiate, 
  loading, 
  error, 
  paymentResult, 
  isSuccess, 
  reset 
} = usePaymentInitiation()

const handlePayment = async () => {
  const result = await initiate({
    phoneNumber: '+22890123456',
    amount: 1500,
    identifier: 'ORDER_123',
    network: 'TMONEY'
  })
  
  if (result) {
    console.log('Paiement:', result)
  }
}
</script>
```

### Composable pour vérification de statut

```vue
<template>
  <div>
    <input v-model="reference" placeholder="TX_REFERENCE">
    <button @click="check" :disabled="loading">
      Vérifier le statut
    </button>
    
    <button @click="startPolling" :disabled="isPolling">
      📡 Surveillance auto
    </button>
    
    <button @click="stopPolling" v-if="isPolling">
      ⏹ Arrêter
    </button>

    <div v-if="status">
      <strong>{{ status.message }}</strong><br>
      Montant: {{ status.amount }} FCFA<br>
      Méthode: {{ status.paymentMethod }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePaymentStatus } from '@filano/paygate-vue'

const reference = ref('')

const { 
  status, 
  loading, 
  error, 
  isPolling, 
  check, 
  startPolling, 
  stopPolling, 
  reset 
} = usePaymentStatus(reference, 5000) // polling toutes les 5s
</script>
```

## Composants prêts à l'emploi

### PaymentForm

Formulaire de paiement complet avec validation :

```vue
<template>
  <PaymentForm 
    @success="onPaymentSuccess"
    @error="onPaymentError"
    submit-label="Payer maintenant"
    :show-reset="true"
    default-description="Achat produit XYZ"
    identifier-prefix="SHOP"
  />
</template>

<script setup>
import { PaymentForm } from '@filano/paygate-vue'

const onPaymentSuccess = (result) => {
  console.log('Paiement réussi:', result)
  // Rediriger ou afficher confirmation
}

const onPaymentError = (error) => {
  console.error('Erreur paiement:', error)
}
</script>
```

### StatusChecker

Composant pour vérifier les statuts :

```vue
<template>
  <StatusChecker 
    :show-polling="true"
    :poll-interval="3000"
    @status-updated="onStatusUpdate"
    @error="onError"
  />
</template>

<script setup>
import { StatusChecker } from '@filano/paygate-vue'

const onStatusUpdate = (status) => {
  console.log('Nouveau statut:', status)
}

const onError = (error) => {
  console.error('Erreur:', error)
}
</script>
```

## Usage avec Options API

```vue
<script>
export default {
  data() {
    return {
      loading: false,
      paymentResult: null
    }
  },
  methods: {
    async handlePayment() {
      this.loading = true
      
      try {
        const result = await this.$paygate.initiatePayment({
          phoneNumber: '+22890123456',
          amount: 2000,
          identifier: `ORDER_${Date.now()}`,
          network: 'FLOOZ'
        })
        
        this.paymentResult = result
      } catch (error) {
        console.error('Erreur:', error.message)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
```

## Types TypeScript

Le package inclut tous les types TypeScript :

```typescript
import type { 
  PayGatePluginOptions,
  UsePayGateState,
  PayGateNetwork,
  InitiatePaymentParams,
  PaymentStatus 
} from '@filano/paygate-vue'
```

## API des composables

### usePayGate()

Composable principal avec toutes les fonctionnalités :

```typescript
const {
  // État
  loading: Ref<boolean>,
  error: Ref<string | null>,
  lastPayment: Ref<PaymentResponse | null>,
  lastStatus: Ref<PaymentStatus | null>,

  // Actions
  clearError: () => void,
  initiatePayment: (params) => Promise<PaymentResponse | null>,
  generatePaymentUrl: (params) => PaymentUrlResponse | null,
  checkPaymentStatus: (reference) => Promise<PaymentStatus | null>,
  checkPaymentStatusByIdentifier: (identifier) => Promise<PaymentStatus | null>,
  checkStatus: (reference) => Promise<PaymentStatus | null>,
  disburse: (params) => Promise<PaymentResponse | null>,
  checkBalance: () => Promise<Balance | null>,

  // Client direct
  client: PayGateClient
} = usePayGate()
```

### usePaymentInitiation()

Composable spécialisé pour l'initiation de paiements :

```typescript
const {
  loading: Ref<boolean>,
  error: Ref<string | null>,
  paymentResult: Ref<PaymentResponse | null>,
  isSuccess: Ref<boolean>,
  initiate: (params) => Promise<PaymentResponse | null>,
  reset: () => void,
  clearError: () => void
} = usePaymentInitiation()
```

### usePaymentStatus(reference, pollInterval?)

Composable pour la vérification de statut avec polling optionnel :

```typescript
const {
  status: Ref<PaymentStatus | null>,
  loading: Ref<boolean>,
  error: Ref<string | null>,
  isPolling: Ref<boolean>,
  check: () => Promise<PaymentStatus | null>,
  startPolling: () => void,
  stopPolling: () => void,
  reset: () => void
} = usePaymentStatus(reference, pollInterval)
```

## Gestion des erreurs

```vue
<script setup>
import { usePayGate, PayGateError } from '@filano/paygate-vue'

const { initiatePayment } = usePayGate()

const handlePayment = async () => {
  try {
    await initiatePayment(params)
  } catch (error) {
    if (error instanceof PayGateError) {
      console.error('Erreur PayGate:', error.status, error.message)
    }
  }
}
</script>
```

## Support

Pour toute question sur ce package, créez une issue sur GitHub.

Pour le support PayGateGlobal officiel :
- Site : [https://paygateglobal.com/](https://paygateglobal.com/)
- Email : info@paygateglobal.com

## Licence

MIT