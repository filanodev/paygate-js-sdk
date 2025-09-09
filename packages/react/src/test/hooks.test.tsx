import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { PayGateProvider } from '../context'
import { usePayGate, usePaymentInitiation, usePaymentStatus } from '../hooks'

// Mock the core client
vi.mock('@filano/paygate-core', () => ({
  PayGateClient: vi.fn().mockImplementation(() => ({
    initiatePayment: vi.fn(),
    checkStatus: vi.fn(),
    checkStatusByIdentifier: vi.fn(),
    generatePaymentUrl: vi.fn(),
    disburse: vi.fn(),
    checkBalance: vi.fn()
  })),
  PayGateError: class PayGateError extends Error {
    constructor(message: string, public status?: number) {
      super(message)
    }
  }
}))

const mockConfig = {
  authToken: 'test-token',
  verifySSL: false
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PayGateProvider {...mockConfig}>
    {children}
  </PayGateProvider>
)

describe('PayGate React Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('usePayGate', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => usePayGate(), { wrapper })

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.lastPayment).toBe(null)
      expect(result.current.lastStatus).toBe(null)
    })

    it('should initiate payment successfully', async () => {
      const mockPaymentResponse = {
        status: 0,
        message: 'Payment initiated',
        txReference: 'TX_123',
        identifier: 'TEST_123'
      }

      const { result } = renderHook(() => usePayGate(), { wrapper })
      
      // Mock the client method
      result.current.client.initiatePayment = vi.fn().mockResolvedValue(mockPaymentResponse)

      let paymentResult: any
      await act(async () => {
        paymentResult = await result.current.initiatePayment({
          phoneNumber: '+22890123456',
          amount: 1000,
          identifier: 'TEST_123',
          network: 'FLOOZ',
          description: 'Test payment'
        })
      })

      expect(paymentResult).toEqual(mockPaymentResponse)
      expect(result.current.lastPayment).toEqual(mockPaymentResponse)
      expect(result.current.error).toBe(null)
    })

    it('should handle payment error', async () => {
      const { result } = renderHook(() => usePayGate(), { wrapper })
      
      result.current.client.initiatePayment = vi.fn().mockRejectedValue(new Error('Payment failed'))

      let paymentResult: any
      await act(async () => {
        paymentResult = await result.current.initiatePayment({
          phoneNumber: '+22890123456',
          amount: 1000,
          identifier: 'TEST_123',
          network: 'FLOOZ',
          description: 'Test payment'
        })
      })

      expect(paymentResult).toBe(null)
      expect(result.current.error).toBe('Payment failed')
    })

    it('should clear error', () => {
      const { result } = renderHook(() => usePayGate(), { wrapper })

      // Set error state manually for testing
      act(() => {
        result.current.client.initiatePayment = vi.fn().mockRejectedValue(new Error('Test error'))
        result.current.initiatePayment({
          phoneNumber: '+22890123456',
          amount: 1000,
          identifier: 'TEST_123',
          network: 'FLOOZ',
          description: 'Test payment'
        })
      })

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBe(null)
    })
  })

  describe('usePaymentInitiation', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => usePaymentInitiation(), { wrapper })

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.paymentResult).toBe(null)
      expect(result.current.isSuccess).toBe(false)
    })

    it('should handle successful payment initiation', async () => {
      const mockPaymentResponse = {
        status: 0,
        message: 'Payment initiated successfully',
        txReference: 'TX_123',
        identifier: 'TEST_123'
      }

      const { result } = renderHook(() => usePaymentInitiation(), { wrapper })
      
      // Access the client through usePayGateContext
      const paygateHook = renderHook(() => usePayGate(), { wrapper })
      paygateHook.result.current.client.initiatePayment = vi.fn().mockResolvedValue(mockPaymentResponse)

      await act(async () => {
        await result.current.initiate({
          phoneNumber: '+22890123456',
          amount: 1000,
          identifier: 'TEST_123',
          network: 'FLOOZ',
          description: 'Test payment'
        })
      })

      expect(result.current.paymentResult).toEqual(mockPaymentResponse)
      expect(result.current.isSuccess).toBe(true)
      expect(result.current.error).toBe(null)
    })

    it('should reset state', () => {
      const { result } = renderHook(() => usePaymentInitiation(), { wrapper })

      act(() => {
        result.current.reset()
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.paymentResult).toBe(null)
      expect(result.current.isSuccess).toBe(false)
    })
  })

  describe('usePaymentStatus', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => usePaymentStatus(), { wrapper })

      expect(result.current.status).toBe(null)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.isPolling).toBe(false)
    })

    it('should check payment status', async () => {
      const mockStatus = {
        status: 0,
        message: 'Payment successful',
        txReference: 'TX_123',
        amount: 1000,
        phoneNumber: '+22890123456',
        paymentMethod: 'FLOOZ',
        datetime: '2024-01-01T00:00:00Z'
      }

      const { result } = renderHook(() => usePaymentStatus('TX_123'), { wrapper })
      
      const paygateHook = renderHook(() => usePayGate(), { wrapper })
      paygateHook.result.current.client.checkStatus = vi.fn().mockResolvedValue(mockStatus)

      await act(async () => {
        await result.current.check('TX_123')
      })

      expect(result.current.status).toEqual(mockStatus)
      expect(result.current.error).toBe(null)
    })

    it('should handle status check error', async () => {
      const { result } = renderHook(() => usePaymentStatus(), { wrapper })
      
      const paygateHook = renderHook(() => usePayGate(), { wrapper })
      paygateHook.result.current.client.checkStatus = vi.fn().mockRejectedValue(new Error('Status check failed'))

      await act(async () => {
        await result.current.check('TX_123')
      })

      expect(result.current.status).toBe(null)
      expect(result.current.error).toBe('Status check failed')
    })

    it('should start and stop polling', () => {
      vi.useFakeTimers()
      
      const { result } = renderHook(() => usePaymentStatus('TX_123', 1000), { wrapper })

      act(() => {
        result.current.startPolling()
      })

      expect(result.current.isPolling).toBe(true)

      act(() => {
        result.current.stopPolling()
      })

      expect(result.current.isPolling).toBe(false)

      vi.useRealTimers()
    })
  })
})