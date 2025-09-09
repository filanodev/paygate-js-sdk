import type { PayGateConfig, PayGateClient } from '@filano/paygate-core'
import type { ReactNode } from 'react'

export interface PayGateProviderProps extends PayGateConfig {
  children: ReactNode
}

export interface PayGateContextValue {
  client: PayGateClient | null
}

export interface UsePayGateState {
  loading: boolean
  error: string | null
  lastPayment: any | null
  lastStatus: any | null
}