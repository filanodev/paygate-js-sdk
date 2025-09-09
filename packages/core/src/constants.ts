export const PAYGATE_URLS = {
  PRODUCTION: {
    API_V1: 'https://paygateglobal.com/api/v1',
    API_V2: 'https://paygateglobal.com/api/v2',
    PAYMENT_PAGE: 'https://paygateglobal.com/v1/page'
  },
  SANDBOX: {
    API_V1: 'https://paygateglobal.com/api/v1', // Même URL pour le moment
    API_V2: 'https://paygateglobal.com/api/v2',
    PAYMENT_PAGE: 'https://paygateglobal.com/v1/page'
  }
} as const

export const DEFAULT_CONFIG = {
  environment: 'sandbox' as const,
  verifySSL: true,
  timeout: 30000
}

export const PAYMENT_STATUSES = {
  SUCCESS: 0,
  PENDING: 1,
  INITIALIZED: 2,
  PROCESSING: 3,
  INSUFFICIENT_FUNDS: 4,
  INVALID_NUMBER: 5,
  FAILED: 6,
  EXPIRED: 7
} as const

export const TRANSACTION_STATUSES = {
  REGISTERED_SUCCESS: 0,
  INVALID_TOKEN: 2,
  INVALID_PARAMS: 4,
  DUPLICATE_DETECTED: 6
} as const

export const STATUS_MESSAGES = {
  [PAYMENT_STATUSES.SUCCESS]: 'Paiement réussi avec succès',
  [PAYMENT_STATUSES.PENDING]: 'Paiement en attente',
  [PAYMENT_STATUSES.INITIALIZED]: 'Paiement initialisé',
  [PAYMENT_STATUSES.PROCESSING]: 'Paiement en cours de traitement',
  [PAYMENT_STATUSES.INSUFFICIENT_FUNDS]: 'Fonds insuffisants',
  [PAYMENT_STATUSES.INVALID_NUMBER]: 'Numéro de téléphone invalide',
  [PAYMENT_STATUSES.FAILED]: 'Paiement échoué',
  [PAYMENT_STATUSES.EXPIRED]: 'Paiement expiré'
} as const