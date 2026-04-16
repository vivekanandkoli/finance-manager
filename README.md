# 💰 NRI Wallet - Personal Finance Manager

A comprehensive personal finance management application built for NRIs (Non-Resident Indians) and anyone managing multi-currency finances.

## 🚀 Features

### 💼 Account & Income Management (NEW! ✨)
- **Accounts Manager** - Track bank accounts, credit cards, cash, and digital wallets
- **Income Tracking** - Comprehensive income tracking with 10+ categories
- **Credit Card Management** - Monitor credit utilization with visual indicators
- **Multi-Currency Accounts** - Manage accounts in INR, USD, EUR, GBP
- **Balance Tracking** - Real-time balance updates across all accounts

### 🏦 Deposits & Savings (NEW! ✨)
- **Fixed Deposits (FD)** - Track bank FDs with maturity alerts
- **PPF Tracking** - Public Provident Fund with 15-year timeline
- **EPF Management** - Employee Provident Fund contributions
- **NPS Tracking** - National Pension System monitoring
- **Other Schemes** - NSC, KVP, SCSS, Recurring Deposits support
- **Maturity Alerts** - Get notified 30 days before deposit maturity
- **Returns Calculator** - Automatic gains and percentage calculation

### ✅ Core Features (Phase 1 Complete)
- **Multi-Currency Support** - Track expenses in INR, USD, EUR, GBP, AED, SGD
- **Expense & Income Tracking** - Add, edit, and categorize transactions
- **Smart Auto-Categorization** - AI-powered categorization using ML
- **Budget Management** - Set budgets by category with overspending alerts
- **Goal Tracking** - Create and monitor financial goals
- **Bill Reminders** - Never miss a payment with smart reminders
- **Recurring Transactions** - Auto-generate monthly bills and subscriptions
- **Subscription Tracker** - Monitor all your subscriptions in one place
- **Beautiful Dashboard** - Real-time analytics and insights
- **Data Export/Import** - CSV, JSON, and Excel support
- **Dark Mode** - Eye-friendly dark theme

### 🎯 Smart Features
- **Auto-Categorization** - ML-based transaction categorization
- **Merchant Recognition** - Identifies common merchants automatically
- **Keyword Matching** - Intelligent pattern recognition
- **Learning System** - Improves with your corrections

### 📊 Analytics & Reports
- Spending trends by category
- Monthly expense comparison
- Budget vs actual spending
- Category-wise breakdowns
- Goal progress tracking
- Subscription cost analysis

## 🛠️ Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Database:** IndexedDB (Dexie.js)
- **Charts:** Chart.js + React-Chartjs-2
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **State Management:** React Context + Hooks
- **ML:** Custom Naive Bayes Classifier (browser-native)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd finance-manager

# Navigate to the app directory
cd nri-wallet

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 📖 Documentation

### Getting Started
- **[Quick Start Guide](docs/guides/QUICK_START.md)** - Get started quickly
- **[Testing Guide](docs/guides/TESTING_GUIDE.md)** - How to test the application

### Backend & Mobile Integration 🆕 (Ready!)
- **[Integration Roadmap](docs/INTEGRATION_ROADMAP.md)** - 🗺️ Visual guide & 4-phase timeline
- **[Integration Guide](docs/INTEGRATION_GUIDE.md)** - 📖 Complete setup instructions (~1000 lines)
- **[Integration Checklist](docs/INTEGRATION_CHECKLIST.md)** - ✅ Task-by-task tracker
- **[Troubleshooting Guide](docs/TROUBLESHOOTING.md)** - 🔧 Fix common issues
- **[Status Overview](INTEGRATION_STATUS.md)** - 📊 Current progress & next steps
- **Quick Setup:** `./scripts/setup-integration.sh` - 🚀 Automated setup script

**What's Ready:**
- ✅ Supabase backend setup guide (complete step-by-step)
- ✅ Real-time currency API (multi-source fallback already working!)
- ✅ iOS native app build instructions (Xcode + Capacitor)
- ✅ PWA setup guide (Progressive Web App with offline mode)
- ✅ Deployment checklist (Vercel, Netlify, TestFlight)
- ✅ Complete troubleshooting (Supabase, APIs, iOS, PWA issues)

**Time Estimate:** 8-12 hours for full backend + mobile setup

### iOS App Conversion
- **[iOS Setup Guide](IOS_SETUP_GUIDE.md)** - 📱 Convert to iOS app
- **[iOS Quick Start](nri-wallet/QUICK_START_iOS.md)** - 🚀 Get iOS app running in 5 minutes

### Bank Statement Parser 🆕 (Phase 1 Complete!)
- **[Bank Parser Overview](docs/BANK_PARSER_README.md)** - 🏦 Auto-import bank statements
- **[Quick Summary](docs/BANK_PARSER_QUICK_SUMMARY.md)** - What it does & how it works
- **[Phase 1 Setup](nri-wallet/BANK_PARSER_SETUP.md)** - Installation & testing guide
- **[Phase 1 Complete](PHASE1_COMPLETE.md)** - ✅ What's working now

### Reports & Planning
- **[Roadmap](docs/reports/COMPETITIVE_IMPROVEMENT_ROADMAP.md)** - Future features and improvements
- **[Week 2 Report](docs/reports/WEEK2_COMPLETE.md)** - Latest completed features
- **[Performance Guide](docs/reports/OPTIMIZATION_QUICK_REFERENCE.md)** - Optimization tips

## 🎨 Project Structure

```
finance-manager/
├── nri-wallet/              # Main React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # Business logic & ML services
│   │   ├── db.js            # IndexedDB setup
│   │   └── App.jsx          # Main app component
│   ├── public/              # Static assets
│   └── package.json
├── docs/                    # Documentation
│   ├── guides/              # User guides
│   └── reports/             # Progress reports
└── README.md                # This file
```

## 🚀 Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## 🎯 Key Features Breakdown

### 1. Multi-Currency Management
- Support for 6+ major currencies
- Real-time currency conversion
- Currency-specific formatting
- Base currency selection

### 2. Smart Categorization
- Pattern-based merchant recognition
- Keyword matching algorithm
- ML-based classification
- Manual correction learning

### 3. Bill & Subscription Management
- Bill due date tracking
- Overdue alerts
- Recurring bill automation
- Subscription cost analysis
- Payment history

### 4. Budget & Goals
- Category-wise budgets
- Rollover budgets (YNAB-style)
- Progress tracking
- Overspending alerts
- Goal milestones

## 🔒 Privacy & Security

- **100% Offline** - All data stored locally in browser
- **No Server** - No data sent to external servers
- **No Tracking** - Zero analytics or tracking
- **Your Data** - Full control over your financial data

## 🐛 Known Issues & Fixes

- ✅ Fixed: Stopword module import error
- ✅ Fixed: Natural.js browser compatibility
- ✅ Fixed: Auto-categorization service

## 🗺️ Roadmap

### Phase 2 (Next) - Automation & Intelligence
- [ ] Enhanced merchant recognition with logos
- [ ] Transaction tagging system
- [ ] Bulk categorization
- [ ] Rule-based automation
- [ ] In-app notification center
- [ ] Cash flow forecasting

### Phase 3 (Future)
- [ ] Tax planning & reports
- [ ] Investment tracking
- [ ] Net worth tracking
- [ ] Receipt scanning
- [ ] Mobile apps (iOS/Android)
- [ ] Bank integration

See [full roadmap](docs/reports/COMPETITIVE_IMPROVEMENT_ROADMAP.md) for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 💡 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Built with ❤️ for financial freedom**
