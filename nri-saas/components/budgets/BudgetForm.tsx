'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

const EXPENSE_CATEGORIES = [
  'Housing & Rent', 'Food & Dining', 'Transport', 'Shopping', 'Healthcare',
  'Entertainment', 'Insurance', 'EMI / Loan', 'Subscriptions', 'Education',
  'Travel', 'Utilities', 'Other'
] as const

const CURRENCIES = ['INR', 'USD', 'THB', 'AED', 'SGD'] as const

type BudgetFormData = {
  category: string
  amount: string
  currency: typeof CURRENCIES[number]
  period: 'monthly' | 'yearly'
  rollover: boolean
}

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: BudgetFormData) => void
  initialData?: Partial<BudgetFormData>
}

export default function BudgetForm({ open, onClose, onSubmit, initialData }: Props) {
  const [formData, setFormData] = useState<BudgetFormData>({
    category: initialData?.category || EXPENSE_CATEGORIES[0],
    amount: initialData?.amount || '',
    currency: initialData?.currency || 'THB',
    period: initialData?.period || 'monthly',
    rollover: initialData?.rollover ?? false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Create Budget</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger label="Category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Budget Amount"
              type="number"
              step="0.01"
              placeholder="10000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
          </div>

          <Select
            value={formData.period}
            onValueChange={(value) => setFormData({ ...formData, period: value as any })}
          >
            <SelectTrigger label="Period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rollover"
              checked={formData.rollover}
              onChange={(e) => setFormData({ ...formData, rollover: e.target.checked })}
              className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="rollover" className="text-sm text-foreground cursor-pointer">
              Rollover unused budget to next month
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="w-4 h-4" />
              Create Budget
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
