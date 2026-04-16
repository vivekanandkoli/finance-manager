# 🚀 React Optimization Quick Reference

## When to Use Each Hook

### 1. **useMemo** - Cache Calculated Values
```javascript
const filteredData = useMemo(() => 
  data.filter(item => condition)
, [data, condition]);
```

**Use when:**
- ✅ Filtering large arrays
- ✅ Complex calculations (reduce, map, sort)
- ✅ Chart data preparation
- ✅ Derived state from props/state

**Don't use when:**
- ❌ Simple primitives (strings, numbers)
- ❌ Very fast operations
- ❌ Single-use values

---

### 2. **useCallback** - Cache Functions
```javascript
const handleClick = useCallback((id) => {
  doSomething(id);
}, [dependency]);
```

**Use when:**
- ✅ Passing callbacks to child components
- ✅ Functions in useEffect dependencies
- ✅ Event handlers in lists
- ✅ Form input handlers

**Don't use when:**
- ❌ Function isn't passed to children
- ❌ No performance issue observed
- ❌ Inside event handlers (already optimized)

---

### 3. **useDebounce** - Delay State Updates
```javascript
const debouncedSearchTerm = useDebounce(searchTerm, 300);
```

**Use when:**
- ✅ Search inputs (typing)
- ✅ Form inputs triggering calculations
- ✅ API calls based on user input
- ✅ Heavy computations triggered by user

**Typical delays:**
- 🔍 Search: 300ms
- ⌨️ Input validation: 500ms
- 🌐 API calls: 500-1000ms
- 📊 Heavy calculations: 300-500ms

---

## Real-World Examples from Our App

### ExpenseList Component ✅
```javascript
// Memoized filtered expenses
const filteredExpenses = useMemo(() => 
  expenses.filter(expense => {
    if (filter.currency !== 'ALL' && expense.currency !== filter.currency) 
      return false;
    if (filter.category !== 'ALL' && expense.category !== filter.category) 
      return false;
    return true;
  })
, [expenses, filter]);

// Memoized totals
const totals = useMemo(() => ({
  thb: filteredExpenses.filter(e => e.currency === 'THB')
    .reduce((sum, e) => sum + Number(e.amount || 0), 0),
  inr: filteredExpenses.filter(e => e.currency === 'INR')
    .reduce((sum, e) => sum + Number(e.amount || 0), 0)
}), [filteredExpenses]);

// Debounced search
const debouncedSearchTerm = useDebounce(filter.searchTerm, 300);
```

---

### Dashboard Component ✅
```javascript
// Memoize chart data
const categoryData = useMemo(() => 
  stats.categoryTotals ? 
    Object.entries(stats.categoryTotals).map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name] || '#95A5A6'
    })) : []
, [stats.categoryTotals, categoryColors]);

// Memoize tooltip component
const CustomTooltip = useCallback(({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p>{label}</p>
        {payload.map((entry, index) => (
          <p key={index}>{entry.name}: ₹{entry.value.toLocaleString()}</p>
        ))}
      </div>
    );
  }
  return null;
}, []);
```

---

### BudgetManager Component ✅
```javascript
// Debounce heavy calculations
const debouncedBudgets = useDebounce(budgets, 300);
const debouncedExpenses = useDebounce(expenses, 300);

useEffect(() => {
  if (debouncedBudgets.length > 0 && debouncedExpenses.length > 0) {
    calculateStats();
    calculateForecast();
  }
}, [debouncedBudgets, debouncedExpenses]);

// Memoize form handler
const handleChange = useCallback((e) => {
  const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  setFormData(prevData => ({
    ...prevData,
    [e.target.name]: value
  }));
}, []);
```

---

### BillReminders Component ✅
```javascript
// Debounced search
const debouncedSearchTerm = useDebounce(searchTerm, 300);

// Memoized filtered bills
const filteredBills = useMemo(() => {
  if (!debouncedSearchTerm) return bills;
  
  const search = debouncedSearchTerm.toLowerCase();
  return bills.filter(bill => 
    bill.billName?.toLowerCase().includes(search) ||
    bill.category?.toLowerCase().includes(search) ||
    bill.notes?.toLowerCase().includes(search)
  );
}, [bills, debouncedSearchTerm]);

// Chain memoizations for derived data
const sortedBills = useMemo(() => 
  [...filteredBills].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
, [filteredBills]);

const unpaidBills = useMemo(() => 
  sortedBills.filter(b => !b.isPaid)
, [sortedBills]);
```

---

### InvestmentPortfolio Component ✅
```javascript
// Memoize complex calculations
const portfolioStats = useMemo(() => {
  const totalInvested = investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalGains = totalCurrentValue - totalInvested;
  const returnsPercentage = totalInvested > 0 
    ? ((totalGains / totalInvested) * 100).toFixed(2) 
    : 0;

  return { totalInvested, totalCurrentValue, totalGains, returnsPercentage };
}, [investments]);

// Destructure memoized values
const { totalInvested, totalCurrentValue, totalGains, returnsPercentage } = portfolioStats;
```

---

## Common Patterns

