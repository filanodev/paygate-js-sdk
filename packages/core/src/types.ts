export type PayGateNetwork = 'FLOOZ' | 'TMONEY'

export interface PayGateConfig {
  authToken: string
  verifySSL?: boolean
  timeout?: number
}

export interface InitiatePaymentParams {
  phoneNumber: string
  amount: number
  identifier: string
  network: PayGateNetwork
  description?: string
}

export interface GeneratePaymentUrlParams {
  token: string      // Jeton d'authentification
  amount: number     // Montant de la transaction
  identifier: string // Identifiant unique
  description?: string // Détails de la transaction
  url?: string       // URL de redirection après paiement
  phone?: string     // Numéro de téléphone du client
  network?: PayGateNetwork // Réseau (FLOOZ ou TMONEY)
}

export interface PaymentResponse {
  txReference: string
  status: number
  message?: string
}

export interface PaymentUrlResponse {
  url: string
  identifier: string
}

export interface PaymentStatus {
  tx_reference: string          // Identifiant PayGateGlobal
  identifier?: string           // Identifiant e-commerce
  payment_reference?: string    // Code référence FLOOZ/TMoney
  status: number               // Code d'état du paiement
  amount?: number              // Montant payé
  phone_number?: string        // Numéro de téléphone
  payment_method?: string      // Méthode de paiement (FLOOZ, T-Money)
  datetime?: string            // Date et heure du paiement
  message?: string             // Message descriptif
}

export interface DisburseParams {
  phoneNumber: string
  amount: number
  reason: string
  network: PayGateNetwork
  reference?: string
}

export interface Balance {
  flooz?: number
  tmoney?: number
}

export interface ApiError {
  status: number
  message: string
  code?: string
}

export class PayGateError extends Error {
  public readonly status: number
  public readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'PayGateError'
    this.status = status
    this.code = code
  }
}