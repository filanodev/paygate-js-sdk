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
  buildQueryParams
} from './utils'

export class PayGateClient {
  private config: Required<PayGateConfig>

  constructor(config: PayGateConfig) {
    if (!config.authToken) {
      throw new PayGateError('Token d\'authentification requis', 400)
    }

    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    }
  }

  /**
   * Initier un paiement selon la documentation officielle PayGateGlobal
   * URL: https://paygateglobal.com/api/v1/pay
   * Méthode: POST
   */
  async initiatePayment(params: InitiatePaymentParams): Promise<PaymentResponse> {
    this.validateInitiatePaymentParams(params)

    // Structure exacte selon la documentation officielle
    const payload = {
      auth_token: this.config.authToken,
      phone_number: normalizePhoneNumber(params.phoneNumber),
      amount: params.amount,
      description: params.description || '',
      identifier: params.identifier,
      network: params.network
    }

    const response = await this.makeRequest(PAYGATE_URLS.PAYMENT, payload)
    
    return {
      txReference: response.tx_reference,
      status: response.status,
      message: this.getStatusMessage(response.status)
    }
  }

  /**
   * Vérifier l'état d'un paiement par tx_reference
   * URL: https://paygateglobal.com/api/v1/status
   * Méthode: POST
   */
  async checkStatus(txReference: string): Promise<PaymentStatus> {
    if (!txReference) {
      throw new PayGateError('Référence de transaction requise', 400)
    }

    const payload = {
      auth_token: this.config.authToken,
      tx_reference: txReference
    }

    const response = await this.makeRequest(PAYGATE_URLS.STATUS_V1, payload)
    
    return {
      ...response,
      message: this.getStatusMessage(response.status)
    }
  }

  /**
   * Vérifier l'état d'un paiement par identifier
   * URL: https://paygateglobal.com/api/v2/status
   * Méthode: POST
   */
  async checkStatusByIdentifier(identifier: string): Promise<PaymentStatus> {
    if (!identifier) {
      throw new PayGateError('Identifiant requis', 400)
    }

    const payload = {
      auth_token: this.config.authToken,
      identifier: identifier
    }

    const response = await this.makeRequest(PAYGATE_URLS.STATUS_V2, payload)
    
    return {
      ...response,
      message: this.getStatusMessage(response.status)
    }
  }

  /**
   * Générer une URL de paiement
   * URL: https://paygateglobal.com/v1/page
   * Méthode: GET (Query String)
   */
  generatePaymentUrl(params: Omit<GeneratePaymentUrlParams, 'token'>): PaymentUrlResponse {
    const queryParams = {
      token: this.config.authToken,
      amount: params.amount,
      identifier: params.identifier,
      description: params.description || '',
      url: params.url || '',
      phone: params.phone || '',
      network: params.network || ''
    }

    // Filtrer les paramètres vides
    const filteredParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, value]) => value !== '')
    )

    const queryString = buildQueryParams(filteredParams)
    const url = `${PAYGATE_URLS.PAYMENT_PAGE}?${queryString}`

    return {
      url,
      identifier: params.identifier
    }
  }

  /**
   * Consulter votre solde FLOOZ et TMoney
   * URL: https://paygateglobal.com/api/v1/check-balance
   * Méthode: POST
   */
  async checkBalance(): Promise<Balance> {
    const payload = {
      auth_token: this.config.authToken
    }

    const response = await this.makeRequest(PAYGATE_URLS.BALANCE, payload)
    
    return {
      flooz: response.flooz,
      tmoney: response.tmoney
    }
  }

  /**
   * Effectuer un remboursement/décaissement
   * URL: https://paygateglobal.com/api/v1/disburse
   * Méthode: POST
   */
  async disburse(params: DisburseParams): Promise<PaymentResponse> {
    this.validateDisburseParams(params)

    const payload = {
      auth_token: this.config.authToken,
      phone_number: normalizePhoneNumber(params.phoneNumber),
      amount: params.amount,
      reason: params.reason,
      reference: params.reference || '',
      network: params.network
    }

    const response = await this.makeRequest(PAYGATE_URLS.DISBURSE, payload)
    
    return {
      txReference: response.tx_reference,
      status: response.status,
      message: response.status === 200 ? 'Transfert effectué avec succès' : 'Erreur lors du transfert'
    }
  }

  /**
   * Effectuer une requête HTTP vers l'API PayGateGlobal
   */
  private async makeRequest(url: string, data: any): Promise<any> {
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PayGate-JS-SDK/1.0.0'
      },
      body: JSON.stringify(data)
    }

    // Gestion SSL
    if (!this.config.verifySSL && typeof process !== 'undefined' && process.env) {
      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
    }

    try {
      const response = await fetch(url, fetchOptions)
      
      if (!response.ok) {
        throw new PayGateError(
          `Erreur HTTP ${response.status}: ${response.statusText}`,
          response.status
        )
      }

      const result = await response.json()
      
      // Vérifier les erreurs de l'API PayGateGlobal
      if (result.status && result.status !== 0 && result.status !== 200) {
        throw new PayGateError(
          this.getStatusMessage(result.status),
          result.status
        )
      }

      return result
    } catch (error) {
      if (error instanceof PayGateError) {
        throw error
      }
      throw new PayGateError(
        `Erreur de connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        500
      )
    } finally {
      // Rétablir la vérification SSL
      if (!this.config.verifySSL && typeof process !== 'undefined' && process.env) {
        delete process.env['NODE_TLS_REJECT_UNAUTHORIZED']
      }
    }
  }

  /**
   * Valider les paramètres d'initiation de paiement
   */
  private validateInitiatePaymentParams(params: InitiatePaymentParams): void {
    validatePhoneNumber(params.phoneNumber)
    validateAmount(params.amount)
    validateNetwork(params.network)
    validateIdentifier(params.identifier)
  }

  /**
   * Valider les paramètres de décaissement
   */
  private validateDisburseParams(params: DisburseParams): void {
    validatePhoneNumber(params.phoneNumber)
    validateAmount(params.amount)
    validateNetwork(params.network)
    
    if (!params.reason || params.reason.trim() === '') {
      throw new PayGateError('Raison du décaissement requise', 400)
    }
  }

  /**
   * Obtenir le message d'état selon les codes officiels
   */
  private getStatusMessage(status: number): string {
    return STATUS_MESSAGES[status as keyof typeof STATUS_MESSAGES] || `Statut inconnu: ${status}`
  }
}