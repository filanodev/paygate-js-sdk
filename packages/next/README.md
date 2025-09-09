# @filano/paygate-next

[![npm version](https://img.shields.io/npm/v/@filano/paygate-next.svg)](https://www.npmjs.com/package/@filano/paygate-next)

Plugin Next.js pour l'intégration de PayGateGlobal - Support FLOOZ et T-Money.

> 📝 **Package communautaire** développé par [Filano](https://me.fedapay.com/filano_don) pour aider les développeurs Next.js à intégrer plus rapidement PayGateGlobal.

## Fonctionnalités

- ✅ **Next.js 12-15** - Support des versions modernes
- 🔄 **SSR/SSG/ISR** - Compatible avec tous les modes de rendu
- ⚡ **API Routes** - Helpers prêts à l'emploi
- 🎯 **TypeScript** - Support complet avec types
- 🛠 **React Hooks** - Client-side moderne
- 🔧 **Server Utils** - Utilitaires serveur
- 🌐 **App Router** - Support Next.js 13+ App Directory

## Installation

```bash
npm install @filano/paygate-next
# ou
yarn add @filano/paygate-next
# ou  
pnpm add @filano/paygate-next
```

## Configuration

### Variables d'environnement

Créez un fichier `.env.local` :

```env
PAYGATE_TOKEN=your-paygate-token-here
```

### Provider dans l'App (App Router)

```tsx
// app/layout.tsx
import { PayGateProvider } from '@filano/paygate-next/client'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <PayGateProvider
          authToken={process.env.NEXT_PUBLIC_PAYGATE_TOKEN!}
          verifySSL={false} // pour le développement uniquement
        >
          {children}
        </PayGateProvider>
      </body>
    </html>
  )
}
```

### Provider dans Pages Router

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app'
import { PayGateProvider } from '@filano/paygate-next/client'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PayGateProvider
      authToken={process.env.NEXT_PUBLIC_PAYGATE_TOKEN!}
      verifySSL={false}
    >
      <Component {...pageProps} />
    </PayGateProvider>
  )
}
```

## Usage Client-side

### Hook principal

```tsx
// app/payment/page.tsx
'use client'

import { usePayGate } from '@filano/paygate-next/client'

export default function PaymentPage() {
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
      description: 'Test paiement Next.js'
    })
    
    if (result) {
      console.log('Paiement initié:', result.txReference)
    }
  }

  return (
    <div>
      <h1>Paiement PayGate</h1>
      
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Traitement...' : 'Payer 1000 FCFA'}
      </button>

      {error && (
        <div className="error">
          {error}
          <button onClick={clearError}>×</button>
        </div>
      )}

      {lastPayment && (
        <div className="success">
          Paiement initié: {lastPayment.txReference}
        </div>
      )}
    </div>
  )
}
```

### Composant PaymentForm

```tsx
// app/checkout/page.tsx
'use client'

import { PaymentForm } from '@filano/paygate-next/client'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const router = useRouter()

  const handleSuccess = (result: any) => {
    console.log('Paiement réussi:', result)
    router.push(`/success?ref=${result.txReference}`)
  }

  const handleError = (error: string) => {
    console.error('Erreur paiement:', error)
    // Afficher une notification d'erreur
  }

  return (
    <div>
      <h1>Finaliser votre commande</h1>
      
      <PaymentForm 
        onSuccess={handleSuccess}
        onError={handleError}
        submitLabel="Payer maintenant"
        showReset={true}
        defaultDescription="Commande e-commerce"
        identifierPrefix="SHOP"
      />
    </div>
  )
}
```

### Hook spécialisé pour les statuts

```tsx
// app/payment/[reference]/page.tsx
'use client'

import { usePaymentStatus } from '@filano/paygate-next/client'
import { useParams } from 'next/navigation'

export default function PaymentStatusPage() {
  const params = useParams()
  const reference = params.reference as string

  const { 
    status, 
    loading, 
    error, 
    isPolling, 
    check, 
    startPolling, 
    stopPolling 
  } = usePaymentStatus(reference, 5000)

  return (
    <div>
      <h1>Statut du paiement</h1>
      <p>Référence: {reference}</p>
      
      <div>
        <button onClick={() => check()} disabled={loading}>
          Vérifier maintenant
        </button>
        
        <button onClick={startPolling} disabled={isPolling}>
          📡 Surveillance auto
        </button>
        
        <button onClick={stopPolling} disabled={!isPolling}>
          ⏹ Arrêter
        </button>
      </div>

      {status && (
        <div className={`status-${status.status === 0 ? 'success' : 'pending'}`}>
          <h3>{status.message}</h3>
          <p>Montant: {status.amount} FCFA</p>
          <p>Téléphone: {status.phoneNumber}</p>
          <p>Méthode: {status.paymentMethod}</p>
        </div>
      )}

      {isPolling && (
        <p>🔄 Surveillance en cours...</p>
      )}
    </div>
  )
}
```

## API Routes

### App Router - Route Handlers

```typescript
// app/api/payments/initiate/route.ts
import { NextRequest } from 'next/server'
import { createInitiatePaymentHandler } from '@filano/paygate-next/server'

