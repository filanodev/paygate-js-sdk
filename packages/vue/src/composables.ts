import { ref, computed, inject, type Ref } from 'vue'
import { 
  PayGateClient, 
  PayGateError,
  type InitiatePaymentParams,
  type GeneratePaymentUrlParams,
  type DisburseParams,
  type PaymentResponse,
  type PaymentUrlResponse,
  type PaymentStatus,
  type Balance
} from '@filano/paygate-core'
import type { UsePayGateState } from './types'

export const PAYGATE_CLIENT_KEY = Symbol('paygate-client')

/**
 * Composable principal pour utiliser PayGate dans Vue
 */
export function usePayGate() {
  const client = inject<PayGateClient>(PAYGATE_CLIENT_KEY)
  
  if (!client) {
    throw new Error('PayGate client not found. Make sure to install the PayGate plugin.')
  }

  const state = ref<UsePayGateState>({
    loading: false,
    error: null,
    lastPayment: null,
    lastStatus: null
  })

  const loading = computed(() => state.value.loading)
  const error = computed(() => state.value.error)
  const lastPayment = computed(() => state.value.lastPayment)
  const lastStatus = computed(() => state.value.lastStatus)

  /**
   * Réinitialise l'état d'erreur
   */
  const clearError = () => {
    state.value.error = null
  }

  /**
   * Initie un paiement
   */
  const initiatePayment = async (params: InitiatePaymentParams): Promise<PaymentResponse | null> => {
    state.value.loading = true
    state.value.error = null

    try {
      const result = await client.initiatePayment(params)
      state.value.lastPayment = result
      return result
    } catch (error) {
      const errorMessage = error instanceof PayGateError ? error.message : 'Erreur inconnue'
      state.value.error = errorMessage
      return null
    } finally {
      state.value.loading = false
    }
  }

  /**
   * Génère une URL de paiement
   */
  const generatePaymentUrl = (params: GeneratePaymentUrlParams): PaymentUrlResponse | null => {
    state.value.error = null

    try {
      return client.generatePaymentUrl(params)
    } catch (error) {
      const errorMessage = error instanceof PayGateError ? error.message : 'Erreur inconnue'
      state.value.error = errorMessage
      return null
    }
  }

  /**
   * Vérifie le statut d'un paiement
   */
  const checkPaymentStatus = async (reference: string): Promise<PaymentStatus | null> => {
    state.value.loading = true
    state.value.error = null

    try {
      const result = await client.checkPaymentStatus(reference)
      state.value.lastStatus = result
      return result
    } catch (error) {
      const errorMessage = error instanceof PayGateError ? error.message : 'Erreur inconnue'
      state.value.error = errorMessage
      return null
    } finally {
      state.value.loading = false
    }
  }

  /**
   * Vérifie le statut par identifier
   */
  const checkPaymentStatusByIdentifier = async (identifier: string): Promise<PaymentStatus | null> => {
    state.value.loading = true
    state.value.error = null

    try {
      const result = await client.checkPaymentStatusByIdentifier(identifier)
      state.value.lastStatus = result
      return result
    } catch (error) {
      const errorMessage = error instanceof PayGateError ? error.message : 'Erreur inconnue'
      state.value.error = errorMessage
      return null
    } finally {
      state.value.loading = false
    }
  }

  /**
   * Vérifie le statut automatiquement
   */
  const checkStatus = async (reference: string): Promise<PaymentStatus | null> => {
    state.value.loading = true
    state.value.error = null

    try {
      const result = await client.checkStatus(reference)
      state.value.lastStatus = result
      return result
    } catch (error) {
      const errorMessage = error instanceof PayGateError ? error.message : 'Erreur inconnue'
      state.value.error = errorMessage
      return null
    } finally {
      state.value.loading = false
    }
  }

  /**
   * Effectue un remboursement
   */
  const disburse = async (params: DisburseParams): Promise<PaymentResponse | null> => {
    state.value.loading = true
    state.value.error = null

    try {
      const result = await client.disburse(params)
      return result
    } catch (error) {
      const errorMessage = error instanceof PayGateError ? error.message : 'Erreur inconnue'
      state.value.error = errorMessage
      return null
    } finally {
      state.value.loading = false
    }
  }

  /**
   * Consulte les soldes
   */
  const checkBalance = async (): Promise<Balance | null> => {
    state.value.loading = true
    state.value.error = null

    try {
      const result = await client.checkBalance()
      return result
    } catch (error) {
      const errorMessage = error instanceof PayGateError ? error.message : 'Erreur inconnue'
      state.value.error = errorMessage
      return null
    } finally {
      state.value.loading = false
    }
  }

  return {
    // État
    loading,
    error,
    lastPayment,
    lastStatus,

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
 * Composable pour l'initiation de paiements avec état local
 */
export function usePaymentInitiation() {
  const { initiatePayment, loading, error, clearError } = usePayGate()
  
  const paymentResult = ref<PaymentResponse | null>(null)
  const isSuccess = computed(() => paymentResult.value?.status === 0)

  const initiate = async (params: InitiatePaymentParams) => {
    paymentResult.value = null
    const result = await initiatePayment(params)
    if (result) {
      paymentResult.value = result
    }
    return result
  }

  const reset = () => {
    paymentResult.value = null
    clearError()
  }

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
 * Composable pour la vérification de statut avec polling
 */
export function usePaymentStatus(reference: Ref<string> | string, pollInterval = 5000) {
  const { checkStatus, loading, error } = usePayGate()
  
  const status = ref<PaymentStatus | null>(null)
  const isPolling = ref(false)
  const pollTimer = ref<NodeJS.Timeout | null>(null)

  const check = async () => {
    const ref = typeof reference === 'string' ? reference : reference.value
    if (!ref) return null

    const result = await checkStatus(ref)
    if (result) {
      status.value = result
    }
    return result
  }

  const startPolling = () => {
    if (isPolling.value) return

    isPolling.value = true
    pollTimer.value = setInterval(async () => {
      await check()
      
      // Arrêter le polling si le paiement est terminé (succès ou échec final)
      if (status.value && [0, 4, 5, 6, 7].includes(status.value.status)) {
        stopPolling()
      }
    }, pollInterval)
  }

  const stopPolling = () => {
    if (pollTimer.value) {
      clearInterval(pollTimer.value)
      pollTimer.value = null
    }
    isPolling.value = false
  }

  const reset = () => {
    stopPolling()
    status.value = null
  }

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