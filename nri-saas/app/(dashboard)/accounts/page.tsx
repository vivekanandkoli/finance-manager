'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Building2, CreditCard, Wallet, Banknote, Globe2, TrendingUp, MoreVertical } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatCompact, getCurrencyFlag } from '@/lib/utils/format'
import { CURRENCIES } from '@/types'

const ACCOUNTS: Array<any> = []

const TYPE_ICONS = { nre: Building2, nro: Building2, fcnr: Building2, bank: Building2, credit: CreditCard, wallet: Wallet, cash: Banknote, investment: TrendingUp }
const TYPE_LABELS = { nre: 'NRE', nro: 'NRO', fcnr: 'FCNR', bank: 'Bank', credit: 'Credit', wallet: 'Wallet', cash: 'Cash', investment: 'Investment' }
const TYPE_VARIANTS = { nre: 'nre', nro: 'nro', fcnr: 'fcnr', bank: 'gray', credit: 'danger', wallet: 'blue', cash: 'gray', investment: 'success' } as const

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

const TOTALS = {
  INR: ACCOUNTS.filter((a: any) => a.currency === 'INR').reduce((s: number, a: any) => s + a.balance, 0),
  USD: ACCOUNTS.filter((a: any) => a.currency === 'USD').reduce((s: number, a: any) => s + a.balance, 0),
  THB: ACCOUNTS.filter((a: any) => a.currency === 'THB').reduce((s: number, a: any) => s + a.balance, 0),
}

export default function AccountsPage() {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all' ? ACCOUNTS : ACCOUNTS.filter(a => a.type === filter || a.country === filter)

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8 page-fade">
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1>Accounts</h1>
          <p>NRE · NRO · FCNR · Bank accounts across all countries</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" /> Add Account
        </Button>
      </motion.div>

      {/* Summary cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total in India (INR)', value: formatCompact(TOTALS.INR), flag: '🇮🇳', sub: `${ACCOUNTS.filter(a=>a.country==='IN').length} accounts`, variant: 'green' as const },
          { label: 'Thailand (THB)',        value: formatCompact(TOTALS.THB, 'THB'), flag: '🇹🇭', sub: `${ACCOUNTS.filter(a=>a.country==='TH').length} accounts`, variant: 'amber' as const },
          { label: 'USD Holdings',          value: formatCompact(TOTALS.USD, 'USD'), flag: '🇺🇸', sub: `${ACCOUNTS.filter(a=>a.currency==='USD').length} accounts`, variant: 'blue' as const },
        ].map(s => (
          <Card key={s.label} variant={s.variant} hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold font-tabular mt-1">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
              </div>
              <span className="text-3xl">{s.flag}</span>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* NRI Account Types explainer */}
      <motion.div variants={fadeUp}>
        <Card className="bg-primary/[0.05] border-primary/15">
          <div className="flex items-start gap-4">
            <Globe2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold mb-2">NRI Account Types Guide</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
                <div>
                  <span className="badge-success mr-1.5">NRE</span>
                  <strong>Non-Resident External</strong> — Foreign income in INR. Tax-free interest. Fully repatriable.
                </div>
                <div>
                  <span className="badge-blue mr-1.5">NRO</span>
                  <strong>Non-Resident Ordinary</strong> — India-sourced income. Interest taxable. Limited repatriation.
                </div>
                <div>
                  <span className="badge-purple mr-1.5">FCNR</span>
                  <strong>Foreign Currency Non-Resident</strong> — Held in foreign currency. No exchange rate risk. Fixed deposit only.
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Filter tabs */}
      <motion.div variants={fadeUp} className="flex items-center gap-2 flex-wrap">
        {[
          { value: 'all', label: 'All Accounts' },
          { value: 'nre', label: '🟢 NRE' },
          { value: 'nro', label: '🔵 NRO' },
          { value: 'fcnr', label: '🟣 FCNR' },
          { value: 'IN', label: '🇮🇳 India' },
          { value: 'TH', label: '🇹🇭 Thailand' },
          { value: 'US', label: '🇺🇸 USA' },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`pill-tab ${filter === f.value ? 'active' : ''}`}>
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* Accounts grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(acc => {
          const Icon = TYPE_ICONS[acc.type as keyof typeof TYPE_ICONS] ?? Building2
          const variant = TYPE_VARIANTS[acc.type as keyof typeof TYPE_VARIANTS] ?? 'gray'

          return (
            <motion.div key={acc.id} whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
              <Card className="relative overflow-hidden glass-hover cursor-pointer">
                {/* Color bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                  style={{ background: acc.color }} />

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${acc.color}18`, border: `1px solid ${acc.color}30` }}>
                      <Icon className="w-5 h-5" style={{ color: acc.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{acc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {acc.bank ?? acc.type.toUpperCase()} {acc.last4 ? `·· ${acc.last4}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={variant}>{TYPE_LABELS[acc.type as keyof typeof TYPE_LABELS]}</Badge>
                    <button className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/08 transition-colors">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Balance</p>
                    <p className="text-2xl font-bold font-tabular">
                      {formatCurrency(acc.balance, acc.currency as 'INR', { compact: true })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{getCurrencyFlag(acc.currency as 'INR')} {acc.currency}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{acc.country}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
        {/* Add account card */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
          <div onClick={() => setOpen(true)}
            className="h-full min-h-[140px] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/40 hover:bg-primary/[0.03] transition-all">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Add Account</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Add Account Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Add Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input label="Account Name" placeholder="e.g. HDFC NRE Savings" />
            <div className="grid grid-cols-2 gap-3">
              <Select>
                <SelectTrigger label="Account Type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { value: 'nre', label: '🟢 NRE (Non-Resident External)' },
                    { value: 'nro', label: '🔵 NRO (Non-Resident Ordinary)' },
                    { value: 'fcnr', label: '🟣 FCNR (Foreign Currency NR)' },
                    { value: 'bank', label: '🏦 Regular Bank Account' },
                    { value: 'credit', label: '💳 Credit Card' },
                    { value: 'wallet', label: '👛 Digital Wallet' },
                    { value: 'cash', label: '💵 Cash' },
                  ].map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger label="Currency">
                  <SelectValue placeholder="INR" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CURRENCIES).map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input label="Bank Name" placeholder="e.g. HDFC Bank" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Current Balance" type="number" placeholder="2800000" />
              <Input label="Account Number (last 4)" placeholder="4521" maxLength={4} />
            </div>
            <Select>
              <SelectTrigger label="Country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {[
                  { code: 'IN', flag: '🇮🇳', name: 'India' },
                  { code: 'TH', flag: '🇹🇭', name: 'Thailand' },
                  { code: 'US', flag: '🇺🇸', name: 'United States' },
                  { code: 'AE', flag: '🇦🇪', name: 'UAE' },
                  { code: 'SG', flag: '🇸🇬', name: 'Singapore' },
                  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
                  { code: 'AU', flag: '🇦🇺', name: 'Australia' },
                ].map(c => <SelectItem key={c.code} value={c.code}>{c.flag} {c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}><Plus className="w-4 h-4" /> Add Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
