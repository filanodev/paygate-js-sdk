'use client'

import { useState, useCallback, useEffect } from 'react'
import { usePayGateContext } from './context'
import type { 
  InitiatePaymentParams, 
  PaymentResponse, 
  PaymentStatus, 
  GeneratePaymentUrlParams,
  PaymentUrlResponse,
  DisburseParams,
  Balance
} from '@filanodev/paygate-core'

interface UsePayGateState {
  loading: boolean
  error: string | null
  lastPayment: PaymentResponse | null
  lastStatus: PaymentStatus | null
}

/**
 * Hook principal pour PayGate avec toutes les fonctionnalités
 */
export function usePayGate() {
  const client = usePayGateContext()
  
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
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await client.initiatePayment(params)
      setState(prev => ({ ...prev, lastPayment: response }))
      
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'initiation du paiement'
      setState(prev => ({ ...prev, error: errorMessage }))
      return null
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [client])

  const generatePaymentUrl = useCallback((params: GeneratePaymentUrlParams): PaymentUrlResponse | null => {
    try {
      setState(prev => ({ ...prev, error: null }))
      return client.generatePaymentUrl(params)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération de l\'URL'
      setState(prev => ({ ...prev, error: errorMessage }))
      return null
    }
  }, [client])

  const checkPaymentStatus = useCallback(async (reference: string): Promise<PaymentStatus | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const status = await client.checkStatus(reference)
      setState(prev => ({ ...prev, lastStatus: status }))
      
      return status
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification du statut'
      setState(prev => ({ ...prev, error: errorMessage }))
      return null
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [client])

  const checkPaymentStatusByIdentifier = useCallback(async (identifier: string): Promise<PaymentStatus | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const status = await client.checkStatusByIdentifier(identifier)
      setState(prev => ({ ...prev, lastStatus: status }))
      
      return status
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification du statut'
      setState(prev => ({ ...prev, error: errorMessage }))
      return null
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [client])

  const checkStatus = checkPaymentStatus

  const disburse = useCallback(async (params: DisburseParams): Promise<PaymentResponse | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await client.disburse(params)
      setState(prev => ({ ...prev, lastPayment: response }))
      
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du décaissement'
      setState(prev => ({ ...prev, error: errorMessage }))
      return null
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [client])

  const checkBalance = useCallback(async (): Promise<Balance | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      return await client.checkBalance()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification du solde'
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
    
    // Client direct
    client
  }
}

/**
 * Hook spécialisé pour l'initiation de paiements
 */
export function usePaymentInitiation() {
  const client = usePayGateContext()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null)
  
  const isSuccess = paymentResult !== null && paymentResult.status === 0

  const initiate = useCallback(async (params: InitiatePaymentParams): Promise<PaymentResponse | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await client.initiatePayment(params)
      setPaymentResult(result)
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'initiation'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [client])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setPaymentResult(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    paymentResult,
    isSuccess,
    initiate,
    reset,
    clearError
  }
}

/**
 * Hook pour la vérification de statut avec polling optionnel
 */
export function usePaymentStatus(reference?: string, pollInterval = 5000) {
  const client = usePayGateContext()
  
  const [status, setStatus] = useState<PaymentStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  const check = useCallback(async (ref?: string): Promise<PaymentStatus | null> => {
    const targetRef = ref || reference
    if (!targetRef) {
      setError('Référence de transaction requise')
      return null
    }

    try {
      setLoading(true)
      setError(null)
      
      const result = await client.checkStatus(targetRef)
      setStatus(result)
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [client, reference])

  const startPolling = useCallback(() => {
    if (isPolling || !reference) return
    
    setIsPolling(true)
    
    const pollTimer = setInterval(() => {
      check(reference)
    }, pollInterval)
    
    // Première vérification immédiate
    check(reference)

    // Nettoyer l'intervalle lors du unmount ou de l'arrêt
    return () => {
      clearInterval(pollTimer)
      setIsPolling(false)
    }
  }, [check, reference, pollInterval, isPolling])

  const stopPolling = useCallback(() => {
    setIsPolling(false)
  }, [])

  const reset = useCallback(() => {
    stopPolling()
    setStatus(null)
    setError(null)
    setLoading(false)
  }, [stopPolling])

  // Effet pour nettoyer le polling au unmount
  useEffect(() => {
    return () => {
      setIsPolling(false)
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