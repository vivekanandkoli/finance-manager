'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, Search, Filter, TrendingDown, Receipt, Tag, Upload, Lock, Crown, Loader2, AlertCircle, Key, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate, formatRelativeDate } from '@/lib/utils/format'
import { EXPENSE_CATEGORIES, CURRENCIES } from '@/types'
import { useSubscription } from '@/hooks/useSubscription'
import Link from 'next/link'
import type { Transaction } from '@/lib/bankParser/BankStatementParser'

// Clean slate - user will add their own expenses
const EXPENSES: Array<{
  id: string
  description: string
  category: string
  amount: number
  currency: string
  date: string
  merchant: string
}> = []

const BY_CATEGORY = EXPENSE_CATEGORIES
  .map(cat => ({ cat, total: EXPENSES.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0) }))
  .filter(c => c.total > 0)
  .sort((a, b) => b.total - a.total)

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp  = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

export default function ExpensesPage() {
  const [open, setOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [search, setSearch] = useState('') 
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [password, setPassword] = useState('')
  const [showPasswordInput, setShowPasswordInput] = useState(false)
  const [parseError, setParseError] = useState('')
  const [parsedTransactions, setParsedTransactions] = useState<Transaction[]>([])
  const [parseSuccess, setParseSuccess] = useState(false)
  const { hasFeature, currentTier, isPro } = useSubscription()

  const canUseBankParser = hasFeature('bank_parser')

  // Debug: Log subscription status (remove in production)
  console.log('🔍 Subscription Debug:', {
    currentTier,
    isPro,
    canUseBankParser,
    localStorageTier: typeof window !== 'undefined' ? localStorage.getItem('userTier') : null
  })

  const filtered = EXPENSES.filter(e =>
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleImportClick = () => {
    if (!canUseBankParser) {
      setUpgradeDialogOpen(true)
    } else {
      setImportOpen(true)
    }
  }

  const handleFileSelect = (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ]
    
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF, Excel, or CSV file')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleImportTransactions = async () => {
    if (!selectedFile) {
      setParseError('Please select a file first')
      return
    }

    setUploading(true)
    setParseError('')
    setParseSuccess(false)
    
    try {
      // Dynamically import BankStatementParser to avoid SSR issues with pdfjs
      const BankStatementParser = (await import('@/lib/bankParser/BankStatementParser')).default
      
      // Parse the bank statement
      const result = await BankStatementParser.parseFile(selectedFile, password || undefined)
      
      if (result.needsPassword) {
        // PDF is password protected
        setShowPasswordInput(true)
        setParseError(result.error || 'This PDF requires a password')
        setUploading(false)
        return
      }
      
      if (!result.success) {
        setParseError(result.error || 'Failed to parse file')
        setUploading(false)
        return
      }
      
      // Success! Show transactions
      setParsedTransactions(result.transactions)
      setParseSuccess(true)
      
      // In production, save to database here
      // await saveTransactionsToDatabase(result.transactions)
      
      console.log('Parsed Results:', {
        bank: result.bank,
        accountNumber: result.accountNumber,
        transactions: result.transactions,
        summary: result.summary
      })
      
    } catch (error: any) {
      setParseError(error.message || 'Failed to parse file')
      console.error('Parse error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleCloseDialog = () => {
    setImportOpen(false)
    setSelectedFile(null)
    setPassword('')
    setShowPasswordInput(false)
    setParseError('')
    setParsedTransactions([])
    setParseSuccess(false)
  }

  const handleConfirmImport = () => {
    // In production: Save to database
    alert(`✅ ${parsedTransactions.length} transactions imported successfully!\n\nIn production, these would be saved to your database.`)
    handleCloseDialog()
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8 page-fade">
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1>Expenses</h1>
          <p>Track spending across all currencies and countries</p>
          {/* Debug badge - shows current tier */}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={isPro ? 'default' : 'gray'} className="text-xs capitalize">
              {currentTier} Plan
            </Badge>
            {canUseBankParser && (
              <Badge variant="green" className="text-xs">
                ✓ Bank Parser Enabled
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={handleImportClick}
            className={!canUseBankParser ? 'relative' : ''}
          >
            {!canUseBankParser && <Lock className="w-3.5 h-3.5 mr-1 text-amber-400" />}
            <Upload className="w-4 h-4" />
            Import from Bank
            {!canUseBankParser && <Badge variant="default" className="ml-2 text-xs">PRO</Badge>}
          </Button>
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4" />Add Expense
          </Button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'This Month (THB)', value: '฿31,201', sub: 'Living expenses', variant: 'amber' as const },
          { label: 'India Payments',   value: '₹27,000', sub: 'EMI + Insurance',  variant: 'red' as const },
          { label: 'Top Category',     value: 'Rent',    sub: '฿22,000',          variant: 'purple' as const },
          { label: 'Daily Average',    value: '฿2,080',  sub: 'This month',       variant: 'blue' as const },
        ].map(s => (
          <Card key={s.label} variant={s.variant} hover>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold font-tabular mt-1">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <h3 className="font-semibold mb-5">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={BY_CATEGORY} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="cat" tick={{ fill: '#64748B', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [v.toLocaleString(), 'Amount']} />
                <Bar dataKey="total" fill="#6C63FF" radius={[4,4,0,0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <Card>
          <h3 className="font-semibold mb-4">Top Spending</h3>
          <div className="space-y-3">
            {BY_CATEGORY.slice(0, 5).map((c, i) => (
              <div key={c.cat} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">{i+1}</span>
                <Tag className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm flex-1 truncate">{c.cat}</span>
                <span className="text-sm font-semibold font-tabular">{c.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Transaction History</h3>
            <div className="flex items-center gap-2">
              <Input prefix={<Search className="w-3.5 h-3.5" />} placeholder="Search…"
                value={search} onChange={e => setSearch(e.target.value)} className="w-48 h-9 text-xs" />
              <Button variant="secondary" size="icon"><Filter className="w-4 h-4" /></Button>
            </div>
          </div>
          <table className="data-table">
            <thead><tr><th>Description</th><th>Category</th><th>Amount</th><th>Date</th><th>Merchant</th></tr></thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td className="text-sm font-medium">{e.description}</td>
                  <td><Badge variant="gray">{e.category}</Badge></td>
                  <td className="font-tabular text-sm font-semibold text-red-400">
                    {formatCurrency(e.amount, e.currency as 'INR')}
                  </td>
                  <td className="text-sm text-muted-foreground">{formatRelativeDate(e.date)}</td>
                  <td className="text-sm text-muted-foreground">{e.merchant}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input label="Description" placeholder="e.g. Grab Food delivery" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Amount" type="number" placeholder="680" />
              <Select>
                <SelectTrigger label="Currency"><SelectValue placeholder="THB" /></SelectTrigger>
                <SelectContent>
                  {Object.values(CURRENCIES).map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.flag} {c.code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select>
              <SelectTrigger label="Category"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input label="Date" type="date" />
            <Input label="Merchant (optional)" placeholder="e.g. Grab" />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}><Plus className="w-4 h-4" />Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <DialogTitle>Upgrade to Pro</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/[0.02] border border-amber-500/20">
              <p className="text-sm font-semibold mb-2">🚀 Bank Statement Parser</p>
              <p className="text-sm text-muted-foreground">
                Automatically import transactions from bank statements (PDF, Excel, CSV). 
                Supports HDFC, SBI, SCB, and more. Save hours of manual entry!
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Pro Plan Includes:</p>
              <div className="space-y-2">
                {[
                  'Bank statement parsing (HDFC, SBI, SCB)',
                  'Unlimited accounts & currencies',
                  'AI-powered insights',
                  'Remittance optimizer + rate alerts',
                  'Tax dashboard (80C, DTAA)',
                  'PDF export & email notifications',
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Receipt className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/[0.06] border border-primary/20 text-center">
              <p className="text-2xl font-bold mb-1">$5 <span className="text-sm font-normal text-muted-foreground">/month</span></p>
              <p className="text-xs text-muted-foreground">Cancel anytime · No hidden fees</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setUpgradeDialogOpen(false)}>Maybe Later</Button>
            <Link href="/settings?tab=billing">
              <Button>
                <Crown className="w-4 h-4" />
                Upgrade Now
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bank Import Dialog - For Pro users */}
      {canUseBankParser && (
        <Dialog open={importOpen} onOpenChange={(open) => {
          if (!open) handleCloseDialog()
          else setImportOpen(open)
        }}>
          <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Import from Bank Statement</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {parseSuccess 
                  ? `Found ${parsedTransactions.length} transactions` 
                  : 'Upload PDF, Excel, or CSV bank statements'
                }
              </p>
            </DialogHeader>
            
            {!parseSuccess ? (
              <div className="space-y-4">
                {/* File Upload */}
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-semibold mb-1">
                    {selectedFile ? selectedFile.name : 'Drag & drop your bank statement'}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {selectedFile 
                      ? `${(selectedFile.size / 1024).toFixed(0)} KB • ${selectedFile.type.split('/')[1]?.toUpperCase() || 'FILE'}`
                      : 'or click to browse'
                    }
                  </p>
                  <input
                    type="file"
                    id="bank-file-input"
                    accept=".pdf,.csv,.xls,.xlsx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0])
                        setShowPasswordInput(false)
                        setParseError('')
                      }
                    }}
                    className="hidden"
                  />
                  <Button 
                    variant={selectedFile ? "default" : "secondary"}
                    onClick={() => document.getElementById('bank-file-input')?.click()}
                    disabled={uploading}
                  >
                    {selectedFile ? 'Change File' : 'Choose File'}
                  </Button>
                </div>

                {/* Password Input (if needed) */}
                {showPasswordInput && (
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2">
                      <Key className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-400 mb-1">Password Protected PDF</p>
                        <p className="text-xs text-muted-foreground">
                          This bank statement is password protected. Please enter the PDF password.
                        </p>
                      </div>
                    </div>
                    <Input
                      type="password"
                      label="PDF Password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoFocus
                    />
                  </div>
                )}

                {/* Error Message */}
                {parseError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-400">{parseError}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold mb-2 text-muted-foreground">SUPPORTED BANKS</p>
                  <div className="flex flex-wrap gap-2">
                    {['HDFC', 'SBI', 'ICICI', 'Axis', 'SCB', 'Kotak', 'HSBC'].map(bank => (
                      <Badge key={bank} variant="gray">{bank}</Badge>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-sky-500/08 border border-sky-500/15 rounded-lg">
                  <p className="text-xs text-sky-400">
                    💡 Your data is processed securely. We only extract transaction information and never store your full statements.
                  </p>
                </div>
              </div>
            ) : (
              /* Success View - Show Parsed Transactions */
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-400 mb-1">Successfully Parsed!</p>
                    <p className="text-xs text-muted-foreground">
                      Found {parsedTransactions.length} transactions from your bank statement
                    </p>
                  </div>
                </div>

                {/* Transaction Preview */}
                <div className="max-h-60 overflow-y-auto border border-white/10 rounded-lg">
                  <table className="w-full text-xs">
                    <thead className="bg-white/[0.02] sticky top-0">
                      <tr className="text-left">
                        <th className="p-2 font-semibold">Date</th>
                        <th className="p-2 font-semibold">Description</th>
                        <th className="p-2 font-semibold">Category</th>
                        <th className="p-2 font-semibold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedTransactions.slice(0, 50).map((transaction, idx) => (
                        <tr key={idx} className="border-t border-white/5 hover:bg-white/[0.02]">
                          <td className="p-2 text-muted-foreground">{transaction.date}</td>
                          <td className="p-2">{transaction.description.substring(0, 40)}...</td>
                          <td className="p-2">
                            <Badge variant="gray" className="text-xs">{transaction.category}</Badge>
                          </td>
                          <td className={`p-2 text-right font-semibold ${transaction.type === 'debit' ? 'text-red-400' : 'text-emerald-400'}`}>
                            {transaction.type === 'debit' ? '-' : '+'}{transaction.currency} {transaction.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {parsedTransactions.length > 50 && (
                  <p className="text-xs text-muted-foreground text-center">
                    Showing first 50 of {parsedTransactions.length} transactions
                  </p>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="secondary" 
                onClick={handleCloseDialog}
                disabled={uploading}
              >
                Cancel
              </Button>
              
              {!parseSuccess ? (
                <Button 
                  onClick={handleImportTransactions}
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {showPasswordInput ? 'Unlock & Parse' : 'Parse Statement'}
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handleConfirmImport}>
                  <CheckCircle className="w-4 h-4" />
                  Import {parsedTransactions.length} Transactions
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  )
}
