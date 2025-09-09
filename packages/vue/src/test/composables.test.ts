import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createApp } from 'vue'
import { usePayGate, usePaymentInitiation, usePaymentStatus } from '../composables'
import { PayGatePlugin } from '../plugin'

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

const createTestApp = () => {
  const app = createApp({})
  app.use(PayGatePlugin, {
    authToken: 'test-token',
    verifySSL: false
  })
  return app
}

describe('Vue PayGate Composables', () => {
  let app: any

  beforeEach(() => {
    app = createTestApp()
    vi.clearAllMocks()
  })

  describe('usePayGate', () => {
    it('should initialize with default state', () => {
      let composableResult: any
      
      app.mount(document.createElement('div'))
      
      const component = {
        setup() {
          composableResult = usePayGate()
          return {}
        },
        template: '<div></div>'
      }
      
      const instance = createApp(component)
      instance.use(PayGatePlugin, {
        authToken: 'test-token',
        verifySSL: false
      })
      instance.mount(document.createElement('div'))

      expect(composableResult.loading.value).toBe(false)
      expect(composableResult.error.value).toBe(null)
      expect(composableResult.lastPayment.value).toBe(null)
      expect(composableResult.lastStatus.value).toBe(null)
    })

    it('should provide all required methods', () => {
      let composableResult: any
      
      const component = {
        setup() {
          composableResult = usePayGate()
          return {}
        },
        template: '<div></div>'
      }
      
      const instance = createApp(component)
      instance.use(PayGatePlugin, {
        authToken: 'test-token',
        verifySSL: false
      })
      instance.mount(document.createElement('div'))

      expect(typeof composableResult.initiatePayment).toBe('function')
      expect(typeof composableResult.checkPaymentStatus).toBe('function')
      expect(typeof composableResult.generatePaymentUrl).toBe('function')
      expect(typeof composableResult.disburse).toBe('function')
      expect(typeof composableResult.checkBalance).toBe('function')
      expect(typeof composableResult.clearError).toBe('function')
    })
  })

  describe('usePaymentInitiation', () => {
    it('should initialize with default state', () => {
      let composableResult: any
      
      const component = {
        setup() {
          composableResult = usePaymentInitiation()
          return {}
        },
        template: '<div></div>'
      }
      
      const instance = createApp(component)
      instance.use(PayGatePlugin, {
        authToken: 'test-token',
        verifySSL: false
      })
      instance.mount(document.createElement('div'))

      expect(composableResult.loading.value).toBe(false)
      expect(composableResult.error.value).toBe(null)
      expect(composableResult.paymentResult.value).toBe(null)
      expect(composableResult.isSuccess.value).toBe(false)
    })

    it('should provide required methods', () => {
      let composableResult: any
      
      const component = {
        setup() {
          composableResult = usePaymentInitiation()
          return {}
        },
        template: '<div></div>'
      }
      
      const instance = createApp(component)
      instance.use(PayGatePlugin, {
        authToken: 'test-token',
        verifySSL: false
      })
      instance.mount(document.createElement('div'))

      expect(typeof composableResult.initiate).toBe('function')
      expect(typeof composableResult.reset).toBe('function')
      expect(typeof composableResult.clearError).toBe('function')
    })
  })

  describe('usePaymentStatus', () => {
    it('should initialize with default state', () => {
      let composableResult: any
      
      const component = {
        setup() {
          composableResult = usePaymentStatus()
          return {}
        },
        template: '<div></div>'
      }
      
      const instance = createApp(component)
      instance.use(PayGatePlugin, {
        authToken: 'test-token',
        verifySSL: false
      })
      instance.mount(document.createElement('div'))

      expect(composableResult.status.value).toBe(null)
      expect(composableResult.loading.value).toBe(false)
      expect(composableResult.error.value).toBe(null)
      expect(composableResult.isPolling.value).toBe(false)
    })

    it('should provide required methods', () => {
      let composableResult: any
      
      const component = {
        setup() {
          composableResult = usePaymentStatus('TX_123', 5000)
          return {}
        },
        template: '<div></div>'
      }
      
      const instance = createApp(component)
      instance.use(PayGatePlugin, {
        authToken: 'test-token',
        verifySSL: false
      })
      instance.mount(document.createElement('div'))

      expect(typeof composableResult.check).toBe('function')
      expect(typeof composableResult.startPolling).toBe('function')
      expect(typeof composableResult.stopPolling).toBe('function')
      expect(typeof composableResult.reset).toBe('function')
    })
  })
})