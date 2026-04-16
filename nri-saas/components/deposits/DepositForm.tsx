'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

const DEPOSIT_TYPES = ['fd', 'rd', 'nsc', 'kvp', 'scss', 'other'] as const
const CURRENCIES = ['INR', 'USD', 'THB', 'AED', 'SGD'] as const

type DepositFormData = {
  name: string
  type: typeof DEPOSIT_TYPES[number]
  amount: string
  interestRate: string
  tenureMonths: string
  startDate: string
  maturityDate: string
  currency: typeof CURRENCIES[number]
  bank: string
  certificateNumber: string
  autoRenew: boolean
}

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: DepositFormData) => void
  initialData?: Partial<DepositFormData>
}

export default function DepositForm({ open, onClose, onSubmit, initialData }: Props) {
  const [formData, setFormData] = useState<DepositFormData>({
    name: initialData?.name || '',
    type: initialData?.type || 'fd',
    amount: initialData?.amount || '',
    interestRate: initialData?.interestRate || '',
    tenureMonths: initialData?.tenureMonths || '',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    maturityDate: initialData?.maturityDate || '',
    currency: initialData?.currency || 'INR',
    bank: initialData?.bank || '',
    certificateNumber: initialData?.certificateNumber || '',
    autoRenew: initialData?.autoRenew ?? false,
  })

  // Calculate maturity amount
  const calculateMaturityAmount = () => {
    const P = parseFloat(formData.amount) || 0
    const r = (parseFloat(formData.interestRate) || 0) / 100
    const t = (parseFloat(formData.tenureMonths) || 0) / 12
    if (P && r && t) {
      const maturity = P * Math.pow(1 + r / 4, 4 * t) // Quarterly compounding
      return maturity.toFixed(0)
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
          <DialogTitle>Add Deposit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Deposit Name"
              placeholder="e.g. SBI FD - 5 Year"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as any })}
            >
              <SelectTrigger label="Deposit Type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPOSIT_TYPES.map((type) => (
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
              placeholder="100000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <Input
              label="Interest Rate (%)"
              type="number"
              step="0.01"
              placeholder="7.25"
              value={formData.interestRate}
              onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
              required
            />
            <Input
              label="Tenure (Months)"
              type="number"
              placeholder="60"
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
            <Input
              label="Maturity Date"
              type="date"
              value={formData.maturityDate}
              onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
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
              label="Bank Name"
              placeholder="e.g. SBI"
              value={formData.bank}
              onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
            />
            <Input
              label="Certificate Number"
              placeholder="FD123456789"
              value={formData.certificateNumber}
              onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoRenew"
              checked={formData.autoRenew}
              onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
              className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="autoRenew" className="text-sm text-foreground cursor-pointer">
              Auto-renew on maturity
            </label>
          </div>

          {/* Maturity Preview */}
          <div className="p-4 bg-emerald-500/[0.05] border border-emerald-500/15 rounded-xl">
            <p className="text-xs text-muted-foreground mb-1">Maturity Amount (Estimated)</p>
            <p className="text-2xl font-bold text-emerald-400 font-tabular">
              ₹{parseFloat(calculateMaturityAmount()).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Interest: ₹{(parseFloat(calculateMaturityAmount()) - parseFloat(formData.amount || '0')).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="w-4 h-4" />
              Add Deposit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
