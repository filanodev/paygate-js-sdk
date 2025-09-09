export type PayGateNetwork = 'FLOOZ' | 'TMONEY'

export type PayGateEnvironment = 'sandbox' | 'production'

export interface PayGateConfig {
  authToken: string
  environment?: PayGateEnvironment
  verifySSL?: boolean
  timeout?: number
  baseUrl?: string
  baseUrlV2?: string
}

export interface InitiatePaymentParams {
  phoneNumber: string
  amount: number
  identifier: string
  network: PayGateNetwork
  description?: string
}

export interface GeneratePaymentUrlParams {
  amount: number
  identifier: string
  description?: string
  successUrl?: string
  returnUrl?: string
  phoneNumber?: string
  network?: PayGateNetwork
}

export interface PaymentResponse {
  txReference: string
  status: number
  message?: string
}

export interface PaymentUrlResponse {
  url: string
  identifier: string
}

export interface PaymentStatus {
  txReference: string
  identifier?: string
  status: number
  amount?: number
  phoneNumber?: string
  paymentMethod?: PayGateNetwork
  datetime?: string
  message?: string
}

export interface DisburseParams {
  phoneNumber: string
  amount: number
  reason: string
  network: PayGateNetwork
  reference?: string
}

export interface Balance {
  flooz?: number
  tmoney?: number
}

export interface ApiError {
  status: number
  message: string
  code?: string
}

export class PayGateError extends Error {
  public readonly status: number
  public readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'PayGateError'
    this.status = status
    this.code = code
  }
}