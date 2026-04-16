# 🚀 Test Commands Reference

Quick reference for all testing commands in NRI-SaaS.

---

## 📋 Basic Commands

### Run All Tests
```bash
npm test
# Runs Jest in watch mode (interactive)
# Press 'a' to run all tests
# Press 'q' to quit
```

### Run Tests Once (No Watch)
```bash
npx jest --no-watch
# Runs all tests once and exits
# Good for CI/CD
```

### Run Tests in CI Mode
```bash
npm run test:ci
# Runs tests with coverage
# No watch mode
# Optimized for CI/CD pipelines
```

---

## 🎯 Specific Test Files

### Format Utilities (✅ ALL PASSING)
```bash
npm test format
# or
npx jest __tests__/utils/format.test.ts --no-watch

# Expected: 61 tests passing
```

### Validation Utilities
```bash
npm test validation
# or
npx jest __tests__/utils/validation.test.ts --no-watch

# Expected: 50+ tests (minor fixes needed)
```

### Bank Parser
```bash
npm test bankParser
# or
npx jest __tests__/lib/bankParser.test.ts --no-watch

# Expected: 40+ tests (mock adjustments needed)
```

### Exchange Rates API
```bash
npm test exchange
# or
npx jest __tests__/api/exchange-rates.test.ts --no-watch

# Expected: 30+ tests (environment setup needed)
```

### Bank Import Component
```bash
npm test BankImport
# or
npx jest __tests__/components/BankImportDialog.test.tsx --no-watch

# Expected: 25+ tests (integration work needed)
```

---

## 📊 Coverage Commands

### Generate Coverage Report
```bash
npm run test:coverage
```

### View Coverage in Browser
```bash
# After running coverage
open coverage/lcov-report/index.html        # macOS
xdg-open coverage/lcov-report/index.html    # Linux
start coverage/lcov-report/index.html       # Windows
```

### Coverage for Specific File
```bash
npx jest __tests__/utils/format.test.ts --coverage --collectCoverageFrom="lib/utils/format.ts"
```

---

## 🔍 Filter Commands

### Filter by Test Name
```bash
npm test -- --testNamePattern="Currency"
# Runs only tests with "Currency" in the name
```

### Filter by File Pattern
```bash
npm test -- --testPathPattern="utils"
# Runs tests in files matching "utils"
```

### Run Only Changed Files
```bash
npm test -- --onlyChanged
# Runs tests related to changed files (requires git)
```

---

## 🐛 Debug Commands

### Debug Mode
```bash
npm run test:debug
# Opens Node debugger for tests
# Use in VS Code or Chrome DevTools
```

### Verbose Output
```bash
npm test -- --verbose
# Shows individual test results
```

### Show All Test Names
```bash
npm test -- --listTests
# Lists all test files
```

---

## ⚙️ Configuration Commands

### Update Snapshots
```bash
npm test -- --updateSnapshot
# Updates snapshot tests (if any)
```

### Clear Cache
```bash
npx jest --clearCache
# Clears Jest cache (fixes weird issues)
```

### Show Config
```bash
npx jest --showConfig
# Shows full Jest configuration
```

---

## 📈 Watch Mode Commands

When running `npm test`, use these keys:

```
a - Run all tests
f - Run only failed tests
p - Filter by filename pattern
t - Filter by test name pattern
q - Quit watch mode
Enter - Trigger test run
```

---

## 🎯 Quick Examples

### Run Format Tests and See Results
```bash
npx jest __tests__/utils/format.test.ts --no-watch --verbose
```

### Run All Utils Tests with Coverage
```bash
npx jest __tests__/utils --coverage
```

### Run Tests Matching "format"
```bash
npm test -- --testNamePattern="format"
```

### Run Tests in Specific Directory
```bash
npx jest __tests__/utils/
```

---

## 🚀 CI/CD Commands

### For GitHub Actions
```bash
npm ci                    # Install dependencies
npm run test:ci           # Run tests with coverage
```

