-- ============================================================
-- NRI SAAS — Full Database Schema (All 4 Phases)
-- Run this in Supabase SQL editor after creating your project
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PHASE 1 — Core Tables
-- ============================================================

-- Profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  home_currency text default 'INR',      -- User's base reporting currency
  resident_country text default 'TH',    -- Where NRI currently lives
  home_country text default 'IN',        -- India
  financial_year_start text default '04', -- '04' = April (India FY), '01' = Jan
  tier text default 'free' check (tier in ('free', 'pro', 'family')),
  stripe_customer_id text,
  stripe_subscription_id text,
  onboarded boolean default false,
  notification_prefs jsonb default '{"email": true, "push": true, "rate_alerts": true}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ACCOUNTS (NRE/NRO/FCNR + regular)
-- ============================================================
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('bank', 'credit', 'wallet', 'cash', 'nre', 'nro', 'fcnr', 'investment')),
  subtype text,                          -- 'savings', 'current', 'fixed_deposit'
  currency text not null default 'INR',
  balance numeric(18, 4) default 0,
  bank_name text,
  account_number_masked text,            -- Last 4 digits only
  country text not null default 'IN',    -- Country where account is held
  color text default '#6C63FF',          -- UI color for this account
  is_active boolean default true,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.accounts enable row level security;
create policy "Users own accounts" on public.accounts for all using (auth.uid() = user_id);
create index on public.accounts(user_id, is_active);

-- ============================================================
-- EXPENSES
-- ============================================================
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete set null,
  amount numeric(18, 4) not null,
  currency text not null default 'INR',
  amount_inr numeric(18, 4),             -- INR equivalent at time of transaction
  exchange_rate numeric(12, 6),
  category text not null,
  subcategory text,
  description text not null,
  merchant text,
  date date not null,
  tags text[] default '{}',
  is_recurring boolean default false,
  recurring_id uuid,                     -- Links to recurring_transactions
  is_tax_deductible boolean default false,
  tax_section text,                      -- '80C', '80D', etc.
  country text default 'IN',
  created_at timestamptz default now()
);

alter table public.expenses enable row level security;
create policy "Users own expenses" on public.expenses for all using (auth.uid() = user_id);
create index on public.expenses(user_id, date desc);
create index on public.expenses(user_id, category);

-- ============================================================
-- INCOME
-- ============================================================
create table if not exists public.income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete set null,
  amount numeric(18, 4) not null,
  currency text not null default 'INR',
  amount_inr numeric(18, 4),
  exchange_rate numeric(12, 6),
  source text not null,                  -- 'salary', 'freelance', 'investment', 'rental'
  description text,
  date date not null,
  is_taxable boolean default true,
  country text default 'TH',            -- Country where income is earned
  created_at timestamptz default now()
);

alter table public.income enable row level security;
create policy "Users own income" on public.income for all using (auth.uid() = user_id);
create index on public.income(user_id, date desc);

-- ============================================================
-- INVESTMENTS (Mutual Funds, Stocks, ETFs, etc.)
-- ============================================================
create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete set null,
  name text not null,
  type text not null check (type in ('mutual_fund', 'stock', 'etf', 'ppf', 'nps', 'epf', 'fd', 'bonds', 'crypto', 'real_estate', 'gold', 'other')),
  symbol text,                           -- Stock/MF ticker
  units numeric(18, 6),
  purchase_price numeric(18, 4) not null,
  current_price numeric(18, 4),
  currency text not null default 'INR',
  purchase_date date not null,
  maturity_date date,                    -- For FD, PPF, etc.
  folio_number text,                     -- For mutual funds
  category text,                         -- 'equity', 'debt', 'hybrid', 'elss'
  is_elss boolean default false,         -- Tax-saving under 80C
  lock_in_years numeric(4, 1),
  country text default 'IN',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.investments enable row level security;
create policy "Users own investments" on public.investments for all using (auth.uid() = user_id);
create index on public.investments(user_id, type);

-- ============================================================
-- LOANS
-- ============================================================
create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('home', 'car', 'personal', 'education', 'business', 'gold', 'other')),
  lender text,
  principal numeric(18, 4) not null,
  outstanding_balance numeric(18, 4) not null,
  interest_rate numeric(6, 4) not null,  -- Annual %
  emi_amount numeric(18, 4),
  tenure_months integer,
  remaining_months integer,
  start_date date not null,
  end_date date,
  currency text not null default 'INR',
  is_nri_loan boolean default false,     -- Loan taken as NRI
  guarantor text,
  notes text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.loans enable row level security;
