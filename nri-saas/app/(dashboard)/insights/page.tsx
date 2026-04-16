'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, RefreshCw, TrendingUp, AlertCircle, CheckCircle2, Info, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/format'

const INSIGHTS = [
  {
    id: '1', type: 'warning', priority: 95, category: 'spending',
    icon: '🚨', title: 'Spending up 18% this month',
    message: 'You\'ve spent ₹68,000 this month vs ₹57,600 last month — an 18% increase. Main drivers: Dining (+₹4,200) and Shopping (+₹3,800).',
    action: 'Review expenses',
    href: '/expenses',
    data: { change: 18, current: 68000, previous: 57600 },
    ai: true,
  },
  {
    id: '2', type: 'success', priority: 85, category: 'remittance',
    icon: '💡', title: 'Good time to remit — rate above average',
    message: 'THB/INR at 2.312 is 1.67% above the 90-day average of 2.274. Sending ₹1L now saves you ~THB 718 compared to average.',
    action: 'Go to Remittance',
    href: '/remittance',
    data: { currentRate: 2.312, avgRate: 2.274, savings: 718 },
    ai: true,
  },
  {
    id: '3', type: 'info', priority: 75, category: 'tax',
    icon: '📋', title: '₹15,000 more 80C room left',
    message: 'You\'ve used ₹1.35L of the ₹1.5L 80C limit. Consider investing ₹15K more in ELSS before March 31 to maximise your deduction.',
    action: 'Track 80C',
    href: '/tax',
    data: { used: 135000, limit: 150000, remaining: 15000 },
    ai: false,
  },
  {
    id: '4', type: 'success', priority: 70, category: 'savings',
    icon: '🎉', title: 'Savings rate 63.2% — excellent!',
    message: 'Your savings rate is significantly above the recommended 20-30%. You saved ₹1.17L this month. Consider moving surplus to a high-yield instrument.',
    action: 'View Goals',
    href: '/goals',
    data: { savingsRate: 63.2, saved: 117000 },
    ai: false,
  },
  {
    id: '5', type: 'warning', priority: 65, category: 'investment',
    icon: '⚖️', title: 'Portfolio: 82% equity concentration',
    message: 'Your investments are heavily equity-weighted. Adding debt (FDs, bonds) or gold could reduce volatility, especially given NRI exchange rate exposure.',
    action: 'View Investments',
    href: '/investments',
    data: { equity: 82, recommended: 60 },
    ai: true,
  },
  {
    id: '6', type: 'info', priority: 55, category: 'bills',
    icon: '📅', title: '2 bills due in next 7 days',
    message: 'Life Insurance Premium (₹8,500) due Apr 20 and Credit Card Statement (₹12,400) due Apr 22. Total: ₹20,900.',
    action: 'View Bills',
    href: '/bills',
    data: { count: 2, total: 20900 },
    ai: false,
  },
]

const TYPE_COLORS = {
  warning: 'bg-amber-500/10 border-amber-500/20',
  success: 'bg-emerald-500/10 border-emerald-500/20',
  info:    'bg-sky-500/10 border-sky-500/20',
  error:   'bg-red-500/10 border-red-500/20',
}

const TYPE_ICON_BG = {
  warning: 'bg-amber-500/15',
  success: 'bg-emerald-500/15',
  info:    'bg-sky-500/15',
  error:   'bg-red-500/15',
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp  = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }

export default function InsightsPage() {
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? INSIGHTS : INSIGHTS.filter(i => i.category === filter)

  async function regenerate() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    setLoading(false)
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8 page-fade">
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div className="page-header mb-0">
          <div className="flex items-center gap-2">
            <h1>AI Insights</h1>
            <Badge variant="default" className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Powered by Groq / Llama 3
            </Badge>
          </div>
          <p>Personalised financial insights for your NRI profile</p>
        </div>
        <Button variant="secondary" onClick={regenerate} loading={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Regenerate
        </Button>
      </motion.div>

      {/* Summary row */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Insights',  value: INSIGHTS.length.toString(),                                      icon: Sparkles,     variant: 'purple' as const },
          { label: 'Action Needed',   value: INSIGHTS.filter(i => i.type === 'warning').length.toString(),    icon: AlertCircle,  variant: 'amber' as const },
          { label: 'Positive Signs',  value: INSIGHTS.filter(i => i.type === 'success').length.toString(),    icon: CheckCircle2, variant: 'green' as const },
          { label: 'AI-Generated',    value: INSIGHTS.filter(i => i.ai).length.toString(),                    icon: Zap,          variant: 'blue' as const },
        ].map(s => (
          <Card key={s.label} variant={s.variant} hover>
            <s.icon className="w-5 h-5 mb-3 opacity-70" />
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold font-tabular mt-1">{s.value}</p>
          </Card>
        ))}
      </motion.div>

      {/* Filter */}
      <motion.div variants={fadeUp} className="flex items-center gap-2">
        {['all', 'spending', 'savings', 'remittance', 'investment', 'tax', 'bills'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`pill-tab capitalize ${filter === f ? 'active' : ''}`}>
            {f}
          </button>
        ))}
      </motion.div>

      {/* Insight cards */}
      <motion.div variants={fadeUp} className="space-y-4">
        {filtered.map((insight, i) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`${TYPE_COLORS[insight.type as keyof typeof TYPE_COLORS]} border`}>
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${TYPE_ICON_BG[insight.type as keyof typeof TYPE_ICON_BG]}`}>
                  {insight.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold">{insight.title}</h4>
                        {insight.ai && (
                          <Badge variant="default" className="text-[10px]">
                            <Sparkles className="w-2.5 h-2.5" /> AI
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{insight.message}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant={
                        insight.priority >= 85 ? 'danger' :
                        insight.priority >= 65 ? 'warning' :
                        'gray'
                      }>
                        P{insight.priority >= 85 ? '1' : insight.priority >= 65 ? '2' : '3'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <a href={insight.href}>
                      <Button size="sm" variant="secondary">{insight.action}</Button>
                    </a>
                    <span className="text-xs text-muted-foreground capitalize">{insight.category}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* AI explainer */}
      <motion.div variants={fadeUp}>
        <Card className="bg-primary/[0.05] border-primary/15">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold mb-1">About AI Insights</h4>
              <p className="text-xs text-muted-foreground">
                AI insights are generated by Llama 3.1 via Groq (free tier — 14,400 requests/day).
                Your financial data is sent to Groq&apos;s API to generate insights but is never stored on Groq&apos;s servers.
                Rule-based insights marked without the AI badge are calculated locally.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
