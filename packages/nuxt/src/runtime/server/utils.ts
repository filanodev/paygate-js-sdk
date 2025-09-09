import { useRuntimeConfig } from '#nitro'
import { PayGateClient } from '@filanodev/paygate-core'
import type { PayGateConfig, InitiatePaymentParams, PaymentResponse, PaymentStatus } from '@filanodev/paygate-core'

let _paygateClient: PayGateClient | null = null

/**
 * Obtenir l'instance PayGate côté serveur
 */
export function getPayGateClient(): PayGateClient {
  if (!_paygateClient) {
    const config = useRuntimeConfig()
    const paygateConfig: PayGateConfig = config.public.paygate
    
    _paygateClient = new PayGateClient(paygateConfig)
  }
  
  return _paygateClient
}

/**
 * Initier un paiement côté serveur
 */
export async function serverInitiatePayment(params: InitiatePaymentParams): Promise<PaymentResponse> {
  const client = getPayGateClient()
  return await client.initiatePayment(params)
}

/**
 * Vérifier le statut d'un paiement côté serveur
 */
export async function serverCheckPaymentStatus(reference: string): Promise<PaymentStatus> {
  const client = getPayGateClient()
  return await client.checkStatus(reference)
}

/**
 * Vérifier le statut par identifiant côté serveur
 */
export async function serverCheckPaymentStatusByIdentifier(identifier: string): Promise<PaymentStatus> {
  const client = getPayGateClient()
  return await client.checkStatusByIdentifier(identifier)
}

/**
 * Vérifier le solde côté serveur
 */
export async function serverCheckBalance() {
  const client = getPayGateClient()
  return await client.checkBalance()
}