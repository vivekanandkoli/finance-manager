import React, { useState, useEffect } from 'react';
import { addRecord, getAllRecords, updateRecord, deleteRecord } from '../db';
import toast from 'react-hot-toast';
import './IncomeManager.css';

const INCOME_CATEGORIES = {
  salary: { label: 'Salary', icon: '💼', color: '#3b82f6' },
  freelance: { label: 'Freelance', icon: '💻', color: '#8b5cf6' },
  business: { label: 'Business', icon: '🏢', color: '#10b981' },
  rental: { label: 'Rental Income', icon: '🏠', color: '#f59e0b' },
  investment: { label: 'Investment Returns', icon: '📈', color: '#06b6d4' },
  dividend: { label: 'Dividends', icon: '💰', color: '#14b8a6' },
  interest: { label: 'Interest', icon: '🏦', color: '#6366f1' },
  bonus: { label: 'Bonus', icon: '🎁', color: '#ec4899' },
  gift: { label: 'Gift/Inheritance', icon: '🎁', color: '#f43f5e' },
  other: { label: 'Other', icon: '💵', color: '#64748b' }
};

const RECURRING_OPTIONS = [
  { value: 'once', label: 'One-time' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

function IncomeManager() {
  const [incomes, setIncomes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [formData, setFormData] = useState({
    source: '',
    category: 'salary',
    amount: '',
    currency: 'INR',
    date: new Date().toISOString().split('T')[0],
    recurring: 'once',
    description: '',
    taxable: true
  });

  useEffect(() => {
    loadIncomes();
  }, []);

  const loadIncomes = async () => {
    try {
      const data = await getAllRecords('income');
      setIncomes(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error('Error loading incomes:', error);
      toast.error('Failed to load income records');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.source || !formData.amount) {
      toast.error('Please fill required fields');
      return;
    }

    const incomeData = {
      ...formData,
      amount: parseFloat(formData.amount),
      createdAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        incomeData.id = editingId;
        await updateRecord('income', incomeData);
        toast.success('Income updated successfully');
      } else {
        await addRecord('income', incomeData);
        toast.success('Income added successfully');
      }
      
      resetForm();
      loadIncomes();
    } catch (error) {
      console.error('Error saving income:', error);
      toast.error('Failed to save income');
    }
  };

  const handleEdit = (income) => {
    setFormData({
      ...income,
      date: new Date(income.date).toISOString().split('T')[0]
    });
    setEditingId(income.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income record?')) {
      try {
        await deleteRecord('income', id);
        toast.success('Income deleted successfully');
        loadIncomes();
      } catch (error) {
        console.error('Error deleting income:', error);
        toast.error('Failed to delete income');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      source: '',
      category: 'salary',
      amount: '',
      currency: 'INR',
      date: new Date().toISOString().split('T')[0],
      recurring: 'once',
      description: '',
      taxable: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getFilteredIncomes = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (filterPeriod === 'all') return incomes;

    return incomes.filter(income => {
      const incomeDate = new Date(income.date);
      const incomeMonth = incomeDate.getMonth();
      const incomeYear = incomeDate.getFullYear();

      if (filterPeriod === 'this-month') {
        return incomeMonth === currentMonth && incomeYear === currentYear;
      } else if (filterPeriod === 'this-year') {
        return incomeYear === currentYear;
      } else if (filterPeriod === 'last-month') {
        const lastMonth = new Date(currentYear, currentMonth - 1, 1);
        return incomeMonth === lastMonth.getMonth() && incomeYear === lastMonth.getFullYear();
      }
      return true;
    });
  };

  const getTotalIncome = () => {
    return getFilteredIncomes().reduce((sum, income) => {
      const amount = income.currency === 'INR' ? income.amount : income.amount * 83;
      return sum + amount;
    }, 0);
  };

  const getMonthlyRecurring = () => {
    return incomes
      .filter(i => i.recurring === 'monthly')
      .reduce((sum, i) => sum + (i.currency === 'INR' ? i.amount : i.amount * 83), 0);
  };

  const getIncomeByCategory = () => {
    const categoryTotals = {};
    getFilteredIncomes().forEach(income => {
      if (!categoryTotals[income.category]) {
        categoryTotals[income.category] = 0;
      }
      const amount = income.currency === 'INR' ? income.amount : income.amount * 83;
      categoryTotals[income.category] += amount;
    });
    return categoryTotals;
  };

  const filteredIncomes = getFilteredIncomes();
  const categoryTotals = getIncomeByCategory();

  return (
    <div className="income-manager">
      <div className="income-header">
        <h1>💸 Income Manager</h1>
        <button 
          className="add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Income'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card total-income">
          <div className="summary-icon">💰</div>
          <div className="summary-info">
            <div className="summary-label">Total Income ({filterPeriod.replace('-', ' ')})</div>
            <div className="summary-value">₹{getTotalIncome().toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
          </div>
        </div>
        <div className="summary-card recurring-income">
          <div className="summary-icon">🔄</div>
          <div className="summary-info">
            <div className="summary-label">Monthly Recurring</div>
            <div className="summary-value">₹{getMonthlyRecurring().toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
          </div>
        </div>
        <div className="summary-card total-sources">
          <div className="summary-icon">📊</div>
          <div className="summary-info">
            <div className="summary-label">Income Sources</div>
            <div className="summary-value">{filteredIncomes.length}</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <label>Period:</label>
        <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}>
          <option value="all">All Time</option>
          <option value="this-month">This Month</option>
          <option value="last-month">Last Month</option>
          <option value="this-year">This Year</option>
        </select>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="income-form-card">
          <h2>{editingId ? 'Edit Income' : 'Add New Income'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Income Source *</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="e.g., Monthly Salary, Client Project"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  {Object.entries(INCOME_CATEGORIES).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.icon} {val.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="THB">THB (฿)</option>
                  <option value="AED">AED (د.إ)</option>
                  <option value="SGD">SGD (S$)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Frequency</label>
                <select
                  value={formData.recurring}
                  onChange={(e) => setFormData({ ...formData, recurring: e.target.value })}
                >
                  {RECURRING_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.taxable}
                    onChange={(e) => setFormData({ ...formData, taxable: e.target.checked })}
                  />
                  <span>Taxable Income</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional notes..."
                rows="2"
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? 'Update Income' : 'Add Income'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="category-breakdown">
          <h2>Income by Category</h2>
          <div className="category-grid">
            {Object.entries(categoryTotals)
              .sort(([, a], [, b]) => b - a)
              .map(([category, total]) => {
                const categoryInfo = INCOME_CATEGORIES[category];
                const percentage = ((total / getTotalIncome()) * 100).toFixed(1);
                return (
                  <div key={category} className="category-item" style={{ borderLeftColor: categoryInfo.color }}>
                    <div className="category-icon" style={{ color: categoryInfo.color }}>
                      {categoryInfo.icon}
                    </div>
                    <div className="category-info">
                      <div className="category-name">{categoryInfo.label}</div>
                      <div className="category-amount">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                      <div className="category-percentage">{percentage}% of total</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Income List */}
      <div className="income-list">
        <h2>Recent Income</h2>
        {filteredIncomes.map((income) => {
          const categoryInfo = INCOME_CATEGORIES[income.category];
          return (
            <div key={income.id} className="income-item">
              <div className="income-icon" style={{ backgroundColor: categoryInfo.color + '20', color: categoryInfo.color }}>
                {categoryInfo.icon}
              </div>
              <div className="income-details">
                <div className="income-main">
                  <h3>{income.source}</h3>
                  {income.recurring !== 'once' && (
                    <span className="recurring-badge">🔄 {income.recurring}</span>
                  )}
                  {income.taxable && (
                    <span className="tax-badge">📋 Taxable</span>
                  )}
                </div>
                <div className="income-meta">
                  <span className="income-category">{categoryInfo.label}</span>
                  <span className="income-date">{new Date(income.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                {income.description && (
                  <div className="income-description">{income.description}</div>
                )}
              </div>
              <div className="income-amount-section">
                <div className="income-amount">
                  {income.currency === 'INR' ? '₹' : '$'}
                  {income.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
                <div className="income-actions">
                  <button onClick={() => handleEdit(income)} className="btn-icon" title="Edit">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(income.id)} className="btn-icon" title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredIncomes.length === 0 && !showForm && (
        <div className="empty-state">
          <div className="empty-icon">💸</div>
          <h3>No income records yet</h3>
          <p>Start tracking your income sources to get better financial insights</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Add Your First Income
          </button>
        </div>
      )}
    </div>
  );
}

export default IncomeManager;
