'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

const LOAN_TYPES = ['home', 'car', 'personal', 'education', 'business', 'gold', 'other'] as const
const CURRENCIES = ['INR', 'USD', 'THB', 'AED', 'SGD'] as const

type LoanFormData = {
  name: string
  type: typeof LOAN_TYPES[number]
  principalAmount: string
  interestRate: string
  tenureMonths: string
  startDate: string
  currency: typeof CURRENCIES[number]
  lender: string
  accountNumber: string
  emiDay: string
}

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: LoanFormData) => void
  initialData?: Partial<LoanFormData>
}

export default function LoanForm({ open, onClose, onSubmit, initialData }: Props) {
  const [formData, setFormData] = useState<LoanFormData>({
    name: initialData?.name || '',
    type: initialData?.type || 'home',
    principalAmount: initialData?.principalAmount || '',
    interestRate: initialData?.interestRate || '',
    tenureMonths: initialData?.tenureMonths || '',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    currency: initialData?.currency || 'INR',
    lender: initialData?.lender || '',
    accountNumber: initialData?.accountNumber || '',
    emiDay: initialData?.emiDay || '5',
  })

  // Calculate EMI
  const calculateEmi = () => {
    const P = parseFloat(formData.principalAmount) || 0
    const r = (parseFloat(formData.interestRate) || 0) / 12 / 100
    const n = parseFloat(formData.tenureMonths) || 0
    if (P && r && n) {
      const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      return emi.toFixed(0)
    }
    return '0'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Add Loan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Loan Name"
              placeholder="e.g. Home Loan - Mumbai"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as any })}
            >
              <SelectTrigger label="Loan Type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOAN_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Principal Amount"
              type="number"
              step="1000"
              placeholder="5000000"
              value={formData.principalAmount}
              onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
              required
            />
            <Input
              label="Interest Rate (%)"
              type="number"
              step="0.01"
              placeholder="8.5"
              value={formData.interestRate}
              onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
              required
            />
            <Input
              label="Tenure (Months)"
              type="number"
              placeholder="240"
              value={formData.tenureMonths}
              onChange={(e) => setFormData({ ...formData, tenureMonths: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Select
              value={formData.currency}
              onValueChange={(value) => setFormData({ ...formData, currency: value as any })}
            >
              <SelectTrigger label="Currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              label="EMI Day of Month"
              type="number"
              min="1"
              max="28"
              placeholder="5"
              value={formData.emiDay}
              onChange={(e) => setFormData({ ...formData, emiDay: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Lender Name"
              placeholder="e.g. SBI"
              value={formData.lender}
              onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
            />
            <Input
              label="Loan Account Number"
              placeholder="123456789"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            />
          </div>

          {/* EMI Preview */}
          <div className="p-4 bg-sky-500/[0.05] border border-sky-500/15 rounded-xl">
            <p className="text-xs text-muted-foreground mb-1">Monthly EMI (Estimated)</p>
            <p className="text-2xl font-bold text-sky-400 font-tabular">
              ₹{parseFloat(calculateEmi()).toLocaleString('en-IN')}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="w-4 h-4" />
              Add Loan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
