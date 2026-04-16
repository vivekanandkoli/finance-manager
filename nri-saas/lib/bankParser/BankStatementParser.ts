/**
 * Smart Bank Statement Parser
 * Analyzes income, expenses, savings, loans, bills
 * Supports 3+ years of data with powerful analytics
 */

// Dynamic import for pdfjs to avoid SSR issues
let pdfjsLib: any = null

async function loadPdfJs() {
  if (!pdfjsLib && typeof window !== 'undefined') {
    pdfjsLib = await import('pdfjs-dist/legacy/build/pdf')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
  }
  return pdfjsLib
}

export interface Transaction {
  date: string
  description: string
  amount: number
  type: 'debit' | 'credit'
  category: string
  subCategory?: string
  balance?: number
  currency: string
  isEditable?: boolean
}

export interface ParseResult {
  success: boolean
  bank?: string
  accountNumber?: string
  transactions: Transaction[]
  expenses: Transaction[]
  income: Transaction[]
  summary: {
    totalTransactions: number
    totalExpenses: number
    totalIncome: number
    netSavings: number
    savingsRate: number
    dateRange: {
      from: string
      to: string
    }
    categorySummary: {
      [category: string]: {
        count: number
        total: number
        percentage: number
      }
    }
    monthlyAverage: {
      income: number
      expenses: number
      savings: number
    }
  }
  error?: string
  needsPassword?: boolean
}

class SmartBankStatementParser {
  /**
   * Parse a bank statement file
   */
  async parseFile(file: File, password?: string): Promise<ParseResult> {
    try {
      const fileType = this.getFileType(file)
      
      if (fileType === 'pdf') {
        return await this.parsePDF(file, password)
      } else if (fileType === 'csv') {
        return await this.parseCSV(file)
      }
      
      throw new Error('Unsupported file type. Please upload PDF or CSV.')
    } catch (error: any) {
      if (error.name === 'PasswordRequired') {
        return this.createEmptyResult(true, 'This PDF is password protected. Please enter the password.')
      }
      
      if (error.name === 'IncorrectPassword') {
        return this.createEmptyResult(true, 'Incorrect password. Please try again.')
      }
      
      return this.createEmptyResult(false, error.message || 'Failed to parse file')
    }
  }

  /**
   * Parse PDF bank statement
   */
  private async parsePDF(file: File, password?: string): Promise<ParseResult> {
    try {
      // Load pdfjs dynamically
      const pdfjs = await loadPdfJs()
      if (!pdfjs) {
        throw new Error('PDF.js could not be loaded')
      }
      
      const arrayBuffer = await file.arrayBuffer()
      
      const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
        password: password || undefined
      })
      
      const pdf = await loadingTask.promise
      const text = await this.extractTextFromPDF(pdf)
      
      // Detect bank and parse transactions
      const bank = this.detectBank(text)
      const transactions = this.extractTransactions(text, bank)
      const accountNumber = this.extractAccountNumber(text, bank)
      
      // Separate and analyze
      const expenses = transactions.filter(t => t.type === 'debit')
      const income = transactions.filter(t => t.type === 'credit')
      
      // Calculate comprehensive summary
      const summary = this.calculateSmartSummary(transactions, expenses, income)
      
