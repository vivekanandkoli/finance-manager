import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { currencyService } from '../currencyService';

describe('CurrencyService', () => {
  beforeEach(() => {
    currencyService.clearCache();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getExchangeRate', () => {
    it('should fetch live exchange rate successfully', async () => {
      const mockResponse = {
        rates: {
          INR: 2.45,
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await currencyService.getExchangeRate('THB', 'INR');

      expect(result.rate).toBe(2.45);
      expect(result.source).toBe('live');
      expect(result.api).toBe('ExchangeRate-API');
    });

    it('should use cached rate when available', async () => {
      const mockResponse = {
        rates: { INR: 2.45 },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // First call
      await currencyService.getExchangeRate('THB', 'INR');

      // Second call should use cache
      const result = await currencyService.getExchangeRate('THB', 'INR');

      expect(result.source).toBe('cache');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should fallback to secondary API when primary fails', async () => {
      // Primary API fails
      global.fetch.mockRejectedValueOnce(new Error('API Error'));

      // Fallback API succeeds
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          rates: { INR: 2.45 },
        }),
      });

      const result = await currencyService.getExchangeRate('THB', 'INR');

      expect(result.rate).toBe(2.45);
      expect(result.source).toBe('live');
    });

    it('should handle invalid currency codes', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          rates: {},
        }),
      });

      await expect(
        currencyService.getExchangeRate('INVALID', 'INR')
      ).rejects.toThrow();
    });
  });

  describe('convert', () => {
    it('should convert amount correctly', () => {
      const result = currencyService.convert(1000, 2.45);
      expect(result).toBe(2450);
    });

    it('should handle string inputs', () => {
      const result = currencyService.convert('1000', '2.45');
      expect(result).toBe(2450);
    });

    it('should round to 2 decimal places', () => {
      const result = currencyService.convert(1000, 2.456789);
      expect(result).toBe(2456.79);
    });
  });

  describe('getBatchRates', () => {
    it('should fetch multiple rates at once', async () => {
      const mockResponse = {
        rates: {
          INR: 2.45,
          USD: 0.028,
          EUR: 0.026,
        },
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await currencyService.getBatchRates('THB', ['INR', 'USD', 'EUR']);

      expect(result).toEqual({
        INR: 2.45,
        USD: 0.028,
        EUR: 0.026,
      });
    });
  });

  describe('caching', () => {
    it('should cache rates for 1 hour', async () => {
      const mockResponse = {
        rates: { INR: 2.45 },
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      // First call
      const result1 = await currencyService.getExchangeRate('THB', 'INR');
      expect(result1.source).toBe('live');

      // Second call within 1 hour
      const result2 = await currencyService.getExchangeRate('THB', 'INR');
      expect(result2.source).toBe('cache');

      // Verify only one API call was made
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should clear cache when requested', () => {
      currencyService.cache.set('test', { rate: 1.5, timestamp: Date.now() });
      expect(currencyService.cache.size).toBe(1);

      currencyService.clearCache();
      expect(currencyService.cache.size).toBe(0);
    });
  });
});
