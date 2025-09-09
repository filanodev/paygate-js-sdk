// Re-export all types from core
export type {
  PayGateConfig,
  PayGateNetwork,
  InitiatePaymentParams,
  GeneratePaymentUrlParams,
  PaymentResponse,
  PaymentStatus,
  DisburseParams,
  Balance
} from '@filanodev/paygate-core'

// Next.js specific types
export interface NextPayGateConfig {
  authToken: string
  verifySSL?: boolean
}

export interface NextPayGateProviderProps extends NextPayGateConfig {
  children: React.ReactNode
}

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