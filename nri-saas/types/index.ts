// ============================================================
// NRI SAAS — Core TypeScript Types
// ============================================================

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'THB' | 'AED' | 'SGD' | 'AUD' | 'CAD' | 'JPY' | 'CHF' | 'HKD' | 'MYR' | 'NZD' | 'SEK' | 'NOK' | 'DKK' | 'QAR' | 'SAR' | 'KWD' | 'BHD' | 'OMR' | string

export type AccountType = 'bank' | 'credit' | 'wallet' | 'cash' | 'nre' | 'nro' | 'fcnr' | 'investment'
export type InvestmentType = 'mutual_fund' | 'stock' | 'etf' | 'ppf' | 'nps' | 'epf' | 'fd' | 'bonds' | 'crypto' | 'real_estate' | 'gold' | 'other'
export type LoanType = 'home' | 'car' | 'personal' | 'education' | 'business' | 'gold' | 'other'
export type DepositType = 'fd' | 'rd' | 'ppf' | 'nps' | 'epf' | 'nsc' | 'scss' | 'pomis' | 'kvp' | 'sukanya_samridhi' | 'other'
export type RemittanceMethod = 'wise' | 'remitly' | 'western_union' | 'swift' | 'bank_transfer' | 'cash' | 'crypto' | 'other'
export type TaxSection = '80C' | '80CCC' | '80CCD' | '80D' | '80E' | '80G' | '80TTA' | 'DTAA' | 'FEMA' | 'other'
export type UserTier = 'free' | 'pro' | 'family'

// ============================================================
// PROFILE
// ============================================================
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  home_currency: Currency
  resident_country: string
  home_country: string
  financial_year_start: string
  tier: UserTier
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  onboarded: boolean
  notification_prefs: {
    email: boolean
    push: boolean
    rate_alerts: boolean
  }
  created_at: string
  updated_at: string
}

// ============================================================
// ACCOUNTS
// ============================================================
export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  subtype: string | null
  currency: Currency
  balance: number
  bank_name: string | null
  account_number_masked: string | null
  country: string
  color: string
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AccountWithConversion extends Account {
  balance_inr?: number
  exchange_rate?: number
}

// ============================================================
// EXPENSES
// ============================================================
export interface Expense {
  id: string
  user_id: string
  account_id: string | null
  amount: number
  currency: Currency
  amount_inr: number | null
  exchange_rate: number | null
  category: string
  subcategory: string | null
  description: string
  merchant: string | null
  date: string
  tags: string[]
  is_recurring: boolean
  recurring_id: string | null
  is_tax_deductible: boolean
  tax_section: TaxSection | null
  country: string
  created_at: string
}

// ============================================================
// INCOME
// ============================================================
export interface Income {
  id: string
  user_id: string
  account_id: string | null
  amount: number
  currency: Currency
  amount_inr: number | null
  exchange_rate: number | null
  source: string
  description: string | null
  date: string
  is_taxable: boolean
  country: string
  created_at: string
}

// ============================================================
// INVESTMENTS
// ============================================================
export interface Investment {
  id: string
  user_id: string
  account_id: string | null
  name: string
  type: InvestmentType
  symbol: string | null
  units: number | null
  purchase_price: number
  current_price: number | null
  currency: Currency
  purchase_date: string
  maturity_date: string | null
  folio_number: string | null
  category: string | null
  is_elss: boolean
  lock_in_years: number | null
  country: string
  notes: string | null
  created_at: string
  updated_at: string
  // computed
  current_value?: number
  gain_loss?: number
  gain_loss_pct?: number
}

