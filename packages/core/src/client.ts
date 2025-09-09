import { 
  PayGateConfig, 
  InitiatePaymentParams, 
  GeneratePaymentUrlParams,
  PaymentResponse,
  PaymentUrlResponse,
  PaymentStatus,
  DisburseParams,
  Balance,
  PayGateError
} from './types'
import { 
  PAYGATE_URLS, 
  DEFAULT_CONFIG,
  STATUS_MESSAGES 
} from './constants'
import { 
  validatePhoneNumber,
  normalizePhoneNumber,
  validateNetwork,
  validateAmount,
  validateIdentifier,
  isIdentifierFormat,
  handleApiError,
  buildQueryParams
} from './utils'

export class PayGateClient {
  private config: Required<PayGateConfig>

  constructor(config: PayGateConfig) {
    if (!config.authToken) {
      throw new PayGateError('Auth token is required', 400, 'MISSING_AUTH_TOKEN')
    }

    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      baseUrl: config.baseUrl || PAYGATE_URLS[config.environment?.toUpperCase() as keyof typeof PAYGATE_URLS || 'SANDBOX'].API_V1,
      baseUrlV2: config.baseUrlV2 || PAYGATE_URLS[config.environment?.toUpperCase() as keyof typeof PAYGATE_URLS || 'SANDBOX'].API_V2
    }
  }

  /**
   * Initier un paiement direct via l'API
   */
  async initiatePayment(params: InitiatePaymentParams): Promise<PaymentResponse> {
    this.validateInitiatePaymentParams(params)

    const data = {
      auth_token: this.config.authToken,
      phone_number: normalizePhoneNumber(params.phoneNumber),
      amount: params.amount,
      identifier: params.identifier,
      network: params.network.toUpperCase(),
      ...(params.description && { description: params.description })
    }

    const response = await this.makeRequest('POST', '/pay', data)
    
    return {
      txReference: response.tx_reference,
      status: response.status,
      message: this.getTransactionStatusMessage(response.status)
    }
  }

  /**
   * Générer une URL de paiement pour redirection
   */
  generatePaymentUrl(params: GeneratePaymentUrlParams): PaymentUrlResponse {
    this.validateGeneratePaymentUrlParams(params)

    const paymentPageUrl = PAYGATE_URLS[this.config.environment.toUpperCase() as keyof typeof PAYGATE_URLS].PAYMENT_PAGE
    
    const queryParams = {
      token: this.config.authToken,
      amount: params.amount,
      identifier: params.identifier,
      ...(params.description && { description: params.description }),
      ...(params.successUrl && { url: params.successUrl }),
      ...(params.returnUrl && { url: params.returnUrl }),
      ...(params.phoneNumber && { phone: normalizePhoneNumber(params.phoneNumber) }),
      ...(params.network && { network: params.network.toUpperCase() })
    }

    const url = `${paymentPageUrl}?${buildQueryParams(queryParams)}`
    
    return {
      url,
      identifier: params.identifier
    }
  }

  /**
   * Vérifier le statut d'un paiement par référence PayGate
   */
  async checkPaymentStatus(txReference: string): Promise<PaymentStatus> {
    if (!txReference) {
      throw new PayGateError('Transaction reference is required', 400, 'MISSING_TX_REFERENCE')
    }

    const data = {
      auth_token: this.config.authToken,
      tx_reference: txReference
    }

    const response = await this.makeRequest('POST', '/status', data)
    
    return this.formatPaymentStatus(response)
  }

  /**
   * Vérifier le statut d'un paiement par identifier personnalisé
   */
  async checkPaymentStatusByIdentifier(identifier: string): Promise<PaymentStatus> {
    if (!identifier) {
      throw new PayGateError('Identifier is required', 400, 'MISSING_IDENTIFIER')
    }

    const data = {
      auth_token: this.config.authToken,
      identifier: identifier
    }

    const response = await this.makeRequestV2('POST', '/status', data)
    
    return this.formatPaymentStatus(response)
  }

  /**
   * Vérifier le statut d'un paiement (détecte automatiquement le type)
   */
  async checkStatus(reference: string): Promise<PaymentStatus> {
    if (isIdentifierFormat(reference)) {
      return this.checkPaymentStatusByIdentifier(reference)
    } else {
      return this.checkPaymentStatus(reference)
    }
  }

  /**
   * Effectuer un remboursement
   */
  async disburse(params: DisburseParams): Promise<PaymentResponse> {
    this.validateDisburseParams(params)

    const data = {
      auth_token: this.config.authToken,
      phone_number: normalizePhoneNumber(params.phoneNumber),
      amount: params.amount,
      reason: params.reason,
      network: params.network.toUpperCase(),
      ...(params.reference && { reference: params.reference })
    }

    const response = await this.makeRequest('POST', '/disburse', data)
    
    return {
      txReference: response.tx_reference || response.reference,
      status: response.status,
      message: this.getTransactionStatusMessage(response.status)
    }
  }

  /**
   * Consulter les soldes
   */
  async checkBalance(): Promise<Balance> {
    const data = {
      auth_token: this.config.authToken
    }

    const response = await this.makeRequest('POST', '/check-balance', data)
    
    return {
      flooz: response.flooz,
      tmoney: response.tmoney
    }
  }

  /**
   * Obtenir le message de statut en français
   */
  getStatusMessage(status: number): string {
    return STATUS_MESSAGES[status as keyof typeof STATUS_MESSAGES] || 'Statut inconnu'
  }

  /**
   * Obtenir le message de statut de transaction
   */
  getTransactionStatusMessage(status: number): string {
    const messages = {
      0: 'Transaction enregistrée avec succès',
      2: 'Jeton d\'authentification invalide',
      4: 'Paramètres invalides',
      6: 'Doublons détectés. Une transaction avec le même identifiant existe déjà.'
    }
    
    return messages[status as keyof typeof messages] || 'Statut de transaction inconnu'
  }

  // Méthodes privées
  
  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    return this.request(this.config.baseUrl + endpoint, method, data)
  }

  private async makeRequestV2(method: string, endpoint: string, data?: any): Promise<any> {
    return this.request(this.config.baseUrlV2 + endpoint, method, data)
  }

  private async request(url: string, method: string, data?: any): Promise<any> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      let responseData
      try {
        responseData = await response.json()
      } catch {
        responseData = null
      }

      if (!response.ok) {
        handleApiError(response, responseData)
      }

      return responseData || {}
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof PayGateError) {
        throw error
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new PayGateError('Request timeout', 408, 'TIMEOUT')
        }
        throw new PayGateError(`Network error: ${error.message}`, 500, 'NETWORK_ERROR')
      }
      
      throw new PayGateError('Unknown error occurred', 500, 'UNKNOWN_ERROR')
    }
  }

  private formatPaymentStatus(response: any): PaymentStatus {
    return {
      txReference: response.tx_reference || response.txReference,
      identifier: response.identifier,
      status: response.status,
      amount: response.amount,
      phoneNumber: response.phone_number,
      paymentMethod: response.payment_method,
      datetime: response.datetime,
      message: this.getStatusMessage(response.status)
    }
  }

  private validateInitiatePaymentParams(params: InitiatePaymentParams): void {
    if (!validatePhoneNumber(params.phoneNumber)) {
      throw new PayGateError('Invalid phone number format', 400, 'INVALID_PHONE_NUMBER')
    }
    
    if (!validateAmount(params.amount)) {
      throw new PayGateError('Amount must be a positive integer', 400, 'INVALID_AMOUNT')
    }
    
    if (!validateIdentifier(params.identifier)) {
      throw new PayGateError('Identifier is required and must be less than 100 characters', 400, 'INVALID_IDENTIFIER')
    }
    
    if (!validateNetwork(params.network)) {
      throw new PayGateError('Network must be FLOOZ or TMONEY', 400, 'INVALID_NETWORK')
    }
  }

  private validateGeneratePaymentUrlParams(params: GeneratePaymentUrlParams): void {
    if (!validateAmount(params.amount)) {
      throw new PayGateError('Amount must be a positive integer', 400, 'INVALID_AMOUNT')
    }
    
    if (!validateIdentifier(params.identifier)) {
      throw new PayGateError('Identifier is required and must be less than 100 characters', 400, 'INVALID_IDENTIFIER')
    }
    
    if (params.phoneNumber && !validatePhoneNumber(params.phoneNumber)) {
      throw new PayGateError('Invalid phone number format', 400, 'INVALID_PHONE_NUMBER')
    }
    
    if (params.network && !validateNetwork(params.network)) {
      throw new PayGateError('Network must be FLOOZ or TMONEY', 400, 'INVALID_NETWORK')
    }
  }

  private validateDisburseParams(params: DisburseParams): void {
    if (!validatePhoneNumber(params.phoneNumber)) {
      throw new PayGateError('Invalid phone number format', 400, 'INVALID_PHONE_NUMBER')
    }
    
    if (!validateAmount(params.amount)) {
      throw new PayGateError('Amount must be a positive integer', 400, 'INVALID_AMOUNT')
    }
    
    if (!params.reason || params.reason.trim().length === 0) {
      throw new PayGateError('Reason is required for disbursement', 400, 'MISSING_REASON')
    }
    
    if (!validateNetwork(params.network)) {
      throw new PayGateError('Network must be FLOOZ or TMONEY', 400, 'INVALID_NETWORK')
    }
  }
}