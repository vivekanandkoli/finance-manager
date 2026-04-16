'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

const INCOME_SOURCES = ['salary', 'freelance', 'investment', 'rental', 'business', 'pension', 'other'] as const
const CURRENCIES = ['INR', 'USD', 'THB', 'AED', 'SGD', 'EUR', 'GBP'] as const
const COUNTRIES = ['India', 'Thailand', 'UAE', 'Singapore', 'USA', 'UK', 'Other'] as const

type IncomeFormData = {
  source: typeof INCOME_SOURCES[number]
  description: string
  amount: string
  currency: typeof CURRENCIES[number]
  date: string
  country: typeof COUNTRIES[number]
  isTaxable: boolean
  accountId?: string
}

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: IncomeFormData) => void
  initialData?: Partial<IncomeFormData>
}

export default function IncomeForm({ open, onClose, onSubmit, initialData }: Props) {
  const [formData, setFormData] = useState<IncomeFormData>({
    source: initialData?.source || 'salary',
    description: initialData?.description || '',
    amount: initialData?.amount || '',
    currency: initialData?.currency || 'INR',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    country: initialData?.country || 'Thailand',
    isTaxable: initialData?.isTaxable ?? true,
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
          <DialogTitle>Add Income</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            value={formData.source}
            onValueChange={(value) => setFormData({ ...formData, source: value as any })}
          >
            <SelectTrigger label="Income Source">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INCOME_SOURCES.map((source) => (
                <SelectItem key={source} value={source}>
                  {source.charAt(0).toUpperCase() + source.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            label="Description"
            placeholder="e.g. Monthly salary - Tech Corp"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              placeholder="50000"
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

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />

          <Select
            value={formData.country}
            onValueChange={(value) => setFormData({ ...formData, country: value as any })}
          >
            <SelectTrigger label="Country (where income earned)">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="taxable"
              checked={formData.isTaxable}
              onChange={(e) => setFormData({ ...formData, isTaxable: e.target.checked })}
              className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="taxable" className="text-sm text-foreground cursor-pointer">
              Taxable income
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="w-4 h-4" />
              Add Income
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
