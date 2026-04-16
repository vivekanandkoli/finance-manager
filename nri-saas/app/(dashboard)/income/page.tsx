'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Wallet, TrendingUp, Calendar, Download, Filter } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import IncomeForm from '@/components/income/IncomeForm'
import { formatCurrency, formatDate, formatRelativeDate } from '@/lib/utils/format'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ExcelExporter } from '@/lib/export/ExcelExporter'

// Clean slate - user will add their own income
const INCOME_DATA: Array<any> = []
const MONTHLY_TREND: Array<any> = []
const SOURCE_BREAKDOWN: Array<any> = []

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

export default function IncomePage() {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  const totalIncome = INCOME_DATA.reduce((sum, item) => sum + item.amountInr, 0)
  const thisMonth = INCOME_DATA.filter(i => new Date(i.date).getMonth() === 3).reduce((sum, item) => sum + item.amountInr, 0)
  const avgMonthly = MONTHLY_TREND.reduce((sum, m) => sum + m.income, 0) / MONTHLY_TREND.length

  const filteredData = filter === 'all' ? INCOME_DATA : INCOME_DATA.filter(i => i.source === filter)

  const handleSubmit = (data: any) => {
    console.log('New income:', data)
    // TODO: Call API to save income
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8 page-fade">
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1>Income Tracking</h1>
          <p>Track all sources of income across countries and currencies</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Income
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card hover>
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <Badge variant="success">+12.4%</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Total Income (YTD)</p>
          <p className="text-2xl font-bold font-tabular mt-1">{formatCurrency(totalIncome, 'INR', { compact: true })}</p>
        </Card>

        <Card hover>
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">This Month</p>
          <p className="text-2xl font-bold font-tabular mt-1">{formatCurrency(thisMonth, 'INR', { compact: true })}</p>
        </Card>

        <Card hover>
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Avg Monthly</p>
          <p className="text-2xl font-bold font-tabular mt-1">{formatCurrency(avgMonthly, 'INR', { compact: true })}</p>
        </Card>

        <Card hover>
          <p className="text-xs text-muted-foreground">Income Sources</p>
          <p className="text-2xl font-bold font-tabular mt-1">{SOURCE_BREAKDOWN.length}</p>
          <div className="flex gap-1 mt-3">
            {SOURCE_BREAKDOWN.map(s => (
              <div key={s.name} className="h-1.5 rounded-full" style={{ width: `${(s.value / totalIncome) * 100}%`, background: s.color }} />
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Charts */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <h3 className="font-semibold mb-5">Income Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={MONTHLY_TREND}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => [`₹${(v/1000).toFixed(0)}K`, 'Income']} />
              <Area type="monotone" dataKey="income" stroke="#6C63FF" strokeWidth={2} fill="url(#incomeGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="font-semibold mb-5">By Source</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={SOURCE_BREAKDOWN}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {SOURCE_BREAKDOWN.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `₹${(v/1000).toFixed(0)}K`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {SOURCE_BREAKDOWN.map(s => (
              <div key={s.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                <span className="text-xs text-muted-foreground">{s.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Income List */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Income</h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => ExcelExporter.exportIncome(filteredData)}
            >
              <Download className="w-4 h-4" />
              Export Excel
            </Button>
          </div>
        </div>

        <Card>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Source</th>
                <th>Amount</th>
                <th>Country</th>
                <th>Taxable</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((income) => (
                <tr key={income.id}>
                  <td>
                    <div className="text-sm font-medium">{formatDate(income.date)}</div>
                    <div className="text-xs text-muted-foreground">{formatRelativeDate(income.date)}</div>
                  </td>
                  <td className="text-sm">{income.description}</td>
                  <td>
                    <Badge variant={income.source === 'salary' ? 'default' : 'blue'}>
                      {income.source.charAt(0).toUpperCase() + income.source.slice(1)}
                    </Badge>
                  </td>
                  <td>
                    <div className="text-sm font-semibold font-tabular">
                      {formatCurrency(income.amount, income.currency)}
                    </div>
                    {income.currency !== 'INR' && (
                      <div className="text-xs text-muted-foreground">
                        ≈ {formatCurrency(income.amountInr, 'INR', { compact: true })}
                      </div>
                    )}
                  </td>
                  <td className="text-sm text-muted-foreground">{income.country}</td>
                  <td>
                    {income.isTaxable ? (
                      <Badge variant="warning" size="sm">Taxable</Badge>
                    ) : (
                      <Badge variant="success" size="sm">Tax-free</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </motion.div>

      <IncomeForm open={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} />
    </motion.div>
  )
}
