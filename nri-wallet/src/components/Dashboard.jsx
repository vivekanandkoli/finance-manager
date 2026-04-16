import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, 
  Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart
} from 'recharts';
import { getAllRecords } from '../db';
import { currencyService } from '../services/currencyService';
import './Dashboard.css';

// Account Card Component with Live Currency Conversion
function AccountCard({ account }) {
  const [convertedBalance, setConvertedBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const convertBalance = async () => {
      if (account.currency !== 'INR') {
        setLoading(true);
        try {
          const result = await currencyService.getExchangeRate(account.currency, 'INR');
          const converted = currencyService.convert(account.balance, result.rate);
          setConvertedBalance({
            amount: converted,
            rate: result.rate,
            source: result.source
          });
        } catch (error) {
          console.error('Conversion error:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    convertBalance();
  }, [account]);

  const getCurrencySymbol = (currency) => {
    const symbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'THB': '฿',
      'AED': 'د.إ',
      'SGD': 'S$',
      'AUD': 'A$',
      'CAD': 'C$',
      'JPY': '¥'
    };
    return symbols[currency] || currency;
  };

  const getAccountIcon = (type) => {
    const icons = {
      'bank': '🏦',
      'credit': '💳',
      'wallet': '👛',
      'cash': '💵'
    };
    return icons[type] || '🏦';
  };

  return (
    <div className="account-card-dashboard">
      <div className="account-header-dash">
        <span className="account-icon-dash">{getAccountIcon(account.type)}</span>
        <div className="account-info-dash">
          <h4>{account.name}</h4>
          <p className="account-type-dash">{account.type}</p>
        </div>
      </div>
      <div className="account-balance-dash">
        <div className="balance-row">
          <span className="balance-label">Balance:</span>
          <span className="balance-amount-original">
            {getCurrencySymbol(account.currency)} {account.balance.toLocaleString(undefined, {maximumFractionDigits: 2})}
          </span>
        </div>
        {convertedBalance && (
          <div className="balance-row converted">
            <span className="balance-label">In INR:</span>
            <span className="balance-amount-converted">
              ₹ {convertedBalance.amount.toLocaleString(undefined, {maximumFractionDigits: 2})}
            </span>
            <span className={`live-indicator ${convertedBalance.source === 'live' ? 'live' : 'cached'}`}>
              {convertedBalance.source === 'live' ? '🟢' : '🟡'}
            </span>
          </div>
        )}
        {loading && (
          <div className="conversion-loading">Converting...</div>
        )}
      </div>
      {convertedBalance && (
        <div className="exchange-rate-info">
          1 {account.currency} = ₹{convertedBalance.rate.toFixed(4)}
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loans, setLoans] = useState([]);
  const [income, setIncome] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [stats, setStats] = useState({
    totalExpensesTHB: 0,
    totalExpensesINR: 0,
    totalExpensesTHBThisMonth: 0,
    totalExpensesINRThisMonth: 0,
    totalExpensesINREquivalent: 0,
    totalExpensesThisMonthINREquivalent: 0,
    expenseCount: 0,
    topCategory: 'N/A',
    totalInvestments: 0,
    totalLoans: 0,
    netWorth: 0,
    totalIncome: 0,
    monthlyCashFlow: 0,
    savingsRate: 0,
    totalAccountBalanceINR: 0,
    accountsCount: 0
  });

  const [netWorthHistory, setNetWorthHistory] = useState([]);
  const [cashFlowData, setCashFlowData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const expensesFromDB = await getAllRecords('expenses');
        const investmentsFromDB = await getAllRecords('investments');
        const loansFromDB = await getAllRecords('loans');
        const incomeFromDB = await getAllRecords('income');
        const accountsFromDB = await getAllRecords('accounts');
        
        setExpenses(expensesFromDB);
        setInvestments(investmentsFromDB);
        setLoans(loansFromDB);
        setIncome(incomeFromDB);
        setAccounts(accountsFromDB);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Memoized stats calculation
  useEffect(() => {
    if (expenses.length > 0 || investments.length > 0 || loans.length > 0 || income.length > 0 || accounts.length > 0) {
      calculateStats(expenses, investments, loans, income, accounts);
      calculateNetWorthHistory(investments, loans);
      calculateCashFlow(income, expenses);
      calculateMonthlyTrends(expenses, income);
    }
  }, [expenses, investments, loans, income, accounts]);

  const calculateStats = async (expenseList, investmentList, loanList, incomeList, accountsList) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    console.log('📊 Dashboard Stats Calculation:');
    console.log(`Current Month: ${currentMonth} (${now.toLocaleString('default', { month: 'long' })})`);
    console.log(`Current Year: ${currentYear}`);
    console.log(`Total Expenses in DB: ${expenseList.length}`);

    const totalExpensesTHB = expenseList
      .filter(e => e.currency === 'THB')
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const totalExpensesINR = expenseList
      .filter(e => (e.currency || 'INR') === 'INR')
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const totalExpensesTHBThisMonth = expenseList
      .filter(e => {
        const expenseDate = new Date(e.date || e.timestamp);
        const isThisMonth = expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear;
        if (e.currency === 'THB') {
          console.log(`THB Expense: ${e.description} - Date: ${e.date || e.timestamp} - Parsed: ${expenseDate} - This Month: ${isThisMonth}`);
        }
        return e.currency === 'THB' && isThisMonth;
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const totalExpensesINRThisMonth = expenseList
      .filter(e => {
        const expenseDate = new Date(e.date || e.timestamp);
        const isThisMonth = expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear;
        if ((e.currency || 'INR') === 'INR') {
          console.log(`INR Expense: ${e.description} - Date: ${e.date || e.timestamp} - Parsed: ${expenseDate} - This Month: ${isThisMonth}`);
        }
        return (e.currency || 'INR') === 'INR' && isThisMonth;
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    console.log(`✅ THB This Month: ฿${totalExpensesTHBThisMonth.toFixed(2)}`);
    console.log(`✅ INR This Month: ₹${totalExpensesINRThisMonth.toFixed(2)}`);

    const categoryTotals = {};
    expenseList.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + (e.amount || 0);
    });
    
    const topCategory = Object.keys(categoryTotals).length > 0
      ? Object.keys(categoryTotals).reduce((a, b) => 
          categoryTotals[a] > categoryTotals[b] ? a : b
        )
      : 'N/A';

    const totalInvestments = investmentList.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalLoans = loanList.reduce((sum, loan) => sum + loan.currentOutstanding, 0);
    const netWorth = totalInvestments - totalLoans;

    // Calculate income
    const totalIncome = incomeList.reduce((sum, inc) => sum + (inc.amount || 0), 0);
    const monthlyIncome = incomeList
      .filter(inc => {
        const incomeDate = new Date(inc.date || inc.timestamp);
        return incomeDate.getMonth() === currentMonth && 
               incomeDate.getFullYear() === currentYear;
      })
      .reduce((sum, inc) => sum + (inc.amount || 0), 0);

    // Calculate total account balance in INR with live conversion
    let totalAccountBalanceINR = 0;
    for (const account of accountsList) {
      if (account.currency === 'INR') {
        totalAccountBalanceINR += account.balance;
      } else {
        try {
          const rateResult = await currencyService.getExchangeRate(account.currency, 'INR');
          const convertedBalance = currencyService.convert(account.balance, rateResult.rate);
          totalAccountBalanceINR += convertedBalance;
        } catch (error) {
          console.error(`Failed to convert ${account.currency} to INR:`, error);
          // Fallback to approximate rate
          totalAccountBalanceINR += account.balance * 2.5; // Approximate fallback
        }
      }
    }

    // Convert all expenses to INR for unified totals
    let totalExpensesINREquivalent = totalExpensesINR;
    let totalExpensesThisMonthINREquivalent = totalExpensesINRThisMonth;
    
    // Convert THB to INR
    if (totalExpensesTHB > 0 || totalExpensesTHBThisMonth > 0) {
      try {
        const thbToInrRate = await currencyService.getExchangeRate('THB', 'INR');
        totalExpensesINREquivalent += totalExpensesTHB * thbToInrRate.rate;
        totalExpensesThisMonthINREquivalent += totalExpensesTHBThisMonth * thbToInrRate.rate;
      } catch (error) {
        console.error('Failed to get THB to INR rate:', error);
        // Fallback rate
        totalExpensesINREquivalent += totalExpensesTHB * 2.5;
        totalExpensesThisMonthINREquivalent += totalExpensesTHBThisMonth * 2.5;
      }
    }

    // Cash flow and savings rate (now using INR equivalent)
    const monthlyCashFlow = monthlyIncome - totalExpensesThisMonthINREquivalent;
    const savingsRate = monthlyIncome > 0 ? ((monthlyCashFlow / monthlyIncome) * 100).toFixed(1) : 0;

    setStats({
      totalExpensesTHB,
      totalExpensesINR,
      totalExpensesTHBThisMonth,
      totalExpensesINRThisMonth,
      totalExpensesINREquivalent,
      totalExpensesThisMonthINREquivalent,
      expenseCount: expenseList.length,
      topCategory,
      totalInvestments,
      totalLoans,
      netWorth,
      categoryTotals,
      totalIncome,
      monthlyIncome,
      monthlyCashFlow,
      savingsRate,
      totalAccountBalanceINR,
      accountsCount: accountsList.length
    });
  };

  // Calculate Net Worth History (Last 6 months)
  const calculateNetWorthHistory = (investmentList, loanList) => {
    const history = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      // Simulate historical data (in production, you'd track this over time)
      const assets = investmentList.reduce((sum, inv) => sum + inv.currentValue, 0);
      const liabilities = loanList.reduce((sum, loan) => sum + loan.currentOutstanding, 0);
      const netWorth = assets - liabilities;
      
      // Add some variation for historical months (simplified)
      const variation = (5 - i) * 0.02; // 2% growth per month
      const historicalAssets = assets * (1 - variation);
      const historicalLiabilities = liabilities * (1 + variation * 0.5);
      
      history.push({
        month: monthName,
        assets: i === 0 ? assets : Math.round(historicalAssets),
        liabilities: i === 0 ? liabilities : Math.round(historicalLiabilities),
        netWorth: i === 0 ? netWorth : Math.round(historicalAssets - historicalLiabilities)
      });
    }
    
    setNetWorthHistory(history);
  };

  // Calculate Cash Flow (Income vs Expenses)
  const calculateCashFlow = (incomeList, expenseList) => {
    const now = new Date();
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      const monthlyIncome = incomeList
        .filter(inc => {
          const incDate = new Date(inc.date);
          return incDate.getMonth() === month && incDate.getFullYear() === year;
        })
        .reduce((sum, inc) => sum + inc.amount, 0);
      
      const monthlyExpenses = expenseList
        .filter(exp => {
          const expDate = new Date(exp.date);
          return expDate.getMonth() === month && expDate.getFullYear() === year;
        })
        .reduce((sum, exp) => sum + (exp.currency === 'INR' ? exp.amount : exp.amount / 2.5), 0);
      
      const savings = monthlyIncome - monthlyExpenses;
      
      data.push({
        month: monthName,
        income: Math.round(monthlyIncome),
        expenses: Math.round(monthlyExpenses),
        savings: Math.round(savings)
      });
    }
    
    setCashFlowData(data);
  };

  // Calculate Monthly Spending Trends by Category
  const calculateMonthlyTrends = (expenseList, incomeList) => {
    const now = new Date();
    const trends = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      const monthExpenses = expenseList.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === month && expDate.getFullYear() === year;
      });
      
      const categoryTotals = {};
      monthExpenses.forEach(exp => {
        const amount = exp.currency === 'INR' ? exp.amount : exp.amount / 2.5;
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + amount;
      });
      
      const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
      
      trends.push({
        month: monthName,
        total: Math.round(total),
        'Food & Dining': Math.round(categoryTotals['Food & Dining'] || 0),
        'Transportation': Math.round(categoryTotals['Transportation'] || 0),
        'Shopping': Math.round(categoryTotals['Shopping'] || 0),
        'Entertainment': Math.round(categoryTotals['Entertainment'] || 0),
        'Other': Math.round(categoryTotals['Other'] || 0)
      });
    }
    
    setMonthlyTrends(trends);
  };

  // Memoized category colors (static) - includes grouped categories
  const categoryColors = useMemo(() => ({
    'Food & Dining': '#FF6B6B',
    'Transportation': '#4ECDC4',
    'Utilities': '#45B7D1',
    'Bills & Utilities': '#45B7D1',
    'Rent': '#FFA07A',
    'Shopping': '#98D8C8',
    'Entertainment': '#F7DC6F',
    'Healthcare': '#BB8FCE',
    'Insurance': '#85C1E2',
    'EMI/Loan': '#F8B739',
    'EMI & Loans': '#F8B739',
    'Investment': '#52B788',
    'Investments & SIP': '#52B788',
    'Salary & Transfers': '#667eea',
    'Support & Expenses': '#9D84B7',
    'Other': '#95A5A6',
    'Others': '#95A5A6'
  }), []);

  // Smart category grouping function
  const groupCategories = useCallback((categoryTotals) => {
    if (!categoryTotals || Object.keys(categoryTotals).length === 0) return [];

    // Define category groups for smart consolidation
    const categoryGroups = {
      'Bills & Utilities': [
        'Electricity Bill', 'Light Bill', 'Light Bill / Gas / Utilities', 
        'Water Bill', 'Gas Bill', 'Internet Bill', 'Cable TV',
        'Maintenance (Society)', 'Maintenance', 'Utilities'
      ],
      'Insurance': [
        'Parents\' Health Insurance', 'Health Insurance', 'Term Insurance',
        'Term Insurance – Wife (ICICI)', 'Life Insurance', 'Car Insurance',
        'Insurance'
      ],
      'Investments & SIP': [
        'PP Liquid SIP', 'PP Flexi Cap SIP', 'HDFC Mid Cap SIP',
        'Mutual Fund SIP', 'SIP', 'Investment', '₹ (auto-calc)'
      ],
      'EMI & Loans': [
        'Home Loan EMI', 'Car Loan EMI', 'Personal Loan EMI',
        'iPhone EMI', 'EMI/Loan', 'Credit Card Bill (India)',
        'Credit Card Bill'
      ],
      'Salary & Transfers': [
        'Bangkok Salary (in-hand)', 'Salary', 'Bangkok → India Transfer (THB)',
        'Transfer (THB)', 'Transfer', 'Exchange Rate (1 THB = ? INR)',
        'Transfer Value in ₹ (auto-calc)', '₹ (auto-calc)'
      ],
      'Support & Expenses': [
        'Tatya (Grandpa Support)', 'Maid', 'Rental Income',
        'iCloud Subscription', 'WiFi', 'Gym', 'Mobile Recharge'
      ],
      'Food & Dining': ['Food & Dining', 'Grocery', 'Restaurant'],
      'Shopping': ['Shopping', 'Online Shopping', 'Clothing'],
      'Transportation': ['Transportation', 'Fuel', 'Cab', 'Public Transport'],
      'Entertainment': ['Entertainment', 'Movies', 'Streaming'],
      'Healthcare': ['Healthcare', 'Medical', 'Pharmacy'],
      'Other': ['Other', 'Miscellaneous', 'Additional']
    };

    // Create a reverse mapping for quick lookup
    const categoryToGroup = {};
    Object.entries(categoryGroups).forEach(([groupName, categories]) => {
      categories.forEach(cat => {
        categoryToGroup[cat] = groupName;
      });
    });

    // Group categories
    const grouped = {};
    Object.entries(categoryTotals).forEach(([category, value]) => {
      const groupName = categoryToGroup[category] || category;
      grouped[groupName] = (grouped[groupName] || 0) + value;
    });

    // Sort by value descending
    const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);

    // Show top 7 categories + Others
    const topCount = 7;
    if (sorted.length <= topCount) {
      return sorted.map(([name, value]) => ({
        name,
        value,
        color: categoryColors[name] || '#95A5A6'
      }));
    }

    const topCategories = sorted.slice(0, topCount);
    const othersTotal = sorted.slice(topCount).reduce((sum, [, value]) => sum + value, 0);

    const result = topCategories.map(([name, value]) => ({
      name,
      value,
      color: categoryColors[name] || '#95A5A6'
    }));

    if (othersTotal > 0) {
      result.push({
        name: 'Others',
        value: othersTotal,
        color: '#95A5A6'
      });
    }

    return result;
  }, [categoryColors]);

  // Memoized category data for charts with smart grouping
  const categoryData = useMemo(() => 
    stats.categoryTotals ? groupCategories(stats.categoryTotals) : []
  , [stats.categoryTotals, groupCategories]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Memoized custom tooltip for charts
  const CustomTooltip = useCallback(({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ₹${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  }, []);

  return (
    <motion.div 
      className="dashboard"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="dashboard-header" variants={itemVariants}>
        <h2>📊 Financial Dashboard</h2>
        <p className="dashboard-subtitle">Your complete financial overview at a glance</p>
      </motion.div>
      
      {/* Enhanced Stats Grid */}
      <div className="stats-grid">
        <motion.div className="stat-card gradient-1" variants={itemVariants} whileHover={{ scale: 1.05, y: -5 }}>
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Accounts Balance</h3>
            <p className="stat-value">₹{stats.totalAccountBalanceINR.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <span className="stat-change positive">↑ {stats.accountsCount} Accounts</span>
          </div>
        </motion.div>

        <motion.div className="stat-card gradient-2" variants={itemVariants} whileHover={{ scale: 1.05, y: -5 }}>
          <div className="stat-icon">💵</div>
          <div className="stat-content">
            <h3>Monthly Cash Flow</h3>
            <p className="stat-value">₹{stats.monthlyCashFlow.toLocaleString()}</p>
            <span className={`stat-change ${stats.monthlyCashFlow >= 0 ? 'positive' : 'negative'}`}>
              {stats.monthlyCashFlow >= 0 ? '↑' : '↓'} Income - Expenses
            </span>
          </div>
        </motion.div>

        <motion.div className="stat-card gradient-3" variants={itemVariants} whileHover={{ scale: 1.05, y: -5 }}>
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Net Worth</h3>
            <p className="stat-value">₹{stats.netWorth.toLocaleString()}</p>
            <span className="stat-change positive">Assets - Liabilities</span>
          </div>
        </motion.div>

        <motion.div className="stat-card gradient-4" variants={itemVariants} whileHover={{ scale: 1.05, y: -5 }}>
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>This Month Expenses</h3>
            <p className="stat-value">₹{stats.totalExpensesThisMonthINREquivalent.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <span className="stat-change">{stats.topCategory} (Top Category)</span>
          </div>
        </motion.div>
      </div>

      {/* Accounts Overview Section */}
      {accounts.length > 0 && (
        <motion.div className="chart-card full-width" variants={itemVariants}>
          <div className="chart-header">
            <h3>💳 Accounts Overview</h3>
            <p className="chart-subtitle">All your accounts with live currency conversion</p>
          </div>
          <div className="accounts-grid">
            {accounts.map(account => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Net Worth Over Time */}
      <motion.div className="chart-card full-width" variants={itemVariants}>
        <div className="chart-header">
          <h3>📈 Net Worth Tracker</h3>
          <p className="chart-subtitle">Assets, Liabilities, and Net Worth over the last 6 months</p>
        </div>
        {netWorthHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={netWorthHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="assets" 
                fill="#52B788" 
                stroke="#52B788" 
                fillOpacity={0.6}
                name="Assets"
              />
              <Area 
                type="monotone" 
                dataKey="liabilities" 
                fill="#FF6B6B" 
                stroke="#FF6B6B" 
                fillOpacity={0.6}
                name="Liabilities"
              />
              <Line 
                type="monotone" 
                dataKey="netWorth" 
                stroke="#667eea" 
                strokeWidth={3}
                name="Net Worth"
                dot={{ fill: '#667eea', r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-chart-data">Add investments and loans to track net worth</div>
        )}
      </motion.div>

      {/* Cash Flow Analysis */}
      <motion.div className="chart-card full-width" variants={itemVariants}>
        <div className="chart-header">
          <h3>💸 Cash Flow Analysis</h3>
          <p className="chart-subtitle">Income vs Expenses - Track your monthly savings</p>
        </div>
        {cashFlowData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="income" fill="#52B788" radius={[10, 10, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#FF6B6B" radius={[10, 10, 0, 0]} name="Expenses" />
              <Bar dataKey="savings" fill="#667eea" radius={[10, 10, 0, 0]} name="Savings" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-chart-data">Add income and expenses to see cash flow</div>
        )}
      </motion.div>

      {/* Monthly Spending Trends */}
      <motion.div className="chart-card full-width" variants={itemVariants}>
        <div className="chart-header">
          <h3>📊 Monthly Spending Trends</h3>
          <p className="chart-subtitle">Category-wise spending breakdown over 6 months</p>
        </div>
        {monthlyTrends.length > 0 && monthlyTrends.some(t => t.total > 0) ? (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="Food & Dining" stackId="1" stroke="#FF6B6B" fill="#FF6B6B" />
              <Area type="monotone" dataKey="Transportation" stackId="1" stroke="#4ECDC4" fill="#4ECDC4" />
              <Area type="monotone" dataKey="Shopping" stackId="1" stroke="#98D8C8" fill="#98D8C8" />
              <Area type="monotone" dataKey="Entertainment" stackId="1" stroke="#F7DC6F" fill="#F7DC6F" />
              <Area type="monotone" dataKey="Other" stackId="1" stroke="#95A5A6" fill="#95A5A6" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-chart-data">Add expenses to see spending trends</div>
        )}
      </motion.div>

      {/* Current Month Breakdown */}
      <div className="charts-row">
        <motion.div className="chart-card" variants={itemVariants}>
          <h3>🍕 This Month's Expense Breakdown</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `₹${value.toLocaleString()}`}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '10px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={60}
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value, entry) => {
                    const percent = ((entry.payload.value / categoryData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0);
                    return `${value} (${percent}%)`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-chart-data">No expense data available</div>
          )}
        </motion.div>

        <motion.div className="chart-card" variants={itemVariants}>
          <h3>📊 Category Spending Comparison</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={categoryData} 
                layout="horizontal"
                margin={{ top: 20, right: 100, left: 150, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  type="number"
                  domain={[0, 'dataMax']}
                  allowDataOverflow={false}
                  tickFormatter={(value) => {
                    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
                    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
                    return `₹${value}`;
                  }}
                />
                <YAxis 
                  type="category"
                  dataKey="name" 
                  width={140}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '10px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#667eea" 
                  radius={[0, 8, 8, 0]} 
                  animationDuration={800}
                  minPointSize={5}
                  label={{ 
                    position: 'right', 
                    formatter: (value) => {
                      if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
                      if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
                      return `₹${value}`;
                    },
                    fontSize: 10,
                    fill: '#666'
                  }}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-chart-data">No expense data available</div>
          )}
        </motion.div>
      </div>

      {/* Financial Health Indicators */}
      <motion.div className="chart-card full-width" variants={itemVariants}>
        <div className="chart-header">
          <h3>💪 Financial Health Indicators</h3>
          <p className="chart-subtitle">Key metrics for financial wellness</p>
        </div>
        <div className="health-indicators">
          <div className="indicator">
            <div className="indicator-label">Savings Rate</div>
            <div className="indicator-bar">
              <div 
                className="indicator-fill" 
                style={{ 
                  width: `${Math.min(stats.savingsRate, 100)}%`,
                  backgroundColor: stats.savingsRate >= 20 ? '#52B788' : stats.savingsRate >= 10 ? '#F7DC6F' : '#FF6B6B'
                }}
              ></div>
            </div>
            <div className="indicator-value">{stats.savingsRate}%</div>
          </div>
          
          <div className="indicator">
            <div className="indicator-label">Debt-to-Asset Ratio</div>
            <div className="indicator-bar">
              <div 
                className="indicator-fill" 
                style={{ 
                  width: `${stats.totalInvestments > 0 ? Math.min((stats.totalLoans / stats.totalInvestments) * 100, 100) : 0}%`,
                  backgroundColor: (stats.totalLoans / stats.totalInvestments) < 0.3 ? '#52B788' : (stats.totalLoans / stats.totalInvestments) < 0.5 ? '#F7DC6F' : '#FF6B6B'
                }}
              ></div>
            </div>
            <div className="indicator-value">
              {stats.totalInvestments > 0 ? ((stats.totalLoans / stats.totalInvestments) * 100).toFixed(1) : 0}%
            </div>
          </div>

          <div className="indicator">
            <div className="indicator-label">Investment Portfolio</div>
            <div className="indicator-bar">
              <div 
                className="indicator-fill" 
                style={{ 
                  width: `${Math.min((stats.totalInvestments / 1000000) * 100, 100)}%`,
                  backgroundColor: '#667eea'
                }}
              ></div>
            </div>
            <div className="indicator-value">₹{(stats.totalInvestments / 100000).toFixed(1)}L</div>
          </div>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.section className="recent-expenses" variants={itemVariants}>
        <h3>🕒 Recent Transactions</h3>
        {expenses.length === 0 ? (
          <motion.div className="no-data" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p>No expenses yet. Start adding some!</p>
          </motion.div>
        ) : (
          <div className="expense-list-preview">
            {expenses.slice(0, 8).map((expense, index) => (
              <motion.div 
                key={expense.id} 
                className="expense-preview-item"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              >
                <div className="expense-preview-left">
                  <span className="expense-preview-icon" style={{ backgroundColor: categoryColors[expense.category] || '#95A5A6' }}>
                    {expense.category === 'Food & Dining' ? '🍔' : 
                     expense.category === 'Transportation' ? '🚗' :
                     expense.category === 'Shopping' ? '🛍️' :
                     expense.category === 'Entertainment' ? '🎬' :
                     expense.category === 'Healthcare' ? '⚕️' :
                     expense.category === 'Utilities' ? '💡' :
                     expense.category === 'Rent' ? '🏠' : '💳'}
                  </span>
                  <div>
                    <span className="expense-preview-category">{expense.category}</span>
                    <span className="expense-preview-date">{new Date(expense.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="expense-preview-right">
                  <span className="expense-preview-amount">
                    {expense.currency === 'THB' ? '฿' : '₹'}{expense.amount.toFixed(2)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Quick Insights */}
      <motion.div className="insights-section" variants={itemVariants}>
        <h3>💡 Quick Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <span className="insight-icon">🎯</span>
            <div className="insight-content">
              <h4>Top Spending Category</h4>
              <p>{stats.topCategory}</p>
            </div>
          </div>
          <div className="insight-card">
            <span className="insight-icon">📈</span>
            <div className="insight-content">
              <h4>Investment Growth</h4>
              <p>{stats.totalInvestments > 0 ? 'Portfolio Active' : 'Start Investing'}</p>
            </div>
          </div>
          <div className="insight-card">
            <span className="insight-icon">💰</span>
            <div className="insight-content">
              <h4>Monthly Savings</h4>
              <p>₹{stats.monthlyCashFlow > 0 ? stats.monthlyCashFlow.toLocaleString() : '0'}</p>
            </div>
          </div>
          <div className="insight-card">
            <span className="insight-icon">🏦</span>
            <div className="insight-content">
              <h4>Debt Status</h4>
              <p>{stats.totalLoans > 0 ? `₹${(stats.totalLoans / 100000).toFixed(1)}L Outstanding` : 'Debt Free! 🎉'}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Dashboard;
