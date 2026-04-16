/**
 * Test to verify SCB Thailand fixes
 * 
 * Tests the critical issues reported:
 * 1. Currency detection (THB not INR)
 * 2. Thai bank recognition
 * 3. Transaction extraction
 */

describe('SCB Thailand Bank Parser Fixes', () => {
  describe('Bank Detection', () => {
    test('should detect SCB Thailand from Thai text', () => {
      const text = `
        ธนาคารไทยพาณิชย์ จำกัด (มหาชน)
        THE SIAM COMMERCIAL BANK PUBLIC COMPANY LIMITED
        Account Statement
      `
      
      const parser = new (require('@/lib/bankParser/BankStatementParser').default)()
      const bank = (parser as any).detectBank(text)
      
      expect(bank).toBe('SCB_Thailand')
    })
    
    test('should detect SCB Thailand from English text', () => {
      const text = 'SIAM COMMERCIAL BANK Statement'
      
      const parser = new (require('@/lib/bankParser/BankStatementParser').default)()
      const bank = (parser as any).detectBank(text)
      
      expect(bank).toBe('SCB_Thailand')
    })
    
    test('should detect other Thai banks', () => {
      const parser = new (require('@/lib/bankParser/BankStatementParser').default)()
      
      expect((parser as any).detectBank('ธนาคารกสิกรไทย')).toBe('KBank_Thailand')
      expect((parser as any).detectBank('ธนาคารกรุงเทพ')).toBe('Bangkok_Bank')
      expect((parser as any).detectBank('ธนาคารกรุงศรีอยุธยา')).toBe('Krungsri_Thailand')
    })
  })
  
  describe('Currency Detection', () => {
    test('should detect THB for SCB Thailand', () => {
      const parser = new (require('@/lib/bankParser/BankStatementParser').default)()
      
      const currency = (parser as any).detectCurrency('SCB_Thailand', '')
      expect(currency).toBe('THB')
    })
    
    test('should detect THB from Thai text', () => {
      const parser = new (require('@/lib/bankParser/BankStatementParser').default)()
      
      const currency = (parser as any).detectCurrency('Unknown', 'บาท THB')
      expect(currency).toBe('THB')
    })
    
    test('should detect other currencies', () => {
      const parser = new (require('@/lib/bankParser/BankStatementParser').default)()
      
      expect((parser as any).detectCurrency('Unknown', 'USD $')).toBe('USD')
      expect((parser as any).detectCurrency('Unknown', 'EUR €')).toBe('EUR')
      expect((parser as any).detectCurrency('Unknown', 'GBP £')).toBe('GBP')
      expect((parser as any).detectCurrency('Unknown', 'SGD')).toBe('SGD')
    })
    
    test('should default to INR for Indian banks', () => {
      const parser = new (require('@/lib/bankParser/BankStatementParser').default)()
      
      expect((parser as any).detectCurrency('HDFC', '')).toBe('INR')
      expect((parser as any).detectCurrency('ICICI', '')).toBe('INR')
      expect((parser as any).detectCurrency('SBI', '')).toBe('INR')
    })
  })
  
  describe('Transaction Extraction', () => {
    test('should extract transactions with correct currency', () => {
      const text = `
        Date        Description                         Amount
        01/04/2026  ธนาคารไทยพาณิชย์ THE SIAM...      90,666.38 Dr
        02/04/2026  Transfer to Account               50,000.00 Dr
        03/04/2026  Salary Credit                    150,000.00 Cr
      `
      
      const parser = new (require('@/lib/bankParser/BankStatementParser').default)()
      const bank = 'SCB_Thailand'
      const transactions = (parser as any).extractTransactions(text, bank)
      
      expect(transactions.length).toBeGreaterThan(0)
      
      // All transactions should have THB currency
      transactions.forEach((txn: any) => {
        expect(txn.currency).toBe('THB')
      })
    })
    
    test('should detect debit transactions', () => {
      const parser = new (require('@/lib/bankParser/BankStatementParser').default)()
      
      expect((parser as any).isDebitTransaction('01/04/2026 Purchase 90,666.38 Dr')).toBe(true)
      expect((parser as any).isDebitTransaction('02/04/2026 ATM Withdrawal 5,000.00')).toBe(true)
      expect((parser as any).isDebitTransaction('03/04/2026 Payment to XYZ 10,000.00')).toBe(true)
    })
    
    test('should detect credit transactions', () => {
      const parser = new (require('@/lib/bankParser/BankStatementParser').default)()
      
      expect((parser as any).isDebitTransaction('01/04/2026 Salary Credit 150,000.00')).toBe(false)
      expect((parser as any).isDebitTransaction('02/04/2026 Deposit 50,000.00 Cr')).toBe(false)
      expect((parser as any).isDebitTransaction('03/04/2026 Refund 1,000.00')).toBe(false)
    })
  })
  
  describe('Real-World Scenario', () => {
    test('should handle user\'s reported transaction correctly', () => {
      const text = `
        Date        Description                                              Amount
        2026-04-01  ธนาคารไทยพาณิชย์ จำกัด (มหาชน) THE SIAM...             90,666.38 Dr
      `
      
      const parser = new (require('@/lib/bankParser/BankStatementParser').default)()
      
      // Detect bank
      const bank = (parser as any).detectBank(text)
      expect(bank).toBe('SCB_Thailand')
      
      // Detect currency
      const currency = (parser as any).detectCurrency(bank, text)
      expect(currency).toBe('THB')
      
      // Extract transactions
      const transactions = (parser as any).extractTransactions(text, bank)
      expect(transactions.length).toBeGreaterThan(0)
      
      const txn = transactions[0]
      expect(txn.currency).toBe('THB')  // ✅ Should be THB, not INR
      expect(txn.date).toBe('2026-04-01')
      expect(txn.amount).toBe(90666.38)
      expect(txn.type).toBe('debit')
      expect(txn.description).toContain('ธนาคารไทยพาณิชย์')
    })
  })
})
