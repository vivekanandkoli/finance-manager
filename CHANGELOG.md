# 📝 Changelog

All notable changes to NRI Wallet will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Enhanced merchant recognition with logos
- Transaction tagging system (#vacation, #work, #business)
- Bulk categorization
- Rule-based automation
- In-app notification center
- Cash flow forecasting

---

## [1.2.0] - 2026-04-14

### 🧹 Project Organization
- **Cleaned up documentation** - Removed 15+ outdated/duplicate MD files
- **Organized project structure**:
  - Created `docs/` folder with proper structure
  - Moved guides to `docs/guides/`
  - Moved reports to `docs/reports/`
  - Created `scripts/` for Python utilities
  - Created `assets/` for images and resources
- **Created comprehensive documentation**:
  - New main `README.md` with complete feature list
  - Updated `nri-wallet/README.md` for developers
  - Added `docs/README.md` as documentation index
  - Added `docs/PROJECT_STRUCTURE.md` for project organization
- **Added `.gitignore`** - Proper git ignore rules

### 🐛 Bug Fixes
- **Fixed:** Stopword module import error (changed to named import)
- **Fixed:** Natural.js browser compatibility (replaced with browser-native implementation)
- **Fixed:** Auto-categorization service now fully functional

### ✨ Improvements
- **Enhanced auto-categorization service**:
  - Custom browser-compatible Naive Bayes classifier
  - Simple tokenizer for text processing
  - Levenshtein distance implementation
  - No external ML library dependencies
- **Better code organization** - Clear separation of concerns

---

## [1.1.0] - 2026-04-13

### ✨ Phase 1 Features Complete

#### 🎯 Core Features
- Multi-currency support (INR, USD, EUR, GBP, AED, SGD)
- Expense & income tracking
- Smart categorization
- Budget management
- Goal tracking

#### 📅 Bill Management (Week 2)
- Bill reminders with due dates
- Recurring transactions
- Auto-generation on due dates
- Subscription tracker
- Tab-based organization

#### 📊 Analytics
- Spending trends
- Category breakdowns
- Budget vs actual comparison
- Goal progress tracking
- Subscription cost analysis

#### 🎨 UI Improvements
- Modern card-based dashboard
- Beautiful gradient designs
- Responsive layout
- Dark mode support
- Status badges and indicators

#### 💾 Data Management
- CSV export/import
- JSON export/import
- Excel export (XLSX)
- Bulk operations
- Sample data generation

### 🔧 Technical Improvements
- IndexedDB with Dexie.js
- React 18 with hooks
- Vite for fast builds
- Tailwind CSS for styling
- Chart.js for visualizations

---

## [1.0.0] - 2026-04-12

### 🎉 Initial Release

#### Core Features
- Basic expense tracking
- Simple categorization
- Dashboard with widgets
- Add/edit/delete transactions
- Local storage with IndexedDB

#### Basic Features
- Category management
- Date filtering
- Search functionality
- Simple analytics

---

## Version History Summary

| Version | Date | Key Features |
|---------|------|--------------|
| 1.2.0 | 2026-04-14 | Project organization, bug fixes, documentation |
| 1.1.0 | 2026-04-13 | Phase 1 complete, bill reminders, advanced analytics |
| 1.0.0 | 2026-04-12 | Initial release with basic features |

---

## Categories

### Added ✨
New features and capabilities

### Changed 🔄
Changes in existing functionality

### Deprecated 🚫
Features that will be removed in upcoming releases

### Removed 🗑️
Features that have been removed

### Fixed 🐛
Bug fixes

### Security 🔒
Security-related changes

---

## Future Roadmap

See [COMPETITIVE_IMPROVEMENT_ROADMAP.md](docs/reports/COMPETITIVE_IMPROVEMENT_ROADMAP.md) for detailed roadmap.

### Phase 2 (Weeks 5-8) - Automation & Intelligence
- Enhanced smart categorization
- Merchant recognition
- Transaction tagging
- Notification system
- Predictive insights

### Phase 3 (Weeks 9-12) - Advanced Features
- Tax planning
- Retirement planning
- Insurance tracking
- Credit card management
- Enhanced reporting

### Phase 4+ (Future)
- Mobile apps (iOS/Android)
- Bank integration
- Shared budgets
- AI assistant
- Crypto tracking

---

## Contributing

Please update this changelog when making significant changes to the project.

### Changelog Guidelines

1. **Add entries to [Unreleased]** for upcoming features
2. **Use clear, descriptive language** for each change
3. **Group changes by category** (Added, Changed, Fixed, etc.)
4. **Create new version section** when releasing
5. **Include date** in YYYY-MM-DD format
6. **Reference issues/PRs** when applicable

---

**Last Updated:** 2026-04-14  
**Project:** NRI Wallet - Personal Finance Manager  
**Maintainer:** Development Team
