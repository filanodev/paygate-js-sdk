import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { PayGateProvider } from '../client/context'
import { usePayGate, usePaymentInitiation } from '../client/hooks'

// Mock the core client
vi.mock('@filanodev/paygate-core', () => ({
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

describe('Next.js PayGate Hooks', () => {
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

    it('should provide all required methods', () => {
      const { result } = renderHook(() => usePayGate(), { wrapper })

      expect(typeof result.current.initiatePayment).toBe('function')
      expect(typeof result.current.checkPaymentStatus).toBe('function')
      expect(typeof result.current.generatePaymentUrl).toBe('function')
      expect(typeof result.current.disburse).toBe('function')
      expect(typeof result.current.checkBalance).toBe('function')
      expect(typeof result.current.clearError).toBe('function')
      expect(result.current.client).toBeDefined()
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

    it('should provide required methods', () => {
      const { result } = renderHook(() => usePaymentInitiation(), { wrapper })

      expect(typeof result.current.initiate).toBe('function')
      expect(typeof result.current.reset).toBe('function')
      expect(typeof result.current.clearError).toBe('function')
    })
  })
})