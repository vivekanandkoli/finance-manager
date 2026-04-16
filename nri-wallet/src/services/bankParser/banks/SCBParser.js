/**
 * SCB (Siam Commercial Bank) Transaction Parser
 * Parses Thai bank statements from SCB
 */

class SCBParser {
  constructor() {
    // SCB transaction codes
    this.transactionCodes = {
      'X1': 'credit',  // Money in (income)
      'X2': 'debit',   // Money out (expense)
      'FE': 'debit',   // Fee/expense
    };

    // Category mappings based on keywords
    this.categoryMappings = {
      // Income
      'รับโอนจาก': 'Income',
      'PromptPay': 'Income', // When X1 (receiving)
      
      // Transfers
      'Transfer to': 'Transfer',
      'โอน': 'Transfer',
      
      // Bills & Utilities
      'จ่ายบิล': 'Bills & Utilities',
      'BRT': 'Transportation',
      'TRUE MONEY': 'Mobile & Internet',
      
      // Food & Dining
      'โลตัส': 'Food & Dining',
      'อีเทอรี่': 'Food & Dining',
      'ฟู้ด': 'Food & Dining',
      'เชฟ': 'Food & Dining',
      
      // Top-ups
      'Top-Up': 'Mobile & Internet',
      'WID': 'Mobile & Internet',
      
      // Credit Card
      'CREDIT CARD': 'Credit Card Payment',
      'UOB': 'Credit Card Payment',
      
      // Services
      'SERVICE CO': 'Services',
      'SIPS': 'Services',
    };
  }

  /**
   * Detect if text is from SCB bank
   */
  isSCBStatement(text) {
    const indicators = [
      'ธนาคารไทยพาณิชย์',
      'THE SIAM COMMERCIAL BANK',
      'SCB',
      'STATEMENT OF SAVING ACCOUNT'
    ];

    return indicators.some(indicator => text.includes(indicator));
  }

  /**
   * Parse SCB statement text into transactions
   */
  parseStatement(text) {
    const lines = text.split('\n').map(line => line.trim());
    
    // Extract account info
    const accountInfo = this.extractAccountInfo(lines, text);
    
    // Extract transactions
    const transactions = this.extractTransactions(lines);
    
    // Calculate summary
    const summary = this.calculateSummary(transactions);
    
    return {
      bank: 'SCB',
      accountInfo,
      transactions,
      summary,
      rawText: text
    };
  }

  /**
   * Extract account information
   */
  extractAccountInfo(lines, text) {
    const accountInfo = {
      bank: 'SCB (Siam Commercial Bank)',
      accountNumber: null,
      accountHolder: null,
      branch: null,
      statementPeriod: null,
      openingBalance: null,
      closingBalance: null
    };

    // Extract account number (format: 431-145472-6)
    const accountMatch = text.match(/(\d{3}-\d{6}-\d)/);
    if (accountMatch) {
      accountInfo.accountNumber = accountMatch[1];
    }

    // Extract account holder name
    const nameMatch = text.match(/MR\.|MRS\.|MS\.|MISS\s+([A-Z\s]+?)(?=\s+SV|BUILDING|\d|Address)/);
    if (nameMatch) {
      accountInfo.accountHolder = nameMatch[0].trim();
    }

    // Extract branch
    const branchMatch = text.match(/([A-Z\s]+?)\s+BRANC/);
    if (branchMatch) {
      accountInfo.branch = branchMatch[1].trim();
    }

    // Extract statement period
    const periodMatch = text.match(/(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/);
    if (periodMatch) {
      accountInfo.statementPeriod = {
        from: periodMatch[1],
        to: periodMatch[2]
      };
    }

    // Extract opening balance
    const openingMatch = text.match(/BALANCE BROUGHT FORWARD\)\s+([\d,]+\.\d{2})/);
    if (openingMatch) {
      accountInfo.openingBalance = this.parseAmount(openingMatch[1]);
    }

    return accountInfo;
  }

  /**
   * Extract transactions from statement
   */
  extractTransactions(lines) {
    const transactions = [];
    
    // Join all lines and split by date pattern to find transactions
    const fullText = lines.join(' ');
    
    // Find the section after "BALANCE BROUGHT FORWARD" and before "TOTAL AMOUNTS"
    const startIndex = fullText.indexOf('BALANCE BROUGHT FORWARD');
    const endIndex = fullText.indexOf('TOTAL AMOUNTS');
    
    if (startIndex === -1) {
      console.log('Could not find BALANCE BROUGHT FORWARD');
      return transactions;
    }
    
    const transactionText = endIndex !== -1 
      ? fullText.substring(startIndex, endIndex)
      : fullText.substring(startIndex);
    
    // Split by date pattern (DD/MM/YY)
    const datePattern = /(\d{2}\/\d{2}\/\d{2})\s+(\d{2}:\d{2})/g;
    const matches = [...transactionText.matchAll(datePattern)];
    
    console.log(`Found ${matches.length} potential transactions`);
    
    // Extract each transaction
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const startPos = match.index;
      const endPos = i < matches.length - 1 ? matches[i + 1].index : transactionText.length;
      
      const transactionLine = transactionText.substring(startPos, endPos).trim();
      const transaction = this.parseTransactionLine(transactionLine);
      
      if (transaction) {
        transactions.push(transaction);
      }
    }

