import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const LRS_LIMIT_USD = 250000 // RBI's Liberalized Remittance Scheme limit

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const financialYear = searchParams.get('fy') || getCurrentFinancialYear()

  try {
    const supabase = await createClient()
    
    // Get all remittances for the financial year
    const { data: remittances, error } = await supabase
      .from('remittances')
      .select('from_amount, from_currency, to_amount, date, purpose, method')
      .gte('date', getFinancialYearStart(financialYear))
      .lte('date', getFinancialYearEnd(financialYear))
      .order('date', { ascending: false })

    if (error) throw error

    // Calculate USD equivalent using rough conversion rates
    const conversionRates: Record<string, number> = {
      'USD': 1,
      'EUR': 1.08,
      'GBP': 1.27,
      'AED': 0.27,
      'SGD': 0.74,
      'THB': 0.028,
      'INR': 0.012,
    }

    let totalUSD = 0
    const breakdown: Record<string, number> = {}

    remittances?.forEach((r) => {
      const rate = conversionRates[r.from_currency] || 0.01
      const usdAmount = r.from_amount * rate
      totalUSD += usdAmount

      // Group by purpose
      if (!breakdown[r.purpose]) breakdown[r.purpose] = 0
      breakdown[r.purpose] += usdAmount
    })

    const remaining = LRS_LIMIT_USD - totalUSD
    const percentUsed = (totalUSD / LRS_LIMIT_USD) * 100

    return NextResponse.json({
      financialYear,
      limit: LRS_LIMIT_USD,
      used: Math.round(totalUSD),
      remaining: Math.round(remaining),
      percentUsed: Math.round(percentUsed * 100) / 100,
      breakdown,
      remittances: remittances?.length || 0,
      alert: percentUsed >= 80 ? 'warning' : percentUsed >= 95 ? 'critical' : 'ok',
    })
  } catch (error) {
    console.error('FEMA API error:', error)
    return NextResponse.json({ error: 'Failed to fetch FEMA data' }, { status: 500 })
  }
}

function getCurrentFinancialYear(): string {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  if (month >= 4) return `${year}-${String(year + 1).slice(2)}`
  return `${year - 1}-${String(year).slice(2)}`
}

function getFinancialYearStart(fy: string): string {
  const year = parseInt(fy.split('-')[0])
  return `${year}-04-01`
}

function getFinancialYearEnd(fy: string): string {
  const year = parseInt(fy.split('-')[0]) + 1
  return `${year}-03-31`
}
