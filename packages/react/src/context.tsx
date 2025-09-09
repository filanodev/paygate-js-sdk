import React, { createContext, useContext, useMemo } from 'react'
import { PayGateClient } from '@filano/paygate-core'
import type { PayGateProviderProps, PayGateContextValue } from './types'

const PayGateContext = createContext<PayGateContextValue>({ client: null })

export function PayGateProvider({ children, ...config }: PayGateProviderProps) {
  const client = useMemo(() => new PayGateClient(config), [
    config.authToken,
    config.verifySSL,
    config.timeout
  ])

  const value: PayGateContextValue = {
    client
  }

  return (
    <PayGateContext.Provider value={value}>
      {children}
    </PayGateContext.Provider>
  )
}

export function usePayGateContext(): PayGateContextValue {
  const context = useContext(PayGateContext)
  
  if (!context.client) {
    throw new Error('usePayGateContext must be used within a PayGateProvider')
  }
  
  return context
}