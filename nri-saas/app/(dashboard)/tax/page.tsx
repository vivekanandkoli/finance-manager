'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Plus, Shield, AlertCircle, CheckCircle2, TrendingDown, Download } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, getFinancialYears, getCurrentFinancialYear } from '@/lib/utils/format'
import { TAX_SECTIONS, type TaxSection } from '@/types'
import FemaTracker from '@/components/fema/FemaTracker'

const FY = getCurrentFinancialYear()

const TAX_ENTRIES = [
  { id: '1', section: '80C' as TaxSection, description: 'HDFC Life ELSS Fund',    amount: 50000,  fy: FY, verified: true  },
  { id: '2', section: '80C' as TaxSection, description: 'PPF Contribution',        amount: 60000,  fy: FY, verified: true  },
  { id: '3', section: '80C' as TaxSection, description: 'LIC Premium',             amount: 25000,  fy: FY, verified: false },
  { id: '4', section: '80D' as TaxSection, description: 'Health Insurance Premium',amount: 25000,  fy: FY, verified: true  },
  { id: '5', section: '80E' as TaxSection, description: 'Education Loan Interest', amount: 48000,  fy: FY, verified: false },
  { id: '6', section: 'DTAA' as TaxSection, description: 'Thai income tax paid (DTAA relief)', amount: 85000, fy: FY, verified: false },
]

const section80CTotal = TAX_ENTRIES.filter(e => e.section === '80C').reduce((s, e) => s + e.amount, 0)
const section80DTotal = TAX_ENTRIES.filter(e => e.section === '80D').reduce((s, e) => s + e.amount, 0)

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp  = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

