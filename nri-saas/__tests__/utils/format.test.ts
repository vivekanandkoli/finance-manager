import {
  formatCurrency,
  formatCompact,
  getCurrencySymbol,
  getCurrencyFlag,
  formatNumber,
  formatPct,
  formatRate,
  formatDate,
  formatRelativeDate,
  getCurrentFinancialYear,
  getFinancialYears,
  getInitials,
  truncate,
  slugify,
} from '@/lib/utils/format'

describe('Currency Formatting', () => {
  describe('formatCurrency', () => {
    it('should format INR currency with default options', () => {
      expect(formatCurrency(1000, 'INR')).toContain('1,000')
    })

    it('should format USD currency', () => {
      const result = formatCurrency(1000, 'USD')
      expect(result).toContain('1,000')
    })

    it('should format EUR currency', () => {
      const result = formatCurrency(1000, 'EUR')
      expect(result).toContain('1,000')
    })

    it('should format compact for crores (INR)', () => {
      expect(formatCurrency(10000000, 'INR', { compact: true })).toBe('₹1.00Cr')
    })

    it('should format compact for lakhs (INR)', () => {
      expect(formatCurrency(100000, 'INR', { compact: true })).toBe('₹1.00L')
    })

    it('should format compact for thousands', () => {
      expect(formatCurrency(5000, 'INR', { compact: true })).toBe('₹5.0K')
    })

    it('should handle negative amounts', () => {
      const result = formatCurrency(-1000, 'INR')
      expect(result).toContain('-')
    })

    it('should respect custom decimals', () => {
      const result = formatCurrency(1234.5678, 'INR', { decimals: 3 })
      expect(result).toContain('1,234.568')
    })

    it('should handle zero amount', () => {
      const result = formatCurrency(0, 'INR')
      expect(result).toBeDefined()
    })

    it('should handle very large amounts in compact mode', () => {
      expect(formatCurrency(100000000, 'INR', { compact: true })).toBe('₹10.00Cr')
    })
  })

  describe('formatCompact', () => {
    it('should format as compact by default', () => {
      expect(formatCompact(100000, 'INR')).toBe('₹1.00L')
    })

    it('should handle USD compact formatting', () => {
      const result = formatCompact(1000, 'USD')
      expect(result).toBe('$1.0K')
    })
  })

  describe('getCurrencySymbol', () => {
    it('should return INR symbol', () => {
      expect(getCurrencySymbol('INR')).toBe('₹')
    })

    it('should return USD symbol', () => {
      expect(getCurrencySymbol('USD')).toBe('$')
    })

    it('should return EUR symbol', () => {
      expect(getCurrencySymbol('EUR')).toBe('€')
    })

    it('should fallback to currency code for unknown currency', () => {
      expect(getCurrencySymbol('XXX' as any)).toBe('XXX')
    })
  })

  describe('getCurrencyFlag', () => {
    it('should return INR flag', () => {
      expect(getCurrencyFlag('INR')).toBe('🇮🇳')
    })

    it('should return USD flag', () => {
      expect(getCurrencyFlag('USD')).toBe('🇺🇸')
    })

    it('should fallback to world emoji for unknown currency', () => {
      expect(getCurrencyFlag('XXX' as any)).toBe('🌍')
    })
  })
})

describe('Number Formatting', () => {
  describe('formatNumber', () => {
    it('should format numbers with Indian locale', () => {
      expect(formatNumber(1000)).toContain('1,000')
    })

    it('should respect decimal places', () => {
      expect(formatNumber(1234.5678, 2)).toContain('1,234.57')
    })

    it('should handle zero decimals', () => {
      expect(formatNumber(1234.5678, 0)).toBe('1,235')
    })

    it('should handle negative numbers', () => {
      const result = formatNumber(-1000)
      expect(result).toContain('-')
    })
  })

  describe('formatPct', () => {
    it('should format positive percentage with + sign', () => {
      expect(formatPct(5.5)).toBe('+5.5%')
    })

    it('should format negative percentage without double sign', () => {
      expect(formatPct(-3.2)).toBe('-3.2%')
    })

    it('should format zero percentage', () => {
      expect(formatPct(0)).toBe('0.0%')
    })

    it('should respect decimal places', () => {
      expect(formatPct(5.5555, 2)).toBe('+5.56%')
    })
  })

  describe('formatRate', () => {
    it('should format exchange rate with 4 decimals', () => {
      expect(formatRate(83.5123)).toBe('83.5123')
    })

    it('should pad with zeros if needed', () => {
      expect(formatRate(83.5)).toBe('83.5000')
    })
  })
})

