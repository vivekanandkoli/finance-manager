'use client'

import { useState } from 'react'
import { Upload, FileText, Lock, CheckCircle, TrendingUp, TrendingDown, PiggyBank, Calendar, X, Edit2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BankStatementParser, { type ParseResult, type Transaction } from '@/lib/bankParser/BankStatementParser'

interface BankImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function BankImportDialog({ open, onOpenChange }: BankImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [password, setPassword] = useState('')
  const [needsPassword, setNeedsPassword] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<{ index: number; category: string } | null>(null)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setPassword('')
    setNeedsPassword(false)
    setParseResult(null)

    await parseFile(selectedFile)
  }

  async function parseFile(fileToparse: File, pwd?: string) {
    setLoading(true)
    try {
      const result = await BankStatementParser.parseFile(fileToparse, pwd)
      
      if (result.needsPassword) {
        setNeedsPassword(true)
        setLoading(false)
        return
      }

      if (result.success) {
        setParseResult(result)
        setNeedsPassword(false)
      } else {
        alert(result.error || 'Failed to parse file')
      }
    } catch (error: any) {
      console.error('Parse error:', error)
      alert(error.message || 'Failed to parse file')
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordSubmit() {
    if (!file || !password) return
    await parseFile(file, password)
  }

  function updateCategory(index: number, newCategory: string, type: 'expense' | 'income') {
    if (!parseResult) return
    
    const updatedResult = { ...parseResult }
    
    if (type === 'expense') {
      updatedResult.expenses[index].category = newCategory
    } else {
      updatedResult.income[index].category = newCategory
    }
    
    // Update in main transactions array too
    const transaction = type === 'expense' ? updatedResult.expenses[index] : updatedResult.income[index]
    const mainIndex = updatedResult.transactions.findIndex(t => 
      t.date === transaction.date && t.amount === transaction.amount
    )
    if (mainIndex >= 0) {
      updatedResult.transactions[mainIndex].category = newCategory
    }
    
    // Recalculate summary
    const summary = recalculateSummary(updatedResult.transactions)
    updatedResult.summary = summary
    
    setParseResult(updatedResult)
    setEditingTransaction(null)
  }

  function recalculateSummary(transactions: Transaction[]) {
    const expenses = transactions.filter(t => t.type === 'debit')
    const income = transactions.filter(t => t.type === 'credit')
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
    const netSavings = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0
    
    const categorySummary: any = {}
    transactions.forEach(t => {
      if (!categorySummary[t.category]) {
        categorySummary[t.category] = { count: 0, total: 0, percentage: 0 }
      }
      categorySummary[t.category].count++
      categorySummary[t.category].total += t.amount
    })
    
    const totalAmount = totalExpenses + totalIncome
    Object.keys(categorySummary).forEach(cat => {
      categorySummary[cat].percentage = (categorySummary[cat].total / totalAmount) * 100
    })
    
    return {
      ...parseResult?.summary,
      totalExpenses,
      totalIncome,
      netSavings,
      savingsRate,
      categorySummary
    } as any
  }

  async function importTransactions() {
    if (!parseResult) return
    
    setLoading(true)
    
    try {
      // Import to Supabase
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Please log in to import transactions')
        setLoading(false)
        return
      }
      
      // Prepare expenses for import
      const expensesToImport = parseResult.expenses.map(exp => ({
        user_id: user.id,
        date: exp.date,
        description: exp.description,
        amount: exp.amount,
        category: exp.category,
        currency: exp.currency,
        payment_method: 'bank_transfer',
        created_at: new Date().toISOString()
      }))
      
      // Prepare income for import
      const incomeToImport = parseResult.income.map(inc => ({
        user_id: user.id,
        date: inc.date,
        source: inc.description,
        amount: inc.amount,
        category: inc.category,
        currency: inc.currency,
        created_at: new Date().toISOString()
      }))
      
      // Insert expenses
      if (expensesToImport.length > 0) {
        const { error: expError } = await supabase
          .from('expenses')
          .insert(expensesToImport)
        
        if (expError) {
          console.error('Error inserting expenses:', expError)
          throw new Error(`Failed to import expenses: ${expError.message}`)
        }
      }
      
      // Insert income
      if (incomeToImport.length > 0) {
        const { error: incError } = await supabase
          .from('income')
          .insert(incomeToImport)
        
        if (incError) {
          console.error('Error inserting income:', incError)
          throw new Error(`Failed to import income: ${incError.message}`)
        }
      }
      
      // Success!
      const currencySymbol = parseResult.transactions[0]?.currency === 'THB' ? '฿' : 
                            parseResult.transactions[0]?.currency === 'USD' ? '$' :
                            parseResult.transactions[0]?.currency === 'EUR' ? '€' : '₹'
      
      alert(`✅ Successfully imported!\n\n${parseResult.expenses.length} Expenses\n${parseResult.income.length} Income\n\nTotal Savings: ${currencySymbol}${parseResult.summary.netSavings.toLocaleString()}`)
      
      // Reset and close
      setFile(null)
      setParseResult(null)
      setPassword('')
      setNeedsPassword(false)
      setLoading(false)
      onOpenChange(false)
      
      // Trigger refresh (if parent component listens)
      window.location.reload()
      
    } catch (error: any) {
      console.error('Import error:', error)
      alert(`❌ Failed to import: ${error.message}`)
      setLoading(false)
    }
  }

  function formatCurrency(amount: number, currency?: string) {
    const curr = currency || parseResult?.transactions[0]?.currency || 'INR'
    const symbol = curr === 'THB' ? '฿' : 
                   curr === 'USD' ? '$' :
                   curr === 'EUR' ? '€' :
                   curr === 'GBP' ? '£' : '₹'
    
    return `${symbol}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  }

  const categories = [
    'Salary', 'Interest Income', 'Investment Returns', 'Refunds & Cashback', 'Bonus', 'Freelance Income', 'Other Income',
    'Housing & Rent', 'Food & Dining', 'Groceries', 'Transport', 'Utilities', 'Internet & Phone', 
    'Healthcare', 'Shopping', 'Entertainment', 'EMI / Loan Payment', 'Credit Card Bill', 'Insurance', 
    'Investments', 'Taxes', 'Education', 'Transfers', 'Cash Withdrawal', 'Other'
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Smart Bank Statement Import
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Upload your bank statement (PDF/CSV) - we'll analyze income, expenses, savings, loans & bills
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          {!file && (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-primary font-medium hover:underline">Click to upload</span>
                <span className="text-muted-foreground"> or drag and drop</span>
              </label>
              <p className="text-sm text-muted-foreground mt-2">
                Supports PDF (password-protected too) and CSV files
              </p>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* File Selected + Password */}
          {file && !parseResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <FileText className="w-8 h-8 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null)
                    setNeedsPassword(false)
                    setPassword('')
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {needsPassword && (
                <div className="space-y-3 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <Lock className="w-5 h-5" />
                    <span className="font-medium">This PDF is password protected</span>
                  </div>
                  <Input
                    type="password"
                    placeholder="Enter PDF password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  />
                  <Button onClick={handlePasswordSubmit} loading={loading} className="w-full">
                    Unlock & Parse
                  </Button>
                </div>
              )}

              {loading && !needsPassword && (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm text-muted-foreground">Analyzing your statement...</p>
                </div>
              )}
            </div>
          )}

          {/* Parse Results - Smart Review */}
          {parseResult && parseResult.success && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-medium">Total Income</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(parseResult.summary.totalIncome, parseResult.transactions[0]?.currency)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {parseResult.income.length} transactions
                  </p>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 mb-1">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-xs font-medium">Total Expenses</span>
                  </div>
                  <p className="text-2xl font-bold text-red-700">
                    {formatCurrency(parseResult.summary.totalExpenses, parseResult.transactions[0]?.currency)}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {parseResult.expenses.length} transactions
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 mb-1">
                    <PiggyBank className="w-4 h-4" />
                    <span className="text-xs font-medium">Net Savings</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(parseResult.summary.netSavings, parseResult.transactions[0]?.currency)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {parseResult.summary.savingsRate.toFixed(1)}% savings rate
                  </p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-700 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium">Period</span>
                  </div>
                  <p className="text-sm font-bold text-purple-700">
                    {parseResult.summary.dateRange.from.split('-')[1]}/{parseResult.summary.dateRange.from.split('-')[0]} - {parseResult.summary.dateRange.to.split('-')[1]}/{parseResult.summary.dateRange.to.split('-')[0]}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {parseResult.summary.totalTransactions} total transactions
                  </p>
                </div>
              </div>

              {/* Bank Info */}
              {parseResult.bank && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">{parseResult.bank}</Badge>
                  {parseResult.accountNumber && (
                    <span className="text-muted-foreground">
                      A/c: ****{parseResult.accountNumber.slice(-4)}
                    </span>
                  )}
                </div>
              )}

              {/* Tabs for Income & Expenses */}
              <Tabs defaultValue="expenses" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="expenses" className="gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Expenses ({parseResult.expenses.length})
                  </TabsTrigger>
                  <TabsTrigger value="income" className="gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Income ({parseResult.income.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="expenses" className="space-y-2 mt-4">
                  <div className="border rounded-lg max-h-96 overflow-y-auto">
                    {parseResult.expenses.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No expense transactions found
                      </div>
                    ) : (
                      parseResult.expenses.map((txn, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border-b last:border-0 hover:bg-muted/50">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{txn.description}</p>
                            <p className="text-xs text-muted-foreground">{txn.date}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {editingTransaction?.index === index ? (
                              <Select
                                value={txn.category}
                                onValueChange={(val) => updateCategory(index, val, 'expense')}
                              >
                                <SelectTrigger className="w-40 h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.filter(c => !['Salary', 'Interest Income', 'Investment Returns', 'Refunds & Cashback', 'Bonus', 'Freelance Income', 'Other Income'].includes(c)).map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <>
                                <Badge variant="outline" className="text-xs">
                                  {txn.category}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => setEditingTransaction({ index, category: txn.category })}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                            <span className="text-sm font-medium text-red-600 w-24 text-right">
                              -{formatCurrency(txn.amount, txn.currency)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="income" className="space-y-2 mt-4">
                  <div className="border rounded-lg max-h-96 overflow-y-auto">
                    {parseResult.income.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No income transactions found
                      </div>
                    ) : (
                      parseResult.income.map((txn, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border-b last:border-0 hover:bg-muted/50">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{txn.description}</p>
                            <p className="text-xs text-muted-foreground">{txn.date}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {editingTransaction?.index === index ? (
                              <Select
                                value={txn.category}
                                onValueChange={(val) => updateCategory(index, val, 'income')}
                              >
                                <SelectTrigger className="w-40 h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.filter(c => ['Salary', 'Interest Income', 'Investment Returns', 'Refunds & Cashback', 'Bonus', 'Freelance Income', 'Other Income'].includes(c)).map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <>
                                <Badge variant="outline" className="text-xs bg-green-50">
                                  {txn.category}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => setEditingTransaction({ index, category: txn.category })}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                            <span className="text-sm font-medium text-green-600 w-24 text-right">
                              +{formatCurrency(txn.amount, txn.currency)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Import Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null)
                    setParseResult(null)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={importTransactions} className="flex-1 gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Import {parseResult.transactions.length} Transactions
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
