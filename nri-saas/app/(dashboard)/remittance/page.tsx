'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'
import { Send, TrendingUp, TrendingDown, Minus, Bell, Plus, ArrowRight, Info } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate, formatRelativeDate, getCurrencyFlag, getCurrencySymbol } from '@/lib/utils/format'
import { CURRENCIES } from '@/types'

const RATE_HISTORY = [
  { date: 'Jan 15', rate: 2.241 }, { date: 'Jan 30', rate: 2.268 },
  { date: 'Feb 14', rate: 2.255 }, { date: 'Feb 28', rate: 2.279 },
  { date: 'Mar 15', rate: 2.287 }, { date: 'Mar 30', rate: 2.276 },
  { date: 'Apr 07', rate: 2.304 }, { date: 'Apr 14', rate: 2.312 },
]

const AVG_90D = 2.274

const REMITTANCES = [
  { id: '1', date: '2026-04-08', from: 'THB', to: 'INR', from_amount: 50000, to_amount: 115200, rate: 2.304, fee: 0, method: 'Wise',    purpose: 'Family Support',  status: 'completed' },
  { id: '2', date: '2026-03-15', from: 'THB', to: 'INR', from_amount: 60000, to_amount: 136800, rate: 2.28,  fee: 0, method: 'Wise',    purpose: 'Investment',      status: 'completed' },
  { id: '3', date: '2026-02-22', from: 'USD', to: 'INR', from_amount: 1000,  to_amount: 83500,  rate: 83.5,  fee: 3.99, method: 'Remitly', purpose: 'Family Support', status: 'completed' },
  { id: '4', date: '2026-01-10', from: 'THB', to: 'INR', from_amount: 45000, to_amount: 100800, rate: 2.24,  fee: 0, method: 'Wise',    purpose: 'Savings',         status: 'completed' },
]

const METHODS = [
  { id: 'wise',     name: 'Wise',          fee: '~0 fee',    speed: 'Same day',  logo: '💙' },
  { id: 'remitly',  name: 'Remitly',       fee: '~₹330',     speed: '1-2 days',  logo: '🔵' },
  { id: 'swift',    name: 'SWIFT',         fee: '~₹1200',    speed: '2-3 days',  logo: '🏦' },
  { id: 'westernunion', name: 'Western Union', fee: '~₹500', speed: 'Minutes',   logo: '🟡' },
]

const currentRate = RATE_HISTORY[RATE_HISTORY.length - 1].rate
const pctAboveAvg = ((currentRate - AVG_90D) / AVG_90D) * 100
const recommendation = pctAboveAvg > 1.5 ? 'GREAT' : pctAboveAvg > 0.5 ? 'GOOD' : pctAboveAvg > -0.5 ? 'AVERAGE' : 'WAIT'
const recColors = { GREAT: 'text-emerald-400', GOOD: 'text-sky-400', AVERAGE: 'text-amber-400', WAIT: 'text-red-400' }
const recBg = { GREAT: 'bg-emerald-500/10 border-emerald-500/20', GOOD: 'bg-sky-500/10 border-sky-500/20', AVERAGE: 'bg-amber-500/10 border-amber-500/20', WAIT: 'bg-red-500/10 border-red-500/20' }

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

