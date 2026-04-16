# 🚀 Test Quick Start Guide

## Installation

### 1. Install Dependencies

```bash
cd nri-saas
npm install
```

This will install all testing dependencies:
- `jest` - Testing framework
- `@testing-library/react` - React component testing
- `@testing-library/jest-dom` - DOM matchers
- `@testing-library/user-event` - User interaction simulation

## Running Tests

### Basic Commands

```bash
# Run all tests in watch mode (best for development)
npm test

# Run all tests once (CI mode)
npm run test:ci

# Run tests with coverage report
npm run test:coverage

# Debug tests
npm run test:debug
```

### Watch Mode Commands

When running `npm test`, Jest enters watch mode. Press:
- `a` - Run all tests
- `f` - Run only failed tests
- `p` - Filter by filename pattern
- `t` - Filter by test name pattern
- `q` - Quit watch mode
- `Enter` - Trigger test run

### Running Specific Tests

```bash
# Run specific test file
npm test format.test

# Run tests matching pattern
npm test bank

# Run tests in specific folder
npm test __tests__/utils

# Run single test suite
npm test -- --testNamePattern="Currency Formatting"
```

## Quick Test Examples

### ✅ All Tests Should Pass

```bash
npm test
```

**Expected Output:**
```
PASS  __tests__/utils/format.test.ts
PASS  __tests__/utils/validation.test.ts
PASS  __tests__/lib/bankParser.test.ts
PASS  __tests__/api/exchange-rates.test.ts
PASS  __tests__/components/BankImportDialog.test.tsx

Test Suites: 5 passed, 5 total
Tests:       120 passed, 120 total
Snapshots:   0 total
Time:        5.123 s
```

### 🎯 Viewing Coverage

```bash
npm run test:coverage
```

**Open coverage report:**
```bash
# macOS
open coverage/lcov-report/index.html

# Linux
xdg-open coverage/lcov-report/index.html

# Windows
start coverage/lcov-report/index.html
```

## Test Structure Overview

```
__tests__/
├── utils/                          # Utility functions
│   ├── format.test.ts              ✅ 60+ tests
│   └── validation.test.ts          ✅ 50+ tests
├── lib/                            # Business logic
│   └── bankParser.test.ts          ✅ 40+ tests
├── api/                            # API routes
│   └── exchange-rates.test.ts      ✅ 30+ tests
├── components/                     # React components
│   └── BankImportDialog.test.tsx   ✅ 25+ tests
└── helpers/                        # Test utilities
    └── test-utils.tsx              🛠️ Shared helpers
```

## What's Being Tested?

### ✅ Format Utils (60+ tests)
- Currency formatting (INR, USD, EUR)
- Number formatting with Indian locale
- Date formatting (relative, financial years)
- String utilities (truncate, slugify, initials)

### ✅ Validation (50+ tests)
- Email, phone, PAN, IFSC validation
- Amount, date, percentage validation
- Input sanitization
- File type validation

### ✅ Bank Parser (40+ tests)
- File type detection (PDF, CSV)
- Bank detection (10+ banks)
- Transaction extraction
- Smart categorization (15+ categories)
- Date normalization
- Summary calculations

### ✅ Exchange Rates API (30+ tests)
- Live rate fetching
- Fallback mechanisms (3 APIs)
- Database caching
- Batch operations
- Error handling
- Edge cases

### ✅ Bank Import UI (25+ tests)
- File upload workflow
- Password-protected PDFs
- Transaction review
- Category editing
- Import functionality
- Accessibility

## Common Test Patterns

### 1. Testing a Function

```typescript
import { formatCurrency } from '@/lib/utils/format'

it('should format INR currency', () => {
  expect(formatCurrency(1000, 'INR')).toContain('1,000')
})
```

### 2. Testing API Routes

```typescript
import { GET } from '@/app/api/exchange-rates/route'

it('should fetch exchange rates', async () => {
  const request = new NextRequest('http://localhost:3000/api/exchange-rates?from=USD&to=INR')
  const response = await GET(request)
  const data = await response.json()
  
  expect(data.rate).toBeDefined()
})
```

### 3. Testing Components

```typescript
import { render, screen } from '@testing-library/react'
import BankImportDialog from '@/components/expenses/BankImportDialog'

it('should render dialog', () => {
  render(<BankImportDialog open={true} onOpenChange={jest.fn()} />)
  expect(screen.getByText(/Import Bank Statement/i)).toBeInTheDocument()
})
```

## Troubleshooting

### ❌ Module Not Found Error

**Error:**
```
Cannot find module '@/lib/utils/format'
```

**Solution:**
Module aliases are configured in `jest.config.js`. Ensure it matches your `tsconfig.json`.

### ❌ Supabase Client Error

**Error:**
```
Supabase client is undefined
```

**Solution:**
Supabase is mocked in `jest.setup.js`. Use the mock or import from test helpers.

### ❌ Tests Timing Out

**Error:**
```
Timeout - Async callback was not invoked within the 5000 ms timeout
```

**Solution:**
Add timeout to async tests:
```typescript
it('should complete', async () => {
  // test code
}, 10000) // 10 second timeout
```

### ❌ React Hook Error

**Error:**
```
Rendered more hooks than during the previous render
```

**Solution:**
Use `customRender` from test-utils.tsx which includes QueryClientProvider.

## Best Practices

### ✅ DO

1. **Write descriptive test names**
   ```typescript
   it('should validate IFSC code with case insensitivity', () => {
     // test
   })
   ```

2. **Test behavior, not implementation**
   ```typescript
   // Good
   expect(result).toBe('Food & Dining')
   
   // Bad (testing internal method)
   expect(parser.categorize).toHaveBeenCalled()
   ```

3. **Use test helpers**
   ```typescript
   import { mockTransaction } from '@/__tests__/helpers/test-utils'
   const txn = mockTransaction({ amount: 5000 })
   ```

4. **Mock external dependencies**
   ```typescript
   jest.mock('@/lib/supabase/client')
   ```

### ❌ DON'T

1. **Don't test third-party libraries**
   ```typescript
   // Bad - testing React itself
   it('should call useState', () => { ... })
   ```

2. **Don't write flaky tests**
   ```typescript
   // Bad - timing dependent
   setTimeout(() => expect(...), 100)
   
   // Good - use waitFor
   await waitFor(() => expect(...))
   ```

3. **Don't duplicate test logic**
   ```typescript
   // Bad
   it('test 1', () => { /* setup */ ... })
   it('test 2', () => { /* same setup */ ... })
   
   // Good
   beforeEach(() => { /* shared setup */ })
   ```

## Next Steps

1. ✅ **Run all tests**: `npm test`
2. ✅ **Check coverage**: `npm run test:coverage`
3. ✅ **Fix any failures**: Review error messages
4. ✅ **Add new tests**: For new features
5. ✅ **Maintain coverage**: Keep above 60%

## CI/CD Integration

### GitHub Actions (Example)

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
```

## Resources

- 📖 [Full Testing Documentation](./TESTING_DOCUMENTATION.md)
- 🛠️ [Test Utilities](../__tests__/helpers/test-utils.tsx)
- 📝 [Jest Docs](https://jestjs.io/)
- 🧪 [Testing Library](https://testing-library.com/)

## Support

**Having issues?**
1. Check [TESTING_DOCUMENTATION.md](./TESTING_DOCUMENTATION.md)
2. Review test examples in `__tests__/`
3. Check Jest setup in `jest.setup.js`
4. Contact development team

---

**Happy Testing! 🎉**

Your comprehensive test suite is ready to catch bugs before they reach production!
