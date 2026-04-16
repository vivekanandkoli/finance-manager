/**
 * Validation Utility Tests
 * Testing common validation functions and input sanitization
 */

describe('Email Validation', () => {
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  it('should validate correct email formats', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('test.user@company.co.in')).toBe(true)
    expect(isValidEmail('name+tag@domain.org')).toBe(true)
  })

  it('should reject invalid email formats', () => {
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('missing@domain')).toBe(false)
    expect(isValidEmail('@nodomain.com')).toBe(false)
    expect(isValidEmail('spaces in@email.com')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })

  it('should handle edge cases', () => {
    expect(isValidEmail('a@b.c')).toBe(true)
    expect(isValidEmail('user@localhost')).toBe(false) // No TLD
    expect(isValidEmail('user@@domain.com')).toBe(false)
  })
})

describe('Phone Number Validation', () => {
  const isValidPhone = (phone: string): boolean => {
    // Support Indian and international formats
    const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/
    return phoneRegex.test(phone.trim())
  }

  it('should validate Indian phone numbers', () => {
    expect(isValidPhone('9876543210')).toBe(true)
    expect(isValidPhone('+919876543210')).toBe(true)
    expect(isValidPhone('91-9876543210')).toBe(true)
  })

  it('should validate international phone numbers', () => {
    expect(isValidPhone('+1-555-123-4567')).toBe(true)
    expect(isValidPhone('+44 20 7946 0958')).toBe(true)
  })

  it('should reject invalid phone numbers', () => {
    expect(isValidPhone('123')).toBe(false) // Too short
    expect(isValidPhone('abcd1234567890')).toBe(false) // Contains letters
    expect(isValidPhone('')).toBe(false)
  })
})

describe('Amount Validation', () => {
  const isValidAmount = (amount: string | number): boolean => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return !isNaN(num) && isFinite(num) && num > 0
  }

  it('should validate positive numbers', () => {
    expect(isValidAmount(100)).toBe(true)
    expect(isValidAmount('100')).toBe(true)
    expect(isValidAmount(0.01)).toBe(true)
    expect(isValidAmount('999999.99')).toBe(true)
  })

  it('should reject invalid amounts', () => {
    expect(isValidAmount(0)).toBe(false)
    expect(isValidAmount(-100)).toBe(false)
    expect(isValidAmount('abc')).toBe(false)
    expect(isValidAmount(NaN)).toBe(false)
    expect(isValidAmount(Infinity)).toBe(false)
  })

  it('should handle edge cases', () => {
    expect(isValidAmount('')).toBe(false)
    expect(isValidAmount('  100  ')).toBe(true) // Trims in real implementation
  })
})

describe('Date Validation', () => {
  const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString)
    return !isNaN(date.getTime())
  }

  it('should validate ISO date strings', () => {
    expect(isValidDate('2024-04-15')).toBe(true)
    expect(isValidDate('2024-04-15T10:30:00Z')).toBe(true)
  })

  it('should validate common date formats', () => {
    expect(isValidDate('04/15/2024')).toBe(true)
    expect(isValidDate('April 15, 2024')).toBe(true)
  })

  it('should reject invalid dates', () => {
    expect(isValidDate('invalid')).toBe(false)
    expect(isValidDate('2024-13-01')).toBe(false) // Invalid month
    expect(isValidDate('2024-04-32')).toBe(false) // Invalid day
    expect(isValidDate('')).toBe(false)
  })
})

describe('Account Number Validation', () => {
  const isValidAccountNumber = (accountNumber: string): boolean => {
    // Account numbers are typically 9-18 digits
    const cleanNumber = accountNumber.replace(/\s/g, '')
    return /^\d{9,18}$/.test(cleanNumber)
  }

  it('should validate account numbers', () => {
    expect(isValidAccountNumber('1234567890')).toBe(true)
    expect(isValidAccountNumber('123456789012345678')).toBe(true)
    expect(isValidAccountNumber('1234 5678 9012 3456')).toBe(true) // With spaces
  })

  it('should reject invalid account numbers', () => {
    expect(isValidAccountNumber('12345')).toBe(false) // Too short
    expect(isValidAccountNumber('ABC123456789')).toBe(false) // Contains letters
    expect(isValidAccountNumber('')).toBe(false)
  })
})

describe('IFSC Code Validation', () => {
  const isValidIFSC = (ifsc: string): boolean => {
    // IFSC format: 4 letters + 0 + 6 alphanumeric
    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase())
  }

  it('should validate correct IFSC codes', () => {
    expect(isValidIFSC('HDFC0001234')).toBe(true)
    expect(isValidIFSC('ICIC0000123')).toBe(true)
    expect(isValidIFSC('SBIN0001234')).toBe(true)
  })

  it('should be case insensitive', () => {
    expect(isValidIFSC('hdfc0001234')).toBe(true)
    expect(isValidIFSC('Hdfc0001234')).toBe(true)
  })

  it('should reject invalid IFSC codes', () => {
    expect(isValidIFSC('HDFC1001234')).toBe(false) // 5th char must be 0
    expect(isValidIFSC('HDC0001234')).toBe(false) // Only 3 letters
    expect(isValidIFSC('HDFC000123')).toBe(false) // Too short
    expect(isValidIFSC('')).toBe(false)
  })
})