export default function RemittancePage() {
  const [open, setOpen] = useState(false)
  const [fromCurrency, setFromCurrency] = useState('THB')
  const [amount, setAmount] = useState('')

  const convertedAmount = amount ? parseFloat(amount) * currentRate : 0

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8 page-fade">
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1>Remittance</h1>
          <p>Track money sent to India · Smart rate optimizer</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" />
          Log Transfer
        </Button>
      </motion.div>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total YTD',       value: '₹4.36L',   sub: '4 transfers',     variant: 'purple' as const },
          { label: 'Average Rate',    value: '2.28',      sub: 'THB/INR avg',     variant: 'green' as const },
          { label: 'Fees Saved',      value: '₹1,200',   sub: 'vs SWIFT',        variant: 'blue' as const },
          { label: 'Best Rate Used',  value: '2.312',     sub: 'Apr 14, 2026',    variant: 'amber' as const },
        ].map(s => (
          <Card key={s.label} variant={s.variant} hover>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold font-tabular mt-1">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </Card>
        ))}
      </motion.div>

      {/* ── Rate Optimizer ─────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rate chart */}
        <div className="md:col-span-2">
          <Card>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="font-semibold">THB / INR Exchange Rate</h3>
                <p className="text-xs text-muted-foreground mt-0.5">90-day history</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-2xl font-bold font-tabular gradient-text">{currentRate}</p>
                  <p className={`text-xs font-semibold ${recColors[recommendation]}`}>
                    {pctAboveAvg > 0 ? '+' : ''}{pctAboveAvg.toFixed(2)}% vs 90d avg
                  </p>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={RATE_HISTORY} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6C63FF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[2.2, 2.36]} tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [v.toFixed(4), 'Rate']} />
                <ReferenceLine y={AVG_90D} stroke="#FBB724" strokeDasharray="4 4" strokeWidth={1.5}
                  label={{ value: '90d avg', fill: '#FBB724', fontSize: 10 }} />
                <Area type="monotone" dataKey="rate" stroke="#6C63FF" strokeWidth={2.5}
                  fill="url(#rateGrad)" dot={false} activeDot={{ r: 4, fill: '#6C63FF' }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recommendation widget */}
        <div className="space-y-4">
          <Card className={`${recBg[recommendation]} border`}>
            <div className="flex items-center gap-2 mb-3">
              {recommendation === 'GREAT' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
              {recommendation === 'GOOD'  && <TrendingUp className="w-4 h-4 text-sky-400" />}
              {recommendation === 'AVERAGE' && <Minus className="w-4 h-4 text-amber-400" />}
              {recommendation === 'WAIT'  && <TrendingDown className="w-4 h-4 text-red-400" />}
              <span className={`text-sm font-bold ${recColors[recommendation]}`}>
                {recommendation === 'GREAT' && '🎉 Great Time to Remit'}
                {recommendation === 'GOOD'  && '✅ Good Time'}
                {recommendation === 'AVERAGE' && '⚡ Average Rate'}
                {recommendation === 'WAIT'  && '⏳ Consider Waiting'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Current rate <span className="font-semibold text-foreground">{currentRate}</span> is{' '}
              <span className={`font-semibold ${recColors[recommendation]}`}>
                {Math.abs(pctAboveAvg).toFixed(2)}% {pctAboveAvg >= 0 ? 'above' : 'below'}
              </span>{' '}
              the 90-day average of {AVG_90D}.
            </p>
            <div className="mt-3 p-2.5 rounded-lg bg-white/[0.04]">
              <p className="text-[11px] text-muted-foreground">Sending ₹1L today vs avg:</p>
              <p className="text-sm font-bold text-emerald-400 font-tabular">
                Save THB {((1/currentRate - 1/AVG_90D) * -100000).toFixed(0)} in extra THB
              </p>
            </div>
          </Card>

          {/* Quick calculator */}
          <Card>
            <h4 className="text-sm font-semibold mb-3">Quick Calculator</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger className="w-[90px] h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['THB','USD','AED','SGD','GBP','EUR'].map(c => (
                      <SelectItem key={c} value={c}>{getCurrencyFlag(c as 'THB')} {c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="h-9 text-sm flex-1"
                />
              </div>
              <div className="p-3 rounded-xl bg-white/[0.04] text-center">
                <p className="text-xs text-muted-foreground mb-1">You receive</p>
                <p className="text-xl font-bold font-tabular text-emerald-400">
                  {convertedAmount > 0 ? formatCurrency(convertedAmount, 'INR') : '—'}
                </p>
                {convertedAmount > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Rate: {currentRate} · Wise (0 fee)
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Set rate alert */}
          <Card variant="purple" className="cursor-pointer hover:opacity-90 transition-opacity">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Rate Alert</span>
            </div>
            <p className="text-xs text-muted-foreground">Get notified when THB/INR hits your target rate</p>
            <Button size="sm" variant="secondary" className="w-full mt-3">
              Set Alert
            </Button>
          </Card>
        </div>
      </motion.div>

      {/* ── Transfer Methods Comparison ────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <h3 className="font-semibold">Transfer Methods Comparison</h3>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {METHODS.map(m => (
              <div key={m.id}
                className={`p-4 rounded-xl border transition-colors cursor-pointer ${m.id === 'wise' ? 'border-emerald-500/30 bg-emerald-500/08' : 'border-white/08 hover:border-white/15 hover:bg-white/04'}`}>
                <div className="text-2xl mb-2">{m.logo}</div>
                <p className="text-sm font-semibold">{m.name}</p>
                {m.id === 'wise' && <Badge variant="success" className="mt-1 text-[10px]">Recommended</Badge>}
                <div className="mt-2 space-y-0.5">
                  <p className="text-xs text-muted-foreground">Fee: <span className="text-foreground font-medium">{m.fee}</span></p>
                  <p className="text-xs text-muted-foreground">Speed: <span className="text-foreground font-medium">{m.speed}</span></p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* ── History Table ──────────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Transfer History</h3>
            <Badge variant="gray">{REMITTANCES.length} transfers</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Route</th>
                  <th>Amount Sent</th>
                  <th>Amount Received</th>
                  <th>Rate</th>
                  <th>Method</th>
                  <th>Purpose</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {REMITTANCES.map(r => (
                  <tr key={r.id}>
                    <td className="text-sm">{formatDate(r.date)}</td>
                    <td>
                      <span className="flex items-center gap-1.5 text-sm">
                        {getCurrencyFlag(r.from as 'THB' | 'USD')} {r.from}
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        {getCurrencyFlag('INR')} {r.to}
                      </span>
                    </td>
                    <td className="font-tabular text-sm">
                      {getCurrencySymbol(r.from as 'THB')} {r.from_amount.toLocaleString()}
                    </td>
                    <td className="font-tabular text-sm font-semibold text-emerald-400">
                      {formatCurrency(r.to_amount, 'INR')}
                    </td>
                    <td className="font-tabular text-sm">{r.rate}</td>
                    <td><Badge variant="gray">{r.method}</Badge></td>
                    <td className="text-sm text-muted-foreground">{r.purpose}</td>
                    <td><Badge variant="success">{r.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* ── Log Transfer Dialog ─────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Log Remittance Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Select>
                <SelectTrigger label="From Currency">
                  <SelectValue placeholder="THB" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CURRENCIES).map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.flag} {c.code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger label="To Currency">
                  <SelectValue placeholder="INR" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">🇮🇳 INR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Amount Sent" type="number" placeholder="50000" />
              <Input label="Amount Received (INR)" type="number" placeholder="115200" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Exchange Rate" type="number" placeholder="2.304" />
              <Input label="Fee (optional)" type="number" placeholder="0" />
            </div>
            <Select>
              <SelectTrigger label="Transfer Method">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.logo} {m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input label="Date" type="date" />
            <Input label="Notes (optional)" placeholder="Family support, monthly" />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>
              <Send className="w-4 h-4" /> Save Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
