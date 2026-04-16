'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, TrendingUp, TrendingDown, DollarSign, Target, PieChart as PieIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import InvestmentForm from '@/components/investments/InvestmentForm'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'

// Clean slate - user will add their own investments
const INVESTMENTS: Array<any> = []
const ALLOCATION: Array<any> = []
const PERFORMANCE: Array<any> = []

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

export default function InvestmentsPage() {
  const [open, setOpen] = useState(false)

  const totalInvested = INVESTMENTS.reduce((sum, inv) => sum + inv.invested, 0)
  const totalCurrent = INVESTMENTS.reduce((sum, inv) => sum + inv.current, 0)
  const totalGain = totalCurrent - totalInvested
  const totalGainPercent = (totalGain / totalInvested) * 100

  const elssTotal = INVESTMENTS.filter(i => i.isElss).reduce((sum, i) => sum + i.invested, 0)

  const handleSubmit = (data: any) => {
    console.log('New investment:', data)
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8 page-fade">
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1>Investment Portfolio</h1>
          <p>Track mutual funds, stocks, PPF, NPS, and more</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Investment
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.1) 0%, rgba(108,99,255,0.02) 100%)' }}>
          <p className="text-xs text-muted-foreground">Total Invested</p>
          <p className="text-2xl font-bold font-tabular mt-1">{formatCurrency(totalInvested, 'INR', { compact: true })}</p>
          <p className="text-xs text-muted-foreground mt-1">Across {INVESTMENTS.length} investments</p>
        </Card>

        <Card className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(0,214,143,0.1) 0%, rgba(0,214,143,0.02) 100%)' }}>
          <p className="text-xs text-muted-foreground">Current Value</p>
          <p className="text-2xl font-bold font-tabular mt-1 text-emerald-400">{formatCurrency(totalCurrent, 'INR', { compact: true })}</p>
          <p className="text-xs text-emerald-400 mt-1">Portfolio value</p>
        </Card>

        <Card className={`relative overflow-hidden ${totalGain > 0 ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs text-muted-foreground">Total Gain/Loss</p>
            {totalGain > 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
          </div>
          <p className={`text-2xl font-bold font-tabular ${totalGain > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalGain > 0 ? '+' : ''}{formatCurrency(totalGain, 'INR', { compact: true })}
          </p>
          <p className={`text-xs mt-1 ${totalGain > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalGain > 0 ? '+' : ''}{totalGainPercent.toFixed(2)}% returns
          </p>
        </Card>

        <Card className="bg-sky-500/[0.06] border-sky-500/15">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs text-muted-foreground">ELSS (80C)</p>
            <Badge variant="blue" size="sm">Tax Saving</Badge>
          </div>
          <p className="text-2xl font-bold font-tabular">{formatCurrency(elssTotal, 'INR', { compact: true })}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {elssTotal < 150000 ? `₹${((150000 - elssTotal)/1000).toFixed(0)}K room left` : 'Limit reached'}
          </p>
        </Card>
      </motion.div>

      {/* Charts */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <h3 className="font-semibold mb-5">Portfolio Growth</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={PERFORMANCE}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => [`₹${(v/1000).toFixed(0)}K`, 'Value']} />
              <Line type="monotone" dataKey="value" stroke="#6C63FF" strokeWidth={2} dot={{ fill: '#6C63FF', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="font-semibold mb-5">Asset Allocation</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={ALLOCATION}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {ALLOCATION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `₹${(v/1000).toFixed(0)}K`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {ALLOCATION.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                <span className="text-xs text-muted-foreground flex-1">{item.name}</span>
                <span className="text-xs font-semibold">{item.percent}%</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Investments List */}
      <motion.div variants={fadeUp}>
        <h3 className="font-semibold mb-4">Your Investments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INVESTMENTS.map((inv) => {
            const gain = inv.current - inv.invested
            const gainPercent = (gain / inv.invested) * 100
            const isPositive = gain > 0

            return (
              <Card key={inv.id} className={`${isPositive ? 'border-emerald-500/15' : 'border-red-500/15'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{inv.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="default" size="sm">
                        {inv.type.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="blue" size="sm">{inv.category}</Badge>
                      {inv.isElss && <Badge variant="success" size="sm">80C</Badge>}
                    </div>
                  </div>
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Invested</p>
                    <p className="text-sm font-semibold font-tabular">{formatCurrency(inv.invested, inv.currency)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current Value</p>
                    <p className={`text-sm font-semibold font-tabular ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(inv.current, inv.currency)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-xs text-muted-foreground">
                    {inv.units} units · {formatDate(inv.purchaseDate, 'short')}
                  </span>
                  <span className={`text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{gainPercent.toFixed(2)}%
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      </motion.div>

      {/* XIRR Info */}
      <motion.div variants={fadeUp}>
        <Card className="bg-sky-500/[0.05] border-sky-500/15">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-sky-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold mb-1">Portfolio XIRR</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Your annualized return (XIRR) is approximately <span className="font-semibold text-emerald-400">14.2%</span>, 
                which is above the market average of 12%. Keep investing regularly for long-term wealth creation.
              </p>
              <Progress value={71} color="emerald" />
              <p className="text-xs text-muted-foreground mt-2">
                71% of your portfolio is in equity — good for long-term growth!
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <InvestmentForm open={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} />
    </motion.div>
  )
}
