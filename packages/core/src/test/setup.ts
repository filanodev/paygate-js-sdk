import { vi } from 'vitest'

// Mock fetch globally for all tests
global.fetch = vi.fn()

// Reset mocks before each test
beforeEach(() => {
  vi.resetAllMocks()
})