      return {
        success: true,
        bank,
        accountNumber,
        transactions,
        expenses,
        income,
        summary
      }
    } catch (error: any) {
      if (this.isPasswordError(error)) {
        if (!password) {
          const err: any = new Error('PASSWORD_REQUIRED')
          err.name = 'PasswordRequired'
          throw err
        }
        
        const err: any = new Error('INCORRECT_PASSWORD')
        err.name = 'IncorrectPassword'
        throw err
      }
      
      throw error
    }
  }

  private async extractTextFromPDF(pdf: any): Promise<string> {
    const numPages = pdf.numPages
    const textPromises: Promise<string>[] = []
    
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      textPromises.push(this.extractTextFromPage(pdf, pageNum))
    }
    
    const pageTexts = await Promise.all(textPromises)
    return pageTexts.join('\n')
  }

  private async extractTextFromPage(pdf: any, pageNum: number): Promise<string> {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()
    
    const strings = textContent.items.map((item: any) => item.str)
    return strings.join(' ')
  }

  private isPasswordError(error: any): boolean {
    if (!error) return false
    
    const errorStr = error.toString().toLowerCase()
    const message = error.message ? error.message.toLowerCase() : ''
    
    return ['password', 'encrypted', 'decrypt'].some(kw => 
      errorStr.includes(kw) || message.includes(kw)
    )
  }

  private async parseCSV(file: File): Promise<ParseResult> {
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    const transactions: Transaction[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',')
      if (columns.length >= 3) {
        const amount = Math.abs(parseFloat(columns[2]?.trim() || '0'))
        const isDebit = parseFloat(columns[2]) < 0
        const desc = columns[1]?.trim() || 'Transaction'
        
        transactions.push({
          date: columns[0]?.trim() || '',
          description: desc,
          amount,
          type: isDebit ? 'debit' : 'credit',
          category: this.smartCategorize(desc, isDebit ? 'debit' : 'credit'),
          currency: 'INR',
          isEditable: true
        })
      }
    }
    
    const expenses = transactions.filter(t => t.type === 'debit')
    const income = transactions.filter(t => t.type === 'credit')
    const summary = this.calculateSmartSummary(transactions, expenses, income)
    
    return {
      success: true,
      bank: 'Unknown',
      transactions,
      expenses,
      income,
      summary
    }
  }

  private detectBank(text: string): string {
    const lowerText = text.toLowerCase()
    
    // Thai banks - check Thai text first
    if (text.includes('ธนาคารไทยพาณิชย์') || lowerText.includes('siam commercial') || lowerText.includes('scb')) {
      return 'SCB_Thailand'
    }
    if (text.includes('ธนาคารกสิกรไทย') || lowerText.includes('kasikorn') || lowerText.includes('kbank')) {
      return 'KBank_Thailand'
    }
    if (text.includes('ธนาคารกรุงเทพ') || lowerText.includes('bangkok bank') || lowerText.includes('bbl')) {
      return 'Bangkok_Bank'
    }
    if (text.includes('ธนาคารกรุงศรีอยุธยา') || lowerText.includes('krungsri') || lowerText.includes('bay')) {
      return 'Krungsri_Thailand'
    }
    
    // Indian banks
    if (lowerText.includes('hdfc')) return 'HDFC'
    if (lowerText.includes('state bank') || lowerText.includes('sbi')) return 'SBI'
    if (lowerText.includes('icici')) return 'ICICI'
    if (lowerText.includes('axis')) return 'Axis'
    if (lowerText.includes('kotak')) return 'Kotak'
    if (lowerText.includes('hsbc')) return 'HSBC'
    
    // Standard Chartered (could be India or Thailand)
    if (lowerText.includes('standard chartered')) {
      // Check for Thai indicators
      if (text.includes('ธนาคาร') || text.includes('บาท') || lowerText.includes('thailand')) {
        return 'SCB_Thailand'
      }
      return 'Standard_Chartered_India'
    }
    
    return 'Unknown'
  }

  private extractAccountNumber(text: string, bank: string): string | undefined {
    let match = text.match(/(?:Account No|A\/c No|Account Number)[:\s]+(\d{10,16})/i)
    if (match) return match[1]
    
    match = text.match(/\b(\d{10,16})\b/)
    if (match) return match[1]
    
    return undefined
  }

  private extractTransactions(text: string, bank: string): Transaction[] {
    const transactions: Transaction[] = []
    const lines = text.split('\n')
    
    // Detect currency from bank or text
    const currency = this.detectCurrency(bank, text)
    
    // Generic extraction for ALL banks
    const datePattern = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/
    const amountPattern = /([\d,]+\.?\d*)/
    
    for (const line of lines) {
      const dateMatch = line.match(datePattern)
      if (!dateMatch) continue
      
      // Extract all numbers that could be amounts
      const amountMatches = line.match(new RegExp(amountPattern, 'g'))
      if (!amountMatches || amountMatches.length === 0) continue
      
      // Find the largest number (likely the transaction amount)
      const amounts = amountMatches.map(a => parseFloat(a.replace(/,/g, '')))
      const amount = Math.max(...amounts.filter(a => !isNaN(a) && a > 0))
      
      if (!amount || amount <= 0) continue
      
      const date = this.normalizeDate(dateMatch[1])
      
      // Determine transaction type
      const isDebit = this.isDebitTransaction(line)
      
      // Extract description
      let description = line
        .replace(dateMatch[0], '')
        .replace(/[\d,]+\.?\d*/g, '') // Remove all numbers
        .trim()
        .substring(0, 150)
      
      if (!description || description.length < 3) {
        description = 'Transaction'
      }
      
      const type = isDebit ? 'debit' : 'credit'
      
      transactions.push({
        date,
        description,
        amount,
        type,
        category: this.smartCategorize(description, type),
        currency,
        isEditable: true
      })
    }
    
    return transactions
  }

  
  private detectCurrency(bank: string, text: string): string {
    // Thai banks
    if (bank.includes('Thailand') || bank.includes('SCB_Thailand') || bank.includes('KBank') || bank.includes('Bangkok') || bank.includes('Krungsri')) {
      return 'THB'
    }
    
    // Check for Thai Baht indicators in text
    if (text.includes('บาท') || text.includes('THB') || text.includes('Baht')) {
      return 'THB'
    }
    
    // Check for other currencies
    if (text.includes('USD') || text.includes('$')) return 'USD'
    if (text.includes('EUR') || text.includes('€')) return 'EUR'
    if (text.includes('GBP') || text.includes('£')) return 'GBP'
    if (text.includes('SGD') || text.includes('S$')) return 'SGD'
    if (text.includes('AED')) return 'AED'
    
    // Default to INR for Indian banks
    if (bank === 'HDFC' || bank === 'ICICI' || bank === 'SBI' || bank === 'Axis' || bank === 'Kotak') {
      return 'INR'
    }
    
    // Check for INR indicators
    if (text.includes('INR') || text.includes('₹') || text.includes('Rupees')) {
      return 'INR'
    }
    
    // Default
    return 'INR'
  }
  
  private isDebitTransaction(line: string): boolean {
    const lower = line.toLowerCase()
    
    // Debit indicators
    const debitKeywords = [
      'debit', 'dr ', ' dr', 'withdrawal', 'paid', 'payment',
      'purchase', 'transfer out', 'atm', 'pos', 'emi',
      '-' // negative sign
    ]
    
    // Credit indicators
    const creditKeywords = [
      'credit', 'cr ', ' cr', 'deposit', 'received', 'salary',
      'refund', 'cashback', 'interest', 'dividend', 'transfer in'
    ]
    
    // Check credit first (if found, not debit)
    for (const keyword of creditKeywords) {
      if (lower.includes(keyword)) return false
    }
    
    // Check debit
    for (const keyword of debitKeywords) {
      if (lower.includes(keyword)) return true
    }
    
    // Default to debit (expenses are more common)
    return true
  }

  private normalizeDate(dateStr: string): string {
    const parts = dateStr.split(/[-\/]/)
    
    if (parts.length === 3) {
      let [day, month, year] = parts
      
      if (year.length === 2) {
        year = `20${year}`
      }
      
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
    
    return dateStr
  }

  /**
   * Smart categorization with comprehensive detection
   */
  private smartCategorize(description: string, type: 'debit' | 'credit'): string {
    const lower = description.toLowerCase()
    
    // INCOME CATEGORIES (for credits)
    if (type === 'credit') {
      if (lower.includes('salary') || lower.includes('payroll')) return 'Salary'
      if (lower.includes('interest') && !lower.includes('charge')) return 'Interest Income'
      if (lower.includes('dividend')) return 'Investment Returns'
      if (lower.includes('refund') || lower.includes('cashback')) return 'Refunds & Cashback'
      if (lower.includes('bonus') || lower.includes('incentive')) return 'Bonus'
      if (lower.includes('freelance') || lower.includes('consulting')) return 'Freelance Income'
      return 'Other Income'
    }
    
    // EXPENSE CATEGORIES (for debits)
    
    // Housing
    if (lower.includes('rent') || lower.includes('landlord')) return 'Housing & Rent'
    if (lower.includes('maintenance') || lower.includes('society')) return 'Housing & Rent'
    
    // Food & Dining
    if (lower.includes('swiggy') || lower.includes('zomato')) return 'Food & Dining'
    if (lower.includes('restaurant') || lower.includes('cafe') || lower.includes('food')) return 'Food & Dining'
    if (lower.includes('grocery') || lower.includes('supermarket') || lower.includes('bigbasket')) return 'Groceries'
    
    // Transport
    if (lower.includes('uber') || lower.includes('ola') || lower.includes('rapido')) return 'Transport'
    if (lower.includes('fuel') || lower.includes('petrol') || lower.includes('diesel')) return 'Transport'
    if (lower.includes('parking') || lower.includes('toll')) return 'Transport'
    
    // Utilities & Bills
    if (lower.includes('electricity') || lower.includes('power') || lower.includes('bescom')) return 'Utilities'
    if (lower.includes('water') || lower.includes('gas') || lower.includes('lpg')) return 'Utilities'
    if (lower.includes('broadband') || lower.includes('wifi') || lower.includes('internet')) return 'Internet & Phone'
    if (lower.includes('mobile') || lower.includes('recharge') || lower.includes('airtel') || lower.includes('jio')) return 'Internet & Phone'
    
    // Healthcare
    if (lower.includes('medical') || lower.includes('hospital') || lower.includes('doctor')) return 'Healthcare'
    if (lower.includes('pharmacy') || lower.includes('medicine') || lower.includes('apollo')) return 'Healthcare'
    
    // Shopping
    if (lower.includes('amazon') || lower.includes('flipkart') || lower.includes('myntra')) return 'Shopping'
    if (lower.includes('shopping') || lower.includes('mall')) return 'Shopping'
    
    // Entertainment
    if (lower.includes('netflix') || lower.includes('prime') || lower.includes('hotstar')) return 'Entertainment'
    if (lower.includes('movie') || lower.includes('cinema') || lower.includes('theatre')) return 'Entertainment'
    if (lower.includes('spotify') || lower.includes('youtube') || lower.includes('music')) return 'Entertainment'
    
    // Financial Obligations
    if (lower.includes('emi') || lower.includes('loan repayment') || lower.includes('loan pmt')) return 'EMI / Loan Payment'
    if (lower.includes('credit card') || lower.includes('cc payment') || lower.includes('card bill')) return 'Credit Card Bill'
    if (lower.includes('insurance') || lower.includes('premium') || lower.includes('policy')) return 'Insurance'
    if (lower.includes('mutual fund') || lower.includes('sip') || lower.includes('investment')) return 'Investments'
    
    // Taxes
    if (lower.includes('tax') || lower.includes('tds') || lower.includes('gst')) return 'Taxes'
    
    // Education
    if (lower.includes('school') || lower.includes('college') || lower.includes('tuition') || lower.includes('course')) return 'Education'
    
    // Transfers
    if (lower.includes('transfer') || lower.includes('neft') || lower.includes('imps') || lower.includes('upi')) return 'Transfers'
    
    // ATM
    if (lower.includes('atm') || lower.includes('cash withdrawal')) return 'Cash Withdrawal'
    
    return 'Other'
  }

  /**
   * Calculate comprehensive summary with analytics
   */
  private calculateSmartSummary(transactions: Transaction[], expenses: Transaction[], income: Transaction[]) {
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
    const netSavings = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0
    
    // Find date range
    const dates = transactions.map(t => t.date).filter(d => d).sort()
    const dateRange = {
      from: dates[0] || '',
      to: dates[dates.length - 1] || ''
    }
    
    // Calculate category summary
    const categorySummary: any = {}
    
    transactions.forEach(transaction => {
      const category = transaction.category
      if (!categorySummary[category]) {
        categorySummary[category] = { count: 0, total: 0, percentage: 0 }
      }
      categorySummary[category].count++
      categorySummary[category].total += transaction.amount
    })
    
    // Calculate percentages
    const totalAmount = totalExpenses + totalIncome
    Object.keys(categorySummary).forEach(category => {
      categorySummary[category].percentage = 
        (categorySummary[category].total / totalAmount) * 100
    })
    
    // Calculate monthly averages
    const monthsDiff = this.calculateMonthsDiff(dateRange.from, dateRange.to)
    const monthlyAverage = {
      income: monthsDiff > 0 ? totalIncome / monthsDiff : totalIncome,
      expenses: monthsDiff > 0 ? totalExpenses / monthsDiff : totalExpenses,
      savings: monthsDiff > 0 ? netSavings / monthsDiff : netSavings
    }
    
    return {
      totalTransactions: transactions.length,
      totalExpenses,
      totalIncome,
      netSavings,
      savingsRate,
      dateRange,
      categorySummary,
      monthlyAverage
    }
  }

  private calculateMonthsDiff(from: string, to: string): number {
    if (!from || !to) return 1
    
    const fromDate = new Date(from)
    const toDate = new Date(to)
    
    const months = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + 
                   (toDate.getMonth() - fromDate.getMonth())
    
    return Math.max(1, months)
  }

  private getFileType(file: File): 'pdf' | 'csv' | 'unknown' {
    const mimeType = file.type.toLowerCase()
    const fileName = file.name.toLowerCase()
    
    if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) return 'pdf'
    if (mimeType === 'text/csv' || fileName.endsWith('.csv')) return 'csv'
    
    return 'unknown'
  }

  private createEmptyResult(needsPassword: boolean, error: string): ParseResult {
    return {
      success: false,
      transactions: [],
      expenses: [],
      income: [],
      summary: {
        totalTransactions: 0,
        totalExpenses: 0,
        totalIncome: 0,
        netSavings: 0,
        savingsRate: 0,
        dateRange: { from: '', to: '' },
        categorySummary: {},
        monthlyAverage: { income: 0, expenses: 0, savings: 0 }
      },
      needsPassword,
      error
    }
  }
}

export default new SmartBankStatementParser()