// ============================================================
// LOANS
// ============================================================
export interface Loan {
  id: string
  user_id: string
  name: string
  type: LoanType
  lender: string | null
  principal: number
  outstanding_balance: number
  interest_rate: number
  emi_amount: number | null
  tenure_months: number | null
  remaining_months: number | null
  start_date: string
  end_date: string | null
  currency: Currency
  is_nri_loan: boolean
  guarantor: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============================================================
// GOALS
// ============================================================
export interface Goal {
  id: string
  user_id: string
  name: string
  category: string
  target_amount: number
  current_amount: number
  currency: Currency
  target_date: string | null
  monthly_contribution: number | null
  linked_account_id: string | null
  color: string
  icon: string
  notes: string | null
  is_achieved: boolean
  created_at: string
  updated_at: string
  // computed
  progress_pct?: number
  months_remaining?: number
  required_monthly?: number
}

// ============================================================
// BUDGETS
// ============================================================
export interface Budget {
  id: string
  user_id: string
  category: string
  amount: number
  currency: Currency
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date: string | null
  is_active: boolean
  rollover: boolean
  notes: string | null
  created_at: string
  // computed
  spent?: number
  remaining?: number
  pct_used?: number
}

// ============================================================
// DEPOSITS
// ============================================================
export interface Deposit {
  id: string
  user_id: string
  name: string
  type: DepositType
  bank_name: string | null
  account_number_masked: string | null
  principal: number
  interest_rate: number
  start_date: string
  maturity_date: string | null
  maturity_amount: number | null
  currency: Currency
  compounding: string
  is_auto_renew: boolean
  is_80c_eligible: boolean
  nominee: string | null
  is_active: boolean
  notes: string | null
  created_at: string
  // computed
  current_value?: number
  days_to_maturity?: number
}

// ============================================================
// PHASE 2 — REMITTANCE
// ============================================================
export interface Remittance {
  id: string
  user_id: string
  date: string
  from_currency: Currency
  to_currency: Currency
  from_amount: number
  to_amount: number
  exchange_rate: number
  fee: number
  fee_currency: string | null
  effective_rate: number | null
  method: RemittanceMethod
  from_account_id: string | null
  to_account_id: string | null
  purpose: string | null
  recipient_name: string | null
  recipient_account_masked: string | null
  reference_number: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  notes: string | null
  created_at: string
}

export interface ExchangeRateHistory {
  id: string
  from_currency: Currency
  to_currency: Currency
  rate: number
  source: string | null
  recorded_at: string
}

export interface RateAlert {
  id: string
  user_id: string
  from_currency: Currency
  to_currency: Currency
  target_rate: number
  condition: 'above' | 'below'
  is_active: boolean
  notification_sent: boolean
  triggered_at: string | null
  created_at: string
}

// ============================================================
// TAX
// ============================================================
export interface TaxEntry {
  id: string
  user_id: string
  financial_year: string
  section: TaxSection
  description: string
  amount: number
  currency: Currency
  max_limit: number | null
  linked_investment_id: string | null
  document_url: string | null
  is_verified: boolean
  notes: string | null
  created_at: string
}

// ============================================================
// AI INSIGHTS
// ============================================================
export interface AIInsight {
  id: string
  user_id: string
  insight_type: string
  title: string
  message: string
  priority: number
  category: string | null
  action: string | null
  data: Record<string, unknown> | null
  is_read: boolean
  generated_at: string
  expires_at: string
}

// ============================================================
// CURRENCY SERVICE
// ============================================================
export interface ExchangeRateResult {
  rate: number
  source: 'live' | 'cache' | 'database' | 'fallback'
  api?: string
  timestamp: number
  warning?: string
}

export interface RemittanceRecommendation {
  recommendation: 'GREAT' | 'GOOD' | 'AVERAGE' | 'WAIT'
  currentRate: number
  avgRate90d: number
  maxRate90d: number
  minRate90d: number
  percentile: number
  potentialSavings: number
  message: string
  trend: 'up' | 'down' | 'flat'
}

// ============================================================
// DASHBOARD
// ============================================================
export interface NetWorthData {
  total_liquid: number
  total_investment_accounts: number
  total_investments: number
  total_deposits: number
  total_liabilities: number
  net_worth: number
  currency: Currency
}

export interface DashboardStats {
  net_worth: number
  total_assets: number
  total_liabilities: number
  monthly_income: number
  monthly_expenses: number
  monthly_savings: number
  savings_rate: number
  total_remitted_ytd: number
  currency: Currency
}

// ============================================================
// CURRENCY META
// ============================================================
export interface CurrencyMeta {
  code: Currency
  name: string
  symbol: string
  flag: string
  country: string
}

export const CURRENCIES: Record<string, CurrencyMeta> = {
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', country: 'India' },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', country: 'United States' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', country: 'European Union' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', country: 'United Kingdom' },
  THB: { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭', country: 'Thailand' },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', country: 'UAE' },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', country: 'Singapore' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', country: 'Australia' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', country: 'Canada' },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', country: 'Japan' },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', country: 'Switzerland' },
  HKD: { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰', country: 'Hong Kong' },
  MYR: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', country: 'Malaysia' },
  QAR: { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR', flag: '🇶🇦', country: 'Qatar' },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR', flag: '🇸🇦', country: 'Saudi Arabia' },
  KWD: { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', flag: '🇰🇼', country: 'Kuwait' },
  BHD: { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', flag: '🇧🇭', country: 'Bahrain' },
  NZD: { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿', country: 'New Zealand' },
}

export const TAX_SECTIONS: Record<TaxSection, { label: string; limit: number; description: string }> = {
  '80C':   { label: 'Section 80C',   limit: 150000, description: 'ELSS, PPF, LIC, ELSS, Home Loan Principal' },
  '80CCC': { label: 'Section 80CCC', limit: 150000, description: 'Pension Fund Premium' },
  '80CCD': { label: 'Section 80CCD', limit: 200000, description: 'NPS Contribution (incl. 50k extra)' },
  '80D':   { label: 'Section 80D',   limit: 50000,  description: 'Health Insurance Premium' },
  '80E':   { label: 'Section 80E',   limit: 0,      description: 'Education Loan Interest (no limit)' },
  '80G':   { label: 'Section 80G',   limit: 0,      description: 'Donations to Charities' },
  '80TTA': { label: 'Section 80TTA', limit: 10000,  description: 'Savings Account Interest' },
  'DTAA':  { label: 'DTAA Relief',   limit: 0,      description: 'Double Tax Avoidance Agreement' },
  'FEMA':  { label: 'FEMA',          limit: 0,      description: 'Foreign Exchange Management' },
  'other': { label: 'Other',         limit: 0,      description: 'Other deductions' },
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Transport', 'Shopping', 'Entertainment', 'Healthcare',
  'Education', 'Housing & Rent', 'Utilities', 'Travel', 'Clothing',
  'Personal Care', 'Insurance', 'Subscriptions', 'Family Support',
  'Gifts', 'Investments', 'EMI / Loan', 'Taxes', 'Miscellaneous',
]

export const INCOME_SOURCES = [
  'Salary', 'Freelance', 'Business', 'Investment Returns', 'Rental Income',
  'Dividends', 'Interest', 'Bonus', 'Commission', 'Pension', 'Other',
]
