# 🏗️ Project Structure

Complete overview of the NRI Wallet project organization.

## 📁 Root Directory Structure

```
finance-manager/
├── nri-wallet/              # Main React application
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
├── assets/                  # Images, files, resources
├── .gitignore              # Git ignore rules
└── README.md               # Main project documentation
```

## 🎯 Directory Breakdown

### `/nri-wallet` - Main Application

The core React application built with Vite.

```
nri-wallet/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── services/           # Business logic
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── db.js               # IndexedDB setup
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
│
├── public/                 # Static assets
│   └── favicon.ico
│
├── issues/                 # Issue tracking (optional)
├── index.html              # HTML entry
├── vite.config.js          # Vite configuration
├── eslint.config.js        # ESLint configuration
├── tailwind.config.js      # Tailwind CSS config
├── postcss.config.js       # PostCSS config
├── package.json            # Dependencies
└── README.md               # App-specific docs
```

**Key Folders:**

- **`src/components/`** - Reusable UI components
  - `Dashboard.jsx` - Main dashboard
  - `ExpenseForm.jsx` - Add/edit expenses
  - `ExpenseList.jsx` - Transaction list
  - `Analytics.jsx` - Charts and graphs
  - `BudgetManager.jsx` - Budget management
  - `BillReminders.jsx` - Bills & subscriptions
  - `GoalTracker.jsx` - Financial goals
  - `LoanTracker.jsx` - Loan amortization
  - `InvestmentPortfolio.jsx` - Investments
  - `DataManager.jsx` - Import/export
  - `ui/` - Reusable UI components (modals, buttons, etc.)

- **`src/services/`** - Business logic & algorithms
  - `categorizationService.js` - ML-based auto-categorization
  - `currencyService.js` - Multi-currency handling
  - `insightsService.js` - Financial insights generation

- **`src/utils/`** - Helper functions
  - `exportUtils.js` - CSV/JSON/Excel export
  - `helpers.js` - Common utilities
  - `seedData.js` - Sample data generation

### `/docs` - Documentation

All project documentation organized by type.

```
docs/
├── guides/                 # User guides
│   ├── QUICK_START.md     # Getting started
│   └── TESTING_GUIDE.md   # Testing instructions
│
├── reports/               # Progress & planning
│   ├── COMPETITIVE_IMPROVEMENT_ROADMAP.md  # Feature roadmap
│   ├── WEEK2_COMPLETE.md                   # Completed features
│   └── OPTIMIZATION_QUICK_REFERENCE.md     # Performance tips
│
├── archived/              # Old documentation
│   └── (deprecated docs)
│
├── PROJECT_STRUCTURE.md   # This file
└── README.md              # Documentation index
```

### `/scripts` - Utility Scripts

Python scripts for data migration and utilities.

```
scripts/
├── import_to_db.py           # Import data to IndexedDB
├── parse_vivek_expenses.py   # Parse Excel expenses
├── read_excel.py              # Excel reader utility
└── import_loan_schedule.py   # Import loan schedules
```

### `/assets` - Resources

Images, Excel files, and other assets.

```
assets/
├── Screenshot 2026-04-13...png         # Screenshots
├── expense-tracking-management...png   # Reference images
├── Vivek financial planner v3.xlsx     # Source data
└── vivek_finance_app_guide.docx       # Original guide
```

## 🗂️ Source Code Organization

### Component Hierarchy

```
App.jsx
├── Dashboard.jsx           (Main dashboard with widgets)
├── ExpenseForm.jsx         (Add/edit expenses)
├── ExpenseList.jsx         (List all transactions)
├── Analytics.jsx           (Charts and insights)
├── BudgetManager.jsx       (Budget management)
├── BillReminders.jsx       (Bills & subscriptions)
├── GoalTracker.jsx         (Financial goals)
├── LoanTracker.jsx         (Loan amortization)
├── InvestmentPortfolio.jsx (Investment tracking)
└── DataManager.jsx         (Import/export data)
```

### Service Layer

```
services/
├── categorizationService.js
│   ├── SimpleBayesClassifier    (ML classifier)
│   ├── SimpleTokenizer          (Text tokenizer)
│   └── CategorizationService    (Main service)
│
├── currencyService.js
│   └── CurrencyService          (Currency conversion)
│
└── insightsService.js
    └── InsightsService          (Financial insights)
```

