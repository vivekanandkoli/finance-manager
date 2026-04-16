'use client'

import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import {
  TrendingUp, TrendingDown, Send, Wallet, CreditCard,
  AlertCircle, ArrowUpRight, Plus, RefreshCw
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatCompact, formatPct, formatRelativeDate, getCurrencyFlag } from '@/lib/utils/format'
import Link from 'next/link'

// ── Clean data - User will add their own ──────────────────────────────────────
const DEMO_STATS = {
  net_worth: 0,
  total_assets: 0,
  total_liabilities: 0,
  monthly_income: 0,
  monthly_expenses: 0,
  monthly_savings: 0,
  savings_rate: 0,
  total_remitted_ytd: 0,
}

const DEMO_ACCOUNTS: Array<{id: string; name: string; type: string; currency: string; balance: number; bank: string; country: string; change: number}> = []

const DEMO_WEALTH_CHART: Array<{month: string; value: number}> = []

const DEMO_PORTFOLIO: Array<{name: string; value: number; color: string}> = []

const DEMO_EXPENSES_CHART: Array<{month: string; income: number; expenses: number}> = []

const DEMO_REMITTANCES: Array<{date: string; from: string; to: string; amount: number; inr: number; method: string; rate: number}> = []

const DEMO_GOALS: Array<{name: string; target: number; current: number; currency: string; color: 'green' | 'blue' | 'purple'}> = []

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{name: string; value: number; color: string}>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="text-sm font-semibold font-tabular">{formatCompact(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ── Account type color/label ───────────────────────────────────────────────────
function AccountTypeBadge({ type }: { type: string }) {
  if (type === 'nre') return <Badge variant="nre">NRE</Badge>
  if (type === 'nro') return <Badge variant="nro">NRO</Badge>
  if (type === 'fcnr') return <Badge variant="fcnr">FCNR</Badge>
  return <Badge variant="gray">{type.toUpperCase()}</Badge>
}

export default function DashboardPage() {
  const s = DEMO_STATS

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-8 page-fade"
    >
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Good afternoon</p>
          <h1 className="text-2xl font-bold mt-0.5">Your Financial Overview</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Link href="/expenses">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              Add Transaction
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* ── Net Worth Hero ───────────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <Card className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(108,99,255,0.14) 0%, rgba(0,214,143,0.06) 60%, rgba(56,189,248,0.05) 100%)',
            borderColor: 'rgba(108,99,255,0.25)',
          }}>
          {/* Decorative orb */}
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.8) 0%, transparent 70%)' }} />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Net Worth</p>
              <p className="text-4xl font-bold mt-2 font-tabular gradient-text">
                {formatCompact(s.net_worth, 'INR')}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-sm text-emerald-400 font-medium">+{formatCompact(s.net_worth - 7940000)} this month</span>
              </div>
            </div>

            <div className="flex items-center gap-4 md:col-span-3">
              {[
                { label: 'Total Assets',    value: s.total_assets,    color: 'text-emerald-400' },
                { label: 'Liabilities',     value: s.total_liabilities, color: 'text-red-400' },
                { label: 'Monthly Income',  value: s.monthly_income,  color: 'text-sky-400' },
                { label: 'Monthly Savings', value: s.monthly_savings, color: 'text-violet-400' },
              ].map(item => (
                <div key={item.label} className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className={`text-lg font-bold font-tabular mt-1 ${item.color}`}>
                    {formatCompact(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Stats Row ────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Savings Rate',    value: `${s.savings_rate}%`,                  icon: Wallet,      variant: 'green' as const,  sub: '+4.2% vs last month' },
          { label: 'Monthly Expenses', value: formatCompact(s.monthly_expenses),    icon: CreditCard,  variant: 'amber' as const,  sub: '-6% vs last month' },
          { label: 'Remitted YTD',    value: formatCompact(s.total_remitted_ytd),   icon: Send,        variant: 'purple' as const, sub: '4 transfers so far' },
          { label: 'Active Accounts', value: '4',                                   icon: AlertCircle, variant: 'blue' as const,   sub: 'Across IN, TH, US' },
        ].map(stat => (
          <Card key={stat.label} variant={stat.variant} hover>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/08 flex items-center justify-center">
                <stat.icon className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold font-tabular mt-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
          </Card>
        ))}
      </motion.div>

      {/* ── Charts Row ───────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Net Worth Chart */}
        <div className="md:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold">Net Worth Trend</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Last 6 months</p>
              </div>
              <Badge variant="success">
                <TrendingUp className="w-3 h-3" />
                +18.3%
              </Badge>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={DEMO_WEALTH_CHART} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="value" name="Net Worth" stroke="#6C63FF"
                    strokeWidth={2.5} fill="url(#netWorthGrad)" dot={false} activeDot={{ r: 4, fill: '#6C63FF' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Portfolio Donut */}
        <Card>
          <div className="mb-4">
            <h3 className="font-semibold">Portfolio Allocation</h3>
            <p className="text-xs text-muted-foreground mt-0.5">By asset class</p>
          </div>
          <div className="chart-container flex justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={DEMO_PORTFOLIO} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                  paddingAngle={3} dataKey="value">
                  {DEMO_PORTFOLIO.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCompact(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {DEMO_PORTFOLIO.map(item => {
              const total = DEMO_PORTFOLIO.reduce((s, i) => s + i.value, 0)
              const pct = ((item.value / total) * 100).toFixed(0)
              return (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-muted-foreground flex-1 truncate">{item.name}</span>
                  <span className="text-xs font-semibold font-tabular">{pct}%</span>
                </div>
              )
            })}
          </div>
        </Card>
      </motion.div>

      {/* ── Accounts + Income/Expense Charts ─────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accounts */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold">Accounts</h3>
              <p className="text-xs text-muted-foreground mt-0.5">All currencies</p>
            </div>
            <Link href="/accounts">
              <Button variant="ghost" size="sm">View all <ArrowUpRight className="w-3.5 h-3.5" /></Button>
            </Link>
          </div>
          <div className="space-y-3">
            {DEMO_ACCOUNTS.map(acc => (
              <div key={acc.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-white/06 flex items-center justify-center text-lg flex-shrink-0">
                  {getCurrencyFlag(acc.currency as 'INR' | 'THB' | 'USD')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{acc.name}</p>
                    <AccountTypeBadge type={acc.type} />
                  </div>
                  <p className="text-xs text-muted-foreground">{acc.bank} · {acc.country}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold font-tabular">
                    {formatCurrency(acc.balance, acc.currency as 'INR' | 'THB' | 'USD', { compact: true })}
                  </p>
                  <p className={`text-xs font-medium ${acc.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatPct(acc.change)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Income vs Expenses */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold">Income vs Expenses</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly comparison</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Income</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />Expenses</span>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={DEMO_EXPENSES_CHART} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D68F" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00D68F" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#00D68F" strokeWidth={2}
                  fill="url(#incGrad)" dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2}
                  fill="url(#expGrad)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* ── Remittances + Goals ───────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Remittances */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold">Recent Remittances</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Money sent to India</p>
            </div>
            <Link href="/remittance">
              <Button variant="ghost" size="sm">View all <ArrowUpRight className="w-3.5 h-3.5" /></Button>
            </Link>
          </div>
          <div className="space-y-3">
            {DEMO_REMITTANCES.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/12 flex items-center justify-center">
                  <Send className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {getCurrencyFlag(r.from as 'THB' | 'USD')} → {getCurrencyFlag('INR')}
                    </span>
                    <Badge variant="gray">{r.method}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatRelativeDate(r.date)} · Rate: {r.rate}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-400 font-tabular">
                    {formatCurrency(r.inr, 'INR', { compact: true })}
                  </p>
                  <p className="text-xs text-muted-foreground font-tabular">{r.from} {r.amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/08 border border-emerald-500/15">
            <p className="text-xs text-emerald-400 font-medium">
              💡 Current THB/INR rate 2.31 is above 90-day average (2.27). Good time to remit!
            </p>
          </div>
        </Card>

        {/* Goals */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold">Savings Goals</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Progress tracker</p>
            </div>
            <Link href="/goals">
              <Button variant="ghost" size="sm">View all <ArrowUpRight className="w-3.5 h-3.5" /></Button>
            </Link>
          </div>
          <div className="space-y-5">
            {DEMO_GOALS.map(goal => {
              const pct = Math.round((goal.current / goal.target) * 100)
              return (
                <div key={goal.name}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{goal.name}</p>
                    <p className="text-sm font-semibold font-tabular">{pct}%</p>
                  </div>
                  <Progress value={pct} color={goal.color} />
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-muted-foreground font-tabular">
                      {formatCompact(goal.current)} saved
                    </p>
                    <p className="text-xs text-muted-foreground font-tabular">
                      Target: {formatCompact(goal.target)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <Link href="/goals">
              <Button variant="secondary" size="sm" className="w-full">
                <Plus className="w-4 h-4" /> Add Goal
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