const handler = createInitiatePaymentHandler({
  authToken: process.env.PAYGATE_TOKEN!
})

export async function POST(request: NextRequest) {
  return handler(request)
}
```

```typescript
// app/api/payments/status/[reference]/route.ts
import { NextRequest } from 'next/server'
import { createStatusHandler } from '@filano/paygate-next/server'

const handler = createStatusHandler()

export async function GET(
  request: NextRequest,
  { params }: { params: { reference: string } }
) {
  return handler(request, { params })
}
```

```typescript
// app/api/payments/balance/route.ts
import { NextRequest } from 'next/server'
import { createBalanceHandler } from '@filano/paygate-next/server'

const handler = createBalanceHandler()

export async function GET(request: NextRequest) {
  return handler(request)
}
```

### Pages Router - API Routes

```typescript
// pages/api/payments/initiate.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { serverInitiatePayment, validatePaymentData } from '@filano/paygate-next/server'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  try {
    const paymentData = validatePaymentData(req.body)
    const result = await serverInitiatePayment(paymentData)
    
    res.status(200).json({
      success: true,
      data: result
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
}
```

```typescript
// pages/api/payments/status/[reference].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { serverCheckPaymentStatus } from '@filano/paygate-next/server'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' })
  }

  try {
    const { reference } = req.query
    const status = await serverCheckPaymentStatus(reference as string)
    
    res.status(200).json({
      success: true,
      data: status
    })
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Paiement non trouvé'
    })
  }
}
```

### Webhook Handler

```typescript
// app/api/webhooks/paygate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createWebhookHandler } from '@filano/paygate-next/server'

const webhookHandler = createWebhookHandler(
  async (payload) => {
    // Traiter la mise à jour du paiement
    console.log('Paiement mis à jour:', payload)
    
    // Exemple: mettre à jour la base de données
    // await updatePaymentInDatabase(payload.identifier, payload.status)
    
    // Exemple: envoyer une notification
    // await sendNotification(payload)
  },
  process.env.PAYGATE_WEBHOOK_SECRET
)

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const success = await webhookHandler(payload)
    
    if (success) {
      return NextResponse.json({ received: true })
    } else {
      return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
```

## Utilisation Server-side

### Dans les Server Components

```tsx
// app/orders/[id]/page.tsx
import { serverCheckPaymentStatus } from '@filano/paygate-next/server'

interface Props {
  params: { id: string }
}

export default async function OrderPage({ params }: Props) {
  let paymentStatus = null
  
  try {
    // Récupérer le statut côté serveur
    paymentStatus = await serverCheckPaymentStatus(params.id)
  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error)
  }

  return (
    <div>
      <h1>Commande #{params.id}</h1>
      
      {paymentStatus ? (
        <div className={`status-${paymentStatus.status === 0 ? 'success' : 'pending'}`}>
          <p>Statut: {paymentStatus.message}</p>
          <p>Montant: {paymentStatus.amount} FCFA</p>
        </div>
      ) : (
        <p>Statut du paiement non disponible</p>
      )}
    </div>
  )
}
```

### Dans les Server Actions

```tsx
// app/payment/actions.ts
'use server'

import { serverInitiatePayment } from '@filano/paygate-next/server'
import { revalidatePath } from 'next/cache'

