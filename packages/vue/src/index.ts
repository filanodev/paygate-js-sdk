// Plugin principal
export { default as PayGatePlugin, createPayGate } from './plugin'

// Composables
export * from './composables'

// Components
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