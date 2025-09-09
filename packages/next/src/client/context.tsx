'use client'

import React, { createContext, useContext, useMemo, ReactNode } from 'react'
import { PayGateClient } from '@filano/paygate-core'
import type { PayGateConfig } from '@filano/paygate-core'

export interface PayGateProviderProps extends PayGateConfig {
  children: ReactNode
}

const PayGateContext = createContext<PayGateClient | null>(null)

export function PayGateProvider({ children, ...config }: PayGateProviderProps) {
  const client = useMemo(() => new PayGateClient(config), [
    config.authToken,
    config.verifySSL
  ])

  return (
    <PayGateContext.Provider value={client}>
      {children}
    </PayGateContext.Provider>
  )
}

export function usePayGateContext(): PayGateClient {
  const context = useContext(PayGateContext)
  
  if (!context) {
    throw new Error('usePayGateContext must be used within a PayGateProvider')
  }
  
  return context
}