create policy "Users own loans" on public.loans for all using (auth.uid() = user_id);

-- ============================================================
-- GOALS
-- ============================================================
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null check (category in ('emergency', 'property', 'vehicle', 'travel', 'education', 'retirement', 'wedding', 'business', 'other')),
  target_amount numeric(18, 4) not null,
  current_amount numeric(18, 4) default 0,
  currency text not null default 'INR',
  target_date date,
  monthly_contribution numeric(18, 4),
  linked_account_id uuid references public.accounts(id),
  color text default '#6C63FF',
  icon text default '🎯',
  notes text,
  is_achieved boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.goals enable row level security;
create policy "Users own goals" on public.goals for all using (auth.uid() = user_id);

-- ============================================================
-- BUDGETS
-- ============================================================
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  amount numeric(18, 4) not null,
  currency text not null default 'INR',
  period text not null default 'monthly' check (period in ('weekly', 'monthly', 'quarterly', 'yearly')),
  start_date date not null,
  end_date date,
  is_active boolean default true,
  rollover boolean default false,
  notes text,
  created_at timestamptz default now()
);

alter table public.budgets enable row level security;
create policy "Users own budgets" on public.budgets for all using (auth.uid() = user_id);

-- ============================================================
-- BILL REMINDERS
-- ============================================================
create table if not exists public.bill_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  amount numeric(18, 4),
  currency text default 'INR',
  due_date date not null,
  frequency text not null default 'monthly' check (frequency in ('once', 'weekly', 'monthly', 'quarterly', 'yearly')),
  category text,
  auto_debit boolean default false,
  account_id uuid references public.accounts(id),
  is_paid boolean default false,
  paid_date date,
  remind_days_before integer default 3,
  country text default 'IN',
  notes text,
  created_at timestamptz default now()
);

alter table public.bill_reminders enable row level security;
create policy "Users own bills" on public.bill_reminders for all using (auth.uid() = user_id);

-- ============================================================
-- DEPOSITS (FD, PPF, NPS, EPF, NSC, etc.)
-- ============================================================
create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('fd', 'rd', 'ppf', 'nps', 'epf', 'nsc', 'scss', 'pomis', 'kvp', 'sukanya_samridhi', 'other')),
  bank_name text,
  account_number_masked text,
  principal numeric(18, 4) not null,
  interest_rate numeric(6, 4) not null,
  start_date date not null,
  maturity_date date,
  maturity_amount numeric(18, 4),
  currency text not null default 'INR',
  compounding text default 'quarterly' check (compounding in ('simple', 'monthly', 'quarterly', 'half_yearly', 'annually')),
  is_auto_renew boolean default false,
  is_80c_eligible boolean default false,
  nominee text,
  is_active boolean default true,
  notes text,
  created_at timestamptz default now()
);

alter table public.deposits enable row level security;
create policy "Users own deposits" on public.deposits for all using (auth.uid() = user_id);

-- ============================================================
-- PHASE 2 — NRI-SPECIFIC TABLES
-- ============================================================

-- REMITTANCES (Phase 2 — Core NRI feature)
create table if not exists public.remittances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  from_currency text not null,           -- e.g. 'THB', 'USD', 'AED'
  to_currency text not null default 'INR',
  from_amount numeric(18, 4) not null,
  to_amount numeric(18, 4) not null,
  exchange_rate numeric(12, 6) not null,
  fee numeric(10, 4) default 0,
  fee_currency text,
  effective_rate numeric(12, 6),         -- After fee: to_amount / from_amount
  method text not null check (method in ('wise', 'remitly', 'western_union', 'swift', 'bank_transfer', 'cash', 'crypto', 'other')),
  from_account_id uuid references public.accounts(id),
  to_account_id uuid references public.accounts(id),
  purpose text check (purpose in ('family_support', 'investment', 'property_emi', 'medical', 'education', 'travel', 'savings', 'other')),
  recipient_name text,
  recipient_account_masked text,
  reference_number text,
  status text default 'completed' check (status in ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  notes text,
  created_at timestamptz default now()
);

alter table public.remittances enable row level security;
create policy "Users own remittances" on public.remittances for all using (auth.uid() = user_id);
create index on public.remittances(user_id, date desc);
create index on public.remittances(user_id, from_currency, to_currency);

