'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

const INVESTMENT_TYPES = [
  'mutual_fund', 'stock', 'etf', 'ppf', 'nps', 'epf', 'fd', 'bonds', 'crypto', 'real_estate', 'gold', 'other'
] as const

const CATEGORIES = ['equity', 'debt', 'hybrid', 'elss', 'index', 'sectoral', 'liquid', 'other'] as const
const CURRENCIES = ['INR', 'USD', 'THB', 'AED', 'SGD'] as const

type InvestmentFormData = {
  name: string
  type: typeof INVESTMENT_TYPES[number]
  symbol: string
  units: string
  purchasePrice: string
  currentPrice: string
  currency: typeof CURRENCIES[number]
  purchaseDate: string
  maturityDate: string
  folioNumber: string
  category: typeof CATEGORIES[number]
  isElss: boolean
}

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (data: InvestmentFormData) => void
  initialData?: Partial<InvestmentFormData>
}

export default function InvestmentForm({ open, onClose, onSubmit, initialData }: Props) {
  const [formData, setFormData] = useState<InvestmentFormData>({
    name: initialData?.name || '',
    type: initialData?.type || 'mutual_fund',
    symbol: initialData?.symbol || '',
    units: initialData?.units || '',
    purchasePrice: initialData?.purchasePrice || '',
    currentPrice: initialData?.currentPrice || '',
    currency: initialData?.currency || 'INR',
    purchaseDate: initialData?.purchaseDate || new Date().toISOString().split('T')[0],
    maturityDate: initialData?.maturityDate || '',
    folioNumber: initialData?.folioNumber || '',
    category: initialData?.category || 'equity',
    isElss: initialData?.isElss ?? false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Add Investment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Investment Name"
              placeholder="e.g. HDFC Top 100"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as any })}
            >
              <SelectTrigger label="Type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVESTMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Symbol/Ticker"
              placeholder="HDFCTOP100"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            />
            <Input
              label="Units"
              type="number"
              step="0.001"
              placeholder="100"
              value={formData.units}
              onChange={(e) => setFormData({ ...formData, units: e.target.value })}
              required
            />
            <Input
              label="Folio Number"
              placeholder="12345678"
              value={formData.folioNumber}
              onChange={(e) => setFormData({ ...formData, folioNumber: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Purchase Price"
              type="number"
              step="0.01"
              placeholder="50"
              value={formData.purchasePrice}
              onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
              required
            />
            <Input
              label="Current Price"
              type="number"
              step="0.01"
              placeholder="68"
              value={formData.currentPrice}
              onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
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
              label="Purchase Date"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              required
            />
            <Input
              label="Maturity Date (optional)"
              type="date"
              value={formData.maturityDate}
              onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
            />
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
                <SelectItem key={cat} value={cat}>
                  {cat.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isElss"
              checked={formData.isElss}
              onChange={(e) => setFormData({ ...formData, isElss: e.target.checked })}
              className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="isElss" className="text-sm text-foreground cursor-pointer">
              ELSS (80C tax benefit)
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="w-4 h-4" />
              Add Investment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
