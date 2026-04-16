import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export class ExcelExporter {
  /**
   * Export expenses to Excel
   */
  static exportExpenses(expenses: any[], filename = 'expenses.xlsx') {
    const data = expenses.map(e => ({
      'Date': e.date,
      'Description': e.description,
      'Category': e.category,
      'Amount': e.amount,
      'Currency': e.currency,
      'Amount (INR)': e.amount_inr || '',
      'Merchant': e.merchant || '',
      'Country': e.country || '',
      'Tags': Array.isArray(e.tags) ? e.tags.join(', ') : '',
      'Is Recurring': e.is_recurring ? 'Yes' : 'No',
      'Tax Deductible': e.is_tax_deductible ? 'Yes' : 'No',
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 12 }, // Date
      { wch: 30 }, // Description
      { wch: 18 }, // Category
      { wch: 12 }, // Amount
      { wch: 8 },  // Currency
      { wch: 12 }, // Amount INR
      { wch: 18 }, // Merchant
      { wch: 12 }, // Country
      { wch: 20 }, // Tags
      { wch: 12 }, // Recurring
      { wch: 14 }, // Tax Deductible
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, filename)
  }

  /**
   * Export income to Excel
   */
  static exportIncome(income: any[], filename = 'income.xlsx') {
    const data = income.map(i => ({
      'Date': i.date,
      'Description': i.description,
      'Source': i.source,
      'Amount': i.amount,
      'Currency': i.currency,
      'Amount (INR)': i.amount_inr || '',
      'Country': i.country || '',
      'Is Taxable': i.is_taxable ? 'Yes' : 'No',
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    
    worksheet['!cols'] = [
      { wch: 12 }, { wch: 30 }, { wch: 15 }, { wch: 12 },
      { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Income')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, filename)
  }

  /**
   * Export remittances to Excel
   */
  static exportRemittances(remittances: any[], filename = 'remittances.xlsx') {
    const data = remittances.map(r => ({
      'Date': r.date,
      'From Currency': r.from_currency,
      'From Amount': r.from_amount,
      'To Currency': r.to_currency,
      'To Amount': r.to_amount,
      'Exchange Rate': r.exchange_rate,
      'Fee': r.fee || 0,
      'Method': r.method,
      'Purpose': r.purpose || '',
      'Reference Number': r.reference_number || '',
      'Status': r.status,
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    
    worksheet['!cols'] = [
      { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 12 },
      { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 15 },
      { wch: 18 }, { wch: 18 }, { wch: 12 },
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Remittances')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, filename)
  }

  /**
   * Export tax entries to Excel (ITR-ready format)
   */
  static exportTaxEntries(taxEntries: any[], financialYear: string, filename = `tax_entries_${financialYear}.xlsx`) {
    // Group by section
    const by80C = taxEntries.filter(e => e.section === '80C')
    const by80D = taxEntries.filter(e => e.section === '80D')
    const byDTAA = taxEntries.filter(e => e.section === 'DTAA')
    const others = taxEntries.filter(e => !['80C', '80D', 'DTAA'].includes(e.section))

    const workbook = XLSX.utils.book_new()

    // Summary Sheet
    const summary = [
      { 'Section': '80C', 'Total': by80C.reduce((s, e) => s + e.amount, 0), 'Limit': 150000 },
      { 'Section': '80D', 'Total': by80D.reduce((s, e) => s + e.amount, 0), 'Limit': 50000 },
      { 'Section': 'DTAA', 'Total': byDTAA.reduce((s, e) => s + e.amount, 0), 'Limit': 0 },
      { 'Section': 'Others', 'Total': others.reduce((s, e) => s + e.amount, 0), 'Limit': 0 },
    ]
    const summarySheet = XLSX.utils.json_to_sheet(summary)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

    // 80C Sheet
    if (by80C.length > 0) {
      const sheet80C = XLSX.utils.json_to_sheet(by80C.map(e => ({
        'Description': e.description,
        'Amount': e.amount,
        'Verified': e.verified ? 'Yes' : 'No',
      })))
      XLSX.utils.book_append_sheet(workbook, sheet80C, '80C')
    }

    // 80D Sheet
    if (by80D.length > 0) {
      const sheet80D = XLSX.utils.json_to_sheet(by80D.map(e => ({
        'Description': e.description,
        'Amount': e.amount,
        'Verified': e.verified ? 'Yes' : 'No',
      })))
      XLSX.utils.book_append_sheet(workbook, sheet80D, '80D')
    }

    // DTAA Sheet
    if (byDTAA.length > 0) {
      const sheetDTAA = XLSX.utils.json_to_sheet(byDTAA.map(e => ({
        'Description': e.description,
        'Amount': e.amount,
        'Verified': e.verified ? 'Yes' : 'No',
      })))
      XLSX.utils.book_append_sheet(workbook, sheetDTAA, 'DTAA')
    }

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, filename)
  }

  /**
   * Export complete financial summary
   */
  static exportFinancialSummary(data: {
    income: any[]
    expenses: any[]
    investments: any[]
    loans: any[]
    netWorth: number
  }, filename = 'financial_summary.xlsx') {
    const workbook = XLSX.utils.book_new()

    // Summary Sheet
    const summary = [
      { 'Metric': 'Total Income', 'Amount (INR)': data.income.reduce((s, i) => s + (i.amount_inr || i.amount), 0) },
      { 'Metric': 'Total Expenses', 'Amount (INR)': data.expenses.reduce((s, e) => s + (e.amount_inr || e.amount), 0) },
      { 'Metric': 'Savings', 'Amount (INR)': data.income.reduce((s, i) => s + (i.amount_inr || i.amount), 0) - data.expenses.reduce((s, e) => s + (e.amount_inr || e.amount), 0) },
      { 'Metric': 'Net Worth', 'Amount (INR)': data.netWorth },
    ]
    const summarySheet = XLSX.utils.json_to_sheet(summary)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

    // Income Sheet
    if (data.income.length > 0) {
      const incomeSheet = XLSX.utils.json_to_sheet(data.income)
      XLSX.utils.book_append_sheet(workbook, incomeSheet, 'Income')
    }

    // Expenses Sheet
    if (data.expenses.length > 0) {
      const expensesSheet = XLSX.utils.json_to_sheet(data.expenses)
      XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Expenses')
    }

    // Investments Sheet
    if (data.investments.length > 0) {
      const investmentsSheet = XLSX.utils.json_to_sheet(data.investments)
      XLSX.utils.book_append_sheet(workbook, investmentsSheet, 'Investments')
    }

    // Loans Sheet
    if (data.loans.length > 0) {
      const loansSheet = XLSX.utils.json_to_sheet(data.loans)
      XLSX.utils.book_append_sheet(workbook, loansSheet, 'Loans')
    }

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, filename)
  }
}
