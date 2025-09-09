// Export client-side functionality
export * from './client'

// Export server-side functionality  
export * from './server'

// Export types
export * from './types'

// Re-export core types
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

// Re-export core errors
export { PayGateError } from '@filanodev/paygate-core'