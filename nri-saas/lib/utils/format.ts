import { CURRENCIES, type Currency } from '@/types'

// ============================================================
// Currency Formatting
// ============================================================

export function formatCurrency(
  amount: number,
  currency: Currency = 'INR',
  options: { compact?: boolean; decimals?: number } = {}
): string {
  const { compact = false, decimals } = options
  const meta = CURRENCIES[currency]
  const symbol = meta?.symbol ?? currency

  if (compact && Math.abs(amount) >= 1_00_00_000) {
    return `${symbol}${(amount / 1_00_00_000).toFixed(2)}Cr`
  }
  if (compact && Math.abs(amount) >= 1_00_000) {
    return `${symbol}${(amount / 1_00_000).toFixed(2)}L`
  }
  if (compact && Math.abs(amount) >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(1)}K`
  }

  const formatted = new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals ?? (Math.abs(amount) >= 100 ? 0 : 2),
    maximumFractionDigits: decimals ?? (Math.abs(amount) >= 100 ? 0 : 2),
  }).format(amount)

  return formatted
}

export function formatCompact(amount: number, currency: Currency = 'INR'): string {
  return formatCurrency(amount, currency, { compact: true })
}

export function getCurrencySymbol(currency: Currency): string {
  return CURRENCIES[currency]?.symbol ?? currency
}

export function getCurrencyFlag(currency: Currency): string {
  return CURRENCIES[currency]?.flag ?? '🌍'
}

// ============================================================
// Number Formatting
// ============================================================

export function formatNumber(n: number, decimals = 2): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  }).format(n)
}

export function formatPct(n: number, decimals = 1): string {
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(decimals)}%`
}

export function formatRate(rate: number): string {
  return rate.toFixed(4)
}

// ============================================================
// Date Formatting
// ============================================================

export function formatDate(date: string | Date, style: 'short' | 'medium' | 'long' = 'medium'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'

  if (style === 'short') return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  if (style === 'long') return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export function getCurrentFinancialYear(): string {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-based
  const year = now.getFullYear()
  if (month >= 4) return `${year}-${String(year + 1).slice(2)}`
  return `${year - 1}-${String(year).slice(2)}`
}

export function getFinancialYears(count = 5): string[] {
  const years: string[] = []
  const now = new Date()
  const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
  for (let i = 0; i < count; i++) {
    const y = currentYear - i
    years.push(`${y}-${String(y + 1).slice(2)}`)
  }
  return years
}

// ============================================================
// Misc
// ============================================================

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function truncate(str: string, max = 30): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}
