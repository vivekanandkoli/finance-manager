'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Bell, Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import BillForm from '@/components/bills/BillForm'
import { formatCurrency, formatDate } from '@/lib/utils/format'

// Clean slate - user will add their own bills
const BILLS: Array<any> = []

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

export default function BillsPage() {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'paid'>('all')

  const upcoming = BILLS.filter(b => !b.isPaid)
  const upcomingSoon = upcoming.filter(b => b.daysUntilDue <= 7 && b.daysUntilDue > 0)
  const overdue = upcoming.filter(b => b.daysUntilDue < 0)
  const totalUpcoming = upcoming.reduce((sum, b) => sum + b.amount, 0)

  const filteredBills = filter === 'all' ? BILLS : filter === 'upcoming' ? upcoming : BILLS.filter(b => b.isPaid)

  const handleSubmit = (data: any) => {
    console.log('New bill:', data)
    // TODO: Call API to save bill
  }

  const handleMarkPaid = (billId: string) => {
    console.log('Mark as paid:', billId)
    // TODO: Call API to mark bill as paid
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8 page-fade">
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1>Bills & Reminders</h1>
          <p>Never miss a payment with automated reminders</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Bill
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-sky-500/[0.08] border-sky-500/20">
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Upcoming Bills</p>
          <p className="text-2xl font-bold font-tabular mt-1">{upcoming.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Total: {formatCurrency(totalUpcoming, 'THB', { compact: true })}
          </p>
        </Card>

        <Card className={`${upcomingSoon.length > 0 ? 'bg-amber-500/[0.08] border-amber-500/20' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            {upcomingSoon.length > 0 && (
              <Badge variant="warning" size="sm">Alert</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Due in 7 Days</p>
          <p className="text-2xl font-bold font-tabular mt-1">{upcomingSoon.length}</p>
          <p className="text-xs text-amber-400 mt-1">
            {upcomingSoon.length > 0 ? 'Action needed soon' : 'All clear'}
          </p>
        </Card>

        <Card className={`${overdue.length > 0 ? 'bg-red-500/[0.08] border-red-500/30' : 'bg-emerald-500/[0.06] border-emerald-500/20'}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            {overdue.length > 0 && (
              <Badge variant="error" size="sm">Urgent</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Overdue</p>
          <p className={`text-2xl font-bold font-tabular mt-1 ${overdue.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {overdue.length}
          </p>
          <p className={`text-xs mt-1 ${overdue.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {overdue.length > 0 ? 'Pay immediately!' : 'No overdue bills'}
          </p>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Paid This Month</p>
          <p className="text-2xl font-bold font-tabular mt-1">{BILLS.filter(b => b.isPaid).length}</p>
          <p className="text-xs text-emerald-400 mt-1">Keep it up!</p>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex items-center gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Bills
        </Button>
        <Button
          variant={filter === 'upcoming' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </Button>
        <Button
          variant={filter === 'paid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('paid')}
        >
          Paid
        </Button>
      </motion.div>

      {/* Bills List */}
      <motion.div variants={fadeUp}>
        <div className="space-y-3">
          {filteredBills.map((bill) => {
            const isOverdue = bill.daysUntilDue < 0 && !bill.isPaid
            const isDueSoon = bill.daysUntilDue <= 3 && bill.daysUntilDue >= 0 && !bill.isPaid

            return (
              <Card 
                key={bill.id} 
                className={`
                  ${isOverdue ? 'border-red-500/30 bg-red-500/[0.05]' : ''}
                  ${isDueSoon ? 'border-amber-500/20 bg-amber-500/[0.03]' : ''}
                  ${bill.isPaid ? 'opacity-60' : ''}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      bill.isPaid ? 'bg-emerald-500/15' :
                      isOverdue ? 'bg-red-500/15' :
                      isDueSoon ? 'bg-amber-500/15' :
                      'bg-primary/10'
                    }`}>
                      {bill.isPaid ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Bell className="w-5 h-5 text-primary" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h4 className="font-semibold text-sm">{bill.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {bill.category} · {bill.frequency.charAt(0).toUpperCase() + bill.frequency.slice(1)}
                            {bill.autoDebit && ' · Auto-debit'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold font-tabular">{formatCurrency(bill.amount, bill.currency)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(bill.dueDate)}
                        </div>
                        
                        {bill.isPaid ? (
                          <Badge variant="success" size="sm">Paid</Badge>
                        ) : isOverdue ? (
                          <Badge variant="error" size="sm">
                            {Math.abs(bill.daysUntilDue)} days overdue
                          </Badge>
                        ) : isDueSoon ? (
                          <Badge variant="warning" size="sm">
                            Due in {bill.daysUntilDue} day{bill.daysUntilDue !== 1 ? 's' : ''}
                          </Badge>
                        ) : (
                          <Badge variant="default" size="sm">
                            {bill.daysUntilDue} days away
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {!bill.isPaid && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkPaid(bill.id)}
                      className="ml-3"
                    >
                      Mark Paid
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </motion.div>

      <BillForm open={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} />
    </motion.div>
  )
}
