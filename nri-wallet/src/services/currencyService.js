import { getAllRecords, addRecord } from '../db';

/**
 * Currency Service - Live exchange rates with automatic fallback
 * Free APIs: ExchangeRate-API, Fixer.io, CurrencyAPI
 */

const EXCHANGE_RATE_APIS = {
  primary: {
    name: 'ExchangeRate-API',
    url: 'https://api.exchangerate-api.com/v4/latest/',
    requiresKey: false,
  },
  fallback1: {
    name: 'Open Exchange Rates',
    url: 'https://open.er-api.com/v6/latest/',
    requiresKey: false,
  },
  fallback2: {
    name: 'Frankfurter',
    url: 'https://api.frankfurter.app/latest',
    requiresKey: false,
  },
};

class CurrencyService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 60 * 60 * 1000; // 1 hour
    this.supportedCurrencies = [];
  }

  /**
   * Get live exchange rate with automatic fallback
   * @param {string} fromCurrency - Source currency code (e.g., 'THB')
   * @param {string} toCurrency - Target currency code (e.g., 'INR')
   * @returns {Promise<Object>} - { rate, source, api, warning, timestamp }
   */
  async getExchangeRate(fromCurrency, toCurrency) {
    const cacheKey = `${fromCurrency}_${toCurrency}_${new Date().toDateString()}`;
    
    // Check cache first (reduces API calls)
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        console.log('✅ Using cached exchange rate');
        return { 
          rate: cached.rate, 
          source: 'cache',
          timestamp: cached.timestamp,
        };
      }
    }

    // Try primary API
    try {
      const rate = await this.fetchFromPrimaryAPI(fromCurrency, toCurrency);
      this.cacheRate(cacheKey, rate);
      await this.saveToDatabase(fromCurrency, toCurrency, rate, 'ExchangeRate-API');
      console.log('✅ Live rate from ExchangeRate-API');
      return { 
        rate, 
        source: 'live', 
        api: 'ExchangeRate-API',
        timestamp: Date.now(),
      };
    } catch (error) {
      console.warn('⚠️ Primary API failed:', error.message);
    }

    // Try fallback APIs
    for (const [key, api] of Object.entries(EXCHANGE_RATE_APIS)) {
      if (key === 'primary') continue;
      
      try {
        const rate = await this.fetchFromFallbackAPI(api, fromCurrency, toCurrency);
        this.cacheRate(cacheKey, rate);
        await this.saveToDatabase(fromCurrency, toCurrency, rate, api.name);
        console.log(`✅ Live rate from ${api.name}`);
        return { 
          rate, 
          source: 'live', 
          api: api.name,
          timestamp: Date.now(),
        };
      } catch (error) {
        console.warn(`⚠️ ${api.name} failed:`, error.message);
      }
    }

    // All APIs failed, try database
    try {
      const rate = await this.getLastKnownRate(fromCurrency, toCurrency);
      console.log('⚠️ Using last known rate from database');
      return { 
        rate, 
        source: 'database', 
        warning: 'Using last known rate. APIs unavailable.',
        timestamp: Date.now(),
      };
    } catch (error) {
      throw new Error('❌ All exchange rate sources failed. Please enter rate manually.');
    }
  }

  /**
   * Fetch from primary API (ExchangeRate-API)
   */
  async fetchFromPrimaryAPI(from, to) {
    const response = await fetch(
      `${EXCHANGE_RATE_APIS.primary.url}${from}`,
      { 
        signal: AbortSignal.timeout(5000), // 5s timeout
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.rates || !data.rates[to]) {
      throw new Error(`Rate for ${to} not found`);
    }
    
    return parseFloat(data.rates[to]);
  }

  /**
   * Fetch from fallback APIs
   */
  async fetchFromFallbackAPI(api, from, to) {
    let url;
    if (api.name === 'Frankfurter') {
      url = `${api.url}?from=${from}&to=${to}`;
    } else {
      url = `${api.url}${from}`;
    }
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Parse different API formats
    if (data.rates && data.rates[to]) {
      return parseFloat(data.rates[to]);
    } else if (data.conversion_rates && data.conversion_rates[to]) {
      return parseFloat(data.conversion_rates[to]);
    }
    
    throw new Error(`Rate for ${to} not found`);
  }

  /**
   * Get last known rate from IndexedDB
   */
  async getLastKnownRate(from, to) {
    const rates = await getAllRecords('exchangeRates');
    
    const matching = rates
      .filter(r => r.fromCurrency === from && r.toCurrency === to)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (matching.length === 0) {
      throw new Error('No historical rate found');
    }
    
    // Warn if rate is older than 7 days
    const age = Date.now() - new Date(matching[0].timestamp);
    const daysOld = Math.floor(age / (1000 * 60 * 60 * 24));
    
    if (daysOld > 7) {
      console.warn(`⚠️ Last known rate is ${daysOld} days old`);
    }
    
    return parseFloat(matching[0].rate);
  }

  /**
   * Save rate to database for historical tracking
   */
  async saveToDatabase(from, to, rate, source) {
    try {
      await addRecord('exchangeRates', {
        rate: parseFloat(rate),
        fromCurrency: from,
        toCurrency: to,
        source,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to save rate to database:', error);
    }
  }

  /**
   * Cache rate in memory
   */
  cacheRate(key, rate) {
    this.cache.set(key, {
      rate: parseFloat(rate),
      timestamp: Date.now(),
    });
  }

  /**
   * Batch fetch multiple rates at once (optimization)
   */
  async getBatchRates(baseCurrency, targetCurrencies) {
    try {
      const response = await fetch(
        `${EXCHANGE_RATE_APIS.primary.url}${baseCurrency}`,
        { signal: AbortSignal.timeout(5000) }
      );
      const data = await response.json();
      
      const rates = {};
      targetCurrencies.forEach(currency => {
        if (data.rates[currency]) {
          rates[currency] = parseFloat(data.rates[currency]);
        }
      });
      
      return rates;
    } catch (error) {
      console.error('Batch fetch failed:', error);
      return null;
    }
  }

  /**
   * Get historical rates from database (for charts)
   */
  async getHistoricalRates(from, to, days = 30) {
    const rates = await getAllRecords('exchangeRates');
    
    return rates
      .filter(r => r.fromCurrency === from && r.toCurrency === to)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, days)
      .reverse(); // Oldest first for charts
  }

  /**
   * Get all supported currencies
   */
  async getSupportedCurrencies() {
    if (this.supportedCurrencies.length > 0) {
      return this.supportedCurrencies;
    }

    try {
      const response = await fetch(
        `${EXCHANGE_RATE_APIS.primary.url}USD`,
        { signal: AbortSignal.timeout(5000) }
      );
      const data = await response.json();
      this.supportedCurrencies = Object.keys(data.rates).sort();
      return this.supportedCurrencies;
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
      // Return common currencies as fallback
      return [
        'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY',
        'INR', 'THB', 'SGD', 'HKD', 'NZD', 'SEK', 'KRW', 'MYR',
      ];
    }
  }

  /**
   * Convert amount with rate
   */
  convert(amount, rate) {
    return parseFloat((parseFloat(amount) * parseFloat(rate)).toFixed(2));
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    this.cache.clear();
  }
}

// Singleton instance
export const currencyService = new CurrencyService();
