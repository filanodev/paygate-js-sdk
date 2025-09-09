import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  getServerPayGateClient,
  serverInitiatePayment,
  serverCheckPaymentStatus,
  createWebhookHandler,
  validateWebhook
} from '../server/utils'

// Mock the core client
vi.mock('@filanodev/paygate-core', () => ({
  PayGateClient: vi.fn().mockImplementation(() => ({
    initiatePayment: vi.fn(),
    checkStatus: vi.fn(),
    checkStatusByIdentifier: vi.fn(),
    generatePaymentUrl: vi.fn(),
    disburse: vi.fn(),
    checkBalance: vi.fn()
  }))
}))

// Mock environment variables
const originalEnv = process.env
beforeEach(() => {
  vi.resetModules()
  process.env = {
    ...originalEnv,
    PAYGATE_TOKEN: 'test-token',
    NODE_ENV: 'test'
  }
})

afterEach(() => {
  process.env = originalEnv
})

describe('Next.js Server Utils', () => {
  describe('getServerPayGateClient', () => {
    it('should create client with environment variables', () => {
      const client = getServerPayGateClient()
      expect(client).toBeDefined()
    })

    it('should create client with custom config', () => {
      const customConfig = {
        authToken: 'custom-token',
        verifySSL: true
      }

      const client = getServerPayGateClient(customConfig)
      expect(client).toBeDefined()
    })

    it('should return singleton instance', () => {
      const client1 = getServerPayGateClient()
      const client2 = getServerPayGateClient()
      expect(client1).toBe(client2)
    })
  })

  describe('serverInitiatePayment', () => {
    it('should initiate payment with server client', async () => {
      const mockResponse = {
        status: 0,
        message: 'Payment initiated',
        txReference: 'TX_123',
        identifier: 'TEST_123'
      }

      const client = getServerPayGateClient()
      vi.mocked(client.initiatePayment).mockResolvedValue(mockResponse)

      const params = {
        phoneNumber: '+22890123456',
        amount: 1000,
        identifier: 'TEST_123',
        network: 'FLOOZ' as const,
        description: 'Test payment'
      }

      const result = await serverInitiatePayment(params)
      expect(result).toEqual(mockResponse)
      expect(client.initiatePayment).toHaveBeenCalledWith(params)
    })
  })

  describe('serverCheckPaymentStatus', () => {
    it('should check payment status with server client', async () => {
      const mockStatus = {
        status: 0,
        message: 'Payment successful',
        txReference: 'TX_123',
        amount: 1000,
        phoneNumber: '+22890123456',
        paymentMethod: 'FLOOZ',
        datetime: '2024-01-01T00:00:00Z'
      }

      const client = getServerPayGateClient()
      vi.mocked(client.checkStatus).mockResolvedValue(mockStatus)

      const result = await serverCheckPaymentStatus('TX_123')
      expect(result).toEqual(mockStatus)
      expect(client.checkStatus).toHaveBeenCalledWith('TX_123')
    })
  })

  describe('validateWebhook', () => {
    const mockPayload = {
      txReference: 'TX_123',
      identifier: 'TEST_123',
      status: 0,
      message: 'Payment successful',
      amount: 1000,
      phoneNumber: '+22890123456',
      paymentMethod: 'FLOOZ',
      datetime: '2024-01-01T00:00:00Z'
    }

    it('should validate webhook payload', () => {
      const result = validateWebhook(mockPayload)
      expect(result).toBe(true)
    })

    it('should reject invalid payload', () => {
      const invalidPayload = { ...mockPayload, txReference: '' }
      const result = validateWebhook(invalidPayload)
      expect(result).toBe(false)
    })

    it('should validate with signature', () => {
      const payloadWithSignature = { ...mockPayload, signature: 'test-signature' }
      const result = validateWebhook(payloadWithSignature, 'secret')
      expect(result).toBe(true)
    })
  })

  describe('createWebhookHandler', () => {
    it('should create webhook handler', async () => {
      const onPaymentUpdated = vi.fn()
      const handler = createWebhookHandler(onPaymentUpdated)

      const mockPayload = {
        txReference: 'TX_123',
        identifier: 'TEST_123',
        status: 0,
        message: 'Payment successful',
        amount: 1000,
        phoneNumber: '+22890123456',
        paymentMethod: 'FLOOZ',
        datetime: '2024-01-01T00:00:00Z'
      }

      const result = await handler(mockPayload)
      expect(result).toBe(true)
      expect(onPaymentUpdated).toHaveBeenCalledWith(mockPayload)
    })

    it('should handle invalid webhook', async () => {
      const onPaymentUpdated = vi.fn()
      const handler = createWebhookHandler(onPaymentUpdated)

      const invalidPayload = {
        txReference: '',
        identifier: '',
        status: 0,
        message: 'Payment successful',
        amount: 1000,
        phoneNumber: '+22890123456',
        paymentMethod: 'FLOOZ',
        datetime: '2024-01-01T00:00:00Z'
      }

      const result = await handler(invalidPayload)
      expect(result).toBe(false)
      expect(onPaymentUpdated).not.toHaveBeenCalled()
    })
  })
})