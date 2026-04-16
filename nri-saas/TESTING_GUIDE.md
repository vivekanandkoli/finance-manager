# 🧪 NRI SaaS Testing Guide

## 🎯 Current Status
- ✅ Authentication working (Magic link + Google OAuth)
- ✅ App running on http://localhost:3001
- ❌ Demo data showing (needs cleanup)
- ❌ PRO features locked (needs enable for testing)

---

## 🧹 Step 1: Remove Demo Data

The app currently shows hardcoded demo data. Here's how to clean it:

### Option A: Manual Cleanup (Recommended)

All demo data is in these files - we'll replace with empty states:

1. **Dashboard**: `app/(dashboard)/dashboard/page.tsx`
2. **Expenses**: `app/(dashboard)/expenses/page.tsx`
3. **Income**: `app/(dashboard)/income/page.tsx`
4. **Deposits**: `app/(dashboard)/deposits/page.tsx`
5. **Loans**: `app/(dashboard)/loans/page.tsx`
6. **Budgets**: `app/(dashboard)/budgets/page.tsx`
7. **Bills**: `app/(dashboard)/bills/page.tsx`
8. **Investments**: `app/(dashboard)/investments/page.tsx`

### Option B: Automated Script

```bash
# Run this from nri-saas directory
npm run clean-demo-data
```

---

## 🚀 Step 2: Enable PRO Features for Testing

### Method 1: Environment Variable (Quick)

Add to `.env.local`:

```env
# Testing - Enable all PRO features
NEXT_PUBLIC_TESTING_MODE=true
NEXT_PUBLIC_ENABLE_PRO_FEATURES=true
```

### Method 2: Database Flag

Update user subscription in Supabase:

```sql
-- In Supabase SQL Editor
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{subscription_tier}',
  '"pro"'
)
WHERE email = 'your-email@example.com';
```

### Method 3: Mock Subscription Hook

The app currently uses:
```typescript
const [currentTier] = useState<'free' | 'pro' | 'family'>('free')
```

We can change this to 'pro' temporarily.

---

## 🏦 Step 3: Test Bank Parser

### Supported Banks:
- HDFC
- SBI (State Bank of India)
- Standard Chartered (SCB)
- ICICI
- Axis Bank

### How to Use:

1. **Go to Expenses page** → Click "Import from Bank"
2. **Upload bank statement** (PDF/CSV/Excel format)
3. **Select bank** from dropdown
4. **Review transactions** before importing
5. **Confirm import**

### Test Files:

Use the sample bank statement in:
```
bank-statements/AcctSt_Apr26.pdf
```

Or create a test CSV with this format:

```csv
Date,Description,Debit,Credit,Balance
2026-04-01,SALARY CREDIT,,185000,450000
2026-04-05,RENT PAYMENT,35000,,415000
2026-04-10,AMAZON SHOPPING,2500,,412500
```

---

## 🎨 Step 4: Test All Features

### ✅ Free Features (Should work)
- [ ] Manual expense tracking
- [ ] Currency converter
- [ ] Basic analytics
- [ ] Goal tracking (2 goals max)
- [ ] 3 accounts

### ⭐ PRO Features (Enable first)
- [ ] AI Insights
- [ ] Unlimited accounts
- [ ] Bank statement parsing
- [ ] Remittance optimizer
- [ ] Tax dashboard (80C, 80D, DTAA)
- [ ] Rate alerts
- [ ] PDF export
- [ ] Email notifications

### 👨‍👩‍👧 Family Features
- [ ] Multi-user access
- [ ] Shared wealth view
- [ ] CA/accountant access

---

## 📊 Step 5: Test Workflows

### Workflow 1: Add Expense
1. Dashboard → Add Transaction
2. Fill: Amount, Category, Date, Currency
3. Save → Check dashboard updates

### Workflow 2: Create Budget
1. Budgets page → New Budget
2. Set: Category, Amount, Period
3. Track spending vs budget

### Workflow 3: Add Goal
1. Goals page → New Goal
2. Name, Target Amount, Date
3. Track progress

### Workflow 4: Import Bank Statement
1. Expenses → Import
2. Upload PDF/CSV
3. Map columns
4. Review & Import

### Workflow 5: Currency Conversion
1. Currency page
2. Enter amount in one currency
3. View real-time conversion
4. Track exchange rate history

### Workflow 6: Remittance Planning
1. Remittance page
2. View current rates
3. Set rate alerts
4. Track transfer history

### Workflow 7: Tax Dashboard
1. Tax page
2. View 80C deductions
3. Track DTAA benefits
4. Download tax reports

---

## 🐛 Common Issues

### Issue: Demo data still showing
**Fix**: Hard refresh (Cmd+Shift+R) or clear browser cache

### Issue: PRO features locked
**Fix**: Check environment variable or database subscription tier

### Issue: Bank parser not working
**Fix**: Ensure file format is correct (PDF/CSV/XLSX)

### Issue: Currency rates not loading
**Fix**: Check internet connection and exchange rate API

### Issue: Authentication loop
**Fix**: Clear cookies and re-login

---

## 🔧 Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Clean demo data
npm run clean-demo-data

# Reset database
npm run db:reset

# Seed sample data (for testing)
npm run db:seed
```

---

## 📱 Mobile Testing (iOS)

The app is also available as an iOS app. See:
- `IOS_SETUP_GUIDE.md` - Setup instructions
- `IOS_CHECKLIST.md` - Testing checklist

---

## ✅ Testing Checklist

### Authentication
- [ ] Magic link login works
- [ ] Google OAuth works
- [ ] Session persists on refresh
- [ ] Logout works

### Core Features
- [ ] Add/Edit/Delete expenses
- [ ] Add/Edit/Delete income
- [ ] Create budgets
- [ ] Set goals
- [ ] View analytics
- [ ] Currency conversion

### PRO Features
- [ ] AI insights generate
- [ ] Bank parsing works
- [ ] Rate alerts trigger
- [ ] Tax calculations correct
- [ ] PDF export downloads
- [ ] Email notifications send

### UI/UX
- [ ] Responsive on mobile
- [ ] Dark mode works
- [ ] Animations smooth
- [ ] Forms validate
- [ ] Error messages clear
- [ ] Loading states show

---

## 📞 Need Help?

Check these docs:
- `QUICK_START_GUIDE.md` - Getting started
- `IMPLEMENTATION_COMPLETE.md` - Technical details
- `TROUBLESHOOTING.md` - Common issues
- `README.md` - Project overview
