import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { getAllRecords, addRecord, deleteRecord, updateRecord } from '../db';
import { useDebounce } from '../hooks';
import './BudgetManager.css';

function BudgetManager() {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: 'Food & Dining',
    amount: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    rollover: true,
    alertThreshold: 80
  });

  const [budgetStats, setBudgetStats] = useState({
    totalBudgeted: 0,
    totalSpent: 0,
    totalIncome: 0,
    toBeBudgeted: 0,
    savingsRate: 0
  });

  const [forecastData, setForecastData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const categories = [
    'Food & Dining',
    'Transportation',
    'Utilities',
    'Rent',
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Insurance',
    'EMI/Loan',
    'Savings',
    'Investment',
    'Other'
  ];

  useEffect(() => {
    loadData();
  }, []);

  // Debounced calculations to avoid performance issues
  const debouncedBudgets = useDebounce(budgets, 300);
  const debouncedExpenses = useDebounce(expenses, 300);
  const debouncedIncome = useDebounce(income, 300);

  useEffect(() => {
    if (debouncedBudgets.length > 0 && debouncedExpenses.length > 0) {
      calculateStats();
      calculateForecast();
    }
  }, [debouncedBudgets, debouncedExpenses, debouncedIncome]);

  const loadData = async () => {
    try {
      const [allBudgets, allExpenses, allIncome] = await Promise.all([
        getAllRecords('budgets'),
        getAllRecords('expenses'),
        getAllRecords('income')
      ]);
      
      setBudgets(allBudgets);
      setExpenses(allExpenses);
      setIncome(allIncome);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate total budgeted for current period
    const totalBudgeted = budgets
      .filter(b => b.period === selectedPeriod)
      .reduce((sum, b) => sum + b.amount, 0);

    // Calculate total spent this month
    const totalSpent = expenses
      .filter(e => {
        const expDate = new Date(e.date);
        return expDate.getMonth() === currentMonth && 
               expDate.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + (e.currency === 'INR' ? e.amount : e.amount / 2.5), 0);

    // Calculate total income this month
    const totalIncome = income
      .filter(i => {
        const incDate = new Date(i.date);
        return incDate.getMonth() === currentMonth && 
               incDate.getFullYear() === currentYear;
      })
      .reduce((sum, i) => sum + i.amount, 0);

    const toBeBudgeted = totalIncome - totalBudgeted;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome * 100) : 0;

    setBudgetStats({
      totalBudgeted,
      totalSpent,
      totalIncome,
      toBeBudgeted,
      savingsRate: savingsRate.toFixed(1)
    });
  };

  const calculateSpent = (budget) => {
    const now = new Date();
    let startDate, endDate;

    if (budget.period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (budget.period === 'weekly') {
      const day = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - day);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else if (budget.period === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    }

    const spent = expenses
      .filter(e => {
        const expDate = new Date(e.date);
        return e.category === budget.category &&
               expDate >= startDate &&
               expDate <= endDate;
      })
      .reduce((sum, e) => sum + (e.currency === 'INR' ? e.amount : e.amount / 2.5), 0);

    return spent;
  };

  const calculateForecast = () => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysPassed = now.getDate();
    const daysRemaining = daysInMonth - daysPassed;

    const forecast = budgets.map(budget => {
      const spent = calculateSpent(budget);
      const dailyRate = spent / daysPassed;
      const projectedSpent = spent + (dailyRate * daysRemaining);
      const projectedOverage = projectedSpent > budget.amount ? projectedSpent - budget.amount : 0;

      return {
        category: budget.category,
        budget: budget.amount,
        spent: Math.round(spent),
        projected: Math.round(projectedSpent),
        overage: Math.round(projectedOverage),
        daysRemaining
      };
    });

    setForecastData(forecast);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const budget = {
      ...formData,
      amount: parseFloat(formData.amount),
      alertThreshold: parseInt(formData.alertThreshold),
      timestamp: new Date().toISOString()
    };

    try {
      if (editingBudget) {
        await updateRecord('budgets', { ...budget, id: editingBudget.id });
        alert('Budget updated successfully!');
        setEditingBudget(null);
      } else {
        await addRecord('budgets', budget);
        alert('Budget added successfully!');
      }
      
      resetForm();
      loadData();
    } catch (error) {
      alert('Error saving budget: ' + error.message);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period,
      startDate: budget.startDate,
      rollover: budget.rollover,
      alertThreshold: budget.alertThreshold || 80
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteRecord('budgets', id);
        loadData();
      } catch (error) {
        alert('Error deleting budget: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'Food & Dining',
      amount: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      rollover: true,
      alertThreshold: 80
    });
    setShowForm(false);
    setEditingBudget(null);
  };

  // Memoized handleChange for form inputs
  const handleChange = useCallback((e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prevData => ({
      ...prevData,
      [e.target.name]: value
    }));
  }, []);

  const getStatusColor = (percentage) => {
    if (percentage < 80) return '#52B788';
    if (percentage < 100) return '#F7DC6F';
    return '#FF6B6B';
  };

  const getStatusText = (percentage) => {
    if (percentage < 50) return 'On Track 👍';
    if (percentage < 80) return 'Good Progress';
    if (percentage < 100) return 'Almost There ⚠️';
    return 'Over Budget! 🚨';
  };

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

  // Memoized budget comparison chart data
  const comparisonData = useMemo(() => 
    budgets.map(budget => {
      const spent = calculateSpent(budget);
      return {
        category: budget.category,
        Budget: budget.amount,
        Spent: Math.round(spent),
        Remaining: Math.max(budget.amount - spent, 0)
      };
    })
  , [budgets]);

  return (
    <motion.div 
      className="budget-manager"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.div className="budget-header" variants={itemVariants}>
        <div className="header-content">
          <h2>💰 Budget Manager</h2>
          <p className="subtitle">Zero-based budgeting with smart forecasting</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn-primary"
        >
          {showForm ? '✕ Cancel' : '+ Add Budget'}
        </button>
      </motion.div>

      {/* YNAB-Style "To Be Budgeted" Section */}
      <motion.div className="to-be-budgeted-section" variants={itemVariants}>
        <div className="tbb-card">
          <div className="tbb-label">To Be Budgeted</div>
          <div className={`tbb-amount ${budgetStats.toBeBudgeted < 0 ? 'negative' : 'positive'}`}>
            ₹{budgetStats.toBeBudgeted.toLocaleString()}
          </div>
          <div className="tbb-breakdown">
            <span>Income: ₹{budgetStats.totalIncome.toLocaleString()}</span>
            <span>•</span>
            <span>Budgeted: ₹{budgetStats.totalBudgeted.toLocaleString()}</span>
          </div>
          {budgetStats.toBeBudgeted < 0 && (
            <div className="tbb-warning">
              ⚠️ You've over-budgeted by ₹{Math.abs(budgetStats.toBeBudgeted).toLocaleString()}
            </div>
          )}
        </div>

        <div className="quick-stats-grid">
          <div className="quick-stat">
            <div className="stat-label">Total Spent</div>
            <div className="stat-value">₹{budgetStats.totalSpent.toLocaleString()}</div>
          </div>
          <div className="quick-stat">
            <div className="stat-label">Savings Rate</div>
            <div className="stat-value">{budgetStats.savingsRate}%</div>
          </div>
          <div className="quick-stat">
            <div className="stat-label">Budget Status</div>
            <div className="stat-value">
              {budgets.filter(b => (calculateSpent(b) / b.amount * 100) > 100).length} Over
            </div>
          </div>
        </div>
      </motion.div>

      {/* Add/Edit Budget Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            className="budget-form-container"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="budget-form">
              <h3>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Budget Amount (₹)</label>
                  <input 
                    type="number" 
                    name="amount" 
                    value={formData.amount} 
                    onChange={handleChange} 
                    step="100" 
                    required 
                    placeholder="e.g., 15000"
                  />
                </div>

                <div className="form-group">
                  <label>Period</label>
                  <select name="period" value={formData.period} onChange={handleChange}>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Alert Threshold (%)</label>
                  <input 
                    type="number" 
                    name="alertThreshold" 
                    value={formData.alertThreshold} 
                    onChange={handleChange} 
                    min="50"
                    max="100"
                    step="5"
                  />
                  <small>Get alerted when you reach this percentage</small>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input 
                      type="checkbox" 
                      name="rollover" 
                      checked={formData.rollover} 
                      onChange={handleChange}
                    />
                    <span>Rollover unused amount to next period</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingBudget ? 'Update Budget' : 'Create Budget'}
                </button>
                <button type="button" onClick={resetForm} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budget vs Actual Chart */}
      {budgets.length > 0 && (
        <motion.div className="chart-section" variants={itemVariants}>
          <h3>📊 Budget vs Actual Spending</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" angle={-45} textAnchor="end" height={120} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Budget" fill="#667eea" radius={[10, 10, 0, 0]} />
              <Bar dataKey="Spent" fill="#FF6B6B" radius={[10, 10, 0, 0]} />
              <Bar dataKey="Remaining" fill="#52B788" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Budget Forecast Section */}
      {forecastData.length > 0 && (
        <motion.div className="forecast-section" variants={itemVariants}>
          <h3>🔮 Budget Forecast (End of Month Projection)</h3>
          <div className="forecast-grid">
            {forecastData.map((item, index) => (
              <motion.div 
                key={index} 
                className="forecast-card"
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="forecast-header">
                  <h4>{item.category}</h4>
                  {item.overage > 0 && (
                    <span className="overage-badge">
                      +₹{item.overage.toLocaleString()} over
                    </span>
                  )}
                </div>
                <div className="forecast-amounts">
                  <div className="amount-row">
                    <span>Budget:</span>
                    <span>₹{item.budget.toLocaleString()}</span>
                  </div>
                  <div className="amount-row">
                    <span>Spent:</span>
                    <span>₹{item.spent.toLocaleString()}</span>
                  </div>
                  <div className="amount-row projected">
                    <span>Projected:</span>
                    <span>₹{item.projected.toLocaleString()}</span>
                  </div>
                </div>
                <div className="forecast-message">
                  {item.overage > 0 ? (
                    <span className="warning">
                      ⚠️ At this rate, you'll exceed by ₹{item.overage.toLocaleString()}
                    </span>
                  ) : (
                    <span className="success">
                      ✅ On track! {item.daysRemaining} days remaining
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Budget Cards with Progress Bars */}
      <motion.div className="budgets-section" variants={itemVariants}>
        <h3>Your Budget Categories</h3>
        {budgets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h4>No budgets set yet</h4>
            <p>Create your first budget to start tracking your spending</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              Create Budget
            </button>
          </div>
        ) : (
          <div className="budget-grid">
            {budgets.map((budget, index) => {
              const spent = calculateSpent(budget);
              const remaining = budget.amount - spent;
              const percentage = (spent / budget.amount * 100);
              const statusColor = getStatusColor(percentage);
              const statusText = getStatusText(percentage);

              return (
                <motion.div 
                  key={budget.id} 
                  className="budget-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
                >
                  <div className="budget-card-header">
                    <h4>{budget.category}</h4>
                    <span className="budget-period">{budget.period}</span>
                  </div>

                  <div className="budget-amounts">
                    <div className="amount-display">
                      <div className="amount-label">Budget</div>
                      <div className="amount-value">₹{budget.amount.toLocaleString()}</div>
                    </div>
                    <div className="amount-display">
                      <div className="amount-label">Spent</div>
                      <div className="amount-value spent">₹{spent.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                    </div>
                    <div className="amount-display">
                      <div className="amount-label">Remaining</div>
                      <div className={`amount-value ${remaining < 0 ? 'negative' : 'positive'}`}>
                        ₹{remaining.toLocaleString(undefined, {maximumFractionDigits: 0})}
                      </div>
                    </div>
                  </div>

                  <div className="progress-section">
                    <div className="progress-bar">
                      <motion.div 
                        className="progress-fill" 
                        style={{ backgroundColor: statusColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      ></motion.div>
                    </div>
                    <div className="progress-info">
                      <span className="percentage" style={{ color: statusColor }}>
                        {percentage.toFixed(1)}%
                      </span>
                      <span className="status-text">{statusText}</span>
                    </div>
                  </div>

                  {percentage >= budget.alertThreshold && percentage < 100 && (
                    <div className="alert-message warning">
                      ⚠️ You've reached {budget.alertThreshold}% of your budget
                    </div>
                  )}

                  {percentage >= 100 && (
                    <div className="alert-message danger">
                      🚨 Budget exceeded by ₹{Math.abs(remaining).toLocaleString()}
                    </div>
                  )}

                  <div className="budget-card-actions">
                    <button onClick={() => handleEdit(budget)} className="btn-edit">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(budget.id)} className="btn-delete">
                      🗑️ Delete
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Smart Recommendations */}
      {budgets.length > 0 && (
        <motion.div className="recommendations-section" variants={itemVariants}>
          <h3>💡 Smart Recommendations</h3>
          <div className="recommendations-grid">
            {budgets
              .filter(b => {
                const spent = calculateSpent(b);
                return (spent / b.amount * 100) > 90;
              })
              .map((budget, index) => (
                <div key={index} className="recommendation-card">
                  <span className="rec-icon">⚠️</span>
                  <div className="rec-content">
                    <h4>Slow down on {budget.category}</h4>
                    <p>You're close to your budget limit. Consider reducing spending here.</p>
                  </div>
                </div>
              ))}
            
            {budgetStats.savingsRate < 20 && (
              <div className="recommendation-card">
                <span className="rec-icon">💰</span>
                <div className="rec-content">
                  <h4>Increase Your Savings Rate</h4>
                  <p>Current: {budgetStats.savingsRate}%. Target: 20%+. Consider reducing discretionary spending.</p>
                </div>
              </div>
            )}

            {budgetStats.toBeBudgeted > 10000 && (
              <div className="recommendation-card success">
                <span className="rec-icon">✅</span>
                <div className="rec-content">
                  <h4>Allocate Remaining Funds</h4>
                  <p>You have ₹{budgetStats.toBeBudgeted.toLocaleString()} to budget. Consider savings or investments.</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default BudgetManager;