export default function TaxPage() {
  const [open, setOpen] = useState(false)
  const [fy, setFy] = useState(FY)

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8 page-fade">
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div className="page-header mb-0">
          <h1>Tax Dashboard</h1>
          <p>80C · 80D · DTAA · FEMA compliance tracking for NRIs</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={fy} onValueChange={setFy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getFinancialYears(5).map(y => (
                <SelectItem key={y} value={y}>FY {y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4" /> Add Entry
          </Button>
        </div>
      </motion.div>

      {/* Section utilization */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            section: '80C', used: section80CTotal, limit: 150000, color: 'purple' as const,
            items: TAX_ENTRIES.filter(e => e.section === '80C').length,
            tip: section80CTotal < 150000 ? `₹${((150000 - section80CTotal)/1000).toFixed(0)}K room left — consider ELSS` : 'Limit reached',
          },
          {
            section: '80D', used: section80DTotal, limit: 50000, color: 'blue' as const,
            items: TAX_ENTRIES.filter(e => e.section === '80D').length,
            tip: section80DTotal < 25000 ? 'Under-utilised — add family health insurance' : '50% used',
          },
          {
            section: 'DTAA', used: 85000, limit: 0, color: 'green' as const,
            items: 1,
            tip: 'India-Thailand DTAA covers salary income',
          },
        ].map(s => (
          <Card key={s.section} variant={s.color}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <Badge variant={s.color === 'purple' ? 'default' : s.color === 'blue' ? 'blue' : 'success'}>
                  Section {s.section}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  {TAX_SECTIONS[s.section as TaxSection]?.description ?? s.section}
                </p>
              </div>
              <Shield className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold font-tabular">{formatCurrency(s.used, 'INR', { compact: true })}</p>
            {s.limit > 0 && (
              <>
                <div className="flex justify-between text-xs text-muted-foreground my-2">
                  <span>Used: {((s.used / s.limit) * 100).toFixed(0)}%</span>
                  <span>Limit: {formatCurrency(s.limit, 'INR', { compact: true })}</span>
                </div>
                <Progress value={(s.used / s.limit) * 100} color={s.color} />
              </>
            )}
            <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5">
              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              {s.tip}
            </p>
          </Card>
        ))}
      </motion.div>

      {/* Estimated Tax Saved */}
      <motion.div variants={fadeUp}>
        <Card className="bg-emerald-500/[0.07] border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Tax Saved (FY {fy})</p>
                <p className="text-3xl font-bold font-tabular text-emerald-400 mt-0.5">
                  {formatCurrency((section80CTotal + section80DTotal) * 0.3, 'INR')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">At 30% tax bracket · Section 80C + 80D</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              <Download className="w-4 h-4" /> Export Report
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* DTAA Info */}
      <motion.div variants={fadeUp}>
        <Card className="bg-sky-500/[0.06] border-sky-500/15">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold mb-1">DTAA — India–Thailand</h4>
              <p className="text-xs text-muted-foreground mb-3">
                India and Thailand have a Double Taxation Avoidance Agreement. Salary income earned in Thailand
                is taxable only in Thailand. You may claim relief under Article 15 of the DTAA.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Thailand tax paid', value: '₹85,000' },
                  { label: 'India relief claimable', value: '₹85,000' },
                  { label: 'Form 67 required', value: 'Before filing ITR' },
                ].map(i => (
                  <div key={i.label} className="p-2.5 rounded-lg bg-white/[0.04]">
                    <p className="text-[10px] text-muted-foreground">{i.label}</p>
                    <p className="text-sm font-semibold mt-0.5">{i.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* FEMA LRS Tracker */}
      <motion.div variants={fadeUp}>
        <h3 className="font-semibold mb-4">FEMA Compliance (LRS Tracker)</h3>
        <FemaTracker />
      </motion.div>

      {/* Entries table */}
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="all">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">All Entries</TabsTrigger>
              <TabsTrigger value="80C">80C</TabsTrigger>
              <TabsTrigger value="80D">80D</TabsTrigger>
              <TabsTrigger value="DTAA">DTAA / FEMA</TabsTrigger>
            </TabsList>
          </div>

          {['all', '80C', '80D', 'DTAA'].map(tab => (
            <TabsContent key={tab} value={tab}>
              <Card>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Section</th>
                      <th>Amount</th>
                      <th>FY</th>
                      <th>Verified</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {TAX_ENTRIES
                      .filter(e => tab === 'all' || e.section === tab || (tab === 'DTAA' && (e.section === 'DTAA' || e.section === 'FEMA')))
                      .map(entry => (
                        <tr key={entry.id}>
                          <td className="text-sm font-medium">{entry.description}</td>
                          <td><Badge variant="default">Section {entry.section}</Badge></td>
                          <td className="text-sm font-semibold font-tabular">{formatCurrency(entry.amount, 'INR')}</td>
                          <td className="text-sm text-muted-foreground">FY {entry.fy}</td>
                          <td>
                            {entry.verified
                              ? <span className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>
                              : <span className="flex items-center gap-1 text-amber-400 text-xs"><AlertCircle className="w-3.5 h-3.5" /> Pending</span>
                            }
                          </td>
                          <td>
                            <button className="text-xs text-primary hover:underline">Edit</button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      {/* Add Entry Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Add Tax Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select>
              <SelectTrigger label="Financial Year">
                <SelectValue placeholder={`FY ${FY}`} />
              </SelectTrigger>
              <SelectContent>
                {getFinancialYears(5).map(y => (
                  <SelectItem key={y} value={y}>FY {y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger label="Tax Section">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TAX_SECTIONS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    <div>
                      <span className="font-semibold">{v.label}</span>
                      {v.limit > 0 && <span className="ml-2 text-muted-foreground">— Limit ₹{(v.limit/1000).toFixed(0)}K</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input label="Description" placeholder="e.g. ELSS Fund — HDFC Life" />
            <Input label="Amount (INR)" type="number" placeholder="50000" />
            <Input label="Document URL (optional)" placeholder="Upload receipt to Supabase Storage" hint="Supported formats: PDF, JPG, PNG" />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}><Plus className="w-4 h-4" /> Save Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
