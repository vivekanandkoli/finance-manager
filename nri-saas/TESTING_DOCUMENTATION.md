# NRI-SaaS Testing Documentation

## Overview

Comprehensive unit testing framework for the NRI-SaaS finance management application. This testing suite ensures reliability, catches bugs early, and maintains code quality across all critical features.

## 🎯 Testing Strategy

### Test Coverage Goals
- **Unit Tests**: 80%+ coverage for utilities and business logic
- **Integration Tests**: 70%+ coverage for API routes and services
- **Component Tests**: 60%+ coverage for UI components
- **E2E Tests**: Critical user flows (to be implemented)

### Testing Philosophy
1. **Test behavior, not implementation**
2. **Write tests before fixing bugs** (TDD where applicable)
3. **Keep tests simple and readable**
4. **Mock external dependencies**
5. **Test edge cases and error scenarios**

## 📁 Test Structure

```
nri-saas/
├── __tests__/
│   ├── utils/                  # Utility function tests
│   │   ├── format.test.ts      # Currency, date, number formatting
│   │   └── validation.test.ts  # Input validation and sanitization
│   ├── lib/                    # Library/service tests
│   │   └── bankParser.test.ts  # Bank statement parser
│   ├── api/                    # API route tests
│   │   └── exchange-rates.test.ts
│   └── components/             # React component tests
│       └── BankImportDialog.test.tsx
├── jest.config.js              # Jest configuration
└── jest.setup.js               # Test environment setup
```

## 🚀 Running Tests

### All Tests
```bash
npm test                 # Watch mode for development
npm run test:ci          # CI mode with coverage
npm run test:coverage    # Generate coverage report
npm run test:debug       # Debug mode
```

### Specific Test Files
```bash
npm test format          # Run format tests
npm test bankParser      # Run bank parser tests
npm test exchange-rates  # Run API tests
```

### Coverage Report
```bash
npm run test:coverage
# Open coverage/lcov-report/index.html in browser
```

## 📋 Test Suites

### 1. Format Utilities (`__tests__/utils/format.test.ts`)

**Purpose**: Test currency, number, date formatting functions

**Coverage**:
- ✅ Currency formatting (INR, USD, EUR, etc.)
- ✅ Compact notation (Cr, L, K)
- ✅ Currency symbols and flags
- ✅ Number formatting with Indian locale
- ✅ Percentage formatting
- ✅ Exchange rate formatting
- ✅ Date formatting (short, medium, long)
- ✅ Relative date formatting
- ✅ Financial year calculations
- ✅ String utilities (truncate, slugify, initials)

**Example Test**:
```typescript
it('should format compact for crores (INR)', () => {
  expect(formatCurrency(10000000, 'INR', { compact: true })).toBe('₹1.00Cr')
})
```

### 2. Bank Statement Parser (`__tests__/lib/bankParser.test.ts`)

**Purpose**: Test bank statement parsing, transaction extraction, and categorization

**Coverage**:
- ✅ File type detection (PDF, CSV, XLSX)
- ✅ Bank detection (HDFC, ICICI, SBI, etc.)
- ✅ Account number extraction
- ✅ Transaction extraction from different formats
- ✅ Smart categorization (Food, Transport, Income, etc.)
- ✅ Date normalization
- ✅ Summary calculation
- ✅ Amount parsing with various formats
- ✅ Error handling

**Critical Test Cases**:
```typescript
it('should categorize UPI payment as Shopping', () => {
  const category = smartCategorize('UPI-AMAZON PAY')
  expect(category).toBe('Shopping')
})

it('should extract Standard Chartered transactions', () => {
  const transactions = extractTransactions(text, 'Standard Chartered Bank')
  expect(transactions).toHaveLength(3)
  expect(transactions[0].type).toBe('debit')
})
```

### 3. Exchange Rates API (`__tests__/api/exchange-rates.test.ts`)

**Purpose**: Test live rate fetching, fallback mechanisms, and caching

**Coverage**:
- ✅ Primary API success
- ✅ Fallback to secondary APIs
- ✅ Database fallback when all APIs fail
- ✅ Batch rate fetching (POST)
- ✅ Error handling (503 errors)
- ✅ Timeout handling (5 seconds)
- ✅ Invalid rate format handling
- ✅ Missing currency handling
- ✅ Edge cases (same currency, very large/small rates)

**Critical Test Cases**:
```typescript
it('should fallback to second API when primary fails', async () => {
  mockFetch
    .mockRejectedValueOnce(new Error('Timeout'))
    .mockResolvedValueOnce({ rates: { INR: 83.5 } })
  
  const response = await GET(request)
  const data = await response.json()
  
  expect(data.api).toBe('open-er-api')
})
```

### 4. Validation Utilities (`__tests__/utils/validation.test.ts`)

**Purpose**: Test input validation and sanitization functions

**Coverage**:
- ✅ Email validation
- ✅ Phone number validation (Indian & International)
- ✅ Amount validation
- ✅ Date validation
- ✅ Account number validation
- ✅ IFSC code validation
- ✅ PAN card validation
- ✅ Currency code validation
- ✅ Percentage validation
- ✅ File type validation
- ✅ URL validation
- ✅ String sanitization