### Database Schema (IndexedDB)

```
db.js (Dexie.js)
├── expenses        (id, amount, description, category, date, currency, type)
├── budgets         (id, category, amount, period, rollover)
├── bills           (id, name, amount, dueDate, isPaid, recurring)
├── recurring       (id, name, amount, frequency, category, autoGenerate)
├── goals           (id, name, targetAmount, currentAmount, deadline)
├── loans           (id, name, principal, interestRate, tenure)
└── investments     (id, name, amount, type, returns, date)
```

## 📦 Key Dependencies

### Core
- `react` (18.x) - UI framework
- `react-dom` (18.x) - React DOM renderer
- `vite` (6.x) - Build tool

### UI & Styling
- `tailwindcss` (4.x) - CSS framework
- `lucide-react` - Icon library
- `chart.js` & `react-chartjs-2` - Charts

### Data & Utils
- `dexie` (4.x) - IndexedDB wrapper
- `date-fns` (4.x) - Date utilities
- `stopword` - Stopword removal

### Development
- `eslint` (9.x) - Linting
- `@vitejs/plugin-react` - Vite React plugin

## 🎨 Coding Conventions

### File Naming
- **Components:** PascalCase (e.g., `ExpenseForm.jsx`)
- **Services:** camelCase (e.g., `categorizationService.js`)
- **Utilities:** camelCase (e.g., `exportUtils.js`)
- **Docs:** UPPER_SNAKE_CASE (e.g., `QUICK_START.md`)

### Component Structure
```jsx
// Imports
import React, { useState, useEffect } from 'react';
import { ComponentName } from './components';

// Component
export default function MyComponent({ prop1, prop2 }) {
  // State
  const [state, setState] = useState(null);
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // Handlers
  const handleAction = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Service Structure
```javascript
// Service class
class MyService {
  constructor() {
    // Initialization
  }
  
  async methodName() {
    // Async logic
  }
}

// Export singleton
export const myService = new MyService();
```

## 📊 Build & Deployment

### Development
```bash
cd nri-wallet
npm install
npm run dev         # Runs on localhost:5173
```

### Production
```bash
npm run build       # Creates dist/ folder
npm run preview     # Preview production build
```

### Build Output
```
nri-wallet/dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
└── favicon.ico
```

## 🔍 Finding Things

### "Where is...?"

| Looking for | Location |
|------------|----------|
| Main entry point | `nri-wallet/src/main.jsx` |
| Dashboard | `nri-wallet/src/components/Dashboard.jsx` |
| Database setup | `nri-wallet/src/db.js` |
| Auto-categorization | `nri-wallet/src/services/categorizationService.js` |
| Export functionality | `nri-wallet/src/utils/exportUtils.js` |
| Styling config | `nri-wallet/tailwind.config.js` |
| Build config | `nri-wallet/vite.config.js` |
| Documentation | `docs/` |
| Getting started | `docs/guides/QUICK_START.md` |
| Roadmap | `docs/reports/COMPETITIVE_IMPROVEMENT_ROADMAP.md` |

## 🚀 Quick Commands

```bash
# Development
cd nri-wallet && npm run dev

# Build
cd nri-wallet && npm run build

# Lint
cd nri-wallet && npm run lint

# Clean install
cd nri-wallet && rm -rf node_modules package-lock.json && npm install
```

## 📝 Adding New Features

1. **Create component** in `nri-wallet/src/components/`
2. **Add business logic** in `nri-wallet/src/services/` if needed
3. **Update database** in `nri-wallet/src/db.js` if storing data
4. **Add to navigation** in `nri-wallet/src/App.jsx`
5. **Document** in `docs/reports/`
6. **Update README** with new feature

## 🧹 Maintenance

### Regular Cleanup
```bash
# Remove unused dependencies
npm prune

# Update dependencies
npm update

# Check for security issues
npm audit
```

### Documentation Updates
- Keep `README.md` updated with new features
- Archive old documentation in `docs/archived/`
- Update `COMPETITIVE_IMPROVEMENT_ROADMAP.md` when completing phases

## 📞 Support

For questions about project structure:
1. Check this document
2. See [main README](../README.md)
3. Check component-specific comments
4. Open an issue on GitHub

---

**Last Updated:** 2026-04-13  
**Maintained by:** Development Team
