# @filanodev/paygate-nuxt

[![npm version](https://img.shields.io/npm/v/@filanodev/paygate-nuxt.svg)](https://www.npmjs.com/package/@filanodev/paygate-nuxt)

Module Nuxt 3/4 pour l'intégration de PayGateGlobal - Support FLOOZ et T-Money.

> 📝 **Package communautaire** développé par [Filano](https://me.fedapay.com/filano_don) pour aider les développeurs Nuxt à intégrer plus rapidement PayGateGlobal.

## Fonctionnalités

- ✅ **Nuxt 3 & Nuxt 4** - Support complet des versions modernes
- 🔄 **SSR/SPA/SSG** - Compatible avec tous les modes de rendu Nuxt
- 🎯 **Auto-imports** - Composables disponibles globalement
- 🛠 **TypeScript** - Support complet avec types
- ⚡ **Plugin auto** - Configuration automatique
- 🔧 **Utilitaires serveur** - API routes simplifiées

## Installation

```bash
npm install @filanodev/paygate-nuxt
# ou
yarn add @filanodev/paygate-nuxt
# ou
pnpm add @filanodev/paygate-nuxt
```

## Configuration

### Configuration de base

Ajoutez le module dans votre `nuxt.config.ts` :

```typescript
export default defineNuxtConfig({
  modules: [
    '@filanodev/paygate-nuxt'
  ],
  paygate: {
    authToken: process.env.PAYGATE_TOKEN,
    verifySSL: false // pour le développement local uniquement
  }
})
```

### Configuration avancée

```typescript
export default defineNuxtConfig({
  modules: [
    '@filanodev/paygate-nuxt'
  ],
  paygate: {
    // Configuration PayGate
    authToken: process.env.PAYGATE_TOKEN,
    verifySSL: true,
    
    // Options du module
    autoImports: true, // Auto-import des composables
    prefix: 'paygate', // Préfixe des composables
    serverUtils: true // Activer les utilitaires serveur
  }
})
```

### Variables d'environnement

Créez un fichier `.env` :

```env
PAYGATE_TOKEN=your-paygate-token-here
```

## Usage avec les Composables

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

    <div v-if="lastPayment" class="success">
      Paiement initié: {{ lastPayment.txReference }}
    </div>
  </div>
</template>

<script setup>
// Auto-importé automatiquement
const { 
  initiatePayment, 
  loading, 
  error, 
  lastPayment, 
  clearError 
} = usePayGate()

const handlePayment = async () => {
  const result = await initiatePayment({
    phoneNumber: '+22890123456',
    amount: 1000,
    identifier: `ORDER_${Date.now()}`,
    network: 'FLOOZ',
    description: 'Test paiement Nuxt'
  })
  
  if (result) {
    console.log('Paiement initié:', result.txReference)
  }
}
</script>
```

### Composable spécialisé pour l'initiation

```vue
<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <input v-model="form.phoneNumber" placeholder="+22890123456" />
      <input v-model.number="form.amount" type="number" placeholder="Montant" />
      <select v-model="form.network">
        <option value="FLOOZ">FLOOZ</option>
        <option value="TMONEY">T-Money</option>
      </select>
      
      <button type="submit" :disabled="loading">
        {{ loading ? 'Initiation...' : 'Initier paiement' }}
      </button>
    </form>

    <div v-if="isSuccess" class="success">
      ✅ Paiement réussi: {{ paymentResult.txReference }}
    </div>

    <button @click="reset">Reset</button>
  </div>
</template>

<script setup>
const { initiate, loading, error, paymentResult, isSuccess, reset } = usePaymentInitiation()

const form = reactive({
  phoneNumber: '',
  amount: 0,
  network: 'FLOOZ'
})

const handleSubmit = async () => {
  await initiate({
    phoneNumber: form.phoneNumber,
    amount: form.amount,
    identifier: `ORDER_${Date.now()}`,
    network: form.network,
    description: 'Paiement depuis Nuxt'
  })
}
</script>
```

### Composable pour vérification de statut

```vue
<template>
  <div>
    <input v-model="reference" placeholder="TX_REFERENCE" />
    
    <button @click="check" :disabled="loading">
      Vérifier statut
    </button>
    
    <button @click="startPolling" :disabled="isPolling">
      📡 Surveillance auto
    </button>
    
    <button @click="stopPolling" :disabled="!isPolling">
      ⏹ Arrêter
    </button>

    <div v-if="status">
      <strong>{{ status.message }}</strong><br>
      Montant: {{ status.amount }} FCFA<br>
      Méthode: {{ status.paymentMethod }}
    </div>

    <div v-if="isPolling">
      🔄 Surveillance en cours...
    </div>
  </div>
</template>

<script setup>
const reference = ref('')

const { 
  status, 
  loading, 
  error, 
  isPolling, 
  check, 
  startPolling, 
  stopPolling 
} = usePaymentStatus(reference, 5000) // polling toutes les 5s
</script>
```

## Usage côté serveur

### Dans les API routes

Créez `server/api/payment/initiate.post.ts` :

```typescript
import { serverInitiatePayment } from '#paygate/server/utils'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  try {
    const result = await serverInitiatePayment({
      phoneNumber: body.phoneNumber,
      amount: body.amount,
      identifier: `API_${Date.now()}`,
      network: body.network,
      description: body.description
    })
    
    return result
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }
})
```

Créez `server/api/payment/status/[reference].get.ts` :

```typescript
import { serverCheckPaymentStatus } from '#paygate/server/utils'

export default defineEventHandler(async (event) => {
  const reference = getRouterParam(event, 'reference')
  
  try {
    const status = await serverCheckPaymentStatus(reference!)
    return status
  } catch (error) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Paiement non trouvé'
    })
  }
})
```

### Dans les server utils

```typescript
// utils/payment.server.ts
import { getPayGateClient } from '#paygate/server/utils'

