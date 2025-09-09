import type { PayGateConfig } from '@filano/paygate-core'

export interface PayGatePluginOptions extends PayGateConfig {
  // Options spécifiques au plugin Vue
}

export interface UsePayGateState {
  loading: boolean
  error: string | null
  lastPayment: any | null
  lastStatus: any | null
}