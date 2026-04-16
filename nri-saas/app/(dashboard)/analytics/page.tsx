'use client'

import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
  ComposedChart, Line
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Clean slate - data will come from user's actual transactions
const MONTHS = [] as string[]
const MONTHLY: Array<{ month: string; income: number; expenses: number; savings: number; remittance: number }> = []
const CATEGORY_SPEND: Array<{ name: string; value: number; color: string }> = []
const WEALTH_BREAKDOWN: Array<{ month: string; liquid: number; investments: number; deposits: number }> = []

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp  = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

export default function AnalyticsPage() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8 page-fade">
      <motion.div variants={fadeUp} className="page-header">
        <h1>Analytics</h1>
        <p>Deep-dive into your financial patterns</p>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Savings Rate',    value: '0%',     sub: 'Add income data',  variant: 'green' as const },
          { label: 'Total Remitted',      value: '₹0',     sub: 'No remittances',   variant: 'purple' as const },
          { label: 'Best Savings Month',  value: '--',     sub: 'Start tracking',   variant: 'blue' as const },
          { label: 'Income Growth',       value: '0%',     sub: 'Add more data',    variant: 'amber' as const },
        ].map(s => (
          <Card key={s.label} variant={s.variant} hover>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold font-tabular mt-1">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </Card>
        ))}
      </motion.div>

      <Tabs defaultValue="cashflow">
        <motion.div variants={fadeUp}>
          <TabsList>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
            <TabsTrigger value="spending">Spending</TabsTrigger>
            <TabsTrigger value="wealth">Wealth Growth</TabsTrigger>
            <TabsTrigger value="remittance">Remittance</TabsTrigger>
          </TabsList>
        </motion.div>

        <TabsContent value="cashflow">
          <motion.div variants={fadeUp}>
            {MONTHLY.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <h3 className="font-semibold mb-5">Income vs Expenses</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <ComposedChart data={MONTHLY}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number, n: string) => [`₹${(v/1000).toFixed(0)}K`, n]} />
                      <Bar dataKey="income" name="Income" fill="#00D68F" opacity={0.7} radius={[3,3,0,0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#EF4444" opacity={0.7} radius={[3,3,0,0]} />
                      <Line type="monotone" dataKey="savings" name="Savings" stroke="#6C63FF" strokeWidth={2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>
                <Card>
                  <h3 className="font-semibold mb-5">Monthly Savings</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={MONTHLY}>
                      <defs>
                        <linearGradient id="savGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#00D68F" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#00D68F" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => [`₹${(v/1000).toFixed(0)}K`, 'Savings']} />
                      <Area type="monotone" dataKey="savings" name="Savings" stroke="#00D68F" strokeWidth={2.5} fill="url(#savGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            ) : (
              <Card className="text-center py-12">
                <p className="text-muted-foreground text-sm">No cash flow data yet. Add income and expenses to see analytics.</p>
              </Card>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="spending">
          <motion.div variants={fadeUp}>
            {CATEGORY_SPEND.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <h3 className="font-semibold mb-5">Spending by Category</h3>
                  <div className="flex justify-center">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={CATEGORY_SPEND} cx="50%" cy="50%" outerRadius={100} paddingAngle={3} dataKey="value">
                          {CATEGORY_SPEND.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                        </Pie>
                        <Legend formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
                        <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card>
                  <h3 className="font-semibold mb-5">Category Breakdown</h3>
                  <div className="space-y-3">
                    {CATEGORY_SPEND.map(c => {
                      const total = CATEGORY_SPEND.reduce((s, i) => s + i.value, 0)
                      const pct = ((c.value / total) * 100).toFixed(0)
                      return (
                        <div key={c.name}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                              {c.name}
                            </span>
                            <span className="font-semibold font-tabular">₹{c.value.toLocaleString()} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/[0.08]">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: c.color }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="text-center py-12">
                <p className="text-muted-foreground text-sm">No spending data yet. Add expenses with categories to see breakdown.</p>
              </Card>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="wealth">
          <motion.div variants={fadeUp}>
            {WEALTH_BREAKDOWN.length > 0 ? (
              <Card>
                <h3 className="font-semibold mb-5">Wealth Composition Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={WEALTH_BREAKDOWN}>
                    <defs>
                      {[
                        { id: 'liq', color: '#6C63FF' },
                        { id: 'inv', color: '#00D68F' },
                        { id: 'dep', color: '#FBB724' },
                      ].map(g => (
                        <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={g.color} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                    <Tooltip formatter={(v: number) => `₹${(v/100000).toFixed(2)}L`} />
                    <Area type="monotone" dataKey="liquid" name="Liquid" stroke="#6C63FF" strokeWidth={2} fill="url(#liq)" stackId="1" />
                    <Area type="monotone" dataKey="investments" name="Investments" stroke="#00D68F" strokeWidth={2} fill="url(#inv)" stackId="1" />
                    <Area type="monotone" dataKey="deposits" name="Deposits" stroke="#FBB724" strokeWidth={2} fill="url(#dep)" stackId="1" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <p className="text-muted-foreground text-sm">No wealth data yet. Add accounts, investments, and deposits to see growth.</p>
              </Card>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="remittance">
          <motion.div variants={fadeUp}>
            {MONTHLY.length > 0 ? (
              <Card>
                <h3 className="font-semibold mb-5">Remittance History (INR)</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={MONTHLY}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => [`₹${(v/1000).toFixed(0)}K`, 'Remitted']} />
                    <Bar dataKey="remittance" name="Remitted (INR)" fill="#00D68F" radius={[4,4,0,0]} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Total remitted:</span>
                    <span className="font-bold font-tabular">₹0</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Avg per transfer:</span>
                    <span className="font-bold font-tabular">₹0</span>
                  </div>
                  <Badge variant="success">0 transfers</Badge>
                </div>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <p className="text-muted-foreground text-sm">No remittance data yet. Track your money transfers to see history.</p>
              </Card>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
