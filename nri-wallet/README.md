# 💰 NRI Wallet - Personal Finance Manager

A modern, feature-rich personal finance management application with smart categorization, multi-currency support, and beautiful analytics.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Lightning-fast build tool
- **Dexie.js** - IndexedDB wrapper for local database
- **Chart.js** - Beautiful charts and graphs
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Icons** - Beautiful icon library
- **date-fns** - Modern date utility library

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── Dashboard.jsx    # Main dashboard
│   ├── ExpenseForm.jsx  # Add/edit expenses
│   ├── ExpenseList.jsx  # Expense listing
│   ├── Analytics.jsx    # Charts & analytics
│   ├── BudgetManager.jsx
│   ├── BillReminders.jsx
│   ├── GoalTracker.jsx
│   ├── LoanTracker.jsx
│   ├── InvestmentPortfolio.jsx
│   ├── DataManager.jsx
│   └── ui/              # Reusable UI components
│
├── services/            # Business logic
│   ├── categorizationService.js  # Auto-categorization ML
│   ├── currencyService.js        # Currency conversion
│   └── insightsService.js        # Financial insights
│
├── hooks/               # Custom React hooks
│   ├── useDebounce.js
│   ├── useLocalStorage.js
│   └── useKeyPress.js
│
├── utils/               # Utility functions
│   ├── exportUtils.js   # Data export (CSV, JSON, Excel)
│   ├── helpers.js       # Common helpers
│   └── seedData.js      # Sample data generation
│
├── db.js                # IndexedDB setup with Dexie
├── App.jsx              # Main app component
└── main.jsx             # Entry point
```

## 🎨 Key Features

### 1. Smart Expense Tracking
- Add/edit/delete transactions
- Multi-currency support
- Auto-categorization with ML
- Bulk operations
- Search and filter

### 2. Budget Management
- Category-wise budgets
- Rollover support (YNAB-style)
- Overspending alerts
- Budget vs actual comparison

### 3. Bill & Subscription Management
- Bill reminders with due dates
- Recurring transactions
- Auto-generation on due dates
- Subscription tracking

### 4. Analytics & Insights
- Spending trends
- Category breakdowns
- Monthly comparisons
- Smart financial insights

### 5. Goals & Investments
- Financial goal tracking
- Loan amortization
- Investment portfolio
- Net worth calculation

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

See [Testing Guide](../docs/guides/TESTING_GUIDE.md) for details.

## 🗄️ Database Schema

The app uses IndexedDB with Dexie.js:

```javascript
{
  expenses: {
    id, amount, description, category, 
    date, currency, type, tags
  },
  budgets: {
    id, category, amount, period, rollover
  },
  bills: {
    id, name, amount, dueDate, isPaid, 
    recurring, category
  },
  goals: {
    id, name, targetAmount, currentAmount,
    deadline, category
  },
  loans: {
    id, name, principal, interestRate,
    tenure, startDate
  },
  investments: {
    id, name, amount, type, returns
  }
}
```

## 🎯 ML Categorization

The app includes a custom Naive Bayes classifier for transaction categorization:

- **Pattern Matching** - Recognizes common merchants
- **Keyword Analysis** - Matches transaction descriptions
- **Learning System** - Improves with corrections
- **Browser-Native** - No external ML libraries

## 🌍 Multi-Currency Support

Supported currencies:
- INR (Indian Rupee)
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- AED (UAE Dirham)
- SGD (Singapore Dollar)

## 🎨 Customization

### Adding New Categories

Edit `src/services/categorizationService.js`:

```javascript
this.categoryKeywords = {
  'Your Category': ['keyword1', 'keyword2'],
  // ...
}
```

### Adding New Currencies

Edit `src/services/currencyService.js`:

```javascript
this.rates = {
  'CUR': 1.0, // Add your currency
  // ...
}
```

## 📊 Performance

- **Initial Load**: ~500ms
- **IndexedDB Query**: <50ms
- **Chart Rendering**: <100ms
- **Auto-categorization**: <10ms

## 🔧 Configuration

### Vite Config
See `vite.config.js` for build configuration.

### ESLint
See `eslint.config.js` for linting rules.

## 📝 Scripts Breakdown

- `npm run dev` - Start Vite dev server (port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🐛 Troubleshooting

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
```bash
# Use different port
npm run dev -- --port 3000
```

### Database Issues
```bash
# Clear IndexedDB in browser DevTools
# Application > Storage > IndexedDB > Delete
```

## 📚 Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Dexie.js Documentation](https://dexie.org)
- [Chart.js Documentation](https://www.chartjs.org)

## 🤝 Contributing

See parent [README.md](../README.md) for contribution guidelines.

---

For more information, see the [main documentation](../docs/).
