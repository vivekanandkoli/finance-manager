/**
 * Test Utilities and Helpers
 * Reusable functions for testing React components and business logic
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ============================================================
// React Query Provider for Testing
// ============================================================

interface AllTheProvidersProps {
  children: React.ReactNode
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  })

export const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const testQueryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  )
}

// ============================================================
// Custom Render Function
// ============================================================

export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => {
  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Re-export everything from testing library
export * from '@testing-library/react'
export { customRender as render }

// ============================================================
// Mock Data Generators
// ============================================================

export const mockTransaction = (overrides = {}) => ({
  id: 'txn_' + Math.random().toString(36).substr(2, 9),
  date: '2024-04-15',
  description: 'Test Transaction',
  type: 'debit' as const,
  amount: 1000,
  category: 'Other',
  balance: 50000,
  currency: 'INR' as const,
  user_id: 'user_123',
  created_at: new Date().toISOString(),
  ...overrides,
})

export const mockExpense = (overrides = {}) => ({
  id: 'exp_' + Math.random().toString(36).substr(2, 9),
  date: '2024-04-15',
  description: 'Test Expense',
  amount: 1000,
  category: 'Food & Dining',
  currency: 'INR' as const,
  user_id: 'user_123',
  created_at: new Date().toISOString(),
  ...overrides,
})

export const mockIncome = (overrides = {}) => ({
  id: 'inc_' + Math.random().toString(36).substr(2, 9),
  date: '2024-04-15',
  source: 'Salary',
  amount: 50000,
  currency: 'INR' as const,
  user_id: 'user_123',
  created_at: new Date().toISOString(),
  ...overrides,
})

export const mockBudget = (overrides = {}) => ({
  id: 'bud_' + Math.random().toString(36).substr(2, 9),
  category: 'Food & Dining',
  amount: 10000,
  period: 'monthly' as const,
  currency: 'INR' as const,
  user_id: 'user_123',
  created_at: new Date().toISOString(),
  ...overrides,
})

export const mockUser = (overrides = {}) => ({
  id: 'user_123',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar_url: null,
  default_currency: 'INR' as const,
  created_at: new Date().toISOString(),
  ...overrides,
})

export const mockBankStatement = (overrides = {}) => ({
  success: true,
  bank: 'HDFC Bank',
  accountNumber: 'XXXX1234',
  transactions: [
    mockTransaction({ type: 'debit', amount: 5000, category: 'Cash' }),
    mockTransaction({ type: 'credit', amount: 50000, category: 'Income' }),
  ],
  expenses: [
    mockTransaction({ type: 'debit', amount: 5000, category: 'Cash' }),
  ],
  income: [
    mockTransaction({ type: 'credit', amount: 50000, category: 'Income' }),
  ],
  summary: {
    startDate: '2024-04-01',
    endDate: '2024-04-30',
    totalDeposits: 50000,
    totalWithdrawals: 5000,
    netChange: 45000,
    transactionCount: 2,
    openingBalance: 50000,
    closingBalance: 95000,
    averageDebit: 5000,
    averageCredit: 50000,
    topCategories: {
      Cash: 5000,
      Income: 50000,
    },
    largestExpense: 5000,
    largestIncome: 50000,
    monthlyAverage: 45000,
    periodInMonths: 1,
  },
  ...overrides,
})

export const mockExchangeRate = (overrides = {}) => ({
  from: 'USD',
  to: 'INR',
  rate: 83.5,
  source: 'live' as const,
  api: 'exchangerate-api',
  recorded_at: new Date().toISOString(),
  ...overrides,
})

// ============================================================
// Test File Helpers
// ============================================================

export const createMockFile = (
  content: string,
  filename: string,
  mimeType: string
): File => {
  const blob = new Blob([content], { type: mimeType })
  return new File([blob], filename, { type: mimeType })
}

export const createMockPDFFile = (content = 'PDF content'): File => {
  return createMockFile(content, 'statement.pdf', 'application/pdf')
}

export const createMockCSVFile = (content = 'Date,Description,Amount\n2024-04-15,Test,1000'): File => {
  return createMockFile(content, 'statement.csv', 'text/csv')
}

// ============================================================
// Async Test Helpers
// ============================================================

export const waitForLoadingToFinish = async () => {
  await new Promise((resolve) => setTimeout(resolve, 100))
}

export const flushPromises = async () => {
  return new Promise((resolve) => setImmediate(resolve))
}

// ============================================================
// Supabase Mock Helpers
// ============================================================

export const mockSupabaseQuery = (data: any, error: any = null) => ({
  data,
  error,
  count: null,
  status: error ? 400 : 200,
  statusText: error ? 'Error' : 'OK',
})

export const createMockSupabaseClient = (overrides = {}) => ({
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: mockUser() },
      error: null,
    }),
    signInWithPassword: jest.fn().mockResolvedValue({
      data: { user: mockUser(), session: {} },
      error: null,
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
    ...overrides.auth,
  },
  from: jest.fn((table: string) => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    ...overrides[table],
  })),
})

// ============================================================
// Date Test Helpers
// ============================================================

export const setSystemDate = (date: string | Date) => {
  jest.useFakeTimers()
  jest.setSystemTime(new Date(date))
}

export const restoreSystemDate = () => {
  jest.useRealTimers()
}

// ============================================================
// Local Storage Mock
// ============================================================

export const mockLocalStorage = () => {
  const store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key])
    },
  }
}

// ============================================================
// Fetch Mock Helpers
// ============================================================

export const mockFetchSuccess = (data: any) => {
  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => data,
    status: 200,
    statusText: 'OK',
  })
}

export const mockFetchError = (errorMessage: string, status = 500) => {
  ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error(errorMessage))
}

export const mockFetchSequence = (responses: any[]) => {
  const mockFetch = global.fetch as jest.Mock
  responses.forEach((response) => {
    if (response instanceof Error) {
      mockFetch.mockRejectedValueOnce(response)
    } else {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response,
        status: 200,
        statusText: 'OK',
      })
    }
  })
}

// ============================================================
// Console Mock (Suppress Warnings in Tests)
// ============================================================

export const suppressConsoleErrors = () => {
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalError
  })
}

export const suppressConsoleWarnings = () => {
  const originalWarn = console.warn
  beforeAll(() => {
    console.warn = jest.fn()
  })
  afterAll(() => {
    console.warn = originalWarn
  })
}

// ============================================================
// Custom Matchers
// ============================================================

export const expectToBeWithinRange = (value: number, min: number, max: number) => {
  expect(value).toBeGreaterThanOrEqual(min)
  expect(value).toBeLessThanOrEqual(max)
}

export const expectDateToBeRecent = (dateString: string, maxAgeMs = 5000) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  expect(diff).toBeLessThan(maxAgeMs)
}

export const expectArrayToContainObject = (array: any[], object: any) => {
  expect(array).toEqual(expect.arrayContaining([expect.objectContaining(object)]))
}

// ============================================================
// Form Testing Helpers
// ============================================================

export const fillForm = async (container: HTMLElement, values: Record<string, string>) => {
  const { userEvent } = await import('@testing-library/user-event')
  const user = userEvent.setup()

  for (const [name, value] of Object.entries(values)) {
    const input = container.querySelector(`[name="${name}"]`) as HTMLInputElement
    if (input) {
      await user.clear(input)
      await user.type(input, value)
    }
  }
}

export const submitForm = async (container: HTMLElement) => {
  const { userEvent } = await import('@testing-library/user-event')
  const user = userEvent.setup()

  const form = container.querySelector('form')
  if (form) {
    await user.click(form.querySelector('[type="submit"]') as HTMLElement)
  }
}

// ============================================================
// Error Boundary Test Helper
// ============================================================

export const TestErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  try {
    return <>{children}</>
  } catch (error) {
    return <div>Error occurred</div>
  }
}