    console.log(`Parsed ${transactions.length} transactions`);
    return transactions;
  }

  /**
   * Parse a single transaction line
   */
  parseTransactionLine(line) {
    // SCB format: DD/MM/YY HH:MM CODE CHANNEL AMOUNT BALANCE DESCRIPTION
    // Example: 01/04/26 09:24   X2   ENET   6,312.75   84,353.63   จ่ายบิล UOB CREDIT CARD/CASH PLUS

    console.log('Parsing line:', line.substring(0, 100));

    // Match transaction pattern - more flexible with whitespace
    const pattern = /(\d{2}\/\d{2}\/\d{2})\s+(\d{2}:\d{2})\s+(X[12]|FE)\s+([A-Z]+)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+(.+?)(?=\d{2}\/\d{2}\/\d{2}|$)/;
    const match = line.match(pattern);

    if (!match) {
      console.log('No match for line');
      return null;
    }

    const [, date, time, code, channel, amount, balance, description] = match;

    console.log('Matched:', { date, time, code, amount, balance });

    // Determine transaction type
    const type = this.transactionCodes[code] || 'unknown';

    // Parse amounts
    const parsedAmount = this.parseAmount(amount);
    const parsedBalance = this.parseAmount(balance);

    // Auto-categorize
    const category = this.categorizeTransaction(description, type);

    // Clean description
    const cleanDescription = this.cleanDescription(description);

    return {
      date: this.parseDate(date),
      time: time,
      code: code,
      channel: channel,
      amount: parsedAmount,
      balance: parsedBalance,
      type: type, // 'debit' or 'credit'
      category: category,
      description: cleanDescription,
      originalDescription: description,
      currency: 'THB'
    };
  }

  /**
   * Parse date from DD/MM/YY to YYYY-MM-DD
   */
  parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/');
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month}-${day}`;
  }

  /**
   * Parse amount (remove commas and convert to number)
   */
  parseAmount(amountStr) {
    if (!amountStr) return 0;
    return parseFloat(amountStr.replace(/,/g, ''));
  }

  /**
   * Categorize transaction based on description
   */
  categorizeTransaction(description, type) {
    const lowerDesc = description.toLowerCase();

    // Check each category mapping
    for (const [keyword, category] of Object.entries(this.categoryMappings)) {
      if (description.includes(keyword) || lowerDesc.includes(keyword.toLowerCase())) {
        // Special case: PromptPay can be income or expense
        if (keyword === 'PromptPay') {
          return type === 'credit' ? 'Income' : 'Transfer';
        }
        return category;
      }
    }

    // Default categories based on type
    if (type === 'credit') {
      return 'Income';
    } else {
      return 'Other Expenses';
    }
  }

  /**
   * Clean description (remove extra spaces, normalize)
   */
  cleanDescription(description) {
    return description
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.])/g, '$1');
  }

  /**
   * Calculate summary statistics
   */
  calculateSummary(transactions) {
    const summary = {
      totalTransactions: transactions.length,
      totalDebits: 0,
      totalCredits: 0,
      debitCount: 0,
      creditCount: 0,
      categorySummary: {}
    };

    transactions.forEach(transaction => {
      if (transaction.type === 'debit') {
        summary.totalDebits += transaction.amount;
        summary.debitCount++;
      } else if (transaction.type === 'credit') {
        summary.totalCredits += transaction.amount;
        summary.creditCount++;
      }

      // Category summary
      const category = transaction.category;
      if (!summary.categorySummary[category]) {
        summary.categorySummary[category] = {
          count: 0,
          total: 0
        };
      }
      summary.categorySummary[category].count++;
      summary.categorySummary[category].total += transaction.amount;
    });

    return summary;
  }

  /**
   * Convert transactions to app format (for import)
   */
  convertToAppFormat(transactions, accountInfo) {
    return transactions.map(transaction => {
      const isIncome = transaction.type === 'credit';

      return {
        // For expense/income record
        date: transaction.date,
        time: transaction.time,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        paymentMethod: transaction.channel,
        type: isIncome ? 'income' : 'expense',
        
        // Additional metadata
        source: 'SCB Bank Import',
        accountNumber: accountInfo.accountNumber,
        balance: transaction.balance,
        originalDescription: transaction.originalDescription,
        transactionCode: transaction.code,
        currency: 'THB',
        
        // Timestamp for database
        timestamp: `${transaction.date}T${transaction.time}:00`,
        imported: true,
        importedAt: new Date().toISOString()
      };
    });
  }
}

export default SCBParser;
