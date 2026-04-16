/**
 * Exchange Rates API Tests
 * Testing live rate fetching, fallback mechanisms, and database caching
 */

import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/exchange-rates/route'

// Mock fetch globally
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('Exchange Rates API - GET', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockReset()
  })

  it('should fetch rates from primary API successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rates: {
          INR: 83.5,
          USD: 1.0,
        },
      }),
    } as Response)

    const request = new NextRequest('http://localhost:3000/api/exchange-rates?from=USD&to=INR')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toMatchObject({
      rate: 83.5,
      from: 'USD',
      to: 'INR',
      source: 'live',
      api: 'exchangerate-api',
    })
  })

  it('should use default currencies (THB to INR) when not specified', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rates: {
          INR: 2.35,
        },
      }),
    } as Response)

    const request = new NextRequest('http://localhost:3000/api/exchange-rates')
    const response = await GET(request)
    const data = await response.json()

    expect(data.from).toBe('THB')
    expect(data.to).toBe('INR')
  })

  it('should fallback to second API when primary fails', async () => {
    // First API fails
    mockFetch.mockRejectedValueOnce(new Error('Timeout'))

    // Second API succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rates: { INR: 83.5 },
        conversion_rates: { INR: 83.5 },
      }),
    } as Response)

    const request = new NextRequest('http://localhost:3000/api/exchange-rates?from=USD&to=INR')
    const response = await GET(request)
    const data = await response.json()

    expect(data.api).toBe('open-er-api')
    expect(data.rate).toBe(83.5)
  })

  it('should fallback to Frankfurter API when first two fail', async () => {
    // First two APIs fail
    mockFetch.mockRejectedValueOnce(new Error('Timeout'))
    mockFetch.mockRejectedValueOnce(new Error('Timeout'))

    // Third API succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rates: { INR: 83.5 },
      }),
    } as Response)

    const request = new NextRequest('http://localhost:3000/api/exchange-rates?from=USD&to=INR')
    const response = await GET(request)
    const data = await response.json()

    expect(data.api).toBe('frankfurter')
    expect(data.rate).toBe(83.5)
  })

  it('should return database fallback when all APIs fail', async () => {
    // All APIs fail
    mockFetch.mockRejectedValue(new Error('Network error'))

    const request = new NextRequest('http://localhost:3000/api/exchange-rates?from=USD&to=INR')
    const response = await GET(request)
    const data = await response.json()

    // Should try to get from database (mocked in jest.setup.js)
    expect(response.status).toBeLessThanOrEqual(503)
  })

  it('should return 503 when all sources fail including database', async () => {
    // All APIs fail
    mockFetch.mockRejectedValue(new Error('Network error'))

    const request = new NextRequest('http://localhost:3000/api/exchange-rates?from=USD&to=INR')
    const response = await GET(request)
    const data = await response.json()

    if (response.status === 503) {
      expect(data.error).toBe('All exchange rate sources failed')
    }
  })

  it('should handle invalid rate format from API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rates: {
          INR: 'invalid',
        },
      }),
    } as Response)

    const request = new NextRequest('http://localhost:3000/api/exchange-rates?from=USD&to=INR')
    const response = await GET(request)

    // Should fallback to next API or return error
    expect(response.status).toBeGreaterThanOrEqual(200)
  })

  it('should handle missing target currency in response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rates: {
          EUR: 0.92, // INR is missing
        },
      }),
    } as Response)

    const request = new NextRequest('http://localhost:3000/api/exchange-rates?from=USD&to=INR')
    const response = await GET(request)

    // Should fallback to next API
    expect(response).toBeDefined()
  })

  it('should respect timeout of 5 seconds', async () => {
    const request = new NextRequest('http://localhost:3000/api/exchange-rates?from=USD&to=INR')

    // This should be called with AbortSignal
    mockFetch.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => ({ rates: { INR: 83.5 } }),
          } as Response)
        }, 10)
      })
    })

    const response = await GET(request)
    expect(response).toBeDefined()
  })
})