describe('PAN Card Validation', () => {
  const isValidPAN = (pan: string): boolean => {
    // PAN format: 5 letters + 4 digits + 1 letter
    return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase())
  }

  it('should validate correct PAN numbers', () => {
    expect(isValidPAN('ABCDE1234F')).toBe(true)
    expect(isValidPAN('AAAAA0000A')).toBe(true)
  })

  it('should be case insensitive', () => {
    expect(isValidPAN('abcde1234f')).toBe(true)
    expect(isValidPAN('AbCdE1234F')).toBe(true)
  })

  it('should reject invalid PAN numbers', () => {
    expect(isValidPAN('ABCD1234F')).toBe(false) // Only 4 letters at start
    expect(isValidPAN('ABCDE12345')).toBe(false) // Ends with digit
    expect(isValidPAN('ABC123456F')).toBe(false) // Wrong format
    expect(isValidPAN('')).toBe(false)
  })
})

describe('Input Sanitization', () => {
  const sanitizeString = (input: string): string => {
    return input.trim().replace(/\s+/g, ' ')
  }

  it('should trim whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello')
  })

  it('should collapse multiple spaces', () => {
    expect(sanitizeString('hello    world')).toBe('hello world')
  })

  it('should handle empty strings', () => {
    expect(sanitizeString('')).toBe('')
    expect(sanitizeString('   ')).toBe('')
  })
})

describe('Currency Code Validation', () => {
  const VALID_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'THB']

  const isValidCurrency = (code: string): boolean => {
    return VALID_CURRENCIES.includes(code.toUpperCase())
  }

  it('should validate supported currencies', () => {
    expect(isValidCurrency('INR')).toBe(true)
    expect(isValidCurrency('USD')).toBe(true)
    expect(isValidCurrency('EUR')).toBe(true)
  })

  it('should be case insensitive', () => {
    expect(isValidCurrency('inr')).toBe(true)
    expect(isValidCurrency('Usd')).toBe(true)
  })

  it('should reject unsupported currencies', () => {
    expect(isValidCurrency('XXX')).toBe(false)
    expect(isValidCurrency('INVALID')).toBe(false)
    expect(isValidCurrency('')).toBe(false)
  })
})

describe('Percentage Validation', () => {
  const isValidPercentage = (value: number): boolean => {
    return !isNaN(value) && isFinite(value) && value >= 0 && value <= 100
  }

  it('should validate percentages within range', () => {
    expect(isValidPercentage(0)).toBe(true)
    expect(isValidPercentage(50)).toBe(true)
    expect(isValidPercentage(100)).toBe(true)
    expect(isValidPercentage(0.5)).toBe(true)
  })

  it('should reject out of range values', () => {
    expect(isValidPercentage(-1)).toBe(false)
    expect(isValidPercentage(101)).toBe(false)
    expect(isValidPercentage(NaN)).toBe(false)
    expect(isValidPercentage(Infinity)).toBe(false)
  })
})

describe('File Type Validation', () => {
  const isValidBankStatementFile = (filename: string): boolean => {
    const ext = filename.toLowerCase().split('.').pop()
    return ['pdf', 'csv', 'xlsx', 'xls'].includes(ext || '')
  }

  it('should validate supported file types', () => {
    expect(isValidBankStatementFile('statement.pdf')).toBe(true)
    expect(isValidBankStatementFile('transactions.csv')).toBe(true)
    expect(isValidBankStatementFile('data.xlsx')).toBe(true)
    expect(isValidBankStatementFile('export.xls')).toBe(true)
  })

  it('should be case insensitive', () => {
    expect(isValidBankStatementFile('statement.PDF')).toBe(true)
    expect(isValidBankStatementFile('data.XLSX')).toBe(true)
  })

  it('should reject unsupported file types', () => {
    expect(isValidBankStatementFile('document.txt')).toBe(false)
    expect(isValidBankStatementFile('image.jpg')).toBe(false)
    expect(isValidBankStatementFile('noextension')).toBe(false)
  })
})

describe('URL Validation', () => {
  const isValidURL = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  it('should validate correct URLs', () => {
    expect(isValidURL('https://example.com')).toBe(true)
    expect(isValidURL('http://localhost:3000')).toBe(true)
    expect(isValidURL('https://api.example.com/v1/endpoint')).toBe(true)
  })

  it('should reject invalid URLs', () => {
    expect(isValidURL('not a url')).toBe(false)
    expect(isValidURL('example.com')).toBe(false) // Missing protocol
    expect(isValidURL('')).toBe(false)
  })
})

describe('Transaction Description Sanitization', () => {
  const sanitizeDescription = (desc: string): string => {
    return desc
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-\.\/]/g, '')
      .slice(0, 200)
  }

  it('should clean transaction descriptions', () => {
    expect(sanitizeDescription('  PAYMENT  TO  MERCHANT  ')).toBe('PAYMENT TO MERCHANT')
  })

  it('should remove special characters', () => {
    expect(sanitizeDescription('UPI-PAY@AMAZON#ORDER')).toBe('UPI-PAYAMAZONORDER')
  })

  it('should limit length', () => {
    const longDesc = 'A'.repeat(300)
    expect(sanitizeDescription(longDesc)).toHaveLength(200)
  })
})
