# @filano/paygate-core

[![npm version](https://img.shields.io/npm/v/@filano/paygate-core.svg)](https://www.npmjs.com/package/@filano/paygate-core)

SDK JavaScript pour l'intégration de PayGateGlobal - Support FLOOZ et T-Money.

> 📝 **Package communautaire** développé par [Filano](https://me.fedapay.com/filano_don) pour aider les développeurs à intégrer plus rapidement PayGateGlobal dans leurs applications JavaScript.

## Installation

```bash
npm install @filano/paygate-core
# ou
yarn add @filano/paygate-core
# ou
pnpm add @filano/paygate-core
```

## Usage rapide

```javascript
import { PayGateClient } from '@filano/paygate-core'

const paygate = new PayGateClient({
  authToken: 'your-paygate-token',
  verifySSL: false // pour le développement local uniquement
})

// Initier un paiement
try {
  const payment = await paygate.initiatePayment({
    phoneNumber: '+22890123456',
    amount: 1000,
    identifier: 'ORDER_123',
    network: 'FLOOZ', // ou 'TMONEY'
    description: 'Achat produit XYZ'
  })
  
  console.log('Paiement initié:', payment.txReference)
} catch (error) {
  console.error('Erreur:', error.message)
}
```

## API Reference

### Constructor

```typescript
new PayGateClient(config: PayGateConfig)
```

**PayGateConfig:**
- `authToken: string` - Votre token d'authentification PayGate (obligatoire)
- `verifySSL?: boolean` - Vérification SSL (défaut: true, false pour dev local)
- `timeout?: number` - Timeout des requêtes en ms (défaut: 30000)

### Méthodes

#### `initiatePayment(params)`
Initie un paiement direct via l'API.

```typescript
await paygate.initiatePayment({
  phoneNumber: '+22890123456',
  amount: 1000,
  identifier: 'ORDER_123',
  network: 'FLOOZ', // ou 'TMONEY'
  description?: 'Description optionnelle'
})
```

#### `generatePaymentUrl(params)`
Génère une URL de paiement pour redirection.

```typescript
const { url, identifier } = paygate.generatePaymentUrl({
  amount: 5000,
  identifier: 'ORDER_456',
  description?: 'Description',
  successUrl?: 'https://monsite.com/success',
  phoneNumber?: '+22890123456',
  network?: 'FLOOZ'
})
```

#### `checkPaymentStatus(txReference)`
Vérifie le statut d'un paiement par référence PayGate.

```typescript
const status = await paygate.checkPaymentStatus('TX_REFERENCE')
```

#### `checkPaymentStatusByIdentifier(identifier)`
Vérifie le statut d'un paiement par identifier personnalisé.

```typescript
const status = await paygate.checkPaymentStatusByIdentifier('ORDER_123')
```

#### `checkStatus(reference)`
Vérifie le statut automatiquement (détecte le type de référence).

```typescript
const status = await paygate.checkStatus('ORDER_123') // ou 'TX_REFERENCE'
```

#### `disburse(params)`
Effectue un remboursement.

```typescript
await paygate.disburse({
  phoneNumber: '+22890123456',
  amount: 1000,
  reason: 'Remboursement commande',
  network: 'FLOOZ',
  reference?: 'REF_123'
})
```

#### `checkBalance()`
Consulte les soldes disponibles.

```typescript
const balance = await paygate.checkBalance()
console.log('FLOOZ:', balance.flooz, 'T-Money:', balance.tmoney)
```

## Gestion des erreurs

```javascript
import { PayGateError } from '@filano/paygate-core'

try {
  const payment = await paygate.initiatePayment(params)
} catch (error) {
  if (error instanceof PayGateError) {
    console.error('Erreur PayGate:', {
      message: error.message,
      status: error.status,
      code: error.code
    })
  } else {
    console.error('Erreur inattendue:', error)
  }
}
```

## Types TypeScript

Le package inclut tous les types TypeScript nécessaires :

```typescript
import type { 
  PayGateConfig,
  InitiatePaymentParams,
  PaymentResponse,
  PaymentStatus,
  PayGateNetwork 
} from '@filano/paygate-core'
```

## Statuts de paiement

- `0` - Paiement réussi
- `1` - En attente  
- `2` - Initialisé
- `3` - En cours de traitement
- `4` - Fonds insuffisants
- `5` - Numéro invalide
- `6` - Échec
- `7` - Expiré

## Support

Pour toute question sur ce package, créez une issue sur GitHub.

Pour le support PayGateGlobal officiel :
- Site : [https://paygateglobal.com/](https://paygateglobal.com/)
- Email : info@paygateglobal.com

## Licence

MIT