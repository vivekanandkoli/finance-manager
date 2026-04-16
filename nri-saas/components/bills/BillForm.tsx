'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

const FREQUENCIES = ['once', 'weekly', 'monthly', 'quarterly', 'yearly'] as const
const CURRENCIES = ['INR', 'USD', 'THB', 'AED', 'SGD'] as const
const CATEGORIES = [
  'Utilities', 'Subscriptions', 'Insurance', 'Rent', 'EMI / Loan',
  'Internet', 'Phone', 'Memberships', 'Other'
] as const

type BillFormData = {
  name: string
  amount: string
  currency: typeof CURRENCIES[number]
  dueDate: string
  frequency: typeof FREQUENCIES[number]
  category: typeof CATEGORIES[number]
  autoDebit: boolean
  remindDaysBefore: string
}

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: BillFormData) => void
  initialData?: Partial<BillFormData>
}

export default function BillForm({ open, onClose, onSubmit, initialData }: Props) {
  const [formData, setFormData] = useState<BillFormData>({
    name: initialData?.name || '',
    amount: initialData?.amount || '',
    currency: initialData?.currency || 'THB',
    dueDate: initialData?.dueDate || new Date().toISOString().split('T')[0],
    frequency: initialData?.frequency || 'monthly',
    category: initialData?.category || 'Utilities',
    autoDebit: initialData?.autoDebit ?? false,
    remindDaysBefore: initialData?.remindDaysBefore || '3',
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
          <DialogTitle>Add Bill / Reminder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Bill Name"
            placeholder="e.g. Netflix Subscription"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              placeholder="469"
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

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
            <Select
              value={formData.frequency}
              onValueChange={(value) => setFormData({ ...formData, frequency: value as any })}
            >
              <SelectTrigger label="Frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((freq) => (
                  <SelectItem key={freq} value={freq}>
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value as any })}
          >
            <SelectTrigger label="Category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            label="Remind me (days before)"
            type="number"
            min="0"
            max="30"
            value={formData.remindDaysBefore}
            onChange={(e) => setFormData({ ...formData, remindDaysBefore: e.target.value })}
            hint="Get notified before the due date"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoDebit"
              checked={formData.autoDebit}
              onChange={(e) => setFormData({ ...formData, autoDebit: e.target.checked })}
              className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="autoDebit" className="text-sm text-foreground cursor-pointer">
              Auto-debit enabled
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="w-4 h-4" />
              Add Bill
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
