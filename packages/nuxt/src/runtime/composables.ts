import { ref, computed, useNuxtApp, onUnmounted } from '#app'
import type { 
  InitiatePaymentParams, 
  PaymentResponse, 
  PaymentStatus, 
  GeneratePaymentUrlParams,
  PaymentUrlResponse,
  DisburseParams,
  Balance
} from '@filano/paygate-core'

interface UsePayGateState {
  loading: boolean
  error: string | null
  lastPayment: PaymentResponse | null
  lastStatus: PaymentStatus | null
}

/**
 * Composable principal pour PayGate avec toutes les fonctionnalités
 */
export function usePayGate() {
  const { $paygate } = useNuxtApp()
  
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

  const clearError = () => {
    state.value.error = null
  }

  const initiatePayment = async (params: InitiatePaymentParams): Promise<PaymentResponse | null> => {
    try {
      state.value.loading = true
      state.value.error = null
      
      const response = await $paygate.initiatePayment(params)
      state.value.lastPayment = response
      
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'initiation du paiement'
      state.value.error = errorMessage
      return null
    } finally {
      state.value.loading = false
    }
  }

  const generatePaymentUrl = (params: GeneratePaymentUrlParams): PaymentUrlResponse | null => {
    try {
      state.value.error = null
      return $paygate.generatePaymentUrl(params)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération de l\'URL'
      state.value.error = errorMessage
      return null
    }
  }

  const checkPaymentStatus = async (reference: string): Promise<PaymentStatus | null> => {
    try {
      state.value.loading = true
      state.value.error = null
      
      const status = await $paygate.checkStatus(reference)
      state.value.lastStatus = status
      
      return status
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification du statut'
      state.value.error = errorMessage
      return null
    } finally {
      state.value.loading = false
    }
  }

  const checkPaymentStatusByIdentifier = async (identifier: string): Promise<PaymentStatus | null> => {
    try {
      state.value.loading = true
      state.value.error = null
      
      const status = await $paygate.checkStatusByIdentifier(identifier)
      state.value.lastStatus = status
      
      return status
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification du statut'
      state.value.error = errorMessage
      return null
    } finally {
      state.value.loading = false
    }
  }

  const checkStatus = checkPaymentStatus

  const disburse = async (params: DisburseParams): Promise<PaymentResponse | null> => {
    try {
      state.value.loading = true
      state.value.error = null
      
      const response = await $paygate.disburse(params)
      state.value.lastPayment = response
      
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du décaissement'
      state.value.error = errorMessage
      return null
    } finally {
      state.value.loading = false
    }
  }

  const checkBalance = async (): Promise<Balance | null> => {
    try {
      state.value.loading = true
      state.value.error = null
      
      return await $paygate.checkBalance()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification du solde'
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
    
    // Client direct
    client: $paygate
  }
}

/**
 * Composable spécialisé pour l'initiation de paiements
 */
export function usePaymentInitiation() {
  const { $paygate } = useNuxtApp()
  
  const loading = ref(false)
  const error = ref<string | null>(null)
  const paymentResult = ref<PaymentResponse | null>(null)
  
  const isSuccess = computed(() => 
    paymentResult.value !== null && paymentResult.value.status === 0
  )

  const initiate = async (params: InitiatePaymentParams): Promise<PaymentResponse | null> => {
    try {
      loading.value = true
      error.value = null
      
      const result = await $paygate.initiatePayment(params)
      paymentResult.value = result
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'initiation'
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    loading.value = false
    error.value = null
    paymentResult.value = null
  }

  const clearError = () => {
    error.value = null
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    paymentResult: computed(() => paymentResult.value),
    isSuccess,
    initiate,
    reset,
    clearError
  }
}

/**
 * Composable pour la vérification de statut avec polling optionnel
 */
export function usePaymentStatus(reference?: string, pollInterval = 5000) {
  const { $paygate } = useNuxtApp()
  
  const status = ref<PaymentStatus | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isPolling = ref(false)
  
  let pollTimer: NodeJS.Timeout | null = null

  const check = async (ref?: string): Promise<PaymentStatus | null> => {
    const targetRef = ref || reference
    if (!targetRef) {
      error.value = 'Référence de transaction requise'
      return null
    }

    try {
      loading.value = true
      error.value = null
      
      const result = await $paygate.checkStatus(targetRef)
      status.value = result
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification'
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }

  const startPolling = () => {
    if (isPolling.value || !reference) return
    
    isPolling.value = true
    pollTimer = setInterval(() => {
      check(reference)
    }, pollInterval)
    
    // Première vérification immédiate
    check(reference)
  }

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
    isPolling.value = false
  }

  const reset = () => {
    stopPolling()
    status.value = null
    error.value = null
    loading.value = false
  }

  // Nettoyer lors de la destruction du composable
  if (process.client) {
    onUnmounted(() => {
      stopPolling()
    })
  }

  return {
    status: computed(() => status.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    isPolling: computed(() => isPolling.value),
    check,
    startPolling,
    stopPolling,
    reset
  }
}