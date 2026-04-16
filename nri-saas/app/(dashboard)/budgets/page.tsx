'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, TrendingUp, TrendingDown, AlertCircle, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import BudgetForm from '@/components/budgets/BudgetForm'
import { formatCurrency } from '@/lib/utils/format'

// Clean slate - user will add their own budgets
const BUDGETS: Array<any> = []

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

export default function BudgetsPage() {
  const [open, setOpen] = useState(false)

  const totalBudget = BUDGETS.reduce((sum, b) => sum + b.budget, 0)
  const totalSpent = BUDGETS.reduce((sum, b) => sum + b.spent, 0)
  const totalRemaining = totalBudget - totalSpent
  const overallPercent = (totalSpent / totalBudget) * 100

  const overspent = BUDGETS.filter(b => b.percentUsed > 100).length
  const onTrack = BUDGETS.filter(b => b.percentUsed <= 80).length
  const warning = BUDGETS.filter(b => b.percentUsed > 80 && b.percentUsed <= 100).length

  const handleSubmit = (data: any) => {
    console.log('New budget:', data)
    // TODO: Call API to save budget
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8 page-fade">
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1>Budgets</h1>
          <p>Track spending against your monthly budgets</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" />
          Create Budget
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.1) 0%, rgba(108,99,255,0.02) 100%)' }}>
          <p className="text-xs text-muted-foreground">Total Budget</p>
          <p className="text-2xl font-bold font-tabular mt-1">{formatCurrency(totalBudget, 'THB', { compact: true })}</p>
          <p className="text-xs text-muted-foreground mt-1">Across {BUDGETS.length} categories</p>
        </Card>

        <Card className={`relative overflow-hidden ${overallPercent > 90 ? 'border-amber-500/30' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs text-muted-foreground">Spent</p>
            <Badge variant={overallPercent > 90 ? 'warning' : 'default'} size="sm">
              {overallPercent.toFixed(0)}%
            </Badge>
          </div>
          <p className="text-2xl font-bold font-tabular">{formatCurrency(totalSpent, 'THB', { compact: true })}</p>
          <Progress value={overallPercent} color={overallPercent > 90 ? 'amber' : 'purple'} className="mt-2" />
        </Card>

        <Card className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(0,214,143,0.1) 0%, rgba(0,214,143,0.02) 100%)' }}>
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className="text-2xl font-bold font-tabular mt-1 text-emerald-400">{formatCurrency(totalRemaining, 'THB', { compact: true })}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {totalRemaining > 0 ? 'Good savings potential' : 'Over budget!'}
          </p>
        </Card>

        <Card>
          <p className="text-xs text-muted-foreground mb-3">Budget Status</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                On Track
              </span>
              <span className="font-semibold">{onTrack}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                Warning
              </span>
              <span className="font-semibold">{warning}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                Over Budget
              </span>
              <span className="font-semibold">{overspent}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Budgets Grid */}
      <motion.div variants={fadeUp}>
        <h3 className="font-semibold mb-4">Category Budgets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BUDGETS.map((budget) => {
            const status = 
              budget.percentUsed > 100 ? 'overspent' :
              budget.percentUsed > 90 ? 'critical' :
              budget.percentUsed > 80 ? 'warning' :
              'good'

            const colorMap = {
              overspent: { bg: 'bg-red-500/[0.08]', border: 'border-red-500/30', text: 'text-red-400', progress: 'red' },
              critical: { bg: 'bg-amber-500/[0.08]', border: 'border-amber-500/30', text: 'text-amber-400', progress: 'amber' },
              warning: { bg: 'bg-yellow-500/[0.08]', border: 'border-yellow-500/30', text: 'text-yellow-400', progress: 'yellow' },
              good: { bg: 'bg-emerald-500/[0.05]', border: 'border-emerald-500/20', text: 'text-emerald-400', progress: 'emerald' },
            }

            const colors = colorMap[status]

            return (
              <Card key={budget.id} className={`${colors.border}`} style={{ background: colors.bg.replace('bg-', 'rgba(').replace('[', '').replace(']', '') + ')' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-sm">{budget.category}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatCurrency(budget.spent, budget.currency)} of {formatCurrency(budget.budget, budget.currency)}
                    </p>
                  </div>
                  <Badge 
                    variant={status === 'good' ? 'success' : status === 'overspent' ? 'error' : 'warning'}
                    size="sm"
                  >
                    {budget.percentUsed.toFixed(0)}%
                  </Badge>
                </div>

                <Progress 
                  value={Math.min(budget.percentUsed, 100)} 
                  color={colors.progress as any}
                  className="mb-2"
                />

                <div className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${colors.text}`}>
                    {budget.remaining >= 0 
                      ? `${formatCurrency(budget.remaining, budget.currency)} left`
                      : `${formatCurrency(Math.abs(budget.remaining), budget.currency)} over`
                    }
                  </span>
                  {status === 'overspent' && (
                    <span className="flex items-center gap-1 text-red-400">
                      <TrendingDown className="w-3 h-3" />
                      Exceeded
                    </span>
                  )}
                  {status === 'warning' && (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <AlertCircle className="w-3 h-3" />
                      Careful
                    </span>
                  )}
                  {status === 'good' && (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Check className="w-3 h-3" />
                      On Track
                    </span>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </motion.div>

      {/* Insights */}
      <motion.div variants={fadeUp}>
        <Card className="bg-sky-500/[0.06] border-sky-500/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-sky-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold mb-1">Budget Insights</h4>
              <p className="text-sm text-muted-foreground">
                You're doing well with <span className="font-semibold text-emerald-400">{onTrack} categories under budget</span>.
                {warning > 0 && (
                  <span> Watch out for <span className="font-semibold text-amber-400">{warning} categories near the limit</span>.</span>
                )}
                {overspent > 0 && (
                  <span className="text-red-400 font-semibold"> {overspent} categories have exceeded the budget — review spending!</span>
                )}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <BudgetForm open={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} />
    </motion.div>
  )
}
