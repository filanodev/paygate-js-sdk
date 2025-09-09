import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PayGateClient, PayGateError } from '../client'
import type { PayGateConfig, InitiatePaymentParams } from '../types'

// Mock fetch globally
global.fetch = vi.fn()

const mockConfig: PayGateConfig = {
  authToken: 'test-token',
  verifySSL: true
}

describe('PayGateClient', () => {
  let client: PayGateClient
  let fetchMock: any

  beforeEach(() => {
    client = new PayGateClient(mockConfig)
    fetchMock = vi.mocked(fetch)
    fetchMock.mockClear()
  })

  describe('constructor', () => {
    it('should create client with default config', () => {
      const defaultClient = new PayGateClient({ authToken: 'token' })
      expect(defaultClient).toBeInstanceOf(PayGateClient)
    })

    it('should throw error if no authToken provided', () => {
      expect(() => new PayGateClient({ authToken: '' })).toThrow('Token d\'authentification requis')
    })
  })

  describe('initiatePayment', () => {
    const paymentParams: InitiatePaymentParams = {
      phoneNumber: '+22890123456',
      amount: 1000,
      identifier: 'TEST_123',
      network: 'FLOOZ',
      description: 'Test payment'
    }

    it('should initiate payment successfully', async () => {
      const mockResponse = {
        status: 0,
        message: 'Payment initiated successfully',
        txReference: 'TX_123456789',
        identifier: 'TEST_123'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.initiatePayment(paymentParams)

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.paygateglobal.com/v1/payment',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(paymentParams)
        })
      )

      expect(result).toEqual(mockResponse)
    })

    it('should throw PayGateError on API error', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          message: 'Invalid phone number',
          status: 400
        })
      })

      await expect(client.initiatePayment(paymentParams)).rejects.toThrow(PayGateError)
    })

    it('should validate phone number format', async () => {
      const invalidParams = { ...paymentParams, phoneNumber: '123456' }
      
      await expect(client.initiatePayment(invalidParams)).rejects.toThrow('Numéro de téléphone invalide')
    })

    it('should validate amount', async () => {
      const invalidParams = { ...paymentParams, amount: 0 }
      
      await expect(client.initiatePayment(invalidParams)).rejects.toThrow('Montant invalide')
    })

    it('should validate network', async () => {
      const invalidParams = { ...paymentParams, network: 'INVALID' as any }
      
      await expect(client.initiatePayment(invalidParams)).rejects.toThrow('Réseau invalide')
    })
  })

  describe('checkStatus', () => {
    it('should check payment status successfully', async () => {
      const mockStatus = {
        status: 0,
        message: 'Payment successful',
        txReference: 'TX_123456789',
        amount: 1000,
        phoneNumber: '+22890123456',
        paymentMethod: 'FLOOZ',
        datetime: '2024-01-01T00:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStatus)
      })

      const result = await client.checkStatus('TX_123456789')

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.paygateglobal.com/v2/payment/TX_123456789',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )

      expect(result).toEqual(mockStatus)
    })

    it('should throw error for empty reference', async () => {
      await expect(client.checkStatus('')).rejects.toThrow('Référence de transaction requise')
    })
  })

  describe('generatePaymentUrl', () => {
    it('should generate payment URL successfully', () => {
      const params = {
        phoneNumber: '+22890123456',
        amount: 1000,
        identifier: 'TEST_123',
        network: 'FLOOZ' as const,
        description: 'Test payment',
        callbackUrl: 'https://example.com/callback',
        returnUrl: 'https://example.com/return'
      }

      const result = client.generatePaymentUrl(params)

      expect(result.url).toContain('https://checkout.paygateglobal.com')
      expect(result.url).toContain('phoneNumber=%2B22890123456')
      expect(result.url).toContain('amount=1000')
      expect(result.url).toContain('network=FLOOZ')
    })
  })

  describe('checkBalance', () => {
    it('should check balance successfully', async () => {
      const mockBalance = {
        balance: 50000,
        currency: 'XOF'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBalance)
      })

      const result = await client.checkBalance()

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.paygateglobal.com/v1/balance',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )

      expect(result).toEqual(mockBalance)
    })
  })

  describe('disburse', () => {
    it('should disburse successfully', async () => {
      const disburseParams = {
        phoneNumber: '+22890123456',
        amount: 1000,
        identifier: 'DISBURSE_123',
        network: 'FLOOZ' as const,
        description: 'Test disbursement'
      }

      const mockResponse = {
        status: 0,
        message: 'Disbursement initiated successfully',
        txReference: 'TX_DIS_123456789',
        identifier: 'DISBURSE_123'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.disburse(disburseParams)

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.paygateglobal.com/v1/disburse',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(disburseParams)
        })
      )

      expect(result).toEqual(mockResponse)
    })
  })

})