-- EXCHANGE RATE HISTORY (for remittance optimizer)
create table if not exists public.exchange_rate_history (
  id uuid primary key default gen_random_uuid(),
  from_currency text not null,
  to_currency text not null,
  rate numeric(14, 8) not null,
  source text,
  recorded_at timestamptz default now()
);

-- Shared across users (no RLS needed, read-only public)
create index on public.exchange_rate_history(from_currency, to_currency, recorded_at desc);

-- RATE ALERTS
create table if not exists public.rate_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  from_currency text not null,
  to_currency text not null,
  target_rate numeric(12, 6) not null,
  condition text not null check (condition in ('above', 'below')),
  is_active boolean default true,
  notification_sent boolean default false,
  triggered_at timestamptz,
  created_at timestamptz default now()
);

alter table public.rate_alerts enable row level security;
create policy "Users own rate alerts" on public.rate_alerts for all using (auth.uid() = user_id);

-- TAX ENTRIES (Phase 2 — 80C, 80D, DTAA, FEMA)
create table if not exists public.tax_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  financial_year text not null,          -- '2025-26'
  section text not null check (section in ('80C', '80CCC', '80CCD', '80D', '80E', '80G', '80TTA', 'DTAA', 'FEMA', 'other')),
  description text not null,
  amount numeric(18, 4) not null,
  currency text default 'INR',
  max_limit numeric(18, 4),              -- Section limit (e.g. 150000 for 80C)
  linked_investment_id uuid references public.investments(id),
  document_url text,                     -- Stored in Supabase Storage
  is_verified boolean default false,
  notes text,
  created_at timestamptz default now()
);

alter table public.tax_entries enable row level security;
create policy "Users own tax entries" on public.tax_entries for all using (auth.uid() = user_id);
create index on public.tax_entries(user_id, financial_year, section);

-- RECURRING TRANSACTIONS
create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('expense', 'income')),
  amount numeric(18, 4) not null,
  currency text not null default 'INR',
  category text,
  description text,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  start_date date not null,
  end_date date,
  next_date date,
  account_id uuid references public.accounts(id),
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.recurring_transactions enable row level security;
create policy "Users own recurring" on public.recurring_transactions for all using (auth.uid() = user_id);

-- ============================================================
-- PHASE 3 — AI INSIGHTS CACHE
-- ============================================================
create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  insight_type text not null,            -- 'spending', 'savings', 'remittance', 'tax'
  title text not null,
  message text not null,
  priority integer default 50,
  category text,
  action text,
  data jsonb,
  is_read boolean default false,
  generated_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '24 hours')
);

alter table public.ai_insights enable row level security;
create policy "Users own insights" on public.ai_insights for all using (auth.uid() = user_id);

-- ============================================================
-- PHASE 4 — SHARING & FAMILY
-- ============================================================
create table if not exists public.shared_access (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  shared_with_email text not null,
  shared_with_id uuid references auth.users(id) on delete cascade,
  access_level text not null check (access_level in ('read', 'write')),
  scope text[] default '{}',            -- Which sections are shared
  invite_token text unique,
  accepted_at timestamptz,
  expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.shared_access enable row level security;
create policy "Owners manage access" on public.shared_access for all using (auth.uid() = owner_id);

-- ============================================================
-- TRIGGERS — auto-update updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_accounts_updated_at before update on public.accounts for each row execute procedure public.set_updated_at();
create trigger set_investments_updated_at before update on public.investments for each row execute procedure public.set_updated_at();
create trigger set_loans_updated_at before update on public.loans for each row execute procedure public.set_updated_at();
create trigger set_goals_updated_at before update on public.goals for each row execute procedure public.set_updated_at();
create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();

-- ============================================================
-- VIEWS — Net Worth Calculation
-- ============================================================
create or replace view public.net_worth_summary as
select
  u.id as user_id,
  coalesce(sum(case when a.type in ('bank','nre','nro','fcnr','wallet','cash') then a.balance else 0 end), 0) as total_liquid,
  coalesce(sum(case when a.type = 'investment' then a.balance else 0 end), 0) as total_investment_accounts,
  coalesce((select sum(i.units * coalesce(i.current_price, i.purchase_price)) from public.investments i where i.user_id = u.id), 0) as total_investments,
  coalesce((select sum(d.principal) from public.deposits d where d.user_id = u.id and d.is_active = true), 0) as total_deposits,
  coalesce((select sum(l.outstanding_balance) from public.loans l where l.user_id = u.id and l.is_active = true), 0) as total_liabilities
from auth.users u
left join public.accounts a on a.user_id = u.id and a.is_active = true
group by u.id;
