'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, TrendingDown, Calendar, DollarSign, Info, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import LoanForm from '@/components/loans/LoanForm'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

// Demo loan data
// Clean slate - user will add their own loans
const LOANS: Array<any> = []

// Calculate amortization schedule preview
const generateAmortization = (principal: number, rate: number, months: number, paidMonths: number) => {
  const monthlyRate = rate / 12 / 100
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
  
  let balance = principal
  const schedule = []
  
  for (let i = 0; i < paidMonths; i++) {
    const interest = balance * monthlyRate
    const principalPaid = emi - interest
    balance -= principalPaid
  }
  
  // Next 12 months forecast
  for (let i = 0; i < 12; i++) {
    const month = paidMonths + i + 1
    const interest = balance * monthlyRate
    const principalPaid = emi - interest
    balance -= principalPaid
    
    schedule.push({
      month: `M${month}`,
      principal: principalPaid,
      interest: interest,
      balance: Math.max(0, balance),
    })
  }
  
  return schedule
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

export default function LoansPage() {
  const [open, setOpen] = useState(false)

  const totalPrincipal = LOANS.reduce((sum, loan) => sum + loan.principal, 0)
  const totalMonthlyEmi = LOANS.reduce((sum, loan) => sum + loan.emiAmount, 0)
  
  // Calculate outstanding principal
  const totalOutstanding = LOANS.reduce((sum, loan) => {
    const monthlyRate = loan.interestRate / 12 / 100
    let balance = loan.principal
    for (let i = 0; i < loan.paidMonths; i++) {
      const interest = balance * monthlyRate
      const principalPaid = loan.emiAmount - interest
      balance -= principalPaid
    }
    return sum + balance
  }, 0)

  const totalPaid = totalPrincipal - totalOutstanding
  const payoffProgress = (totalPaid / totalPrincipal) * 100

  const handleSubmit = (data: any) => {
    console.log('New loan:', data)
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8 page-fade">
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1>Loan EMI Tracker</h1>
          <p>Track all your loans and EMI payments</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Loan
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-500/[0.02]">
          <p className="text-xs text-muted-foreground">Total Borrowed</p>
          <p className="text-2xl font-bold font-tabular mt-1">{formatCurrency(totalPrincipal, 'INR', { compact: true })}</p>
          <p className="text-xs text-muted-foreground mt-1">{LOANS.length} active loans</p>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-red-500/10 to-red-500/[0.02]">
          <p className="text-xs text-muted-foreground">Outstanding Balance</p>
          <p className="text-2xl font-bold font-tabular mt-1 text-red-400">{formatCurrency(totalOutstanding, 'INR', { compact: true })}</p>
          <p className="text-xs text-red-400 mt-1">Remaining to pay</p>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-emerald-500/[0.02]">
          <p className="text-xs text-muted-foreground">Total Monthly EMI</p>
          <p className="text-2xl font-bold font-tabular mt-1 text-emerald-400">{formatCurrency(totalMonthlyEmi, 'INR', { compact: true })}</p>
          <p className="text-xs text-emerald-400 mt-1">Per month</p>
        </Card>

        <Card className="bg-sky-500/[0.06] border-sky-500/15">
          <p className="text-xs text-muted-foreground mb-2">Payoff Progress</p>
          <div className="flex items-end gap-2 mb-2">
            <p className="text-2xl font-bold font-tabular">{payoffProgress.toFixed(1)}%</p>
            <TrendingDown className="w-5 h-5 text-sky-400 mb-1" />
          </div>
          <Progress value={payoffProgress} color="emerald" />
          <p className="text-xs text-muted-foreground mt-2">
            {formatCurrency(totalPaid, 'INR', { compact: true })} paid off
          </p>
        </Card>
      </motion.div>

      {/* Loans List */}
      <motion.div variants={fadeUp}>
        <h3 className="font-semibold mb-4">Active Loans</h3>
        <div className="space-y-4">
          {LOANS.map((loan) => {
            const payoffPercent = (loan.paidMonths / loan.tenureMonths) * 100
            const monthlyRate = loan.interestRate / 12 / 100
            let outstanding = loan.principal
            for (let i = 0; i < loan.paidMonths; i++) {
              const interest = outstanding * monthlyRate
              const principalPaid = loan.emiAmount - interest
              outstanding -= principalPaid
            }
            
            const totalPayable = loan.emiAmount * loan.tenureMonths
            const totalInterest = totalPayable - loan.principal
            const interestPercent = (totalInterest / loan.principal) * 100

            return (
              <Card key={loan.id} className="border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold">{loan.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="default" size="sm">{loan.type.toUpperCase()}</Badge>
                      <Badge variant="blue" size="sm">{loan.lender}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {loan.interestRate}% p.a.
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Monthly EMI</p>
                    <p className="text-xl font-bold font-tabular">{formatCurrency(loan.emiAmount, loan.currency, { compact: true })}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Principal</p>
                    <p className="text-sm font-semibold font-tabular">{formatCurrency(loan.principal, loan.currency, { compact: true })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Outstanding</p>
                    <p className="text-sm font-semibold font-tabular text-red-400">{formatCurrency(outstanding, loan.currency, { compact: true })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Interest</p>
                    <p className="text-sm font-semibold font-tabular text-amber-400">{formatCurrency(totalInterest, loan.currency, { compact: true })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <p className="text-sm font-semibold">{formatDate(loan.startDate, 'short')}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Payoff Progress</span>
                    <span className="font-semibold">{loan.paidMonths} / {loan.tenureMonths} months</span>
                  </div>
                  <Progress value={payoffPercent} color="emerald" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{payoffPercent.toFixed(1)}% completed</span>
                    <span>{loan.remainingMonths} months left</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </motion.div>

      {/* Amortization Preview - Only show if loans exist */}
      {LOANS.length > 0 && (
        <motion.div variants={fadeUp}>
          <h3 className="font-semibold mb-4">Amortization Schedule (Next 12 Months)</h3>
          <Card>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={generateAmortization(LOANS[0].principal, LOANS[0].interestRate, LOANS[0].tenureMonths, LOANS[0].paidMonths)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
                <Bar dataKey="principal" stackId="a" fill="#00D68F" name="Principal" />
                <Bar dataKey="interest" stackId="a" fill="#FBB724" name="Interest" />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-4 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  The chart shows how your EMI is split between principal and interest payments. 
                  Early payments have more interest, while later payments have more principal repayment.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Debt-Free Timeline - Only show if loans exist */}
      {LOANS.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/[0.02] border-emerald-500/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold mb-1">Debt-Free Projection</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Based on your current EMI schedule, you'll be completely debt-free by{' '}
                  <span className="font-semibold text-emerald-400">June 2042</span>. 
                  Making extra principal payments can help you become debt-free faster and save on interest!
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Longest loan: Home Loan (206 months remaining)</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Empty State - Show when no loans */}
      {LOANS.length === 0 && (
        <motion.div variants={fadeUp}>
          <Card className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">No Loans Yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Start tracking your loans and EMI payments. Get insights on your debt repayment schedule and plan your journey to becoming debt-free.
                </p>
              </div>
              <Button onClick={() => setOpen(true)} size="lg">
                <Plus className="w-4 h-4" />
                Add Your First Loan
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      <LoanForm open={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} />
    </motion.div>
  )
}
