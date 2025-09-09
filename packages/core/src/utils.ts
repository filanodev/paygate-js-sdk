import { PayGateError, PayGateNetwork } from './types'

export function validatePhoneNumber(phoneNumber: string): boolean {
  // Format attendu: +228XXXXXXXX ou 228XXXXXXXX ou directement 8 chiffres
  const cleanPhone = phoneNumber.replace(/[\s\-\+]/g, '')
  
  // Vérifier si c'est un numéro togolais valide (8 chiffres ou avec indicatif)
  return /^(?:\+?228)?[0-9]{8}$/.test(cleanPhone)
}

export function normalizePhoneNumber(phoneNumber: string): string {
  let cleanPhone = phoneNumber.replace(/[\s\-\+]/g, '')
  
  // Ajouter l'indicatif 228 si pas présent
  if (cleanPhone.length === 8) {
    cleanPhone = `228${cleanPhone}`
  }
  
  // Retirer le 228 en début s'il est présent (PayGate n'en veut pas)
  if (cleanPhone.startsWith('228')) {
    cleanPhone = cleanPhone.substring(3)
  }
  
  return cleanPhone
}

export function validateNetwork(network: string): network is PayGateNetwork {
  return ['FLOOZ', 'TMONEY'].includes(network.toUpperCase())
}

export function validateAmount(amount: number): boolean {
  return amount > 0 && Number.isInteger(amount)
}

export function validateIdentifier(identifier: string): boolean {
  return identifier.length > 0 && identifier.length <= 100
}

export function isIdentifierFormat(reference: string): boolean {
  // Détecter si c'est un identifier personnalisé (contient des lettres/underscore)
  return /[a-zA-Z_]/.test(reference)
}

export function handleApiError(response: Response, data?: any): never {
  let message = `Erreur API PayGate (${response.status})`
  
  if (data?.error) {
    message = data.error
  } else if (data?.message) {
    message = data.message
  } else {
    switch (response.status) {
      case 401:
        message = 'Token d\'authentification invalide'
        break
      case 400:
        message = 'Paramètres de requête invalides'
        break
      case 404:
        message = 'Ressource non trouvée'
        break
      case 500:
        message = 'Erreur interne du serveur PayGate'
        break
    }
  }
  
  throw new PayGateError(message, response.status, data?.code)
}

export function buildQueryParams(params: Record<string, any>): string {
  const query = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value))
    }
  })
  
  return query.toString()
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}