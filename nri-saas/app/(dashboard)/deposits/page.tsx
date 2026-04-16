'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Calendar, TrendingUp, Clock, Bell } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import DepositForm from '@/components/deposits/DepositForm'
import { formatCurrency, formatDate } from '@/lib/utils/format'

// Demo deposit data
// Clean slate - user will add their own deposits
const DEPOSITS: Array<any> = []

// Calculate maturity amount with quarterly compounding
const calculateMaturityAmount = (principal: number, rate: number, startDate: string, maturityDate: string) => {
  const years = (new Date(maturityDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
  return principal * Math.pow(1 + rate / 400, 4 * years)
}

// Get days until maturity
const getDaysUntilMaturity = (maturityDate: string) => {
  const now = new Date()
  const maturity = new Date(maturityDate)
  const days = Math.ceil((maturity.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return days
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

export default function DepositsPage() {
  const [open, setOpen] = useState(false)

  const totalPrincipal = DEPOSITS.reduce((sum, dep) => sum + dep.amount, 0)
  const totalMaturityValue = DEPOSITS.reduce((sum, dep) => 
    sum + calculateMaturityAmount(dep.amount, dep.interestRate, dep.startDate, dep.maturityDate), 0
  )
  const totalInterest = totalMaturityValue - totalPrincipal

  // Find deposits maturing in next 90 days
  const upcomingMaturity = DEPOSITS.filter(dep => {
    const days = getDaysUntilMaturity(dep.maturityDate)
    return days > 0 && days <= 90
  }).sort((a, b) => getDaysUntilMaturity(a.maturityDate) - getDaysUntilMaturity(b.maturityDate))

  const handleSubmit = (data: any) => {
    console.log('New deposit:', data)
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8 page-fade">
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1>Fixed Deposits</h1>
          <p>Track FD maturity dates and interest earnings</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Deposit
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-sky-500/10 to-sky-500/[0.02]">
          <p className="text-xs text-muted-foreground">Total Principal</p>
          <p className="text-2xl font-bold font-tabular mt-1">{formatCurrency(totalPrincipal, 'INR', { compact: true })}</p>
          <p className="text-xs text-muted-foreground mt-1">{DEPOSITS.length} deposits</p>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-emerald-500/[0.02]">
          <p className="text-xs text-muted-foreground">Maturity Value</p>
          <p className="text-2xl font-bold font-tabular mt-1 text-emerald-400">{formatCurrency(totalMaturityValue, 'INR', { compact: true })}</p>
          <p className="text-xs text-emerald-400 mt-1">At maturity</p>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-amber-500/[0.02]">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs text-muted-foreground">Total Interest</p>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-tabular text-amber-400">{formatCurrency(totalInterest, 'INR', { compact: true })}</p>
          <p className="text-xs text-amber-400 mt-1">
            {((totalInterest / totalPrincipal) * 100).toFixed(1)}% returns
          </p>
        </Card>

        <Card className="bg-purple-500/[0.06] border-purple-500/15">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs text-muted-foreground">Avg Interest Rate</p>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold font-tabular">
            {(DEPOSITS.reduce((sum, dep) => sum + dep.interestRate, 0) / DEPOSITS.length).toFixed(2)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Per annum</p>
        </Card>
      </motion.div>

      {/* Upcoming Maturity Alert */}
      {upcomingMaturity.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card className="bg-amber-500/[0.08] border-amber-500/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold mb-1 text-amber-400">
                  {upcomingMaturity.length} Deposit{upcomingMaturity.length > 1 ? 's' : ''} Maturing Soon
                </h4>
                <div className="space-y-2">
                  {upcomingMaturity.map((dep) => {
                    const daysLeft = getDaysUntilMaturity(dep.maturityDate)
                    const maturityAmount = calculateMaturityAmount(dep.amount, dep.interestRate, dep.startDate, dep.maturityDate)
                    
                    return (
                      <div key={dep.id} className="flex items-center justify-between p-2 bg-black/10 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{dep.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Matures in {daysLeft} day{daysLeft !== 1 ? 's' : ''} · {formatDate(dep.maturityDate, 'short')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-emerald-400">{formatCurrency(maturityAmount, dep.currency, { compact: true })}</p>
                          {dep.autoRenew && (
                            <Badge variant="blue" size="sm" className="mt-1">Auto-renew</Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* FD Calendar View */}
      <motion.div variants={fadeUp}>
        <h3 className="font-semibold mb-4">Maturity Calendar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEPOSITS.sort((a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime()).map((dep) => {
            const maturityAmount = calculateMaturityAmount(dep.amount, dep.interestRate, dep.startDate, dep.maturityDate)
            const interest = maturityAmount - dep.amount
            const daysLeft = getDaysUntilMaturity(dep.maturityDate)
            const totalDays = (new Date(dep.maturityDate).getTime() - new Date(dep.startDate).getTime()) / (1000 * 60 * 60 * 24)
            const progress = Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100))
            
            return (
              <Card key={dep.id} className="border-white/10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{dep.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="default" size="sm">{dep.type.toUpperCase()}</Badge>
                      <Badge variant="blue" size="sm">{dep.bank}</Badge>
                      {dep.autoRenew && <Badge variant="success" size="sm">Auto-renew</Badge>}
                    </div>
                  </div>
                  <Calendar className="w-5 h-5 text-sky-400" />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Principal</p>
                    <p className="text-sm font-semibold font-tabular">{formatCurrency(dep.amount, dep.currency, { compact: true })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Maturity Value</p>
                    <p className="text-sm font-semibold font-tabular text-emerald-400">{formatCurrency(maturityAmount, dep.currency, { compact: true })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Interest ({dep.interestRate}%)</p>
                    <p className="text-sm font-semibold font-tabular text-amber-400">{formatCurrency(interest, dep.currency, { compact: true })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Maturity Date</p>
                    <p className="text-sm font-semibold">{formatDate(dep.maturityDate, 'short')}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Matured'}
                    </span>
                    <span className="font-semibold">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </motion.div>

      {/* Interest Income Timeline */}
      <motion.div variants={fadeUp}>
        <Card>
          <h3 className="font-semibold mb-4">Annual Interest Income (Projected)</h3>
          <div className="space-y-3">
            {[2025, 2026, 2027, 2028, 2029].map((year) => {
              // Calculate interest for deposits maturing in this year
              const yearlyInterest = DEPOSITS
                .filter(dep => new Date(dep.maturityDate).getFullYear() === year)
                .reduce((sum, dep) => {
                  const maturity = calculateMaturityAmount(dep.amount, dep.interestRate, dep.startDate, dep.maturityDate)
                  return sum + (maturity - dep.amount)
                }, 0)
              
              if (yearlyInterest === 0) return null
              
              return (
                <div key={year} className="flex items-center gap-4">
                  <div className="w-16 text-sm font-semibold text-muted-foreground">{year}</div>
                  <div className="flex-1">
                    <div className="h-8 bg-gradient-to-r from-amber-500/20 to-amber-500/5 rounded-lg flex items-center px-3">
                      <span className="text-sm font-semibold text-amber-400">
                        {formatCurrency(yearlyInterest, 'INR', { compact: true })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </motion.div>

      <DepositForm open={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} />
    </motion.div>
  )
}
