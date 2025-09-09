import { PayGateClient } from '@filano/paygate-core'
import type { 
  PayGateConfig,
  InitiatePaymentParams,
  PaymentResponse,
  PaymentStatus,
  DisburseParams,
  Balance
} from '@filano/paygate-core'

let _paygateClient: PayGateClient | null = null

/**
 * Obtenir l'instance PayGate côté serveur (singleton)
 */
export function getServerPayGateClient(config?: PayGateConfig): PayGateClient {
  if (!_paygateClient) {
    const defaultConfig: PayGateConfig = {
      authToken: process.env.PAYGATE_TOKEN || '',
      environment: (process.env.PAYGATE_ENVIRONMENT as any) || 'sandbox',
      verifySSL: process.env.NODE_ENV === 'production'
    }
    
    _paygateClient = new PayGateClient({ ...defaultConfig, ...config })
  }
  
  return _paygateClient
}

/**
 * Initier un paiement côté serveur
 */
export async function serverInitiatePayment(
  params: InitiatePaymentParams, 
  config?: PayGateConfig
): Promise<PaymentResponse> {
  const client = getServerPayGateClient(config)
  return await client.initiatePayment(params)
}

/**
 * Vérifier le statut d'un paiement côté serveur
 */
export async function serverCheckPaymentStatus(
  reference: string, 
  config?: PayGateConfig
): Promise<PaymentStatus> {
  const client = getServerPayGateClient(config)
  return await client.checkStatus(reference)
}

/**
 * Vérifier le statut par identifiant côté serveur
 */
export async function serverCheckPaymentStatusByIdentifier(
  identifier: string, 
  config?: PayGateConfig
): Promise<PaymentStatus> {
  const client = getServerPayGateClient(config)
  return await client.checkStatusByIdentifier(identifier)
}

/**
 * Effectuer un décaissement côté serveur
 */
export async function serverDisburse(
  params: DisburseParams, 
  config?: PayGateConfig
): Promise<PaymentResponse> {
  const client = getServerPayGateClient(config)
  return await client.disburse(params)
}

/**
 * Vérifier le solde côté serveur
 */
export async function serverCheckBalance(config?: PayGateConfig): Promise<Balance> {
  const client = getServerPayGateClient(config)
  return await client.checkBalance()
}

/**
 * Générer une URL de paiement côté serveur
 */
export function serverGeneratePaymentUrl(
  params: any, 
  config?: PayGateConfig
) {
  const client = getServerPayGateClient(config)
  return client.generatePaymentUrl(params)
}

/**
 * Utilitaire pour traiter les webhooks PayGate
 */
export interface WebhookPayload {
  txReference: string
  identifier: string
  status: number
  message: string
  amount: number
  phoneNumber: string
  paymentMethod: string
  datetime: string
  signature?: string
}

export function validateWebhook(payload: WebhookPayload, secret?: string): boolean {
  if (!payload.txReference || !payload.identifier) {
    return false
  }

  // Si une signature est fournie, la valider
  if (payload.signature && secret) {
    // Logique de validation de signature personnalisée
    // À adapter selon les spécifications de PayGateGlobal
    return true
  }

  return true
}

/**
 * Handler générique pour les webhooks
 */
export function createWebhookHandler(
  onPaymentUpdated: (payload: WebhookPayload) => Promise<void>,
  secret?: string
) {
  return async (payload: WebhookPayload): Promise<boolean> => {
    try {
      if (!validateWebhook(payload, secret)) {
        console.error('Webhook PayGate invalide:', payload)
        return false
      }

      await onPaymentUpdated(payload)
      return true
    } catch (error) {
      console.error('Erreur lors du traitement du webhook:', error)
      return false
    }
  }
}

/**
 * Utilitaire pour les variables d'environnement PayGate
 */
export function getPayGateEnvConfig(): PayGateConfig {
  return {
    authToken: process.env.PAYGATE_TOKEN || '',
    environment: (process.env.PAYGATE_ENVIRONMENT as any) || 'sandbox',
    verifySSL: process.env.NODE_ENV === 'production'
  }
}

/**
 * Middleware pour vérifier la configuration PayGate
 */
export function ensurePayGateConfig(): void {
  const config = getPayGateEnvConfig()
  
  if (!config.authToken) {
    throw new Error('PAYGATE_TOKEN variable d\'environnement requise')
  }
  
  if (!['sandbox', 'production'].includes(config.environment)) {
    throw new Error('PAYGATE_ENVIRONMENT doit être "sandbox" ou "production"')
  }
}