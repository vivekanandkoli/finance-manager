'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Shield, AlertTriangle, CheckCircle2, TrendingUp, ExternalLink } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

type FemaData = {
  financialYear: string
  limit: number
  used: number
  remaining: number
  percentUsed: number
  breakdown: Record<string, number>
  remittances: number
  alert: 'ok' | 'warning' | 'critical'
}

export default function FemaTracker() {
  const [data, setData] = useState<FemaData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFemaData()
  }, [])

  const fetchFemaData = async () => {
    try {
      const response = await fetch('/api/fema')
      const json = await response.json()
      setData(json)
    } catch (error) {
      console.error('Failed to fetch FEMA data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-64 bg-white/5 rounded-lg" />
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="text-center py-12">
        <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Failed to load FEMA compliance data</p>
      </Card>
    )
  }

  const breakdownData = Object.entries(data.breakdown).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
    color: getColorForPurpose(name)
  }))

  const alertConfig = {
    ok: { bg: 'bg-emerald-500/[0.06]', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle2 },
    warning: { bg: 'bg-amber-500/[0.08]', border: 'border-amber-500/25', text: 'text-amber-400', icon: AlertTriangle },
    critical: { bg: 'bg-red-500/[0.08]', border: 'border-red-500/30', text: 'text-red-400', icon: AlertTriangle },
  }

  const config = alertConfig[data.alert]
  const Icon = config.icon

  return (
    <div className="space-y-6">
      {/* Main LRS Status Card */}
      <Card className={`${config.border} ${config.bg}`}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className={`w-5 h-5 ${config.text}`} />
              <h3 className="font-semibold">FEMA LRS Compliance</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Financial Year {data.financialYear} · Liberalized Remittance Scheme
            </p>
          </div>
          <Badge variant={data.alert === 'ok' ? 'success' : data.alert === 'warning' ? 'warning' : 'error'}>
            {data.percentUsed.toFixed(1)}% Used
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Annual Limit</p>
            <p className="text-2xl font-bold font-tabular">${data.limit.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">RBI prescribed limit</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Used (YTD)</p>
            <p className={`text-2xl font-bold font-tabular ${config.text}`}>
              ${data.used.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Across {data.remittances} remittance{data.remittances !== 1 ? 's' : ''}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Remaining</p>
            <p className={`text-2xl font-bold font-tabular ${data.remaining > 50000 ? 'text-emerald-400' : 'text-amber-400'}`}>
              ${data.remaining.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Available for remittance
            </p>
          </div>
        </div>

        <Progress 
          value={data.percentUsed} 
          color={data.alert === 'ok' ? 'emerald' : data.alert === 'warning' ? 'amber' : 'red'}
          className="h-3"
        />

        <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-white/[0.03]">
          <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${config.text}`} />
          <div className="text-sm">
            {data.alert === 'ok' && (
              <p className="text-muted-foreground">
                You're well within your LRS limit. You can remit up to <span className="font-semibold text-emerald-400">${data.remaining.toLocaleString()}</span> more this financial year.
              </p>
            )}
            {data.alert === 'warning' && (
              <p className="text-muted-foreground">
                <span className="font-semibold text-amber-400">Caution:</span> You've used {data.percentUsed.toFixed(0)}% of your LRS limit. 
                Plan your remaining remittances carefully to stay within the $250K annual cap.
              </p>
            )}
            {data.alert === 'critical' && (
              <p className="text-muted-foreground">
                <span className="font-semibold text-red-400">Critical:</span> You've nearly exhausted your LRS limit! 
                Only <span className="text-red-400 font-semibold">${data.remaining.toLocaleString()}</span> remaining. 
                Any remittance beyond this requires RBI approval.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Breakdown by Purpose */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h4 className="font-semibold mb-4">Remittance by Purpose</h4>
          {breakdownData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {breakdownData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs text-muted-foreground flex-1">{item.name}</span>
                    <span className="text-xs font-semibold">${(item.value / 1000).toFixed(0)}K</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No remittances yet this financial year</p>
            </div>
          )}
        </Card>

        <Card className="bg-sky-500/[0.05] border-sky-500/15">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">About LRS</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Reserve Bank of India regulation
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              The <span className="font-semibold text-foreground">Liberalized Remittance Scheme (LRS)</span> allows 
              resident individuals to remit up to <span className="font-semibold text-sky-400">USD 250,000</span> per 
              financial year for permitted current or capital account transactions.
            </p>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-foreground">Permitted purposes:</p>
              <ul className="text-xs space-y-1 pl-4">
                <li>· Private visits & business travel</li>
                <li>· Maintenance of close relatives abroad</li>
                <li>· Gift or donation</li>
                <li>· Purchase of immovable property</li>
                <li>· Investment in shares, debt instruments</li>
                <li>· Opening of foreign currency accounts</li>
              </ul>
            </div>

            <a 
              href="https://www.rbi.org.in/Scripts/FAQView.aspx?Id=129" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors mt-3"
            >
              <span>Learn more on RBI website</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}

function getColorForPurpose(purpose: string): string {
  const colors: Record<string, string> = {
    family_support: '#6C63FF',
    investment: '#00D68F',
    property_emi: '#EF4444',
    medical: '#FBB724',
    education: '#38BDF8',
    travel: '#A78BFA',
    savings: '#10B981',
    other: '#64748B',
  }
  return colors[purpose] || '#64748B'
}
