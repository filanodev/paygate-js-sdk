import { vi } from 'vitest'

// Mock console methods to avoid noise during tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
}

// Clean up after each test
beforeEach(() => {
  vi.clearAllMocks()
})