**Example Tests**:
```typescript
it('should validate Indian phone numbers', () => {
  expect(isValidPhone('9876543210')).toBe(true)
  expect(isValidPhone('+919876543210')).toBe(true)
})

it('should validate correct IFSC codes', () => {
  expect(isValidIFSC('HDFC0001234')).toBe(true)
  expect(isValidIFSC('hdfc0001234')).toBe(true) // case insensitive
})
```

### 5. BankImportDialog Component (`__tests__/components/BankImportDialog.test.tsx`)

**Purpose**: Test bank statement import UI workflow

**Coverage**:
- ✅ Dialog open/close
- ✅ File upload handling
- ✅ Password-protected PDF handling
- ✅ Parsing results display
- ✅ Transaction list rendering
- ✅ Category editing
- ✅ Summary statistics
- ✅ Import button functionality
- ✅ Error handling
- ✅ Loading states
- ✅ Accessibility (ARIA labels, keyboard navigation)

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)

Key settings:
- **Environment**: `jsdom` for React component testing
- **Transform**: Next.js transformer for proper module resolution
- **Module Aliases**: Matches tsconfig.json paths (@/components, @/lib, etc.)
- **Coverage Threshold**: 60% minimum for all metrics
- **Ignore Patterns**: .next/, node_modules/, coverage/

### Test Setup (`jest.setup.js`)

Mocked services:
- ✅ Next.js router (useRouter, useSearchParams, usePathname)
- ✅ Supabase client (createClient with full API surface)
- ✅ Supabase server (SSR client)
- ✅ Global fetch
- ✅ IntersectionObserver
- ✅ ResizeObserver
- ✅ window.matchMedia
- ✅ Environment variables

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module '@/...'"
**Solution**: Ensure module aliases in jest.config.js match tsconfig.json

### Issue: "TextEncoder is not defined"
**Solution**: Already handled in jest.setup.js with polyfills

### Issue: "Supabase client error in tests"
**Solution**: Use mocked Supabase client from jest.setup.js

### Issue: "Next.js navigation hooks error"
**Solution**: Use mocked navigation from jest.setup.js

### Issue: "PDF.js worker error"
**Solution**: Mock pdfjs-dist in test file

## 📊 Coverage Reports

### Current Coverage (Target)
| Category    | Statements | Branches | Functions | Lines |
|-------------|-----------|----------|-----------|-------|
| Utils       | 85%       | 80%      | 90%       | 85%   |
| Lib         | 75%       | 70%      | 75%       | 75%   |
| API Routes  | 80%       | 75%      | 80%       | 80%   |
| Components  | 65%       | 60%      | 65%       | 65%   |
| **Overall** | **70%**   | **65%**  | **70%**   | **70%** |

### Viewing Coverage
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## 🎯 Testing Best Practices

### 1. Arrange-Act-Assert Pattern
```typescript
it('should calculate net change correctly', () => {
  // Arrange
  const transactions = [...]
  
  // Act
  const summary = calculateSummary(transactions)
  
  // Assert
  expect(summary.netChange).toBe(45000)
})
```

### 2. Descriptive Test Names
❌ Bad: `it('test 1', ...)`
✅ Good: `it('should validate IFSC code with case insensitivity', ...)`

### 3. Test One Thing at a Time
❌ Bad: Testing multiple scenarios in one test
✅ Good: Separate test for each scenario

### 4. Use Data-Driven Tests
```typescript
describe.each([
  ['HDFC0001234', true],
  ['HDFC1001234', false],
  ['HDC0001234', false],
])('IFSC validation', (ifsc, expected) => {
  it(`should ${expected ? 'accept' : 'reject'} ${ifsc}`, () => {
    expect(isValidIFSC(ifsc)).toBe(expected)
  })
})
```

### 5. Mock External Dependencies
```typescript
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}))
```

## 📈 Continuous Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## 🔜 Future Enhancements

### Planned Test Additions
1. **E2E Tests** (Playwright/Cypress)
   - Complete user workflows
   - Multi-step transactions
   - Cross-browser testing

2. **Performance Tests**
   - Large dataset handling
   - Memory leak detection
   - Render performance

3. **Visual Regression Tests**
   - Component snapshot testing
   - UI consistency checks

4. **Load Tests**
   - API endpoint stress testing
   - Concurrent user simulation

5. **Security Tests**
   - Input sanitization
   - XSS prevention
   - SQL injection prevention

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🤝 Contributing

When adding new features:
1. ✅ Write tests first (TDD)
2. ✅ Ensure all tests pass
3. ✅ Maintain minimum coverage (60%)
4. ✅ Update this documentation
5. ✅ Add meaningful test descriptions

## 🆘 Getting Help

If tests are failing:
1. Check error messages carefully
2. Review mocks and setup
3. Verify module paths
4. Check for async/await issues
5. Consult this documentation

For persistent issues, contact the development team.

---

**Last Updated**: 2024-04-16
**Maintained by**: Development Team
**Version**: 1.0.0