### For GitLab CI
```bash
npm ci
npm run test:ci -- --reporters=default --reporters=jest-junit
```

### For CircleCI
```bash
npm ci
npm run test:ci -- --maxWorkers=2
```

---

## 🔧 Troubleshooting Commands

### If Tests Won't Run
```bash
# Clear cache
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### If Watch Mode Crashes (Too Many Files)
```bash
# Run without watch
npx jest --no-watch

# Or increase file limit (macOS)
ulimit -n 4096
```

### If Module Not Found
```bash
# Check Jest config
npx jest --showConfig | grep moduleNameMapper

# Verify aliases
cat jest.config.js | grep moduleNameMapper
```

---

## 📊 Useful Combinations

### Run Specific Test with Coverage and Verbose
```bash
npx jest __tests__/utils/format.test.ts --coverage --verbose --no-watch
```

### Run All Tests Silently (Just Pass/Fail)
```bash
npx jest --no-watch --silent
```

### Run Tests and Generate HTML Report
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

### Watch Only Failed Tests
```bash
# Run normally first
npm test

# Then in watch mode, press 'f'
```

---

## 🎨 Custom Scripts (Add to package.json)

```json
{
  "scripts": {
    "test": "jest --watch",
    "test:ci": "jest --ci --coverage",
    "test:coverage": "jest --coverage",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand",
    "test:utils": "jest __tests__/utils --watch",
    "test:lib": "jest __tests__/lib --watch",
    "test:api": "jest __tests__/api --watch",
    "test:components": "jest __tests__/components --watch",
    "test:all": "jest --no-watch --coverage",
    "test:changed": "jest --onlyChanged",
    "test:verbose": "jest --verbose",
    "test:clear": "jest --clearCache"
  }
}
```

**Usage**:
```bash
npm run test:utils        # Test only utils
npm run test:all          # All tests once with coverage
npm run test:changed      # Only changed tests
npm run test:verbose      # Detailed output
npm run test:clear        # Clear cache
```

---

## 🏁 Quick Start Workflow

### First Time
```bash
# 1. Install dependencies (if not done)
npm install

# 2. Run all tests to see status
npm test

# 3. Check format tests (all should pass)
npx jest __tests__/utils/format.test.ts --no-watch

# 4. Generate coverage
npm run test:coverage

# 5. Open coverage report
open coverage/lcov-report/index.html
```

### Daily Development
```bash
# Start watch mode
npm test

# Make changes
# Tests auto-run

# When done, run all once
npx jest --no-watch
```

### Before Commit
```bash
# Run all tests
npm run test:ci

# Check coverage
# Ensure no failures
```

---

## 💡 Pro Tips

### Run Tests in Background
```bash
npm test > test-output.log 2>&1 &
# Tests run in background, output to log
```

### Time Your Tests
```bash
time npm test -- --no-watch
# Shows how long tests take
```

### Find Slow Tests
```bash
npm test -- --verbose --no-watch | grep "ms)"
# Shows test execution times
```

### Test Specific Line
```bash
# Won't work directly, but you can:
# 1. Add .only to the test:
#    it.only('should test', () => { ... })
# 2. Run tests
# 3. Remove .only
```

---

## 🆘 Emergency Commands

### When Everything Breaks
```bash
# Nuclear option
rm -rf node_modules package-lock.json .next coverage
npm install
npx jest --clearCache
npm test
```

### When Tests Pass Locally but Fail in CI
```bash
# Run in CI mode locally
NODE_ENV=test npm run test:ci

# Check for environment differences
npx jest --showConfig
```

---

## 📖 More Information

- [TESTING_DOCUMENTATION.md](./TESTING_DOCUMENTATION.md) - Complete guide
- [TEST_QUICK_START.md](./TEST_QUICK_START.md) - Quick start
- [__tests__/README.md](./__tests__/README.md) - Test organization
- [Jest CLI Docs](https://jestjs.io/docs/cli) - Official docs

---

**Keep this file handy for quick reference! 📌**
