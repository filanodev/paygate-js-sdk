import { useState, useCallback, useEffect, useRef } from 'react'
import { 
  PayGateError,
  type InitiatePaymentParams,
  type GeneratePaymentUrlParams,
  type DisburseParams,
  type PaymentResponse,
  type PaymentUrlResponse,
  type PaymentStatus,
  type Balance
} from '@filanodev/paygate-core'
import { usePayGateContext } from './context'
import type { UsePayGateState } from './types'

/**
 * Hook principal pour utiliser PayGate dans React
 */
export function usePayGate() {
  const { client } = usePayGateContext()
  
  const [state, setState] = useState<UsePayGateState>({
    loading: false,
    error: null,
    lastPayment: null,
    lastStatus: null
  })

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const initiatePayment = useCallback(async (params: InitiatePaymentParams): Promise<PaymentResponse | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await client.initiatePayment(params)
      setState(prev => ({ ...prev, lastPayment: result }))
      return result
    } catch (error) {
      const errorMessage = error instanceof PayGateError ? error.message : 'Erreur inconnue'
      setState(prev => ({ ...prev, error: errorMessage }))
      return null
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [client])

  const generatePaymentUrl = useCallback((params: GeneratePaymentUrlParams): PaymentUrlResponse | null => {
    setState(prev => ({ ...prev, error: null }))

    try {
      return client.generatePaymentUrl(params)
    } catch (error) {
      const errorMessage = error instanceof PayGateError ? error.message : 'Erreur inconnue'
      setState(prev => ({ ...prev, error: errorMessage }))
      return null
    }
  }, [client])

  const checkPaymentStatus = useCallback(async (reference: string): Promise<PaymentStatus | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await client.checkPaymentStatus(reference)
      setState(prev => ({ ...prev, lastStatus: result }))
      return result
    } catch (error) {
      const errorMessage = error instanceof PayGateError ? error.message : 'Erreur inconnue'
      setState(prev => ({ ...prev, error: errorMessage }))
      return null
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [client])

  const checkPaymentStatusByIdentifier = useCallback(async (identifier: string): Promise<PaymentStatus | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await client.checkPaymentStatusByIdentifier(identifier)
      setState(prev => ({ ...prev, lastStatus: result }))
      return result
    } catch (error) {
      const errorMessage = error instanceof PayGateError ? error.message : 'Erreur inconnue'
      setState(prev => ({ ...prev, error: errorMessage }))
      return null
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [client])

  const checkStatus = useCallback(async (reference: string): Promise<PaymentStatus | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await client.checkStatus(reference)
      setState(prev => ({ ...prev, lastStatus: result }))
      return result
    } catch (error) {
      const errorMessage = error instanceof PayGateError ? error.message : 'Erreur inconnue'
      setState(prev => ({ ...prev, error: errorMessage }))
      return null
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [client])

  const disburse = useCallback(async (params: DisburseParams): Promise<PaymentResponse | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await client.disburse(params)
      return result
    } catch (error) {
      const errorMessage = error instanceof PayGateError ? error.message : 'Erreur inconnue'
      setState(prev => ({ ...prev, error: errorMessage }))
      return null
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [client])

  const checkBalance = useCallback(async (): Promise<Balance | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await client.checkBalance()
      return result
    } catch (error) {
      const errorMessage = error instanceof PayGateError ? error.message : 'Erreur inconnue'
      setState(prev => ({ ...prev, error: errorMessage }))
      return null
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [client])

  return {
    // État
    loading: state.loading,
    error: state.error,
    lastPayment: state.lastPayment,
    lastStatus: state.lastStatus,

    // Actions
    clearError,
    initiatePayment,
    generatePaymentUrl,
    checkPaymentStatus,
    checkPaymentStatusByIdentifier,
    checkStatus,
    disburse,
    checkBalance,

    // Client direct pour usage avancé
    client
  }
}

/**
 * Hook spécialisé pour l'initiation de paiements
 */
export function usePaymentInitiation() {
  const { initiatePayment, loading, error, clearError } = usePayGate()
  
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null)

  const initiate = useCallback(async (params: InitiatePaymentParams) => {
    setPaymentResult(null)
    const result = await initiatePayment(params)
    if (result) {
      setPaymentResult(result)
    }
    return result
  }, [initiatePayment])

  const reset = useCallback(() => {
    setPaymentResult(null)
    clearError()
  }, [clearError])

  return {
    loading,
    error,
    paymentResult,
    isSuccess: paymentResult?.status === 0,
    initiate,
    reset,
    clearError
  }
}

/**
 * Hook spécialisé pour la vérification de statut avec polling
 */
export function usePaymentStatus(reference?: string, pollInterval = 5000) {
  const { checkStatus, loading, error } = usePayGate()
  
  const [status, setStatus] = useState<PaymentStatus | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const pollTimer = useRef<NodeJS.Timeout | null>(null)

  const check = useCallback(async (ref?: string) => {
    const targetRef = ref || reference
    if (!targetRef) return null

    const result = await checkStatus(targetRef)
    if (result) {
      setStatus(result)
    }
    return result
  }, [reference, checkStatus])

  const startPolling = useCallback(() => {
    if (isPolling || !reference) return

    setIsPolling(true)
    pollTimer.current = setInterval(async () => {
      await check()
      
      // Arrêter le polling si le paiement est terminé (succès ou échec final)
      if (status && [0, 4, 5, 6, 7].includes(status.status)) {
        stopPolling()
      }
    }, pollInterval)
  }, [isPolling, reference, check, pollInterval, status])

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current)
      pollTimer.current = null
    }
    setIsPolling(false)
  }, [])

  const reset = useCallback(() => {
    stopPolling()
    setStatus(null)
  }, [stopPolling])

  // Cleanup sur démontage
  useEffect(() => {
    return () => {
      if (pollTimer.current) {
        clearInterval(pollTimer.current)
      }
    }
  }, [])

  return {
    status,
    loading,
    error,
    isPolling,
    check,
    startPolling,
    stopPolling,
    reset
  }
}