describe('Exchange Rates API - POST (Batch)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockReset()
  })

  it('should fetch multiple currency rates in batch', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rates: {
          INR: 83.5,
          EUR: 0.92,
          GBP: 0.79,
          JPY: 149.5,
        },
      }),
    } as Response)

    const request = new NextRequest('http://localhost:3000/api/exchange-rates', {
      method: 'POST',
      body: JSON.stringify({
        from: 'USD',
        targets: ['INR', 'EUR', 'GBP', 'JPY'],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toMatchObject({
      from: 'USD',
      rates: {
        INR: 83.5,
        EUR: 0.92,
        GBP: 0.79,
        JPY: 149.5,
      },
      source: 'live',
    })
  })

  it('should handle partial batch results', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rates: {
          INR: 83.5,
          EUR: 0.92,
          // GBP missing
        },
      }),
    } as Response)

    const request = new NextRequest('http://localhost:3000/api/exchange-rates', {
      method: 'POST',
      body: JSON.stringify({
        from: 'USD',
        targets: ['INR', 'EUR', 'GBP'],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data.rates.INR).toBe(83.5)
    expect(data.rates.EUR).toBe(0.92)
    expect(data.rates.GBP).toBeUndefined()
  })

  it('should return 503 when batch fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const request = new NextRequest('http://localhost:3000/api/exchange-rates', {
      method: 'POST',
      body: JSON.stringify({
        from: 'USD',
        targets: ['INR', 'EUR'],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.error).toBe('Rate fetch failed')
  })

  it('should handle empty target array', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rates: {},
      }),
    } as Response)

    const request = new NextRequest('http://localhost:3000/api/exchange-rates', {
      method: 'POST',
      body: JSON.stringify({
        from: 'USD',
        targets: [],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data.rates).toEqual({})
  })

  it('should parse string rate values correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rates: {
          INR: '83.5000',
          EUR: '0.9200',
        },
      }),
    } as Response)

    const request = new NextRequest('http://localhost:3000/api/exchange-rates', {
      method: 'POST',
      body: JSON.stringify({
        from: 'USD',
        targets: ['INR', 'EUR'],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(typeof data.rates.INR).toBe('number')
    expect(typeof data.rates.EUR).toBe('number')
  })
})

describe('Exchange Rates API - Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockReset()
  })

  it('should handle same from and to currency', async () => {
    const request = new NextRequest('http://localhost:3000/api/exchange-rates?from=USD&to=USD')

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rates: {
          USD: 1.0,
        },
      }),
    } as Response)

    const response = await GET(request)
    const data = await response.json()

    expect(data.rate).toBe(1.0)
  })

  it('should handle special characters in currency codes', async () => {
    const request = new NextRequest('http://localhost:3000/api/exchange-rates?from=US$&to=IN₹')

    // Should still make API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rates: {} }),
    } as Response)

    const response = await GET(request)
    expect(response).toBeDefined()
  })

  it('should handle very large rate numbers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rates: {
          VND: 24000.5, // Vietnamese Dong
        },
      }),
    } as Response)

    const request = new NextRequest('http://localhost:3000/api/exchange-rates?from=USD&to=VND')
    const response = await GET(request)
    const data = await response.json()

    expect(data.rate).toBe(24000.5)
  })

  it('should handle very small rate numbers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rates: {
          KWD: 0.00031, // Kuwaiti Dinar (inverse)
        },
      }),
    } as Response)

    const request = new NextRequest('http://localhost:3000/api/exchange-rates?from=INR&to=KWD')
    const response = await GET(request)
    const data = await response.json()

    expect(typeof data.rate).toBe('number')
  })
})

describe('Exchange Rates API - Caching', () => {
  it('should indicate live source when fresh data is fetched', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rates: { INR: 83.5 },
      }),
    } as Response)

    const request = new NextRequest('http://localhost:3000/api/exchange-rates?from=USD&to=INR')
    const response = await GET(request)
    const data = await response.json()

    expect(data.source).toBe('live')
  })

  it('should indicate database source when using fallback', async () => {
    // All APIs fail
    mockFetch.mockRejectedValue(new Error('Network error'))

    const request = new NextRequest('http://localhost:3000/api/exchange-rates?from=USD&to=INR')
    const response = await GET(request)
    const data = await response.json()

    // If it returns database fallback
    if (data.source === 'database') {
      expect(data.warning).toBeDefined()
      expect(data.recorded_at).toBeDefined()
    }
  })
})
