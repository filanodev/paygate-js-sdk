import { NextRequest, NextResponse } from 'next/server'
import { PayGateClient, PayGateError } from '@filanodev/paygate-core'
import type { 
  PayGateConfig,
  InitiatePaymentParams,
  PaymentResponse,
  PaymentStatus,
  DisburseParams,
  Balance
} from '@filanodev/paygate-core'

/**
 * Configuration par défaut pour les API routes
 */
interface PayGateApiConfig extends PayGateConfig {
  corsOrigins?: string[]
  rateLimitRequests?: number
  rateLimitWindow?: number
}

/**
 * Créer un client PayGate pour les API routes
 */
export function createPayGateApiClient(config?: PayGateApiConfig): PayGateClient {
  const defaultConfig: PayGateConfig = {
    authToken: process.env.PAYGATE_TOKEN || '',
    verifySSL: process.env.NODE_ENV === 'production'
  }

  return new PayGateClient({ ...defaultConfig, ...config })
}

/**
 * Middleware pour gérer les erreurs PayGate dans les API routes
 */
export function withPayGateErrorHandling(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(req, context)
    } catch (error) {
      console.error('PayGate API Error:', error)

      if (error instanceof PayGateError) {
        return NextResponse.json({
          success: false,
          error: {
            message: error.message,
            status: error.status,
            code: 'PAYGATE_ERROR'
          }
        }, { status: error.status || 400 })
      }

      return NextResponse.json({
        success: false,
        error: {
          message: 'Erreur interne du serveur',
          code: 'INTERNAL_ERROR'
        }
      }, { status: 500 })
    }
  }
}

/**
 * Middleware pour valider les données de paiement
 */
export function validatePaymentData(data: any): InitiatePaymentParams {
  if (!data.phoneNumber || typeof data.phoneNumber !== 'string') {
    throw new Error('Numéro de téléphone requis')
  }

  if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
    throw new Error('Montant invalide')
  }

  if (!data.network || !['FLOOZ', 'TMONEY'].includes(data.network)) {
    throw new Error('Réseau invalide')
  }

  if (!data.identifier || typeof data.identifier !== 'string') {
    throw new Error('Identifiant requis')
  }

  return {
    phoneNumber: data.phoneNumber,
    amount: data.amount,
    network: data.network,
    identifier: data.identifier,
    description: data.description || 'Paiement Next.js'
  }
}

/**
 * Helper pour créer une réponse API standardisée
 */
export function createApiResponse<T>(data: T, success = true, status = 200): NextResponse {
  return NextResponse.json({
    success,
    data,
    timestamp: new Date().toISOString()
  }, { status })
}

/**
 * Helper pour créer une réponse d'erreur API
 */
export function createErrorResponse(message: string, status = 400, code?: string): NextResponse {
  return NextResponse.json({
    success: false,
    error: {
      message,
      code,
      timestamp: new Date().toISOString()
    }
  }, { status })
}

/**
 * Handler prêt à l'emploi pour initier un paiement
 */
export function createInitiatePaymentHandler(config?: PayGateApiConfig) {
  const client = createPayGateApiClient(config)

  return withPayGateErrorHandling(async (req: NextRequest): Promise<NextResponse> => {
    if (req.method !== 'POST') {
      return createErrorResponse('Méthode non autorisée', 405)
    }

    const body = await req.json()
    const paymentData = validatePaymentData(body)

    const result = await client.initiatePayment(paymentData)
    return createApiResponse(result)
  })
}

/**
 * Handler prêt à l'emploi pour vérifier le statut d'un paiement
 */
export function createStatusHandler(config?: PayGateApiConfig) {
  const client = createPayGateApiClient(config)

  return withPayGateErrorHandling(async (req: NextRequest, { params }: { params: { reference: string } }): Promise<NextResponse> => {
    if (req.method !== 'GET') {
      return createErrorResponse('Méthode non autorisée', 405)
    }

    const reference = params.reference
    if (!reference) {
      return createErrorResponse('Référence de transaction requise', 400)
    }

    const status = await client.checkStatus(reference)
    return createApiResponse(status)
  })
}

/**
 * Handler prêt à l'emploi pour vérifier le solde
 */
export function createBalanceHandler(config?: PayGateApiConfig) {
  const client = createPayGateApiClient(config)

  return withPayGateErrorHandling(async (req: NextRequest): Promise<NextResponse> => {
    if (req.method !== 'GET') {
      return createErrorResponse('Méthode non autorisée', 405)
    }

    const balance = await client.checkBalance()
    return createApiResponse(balance)
  })
}

/**
 * Middleware CORS pour les API routes PayGate
 */
export function withCors(origins: string[] = ['*']) {
  return (handler: (req: NextRequest, context?: any) => Promise<NextResponse>) => {
    return async (req: NextRequest, context?: any): Promise<NextResponse> => {
      const response = await handler(req, context)

      // Gérer les requêtes préparatoires CORS
      if (req.method === 'OPTIONS') {
        return new NextResponse(null, { status: 200 })
      }

      // Ajouter les headers CORS
      const origin = req.headers.get('origin')
      if (origin && (origins.includes('*') || origins.includes(origin))) {
        response.headers.set('Access-Control-Allow-Origin', origin)
      }

      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      response.headers.set('Access-Control-Max-Age', '86400')

      return response
    }
  }
}