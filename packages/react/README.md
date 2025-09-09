# @filano/paygate-react

[![npm version](https://img.shields.io/npm/v/@filano/paygate-react.svg)](https://www.npmjs.com/package/@filano/paygate-react)

Hooks et composants React pour l'intégration de PayGateGlobal - Support FLOOZ et T-Money.

> 📝 **Package communautaire** développé par [Filano](https://me.fedapay.com/filano_don) pour aider les développeurs React à intégrer plus rapidement PayGateGlobal.

## Installation

```bash
npm install @filano/paygate-react
# ou
yarn add @filano/paygate-react
# ou
pnpm add @filano/paygate-react
```

## Configuration

### Provider

Enveloppez votre application avec le `PayGateProvider` :

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { PayGateProvider } from '@filano/paygate-react'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <PayGateProvider
    authToken="your-paygate-token"
    verifySSL={false} // pour le développement local uniquement
  >
    <App />
  </PayGateProvider>
)
```

## Usage avec les Hooks

### Hook principal

```jsx
import React from 'react'
import { usePayGate } from '@filano/paygate-react'

function PaymentComponent() {
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
      description: 'Test paiement React'
    })
    
    if (result) {
      console.log('Paiement initié:', result.txReference)
    }
  }

  return (
    <div>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Traitement...' : 'Payer 1000 FCFA'}
      </button>

      {error && (
        <div style={{ color: 'red' }}>
          {error}
          <button onClick={clearError}>×</button>
        </div>
      )}

      {lastPayment && (
        <div style={{ color: 'green' }}>
          Paiement initié: {lastPayment.txReference}
        </div>
      )}
    </div>
  )
}
```

### Hook spécialisé pour l'initiation

```jsx
import { usePaymentInitiation } from '@filano/paygate-react'

function InitiationComponent() {
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

  return (
    <div>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Initiation...' : 'Initier paiement'}
      </button>
      
      {isSuccess && (
        <p>✅ Paiement réussi: {paymentResult.txReference}</p>
      )}
      
      <button onClick={reset}>Reset</button>
    </div>
  )
}
```

### Hook pour vérification de statut avec polling

```jsx
import { useState } from 'react'
import { usePaymentStatus } from '@filano/paygate-react'

function StatusComponent() {
  const [reference, setReference] = useState('')
  
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

  return (
    <div>
      <input 
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        placeholder="TX_REFERENCE"
      />
      
      <button onClick={() => check()} disabled={loading}>
        Vérifier statut
      </button>
      
      <button onClick={startPolling} disabled={isPolling}>
        📡 Surveillance auto
      </button>
      
      <button onClick={stopPolling} disabled={!isPolling}>
        ⏹ Arrêter
      </button>

      {status && (
        <div>
          <strong>{status.message}</strong><br />
          Montant: {status.amount} FCFA<br />
          Méthode: {status.paymentMethod}
        </div>
      )}
    </div>
  )
}
```

## Composants prêts à l'emploi

### PaymentForm

Formulaire de paiement complet avec validation :

```jsx
import { PaymentForm } from '@filano/paygate-react'

function App() {
  const handleSuccess = (result) => {
    console.log('Paiement réussi:', result)
    // Rediriger ou afficher confirmation
  }

  const handleError = (error) => {
    console.error('Erreur paiement:', error)
  }

  return (
    <PaymentForm 
      onSuccess={handleSuccess}
      onError={handleError}
      submitLabel="Payer maintenant"
      showReset={true}
      defaultDescription="Achat produit XYZ"
      identifierPrefix="SHOP"
    />
  )
}
```

### StatusChecker

Composant pour vérifier les statuts :

```jsx
import { StatusChecker } from '@filano/paygate-react'

function App() {
  const handleStatusUpdate = (status) => {
    console.log('Nouveau statut:', status)
  }

  const handleError = (error) => {
    console.error('Erreur:', error)
  }

  return (
    <StatusChecker 
      showPolling={true}
      pollInterval={3000}
      onStatusUpdated={handleStatusUpdate}
      onError={handleError}
    />
  )
}
```

## API des Hooks

### usePayGate()

Hook principal avec toutes les fonctionnalités :

```typescript
const {
  // État
  loading: boolean,
  error: string | null,
  lastPayment: PaymentResponse | null,
  lastStatus: PaymentStatus | null,

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

Hook spécialisé pour l'initiation de paiements :

```typescript
const {
  loading: boolean,
  error: string | null,
  paymentResult: PaymentResponse | null,
  isSuccess: boolean,
  initiate: (params) => Promise<PaymentResponse | null>,
  reset: () => void,
  clearError: () => void
} = usePaymentInitiation()
```

### usePaymentStatus(reference?, pollInterval?)

Hook pour la vérification de statut avec polling optionnel :

```typescript
const {
  status: PaymentStatus | null,
  loading: boolean,
  error: string | null,
  isPolling: boolean,
  check: (ref?) => Promise<PaymentStatus | null>,
  startPolling: () => void,
  stopPolling: () => void,
  reset: () => void
} = usePaymentStatus(reference, pollInterval)
```

## Types TypeScript

Le package inclut tous les types TypeScript :

```typescript
import type { 
  PayGateProviderProps,
  UsePayGateState,
  PayGateNetwork,
  InitiatePaymentParams,
  PaymentStatus 
} from '@filano/paygate-react'
```

## Gestion des erreurs

```jsx
import { usePayGate, PayGateError } from '@filano/paygate-react'

function PaymentComponent() {
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

  return <button onClick={handlePayment}>Payer</button>
}
```

## Utilisation avec TypeScript

```tsx
import React from 'react'
import { 
  PayGateProvider, 
  usePayGate,
  type PayGateNetwork,
  type InitiatePaymentParams 
} from '@filano/paygate-react'

interface PaymentFormData {
  phoneNumber: string
  amount: number
  network: PayGateNetwork
}

function TypedComponent() {
  const { initiatePayment } = usePayGate()

  const handleSubmit = async (data: PaymentFormData) => {
    const params: InitiatePaymentParams = {
      phoneNumber: data.phoneNumber,
      amount: data.amount,
      identifier: `ORDER_${Date.now()}`,
      network: data.network,
      description: 'Paiement TypeScript'
    }

    const result = await initiatePayment(params)
    console.log(result?.txReference)
  }

  // ... rest of component
}
```

## Support

Pour toute question sur ce package, créez une issue sur GitHub.

Pour le support PayGateGlobal officiel :
- Site : [https://paygateglobal.com/](https://paygateglobal.com/)
- Email : info@paygateglobal.com

## Licence

MIT