export async function processPayment(orderData: any) {
  const client = getPayGateClient()
  
  return await client.initiatePayment({
    phoneNumber: orderData.phone,
    amount: orderData.total,
    identifier: orderData.id,
    network: orderData.network,
    description: `Commande ${orderData.id}`
  })
}
```

## Exemple complet

```vue
<template>
  <div class="payment-page">
    <h1>Paiement PayGate</h1>
    
    <!-- Formulaire de paiement -->
    <form @submit.prevent="processPayment" class="payment-form">
      <div class="form-group">
        <label>Téléphone</label>
        <input 
          v-model="form.phoneNumber" 
          type="tel" 
          placeholder="+22890123456"
          required 
        />
      </div>
      
      <div class="form-group">
        <label>Montant (FCFA)</label>
        <input 
          v-model.number="form.amount" 
          type="number" 
          min="10"
          required 
        />
      </div>
      
      <div class="form-group">
        <label>Réseau</label>
        <select v-model="form.network" required>
          <option value="">Choisir</option>
          <option value="FLOOZ">FLOOZ (Moov)</option>
          <option value="TMONEY">T-Money (Togocel)</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Description</label>
        <input v-model="form.description" placeholder="Achat produit..." />
      </div>
      
      <button 
        type="submit" 
        :disabled="initiationLoading || !isFormValid"
        class="btn-primary"
      >
        {{ initiationLoading ? 'Traitement...' : 'Payer maintenant' }}
      </button>
    </form>

    <!-- Statut du paiement -->
    <div v-if="paymentResult" class="payment-status">
      <h3>Paiement initié</h3>
      <p><strong>Référence:</strong> {{ paymentResult.txReference }}</p>
      
      <div class="status-check">
        <button @click="checkStatus" :disabled="statusLoading">
          {{ statusLoading ? 'Vérification...' : 'Vérifier le statut' }}
        </button>
        
        <button @click="startAutoCheck" :disabled="isPolling">
          📡 Surveillance auto
        </button>
        
        <button @click="stopAutoCheck" :disabled="!isPolling">
          ⏹ Arrêter surveillance
        </button>
      </div>
      
      <div v-if="currentStatus" class="status-result">
        <div :class="getStatusClass(currentStatus.status)">
          {{ getStatusIcon(currentStatus.status) }} {{ currentStatus.message }}
        </div>
        
        <div class="status-details">
          <p><strong>Montant:</strong> {{ currentStatus.amount }} FCFA</p>
          <p><strong>Téléphone:</strong> {{ currentStatus.phoneNumber }}</p>
          <p><strong>Méthode:</strong> {{ currentStatus.paymentMethod }}</p>
          <p><strong>Date:</strong> {{ formatDate(currentStatus.datetime) }}</p>
        </div>
      </div>
    </div>

    <!-- Erreurs -->
    <div v-if="error" class="alert error">
      {{ error }}
      <button @click="clearError">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Configuration SEO
