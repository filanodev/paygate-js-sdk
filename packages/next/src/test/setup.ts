import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with testing-library matchers
expect.extend(matchers)

// Clean up after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Mock console methods to avoid noise during tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
}

// Mock Next.js modules
vi.mock('next/server', () => ({
  NextRequest: class MockNextRequest {},
  NextResponse: {
    json: (data: any, options?: any) => ({ 
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      headers: new Map()
    }),
    next: () => ({ next: true })
  }
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn()
  }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams()
}))