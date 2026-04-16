// Centralized currency configuration
export const CURRENCIES = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    exchangeRate: 1, // Base currency
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    exchangeRate: 83, // 1 USD = 83 INR (approximate)
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    exchangeRate: 90, // 1 EUR = 90 INR (approximate)
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    exchangeRate: 105, // 1 GBP = 105 INR (approximate)
  },
  THB: {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    flag: '🇹🇭',
    exchangeRate: 2.3, // 1 THB = 2.3 INR (approximate)
  },
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    flag: '🇦🇪',
    exchangeRate: 22.6, // 1 AED = 22.6 INR (approximate)
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    flag: '🇸🇬',
    exchangeRate: 61.5, // 1 SGD = 61.5 INR (approximate)
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    flag: '🇦🇺',
    exchangeRate: 54, // 1 AUD = 54 INR (approximate)
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    exchangeRate: 61, // 1 CAD = 61 INR (approximate)
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    flag: '🇯🇵',
    exchangeRate: 0.56, // 1 JPY = 0.56 INR (approximate)
  },
  CHF: {
    code: 'CHF',
    symbol: 'Fr',
    name: 'Swiss Franc',
    flag: '🇨🇭',
    exchangeRate: 94, // 1 CHF = 94 INR (approximate)
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    flag: '🇨🇳',
    exchangeRate: 11.5, // 1 CNY = 11.5 INR (approximate)
  },
  MYR: {
    code: 'MYR',
    symbol: 'RM',
    name: 'Malaysian Ringgit',
    flag: '🇲🇾',
    exchangeRate: 18.5, // 1 MYR = 18.5 INR (approximate)
  },
  SAR: {
    code: 'SAR',
    symbol: '﷼',
    name: 'Saudi Riyal',
    flag: '🇸🇦',
    exchangeRate: 22.1, // 1 SAR = 22.1 INR (approximate)
  },
  QAR: {
    code: 'QAR',
    symbol: '﷼',
    name: 'Qatari Riyal',
    flag: '🇶🇦',
    exchangeRate: 22.8, // 1 QAR = 22.8 INR (approximate)
  },
};

// Get currency options for dropdowns
export const getCurrencyOptions = () => {
  return Object.values(CURRENCIES).map(currency => ({
    value: currency.code,
    label: `${currency.code} (${currency.symbol})`,
    fullLabel: `${currency.flag} ${currency.code} (${currency.symbol}) - ${currency.name}`,
  }));
};

// Get most common currencies for primary dropdown
export const getCommonCurrencies = () => {
  const common = ['INR', 'USD', 'EUR', 'GBP', 'THB', 'AED', 'SGD', 'AUD', 'CAD', 'JPY'];
  return common.map(code => CURRENCIES[code]);
};

// Format currency amount
export const formatCurrency = (amount, currencyCode = 'INR') => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.INR;
  return `${currency.symbol}${amount.toLocaleString('en-IN', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2 
  })}`;
};

// Convert to base currency (INR)
export const convertToINR = (amount, fromCurrency = 'INR') => {
  const currency = CURRENCIES[fromCurrency] || CURRENCIES.INR;
  return amount * currency.exchangeRate;
};

// Convert from base currency (INR) to target currency
export const convertFromINR = (amountInINR, toCurrency = 'INR') => {
  const currency = CURRENCIES[toCurrency] || CURRENCIES.INR;
  return amountInINR / currency.exchangeRate;
};

// Convert between any two currencies
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  const inrAmount = convertToINR(amount, fromCurrency);
  return convertFromINR(inrAmount, toCurrency);
};

// Get currency symbol
export const getCurrencySymbol = (currencyCode = 'INR') => {
  return CURRENCIES[currencyCode]?.symbol || '₹';
};

// Get currency name
export const getCurrencyName = (currencyCode = 'INR') => {
  return CURRENCIES[currencyCode]?.name || 'Indian Rupee';
};

export default CURRENCIES;