export async function processPayment(formData: FormData) {
  try {
    const result = await serverInitiatePayment({
      phoneNumber: formData.get('phoneNumber') as string,
      amount: Number(formData.get('amount')),
      identifier: `ORDER_${Date.now()}`,
      network: formData.get('network') as 'FLOOZ' | 'TMONEY',
      description: 'Paiement via Server Action'
    })
    
    // Revalider les données de la page
    revalidatePath('/payments')
    
    return {
      success: true,
      data: result
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}
```

## Middleware et sécurité

### Middleware avec CORS

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { withCors } from '@filano/paygate-next/server'

const corsHandler = withCors(['https://your-domain.com'])

export function middleware(request: NextRequest) {
  // Appliquer CORS aux routes API PayGate
  if (request.nextUrl.pathname.startsWith('/api/payments')) {
    return corsHandler((req) => NextResponse.next())(request)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/payments/:path*'
}
```

### Configuration avancée

```typescript
// lib/paygate.ts
import { createPayGateApiClient, ensurePayGateConfig } from '@filano/paygate-next/server'

// Vérifier la configuration au démarrage
ensurePayGateConfig()

// Client global pour l'application
export const paygateClient = createPayGateApiClient({
  authToken: process.env.PAYGATE_TOKEN!,
  verifySSL: process.env.NODE_ENV === 'production'
})
```

## Exemple d'application complète

```tsx
// app/page.tsx
import { PaymentDemo } from './components/PaymentDemo'

export default function HomePage() {
  return (
    <main>
      <h1>Demo PayGate Next.js</h1>
      <PaymentDemo />
    </main>
  )
}
```

```tsx
// app/components/PaymentDemo.tsx
'use client'

import { useState } from 'react'
import { usePayGate, PaymentForm } from '@filano/paygate-next/client'

export function PaymentDemo() {
  const [paymentReference, setPaymentReference] = useState<string | null>(null)
  const { checkPaymentStatus, loading, lastStatus } = usePayGate()

  const handlePaymentSuccess = (result: any) => {
    setPaymentReference(result.txReference)
  }

  const checkStatus = async () => {
    if (paymentReference) {
      await checkPaymentStatus(paymentReference)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Initier un paiement</h2>
      
      <PaymentForm
        onSuccess={handlePaymentSuccess}
        onError={(error) => console.error(error)}
        identifierPrefix="DEMO"
      />

      {paymentReference && (
        <div style={{ marginTop: '30px', padding: '20px', background: '#f5f5f5' }}>
          <h3>Vérifier le statut</h3>
          <p>Référence: {paymentReference}</p>
          
          <button onClick={checkStatus} disabled={loading}>
            {loading ? 'Vérification...' : 'Vérifier le statut'}
          </button>

          {lastStatus && (
            <div style={{ marginTop: '10px' }}>
              <strong>Statut:</strong> {lastStatus.message}<br />
              <strong>Montant:</strong> {lastStatus.amount} FCFA<br />
              <strong>Méthode:</strong> {lastStatus.paymentMethod}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

## API

### Hooks Client-side

- `usePayGate()` - Hook principal avec toutes les fonctionnalités
- `usePaymentInitiation()` - Spécialisé pour l'initiation de paiements
- `usePaymentStatus(reference?, pollInterval?)` - Vérification de statut avec polling

### Composants

- `<PayGateProvider>` - Provider context pour l'application
- `<PaymentForm>` - Formulaire de paiement complet

### Utilitaires Server-side

- `getServerPayGateClient(config?)` - Obtenir le client serveur
- `serverInitiatePayment(params, config?)` - Initier un paiement
- `serverCheckPaymentStatus(reference, config?)` - Vérifier le statut
- `createInitiatePaymentHandler(config?)` - Handler API prêt à l'emploi
- `createStatusHandler(config?)` - Handler de vérification de statut
- `createWebhookHandler(onUpdated, secret?)` - Handler de webhook

### Helpers API

- `withPayGateErrorHandling()` - Middleware de gestion d'erreurs
- `validatePaymentData()` - Validation des données de paiement
- `createApiResponse()` - Créer une réponse API standardisée
- `withCors()` - Middleware CORS

## Support TypeScript

Le package inclut tous les types TypeScript :

```typescript
import type { 
  PayGateConfig,
  InitiatePaymentParams,
  PaymentResponse,
  PaymentStatus,
  WebhookPayload
} from '@filano/paygate-next'
```

## Gestion des erreurs

```tsx
'use client'

import { usePayGate, PayGateError } from '@filano/paygate-next/client'

export default function PaymentComponent() {
  const { initiatePayment } = usePayGate()

  const handlePayment = async () => {
    try {
      await initiatePayment(params)
    } catch (error) {
      if (error instanceof PayGateError) {
        console.error('Erreur PayGate:', error.status, error.message)
      } else {
        console.error('Erreur générale:', error)
      }
    }
  }

  return <button onClick={handlePayment}>Payer</button>
}
```

## Support

Pour toute question sur ce package, créez une issue sur GitHub.

Pour le support PayGateGlobal officiel :
- Site : [https://paygateglobal.com/](https://paygateglobal.com/)
- Email : info@paygateglobal.com

## Licence

MIT