### Pattern 1: Filter → Sort → Display
```javascript
// Step 1: Filter (memoized)
const filtered = useMemo(() => 
  items.filter(item => condition)
, [items, condition]);

// Step 2: Sort (memoized, depends on filtered)
const sorted = useMemo(() => 
  [...filtered].sort(compareFn)
, [filtered]);

// Step 3: Display (use sorted)
return sorted.map(item => <Item key={item.id} {...item} />);
```

---

### Pattern 2: Search with Debounce
```javascript
// State for immediate UI update
const [searchTerm, setSearchTerm] = useState('');

// Debounced value for expensive operations
const debouncedSearch = useDebounce(searchTerm, 300);

// Use debounced value in memoization
const filtered = useMemo(() => 
  items.filter(item => item.name.includes(debouncedSearch))
, [items, debouncedSearch]);
```

---

### Pattern 3: Form Handler Optimization
```javascript
// ❌ Bad: Creates new function on every render
const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

// ✅ Good: Memoized with functional update
const handleChange = useCallback((e) => {
  setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
}, []);
```

---

### Pattern 4: Chart Data Preparation
```javascript
// Memoize static configuration
const chartColors = useMemo(() => ({
  primary: '#667eea',
  success: '#52B788',
  warning: '#F7DC6F',
  danger: '#FF6B6B'
}), []);

// Memoize data transformation
const chartData = useMemo(() => 
  rawData.map(item => ({
    name: item.label,
    value: item.amount,
    color: chartColors[item.type]
  }))
, [rawData, chartColors]);
```

---

## Performance Checklist

### Before Optimizing:
- [ ] Profile with React DevTools
- [ ] Identify slow components
- [ ] Measure actual performance impact
- [ ] Check if optimization is needed

### During Optimization:
- [ ] Use appropriate hook (useMemo/useCallback/useDebounce)
- [ ] Add correct dependencies
- [ ] Test that functionality still works
- [ ] Verify performance improvement

### After Optimization:
- [ ] No unnecessary re-renders
- [ ] Smooth user interactions
- [ ] Fast initial load
- [ ] Good perceived performance

---

## Common Mistakes to Avoid

### 1. **Missing Dependencies**
```javascript
// ❌ Bad: Missing filter in dependencies
const filtered = useMemo(() => 
  items.filter(item => item.type === filter)
, [items]); // Missing 'filter'

// ✅ Good: All dependencies included
const filtered = useMemo(() => 
  items.filter(item => item.type === filter)
, [items, filter]);
```

---

### 2. **Overusing Memoization**
```javascript
// ❌ Bad: Unnecessary memoization
const name = useMemo(() => user.firstName + ' ' + user.lastName, [user]);

// ✅ Good: Simple calculation, no memoization needed
const name = user.firstName + ' ' + user.lastName;
```

---

### 3. **Wrong Hook Choice**
```javascript
// ❌ Bad: useMemo for functions
const handleClick = useMemo(() => (id) => deleteItem(id), [deleteItem]);

// ✅ Good: useCallback for functions
const handleClick = useCallback((id) => deleteItem(id), [deleteItem]);
```

---

### 4. **Not Using Functional Updates**
```javascript
// ❌ Bad: Dependency on current state
const increment = useCallback(() => {
  setCount(count + 1);
}, [count]); // Re-creates on every count change

// ✅ Good: Functional update
const increment = useCallback(() => {
  setCount(prev => prev + 1);
}, []); // Never re-creates
```

---

## Debugging Tips

### Check Re-renders:
```javascript
// Add to component
useEffect(() => {
  console.log('Component rendered');
});

// Check why component re-rendered
useEffect(() => {
  console.log('Props changed:', props);
}, [props]);
```

---

### Measure Performance:
```javascript
import { Profiler } from 'react';

<Profiler id="Dashboard" onRender={(id, phase, actualDuration) => {
  console.log(`${id} took ${actualDuration}ms to ${phase}`);
}}>
  <Dashboard />
</Profiler>
```

---

### Use React DevTools:
1. Install React DevTools extension
2. Open Components tab
3. Click "Highlight updates" button
4. Interact with app
5. See which components re-render

---

## Quick Decision Tree

**Q: Is it expensive to calculate?**
- Yes → useMemo
- No → No optimization needed

**Q: Is it a function passed to children?**
- Yes → useCallback
- No → Check if used in dependencies

**Q: Is it user input triggering calculations?**
- Yes → useDebounce
- No → Consider useMemo

**Q: Does it cause lag when typing?**
- Yes → useDebounce + useMemo
- No → Profile first before optimizing

---

## Summary

✅ **useMemo** - Cache values  
✅ **useCallback** - Cache functions  
✅ **useDebounce** - Delay updates  

**Remember:**
- Optimize when needed, not always
- Measure before and after
- Keep code readable
- Dependencies must be correct

**Our App Performance:**
- ✅ Dashboard: Memoized charts
- ✅ BudgetManager: Debounced inputs
- ✅ BillReminders: Search + memoization
- ✅ InvestmentPortfolio: Optimized calculations
- ✅ ExpenseList: Complete optimization

---

**Status: Production Ready! 🚀**
