// Context et Provider
export { PayGateProvider, usePayGateContext } from './context'

// Hooks
export * from './hooks'

// Composants
export * from './components'

// Types
export * from './types'

// Re-export des types du core
export type {
  PayGateConfig,
  PayGateNetwork,
  InitiatePaymentParams,
  GeneratePaymentUrlParams,
  PaymentResponse,
  PaymentStatus,
  DisburseParams,
  Balance
} from '@filano/paygate-core'

// Re-export des erreurs du core
export { PayGateError } from '@filano/paygate-core'