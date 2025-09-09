// URLs officielles selon la documentation PayGateGlobal - PAS DE MODE SANDBOX
export const PAYGATE_URLS = {
  PAYMENT: 'https://paygateglobal.com/api/v1/pay',
  STATUS_V1: 'https://paygateglobal.com/api/v1/status',
  STATUS_V2: 'https://paygateglobal.com/api/v2/status',
  BALANCE: 'https://paygateglobal.com/api/v1/check-balance',
  DISBURSE: 'https://paygateglobal.com/api/v1/disburse',
  PAYMENT_PAGE: 'https://paygateglobal.com/v1/page'
} as const

export const DEFAULT_CONFIG = {
  verifySSL: true,
  timeout: 30000
}

// Codes d'état selon la documentation officielle PayGateGlobal
export const PAYMENT_STATUSES = {
  SUCCESS: 0,    // Paiement réussi avec succès
  PENDING: 2,    // En cours  
  EXPIRED: 4,    // Expiré
  CANCELLED: 6   // Annulé
} as const

export const TRANSACTION_STATUSES = {
  REGISTERED_SUCCESS: 0,    // Transaction enregistrée avec succès
  INVALID_TOKEN: 2,         // Jeton d'authentification invalide
  INVALID_PARAMS: 4,        // Paramètres Invalides
  DUPLICATE_DETECTED: 6     // Doublons détectées
} as const

export const STATUS_MESSAGES = {
  [PAYMENT_STATUSES.SUCCESS]: 'Paiement réussi avec succès',
  [PAYMENT_STATUSES.PENDING]: 'En cours',
  [PAYMENT_STATUSES.EXPIRED]: 'Expiré',
  [PAYMENT_STATUSES.CANCELLED]: 'Annulé'
} as const