useSeoMeta({
  title: 'Paiement PayGateGlobal',
  description: 'Effectuer un paiement via FLOOZ ou T-Money'
})

// Composables PayGate
const { initiatePayment, loading: initiationLoading, error, clearError } = usePaymentInitiation()
const { status: currentStatus, loading: statusLoading, isPolling, check, startPolling, stopPolling } = usePaymentStatus()

// État du formulaire
const form = reactive({
  phoneNumber: '',
  amount: null,
  network: '',
  description: 'Paiement en ligne'
})

const paymentResult = ref(null)

// Validation
const isFormValid = computed(() => 
  form.phoneNumber && 
  form.amount && 
  form.amount > 0 && 
  form.network
)

// Actions
const processPayment = async () => {
  const result = await initiatePayment({
    phoneNumber: form.phoneNumber,
    amount: form.amount,
    identifier: `WEB_${Date.now()}`,
    network: form.network,
    description: form.description
  })
  
  if (result) {
    paymentResult.value = result
  }
}

const checkStatus = () => {
  if (paymentResult.value) {
    check(paymentResult.value.txReference)
  }
}

const startAutoCheck = () => {
  if (paymentResult.value) {
    startPolling()
  }
}

const stopAutoCheck = () => {
  stopPolling()
}

// Utilitaires
const getStatusClass = (status: number) => {
  switch (status) {
    case 0: return 'success'
    case 1:
    case 2:
    case 3: return 'pending'
    case 4:
    case 5:
    case 6: return 'error'
    case 7: return 'expired'
    default: return 'unknown'
  }
}

const getStatusIcon = (status: number) => {
  switch (status) {
    case 0: return '✅'
    case 1:
    case 2:
    case 3: return '⏳'
    case 4:
    case 5:
    case 6: return '❌'
    case 7: return '⏰'
    default: return '❓'
  }
}

const formatDate = (datetime: string) => {
  return new Date(datetime).toLocaleString('fr-FR')
}
</script>

<style scoped>
.payment-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.payment-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.btn-primary {
  background: #4CAF50;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.payment-status {
  background: #e8f5e9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.status-check {
  display: flex;
  gap: 10px;
  margin: 16px 0;
}

.status-check button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.status-result {
  margin-top: 16px;
  padding: 16px;
  border-radius: 6px;
  background: white;
}

.success { color: #2e7d32; }
.pending { color: #f57c00; }
.error { color: #d32f2f; }
.expired { color: #616161; }

.alert {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  position: relative;
}

.alert.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.alert button {
  position: absolute;
  top: 8px;
  right: 12px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}
</style>
```

## Configuration TypeScript

Le module ajoute automatiquement les types. Créez `types/paygate.d.ts` si nécessaire :

```typescript
import type { PayGateClient } from '@filanodev/paygate-core'

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
```

## API

### Composables

- `usePayGate()` - Composable principal avec toutes les fonctionnalités
- `usePaymentInitiation()` - Spécialisé pour l'initiation de paiements
- `usePaymentStatus(reference?, pollInterval?)` - Vérification de statut avec polling

### Utilitaires serveur

- `getPayGateClient()` - Obtenir l'instance client côté serveur
- `serverInitiatePayment(params)` - Initier un paiement côté serveur
- `serverCheckPaymentStatus(reference)` - Vérifier le statut côté serveur
- `serverCheckPaymentStatusByIdentifier(identifier)` - Vérifier par identifiant

## Gestion des erreurs

```vue
<script setup>
const { initiatePayment, error } = usePayGate()

watch(error, (newError) => {
  if (newError) {
    // Logger l'erreur
    console.error('Erreur PayGate:', newError)
    
    // Afficher une notification
    $toast.error(newError)
  }
})
</script>
```

## Support

Pour toute question sur ce package, créez une issue sur GitHub.

Pour le support PayGateGlobal officiel :
- Site : [https://paygateglobal.com/](https://paygateglobal.com/)
- Email : info@paygateglobal.com

## Licence

MIT