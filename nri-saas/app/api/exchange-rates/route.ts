import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PRIMARY_API    = 'https://api.exchangerate-api.com/v4/latest/'
const FALLBACK_API   = 'https://open.er-api.com/v6/latest/'
const FRANKFURT_API  = 'https://api.frankfurter.app/latest'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from') ?? 'THB'
  const to   = searchParams.get('to')   ?? 'INR'

  // 1. Try primary
  try {
    const res = await fetch(`${PRIMARY_API}${from}`, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 3600 }, // Cache 1hr in Next.js
    })
    const data = await res.json()
    if (data.rates?.[to]) {
      const rate = parseFloat(data.rates[to])
      await saveRateToSupabase(from, to, rate, 'exchangerate-api')
      return NextResponse.json({ rate, from, to, source: 'live', api: 'exchangerate-api' })
    }
  } catch {}

  // 2. Fallback
  try {
    const res = await fetch(`${FALLBACK_API}${from}`, { signal: AbortSignal.timeout(5000) })
    const data = await res.json()
    const rate = parseFloat(data.rates?.[to] ?? data.conversion_rates?.[to])
    if (!isNaN(rate)) {
      await saveRateToSupabase(from, to, rate, 'open-er-api')
      return NextResponse.json({ rate, from, to, source: 'live', api: 'open-er-api' })
    }
  } catch {}

  // 3. Frankfurter
  try {
    const res = await fetch(`${FRANKFURT_API}?from=${from}&to=${to}`, { signal: AbortSignal.timeout(5000) })
    const data = await res.json()
    const rate = parseFloat(data.rates?.[to])
    if (!isNaN(rate)) {
      return NextResponse.json({ rate, from, to, source: 'live', api: 'frankfurter' })
    }
  } catch {}

  // 4. Database fallback
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('exchange_rate_history')
      .select('rate, recorded_at')
      .eq('from_currency', from)
      .eq('to_currency', to)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single()

    if (data?.rate) {
      return NextResponse.json({
        rate: parseFloat(String(data.rate)),
        from, to,
        source: 'database',
        warning: 'Using last known rate from database',
        recorded_at: data.recorded_at,
      })
    }
  } catch {}

  return NextResponse.json({ error: 'All exchange rate sources failed' }, { status: 503 })
}

async function saveRateToSupabase(from: string, to: string, rate: number, source: string) {
  try {
    const supabase = await createClient()
    await supabase.from('exchange_rate_history').insert({ from_currency: from, to_currency: to, rate, source })
  } catch {}
}

// Batch rates for multiple currencies at once
export async function POST(request: NextRequest) {
  const { from, targets }: { from: string; targets: string[] } = await request.json()

  try {
    const res = await fetch(`${PRIMARY_API}${from}`, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 3600 },
    })
    const data = await res.json()

    const rates: Record<string, number> = {}
    targets.forEach(t => {
      if (data.rates?.[t]) rates[t] = parseFloat(data.rates[t])
    })

    return NextResponse.json({ from, rates, source: 'live' })
  } catch {
    return NextResponse.json({ error: 'Rate fetch failed' }, { status: 503 })
  }
}