describe('Date Formatting', () => {
  describe('formatDate', () => {
    const testDate = new Date('2024-01-15')

    it('should format date in short style', () => {
      const result = formatDate(testDate, 'short')
      expect(result).toMatch(/\d{2}\s\w{3}/)
    })

    it('should format date in medium style', () => {
      const result = formatDate(testDate, 'medium')
      expect(result).toMatch(/\d{2}\s\w{3}\s\d{4}/)
    })

    it('should format date in long style', () => {
      const result = formatDate(testDate, 'long')
      expect(result).toMatch(/\d{2}\s\w+\s\d{4}/)
    })

    it('should handle string input', () => {
      const result = formatDate('2024-01-15')
      expect(result).toBeDefined()
    })

    it('should return dash for invalid date', () => {
      expect(formatDate('invalid-date')).toBe('—')
    })
  })

  describe('formatRelativeDate', () => {
    it('should return "Today" for current date', () => {
      const today = new Date()
      expect(formatRelativeDate(today)).toBe('Today')
    })

    it('should return "Yesterday" for yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(formatRelativeDate(yesterday)).toBe('Yesterday')
    })

    it('should return days ago for recent dates', () => {
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      expect(formatRelativeDate(threeDaysAgo)).toBe('3 days ago')
    })

    it('should return weeks ago for dates within month', () => {
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
      expect(formatRelativeDate(twoWeeksAgo)).toBe('2 weeks ago')
    })

    it('should return months ago for dates within year', () => {
      const twoMonthsAgo = new Date()
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
      expect(formatRelativeDate(twoMonthsAgo)).toMatch(/\d+ months? ago/)
    })

    it('should return years ago for old dates', () => {
      const twoYearsAgo = new Date()
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
      expect(formatRelativeDate(twoYearsAgo)).toMatch(/\d+ years? ago/)
    })
  })

  describe('getCurrentFinancialYear', () => {
    it('should return correct FY after April', () => {
      // Mock date to May 2024
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-05-15'))
      
      expect(getCurrentFinancialYear()).toBe('2024-25')
      
      jest.useRealTimers()
    })

    it('should return correct FY before April', () => {
      // Mock date to January 2024
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-01-15'))
      
      expect(getCurrentFinancialYear()).toBe('2023-24')
      
      jest.useRealTimers()
    })
  })

  describe('getFinancialYears', () => {
    it('should return default 5 financial years', () => {
      const years = getFinancialYears()
      expect(years).toHaveLength(5)
      expect(years[0]).toMatch(/\d{4}-\d{2}/)
    })

    it('should return custom count of years', () => {
      const years = getFinancialYears(3)
      expect(years).toHaveLength(3)
    })

    it('should return years in descending order', () => {
      const years = getFinancialYears(3)
      // Extract first year numbers
      const firstYears = years.map(y => parseInt(y.split('-')[0]))
      expect(firstYears[0]).toBeGreaterThan(firstYears[1])
      expect(firstYears[1]).toBeGreaterThan(firstYears[2])
    })
  })
})

describe('Miscellaneous Utilities', () => {
  describe('getInitials', () => {
    it('should extract initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD')
    })

    it('should handle single name', () => {
      expect(getInitials('John')).toBe('J')
    })

    it('should handle three names (take first two)', () => {
      expect(getInitials('John Michael Doe')).toBe('JM')
    })

    it('should convert to uppercase', () => {
      expect(getInitials('john doe')).toBe('JD')
    })

    it('should handle empty string', () => {
      expect(getInitials('')).toBe('')
    })
  })

  describe('truncate', () => {
    it('should truncate long strings', () => {
      const longText = 'This is a very long string that should be truncated'
      expect(truncate(longText, 20)).toBe('This is a very long …')
    })

    it('should not truncate short strings', () => {
      const shortText = 'Short'
      expect(truncate(shortText, 20)).toBe('Short')
    })

    it('should use default max of 30', () => {
      const text = 'A'.repeat(35)
      const result = truncate(text)
      expect(result).toHaveLength(31) // 30 chars + ellipsis
    })

    it('should handle exact length', () => {
      const text = 'A'.repeat(30)
      expect(truncate(text, 30)).toBe(text)
    })
  })

  describe('slugify', () => {
    it('should convert to lowercase and replace spaces', () => {
      expect(slugify('Hello World')).toBe('hello-world')
    })

    it('should remove special characters', () => {
      expect(slugify('Hello @World!')).toBe('hello-world')
    })

    it('should handle multiple spaces', () => {
      expect(slugify('Hello   World')).toBe('hello-world')
    })

    it('should handle numbers', () => {
      expect(slugify('Product 123')).toBe('product-123')
    })

    it('should handle hyphens in input', () => {
      expect(slugify('Hello-World')).toBe('hello-world')
    })

    it('should handle empty string', () => {
      expect(slugify('')).toBe('')
    })

    it('should handle unicode characters', () => {
      expect(slugify('Café')).toBe('caf')
    })
  })
})
