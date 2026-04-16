import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllRecords, deleteRecord } from '../db';
import toast from 'react-hot-toast';
import { SearchBar, LoadingSpinner, CardSkeleton, ConfirmModal, NoExpenses, NoSearchResults } from './ui';
import './ExpenseList.css';

// Memoized ExpenseCard component to prevent unnecessary re-renders
const ExpenseCard = React.memo(({ expense, onDelete }) => {
  const getCategoryIcon = useCallback((category) => {
    const icons = {
      'Food & Dining': '🍽️',
      'Transportation': '🚗',
      'Utilities': '💡',
      'Rent': '🏠',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Healthcare': '🏥',
      'Insurance': '🛡️',
      'EMI/Loan': '💳',
      'Investment': '📈',
      'Salary': '💰',
      'Income': '💰',
      'Other': '📦'
    };
    
    for (const [key, icon] of Object.entries(icons)) {
      if (category?.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return '💵';
  }, []);

  return (
    <div className="expense-item-card">
      <div className="expense-item-header">
        <div className="expense-category-badge">
          <span className="category-icon">{getCategoryIcon(expense.category)}</span>
          <span className="category-name">{expense.category || 'Uncategorized'}</span>
        </div>
        <div className="expense-amount-badge" style={{
          background: expense.currency === 'THB' 
            ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        }}>
          {expense.currency === 'THB' ? '฿' : '₹'}
          {Number(expense.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {expense.description && (
        <p className="expense-description">{expense.description}</p>
      )}

      <div className="expense-item-footer">
        <div className="expense-meta">
          <span className="expense-date">📅 {expense.date || 'No date'}</span>
          <span className="expense-payment">💳 {expense.paymentMethod || expense.paymentMode || 'N/A'}</span>
        </div>
        <button 
          onClick={() => onDelete(expense)}
          className="delete-btn"
          title="Delete expense"
        >
          🗑️
        </button>
      </div>
    </div>
  );
});

ExpenseCard.displayName = 'ExpenseCard';

function ExpenseList({ refreshTrigger }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, expense: null });
  const [filter, setFilter] = useState({
    currency: 'ALL',
    category: 'ALL',
    searchTerm: '',
    startDate: '',
    endDate: ''
  });

  // Memoized loadExpenses function
  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const allExpenses = await getAllRecords('expenses');
      const sorted = allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
      setExpenses(sorted);
      toast.success(`Loaded ${sorted.length} expenses`);
    } catch (error) {
      console.error('Error loading expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [refreshTrigger, loadExpenses]);

  // Memoized delete handler
  const handleDeleteClick = useCallback((expense) => {
    setDeleteModal({ isOpen: true, expense });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await deleteRecord('expenses', deleteModal.expense.id);
      toast.success('Expense deleted successfully');
      await loadExpenses();
      setDeleteModal({ isOpen: false, expense: null });
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  }, [deleteModal.expense, loadExpenses]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModal({ isOpen: false, expense: null });
  }, []);

  // Memoized search handler
  const handleSearch = useCallback((searchTerm) => {
    setFilter(prev => ({ ...prev, searchTerm }));
  }, []);

  // Memoized filter handlers
  const handleCurrencyChange = useCallback((e) => {
    setFilter(prev => ({ ...prev, currency: e.target.value }));
  }, []);

  const handleCategoryChange = useCallback((e) => {
    setFilter(prev => ({ ...prev, category: e.target.value }));
  }, []);

  const handleStartDateChange = useCallback((e) => {
    setFilter(prev => ({ ...prev, startDate: e.target.value }));
  }, []);

  const handleEndDateChange = useCallback((e) => {
    setFilter(prev => ({ ...prev, endDate: e.target.value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilter({ currency: 'ALL', category: 'ALL', searchTerm: '', startDate: '', endDate: '' });
    toast.success('Filters cleared');
  }, []);

  // Memoized filtered expenses
  const filteredExpenses = useMemo(() => expenses.filter(expense => {
    // Currency filter
    if (filter.currency !== 'ALL' && expense.currency !== filter.currency) return false;
    
    // Category filter
    if (filter.category !== 'ALL' && expense.category !== filter.category) return false;
    
    // Search term filter
    if (filter.searchTerm) {
      const search = filter.searchTerm.toLowerCase();
      const matchesCategory = expense.category?.toLowerCase().includes(search);
      const matchesDescription = expense.description?.toLowerCase().includes(search);
      if (!matchesCategory && !matchesDescription) return false;
    }
    
    // Date range filter
    if (filter.startDate && expense.date < filter.startDate) return false;
    if (filter.endDate && expense.date > filter.endDate) return false;
    
    return true;
  }), [expenses, filter]);

  // Memoized totals
  const totals = useMemo(() => ({
    thb: filteredExpenses
      .filter(e => e.currency === 'THB')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0),
    inr: filteredExpenses
      .filter(e => e.currency === 'INR')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0)
  }), [filteredExpenses]);

  // Memoized categories
  const categories = useMemo(() => 
    [...new Set(expenses.map(e => e.category))].filter(Boolean).sort(),
    [expenses]
  );

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => 
    filter.searchTerm || filter.currency !== 'ALL' || filter.category !== 'ALL' || filter.startDate || filter.endDate,
    [filter]
  );

  return (
    <div className="expense-list-container">
      <div className="expense-list-header">
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>
            Expense History
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
            View and manage all your transactions
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-card">
        <div className="filters-grid">
          <div className="filter-item" style={{ gridColumn: '1 / -1' }}>
            <label>🔍 Search</label>
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search by category or description..."
              debounceDelay={300}
            />
          </div>

          <div className="filter-item">
            <label>💱 Currency</label>
            <select
              value={filter.currency}
              onChange={handleCurrencyChange}
              className="filter-select"
            >
              <option value="ALL">All Currencies</option>
              <option value="THB">THB (฿)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          <div className="filter-item">
            <label>📁 Category</label>
            <select
              value={filter.category}
              onChange={handleCategoryChange}
              className="filter-select"
            >
              <option value="ALL">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>📅 Date Range</label>
            <div className="date-range">
              <input
                type="date"
                value={filter.startDate}
                onChange={handleStartDateChange}
                className="filter-input"
              />
              <span style={{ padding: '0 8px', color: '#94a3b8' }}>to</span>
              <input
                type="date"
                value={filter.endDate}
                onChange={handleEndDateChange}
                className="filter-input"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="clear-filters-btn"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>💵</div>
          <div className="summary-content">
            <p className="summary-label">Total THB</p>
            <p className="summary-value">฿{totals.thb.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>💰</div>
          <div className="summary-content">
            <p className="summary-label">Total INR</p>
            <p className="summary-value">₹{totals.inr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>📊</div>
          <div className="summary-content">
            <p className="summary-label">Total Transactions</p>
            <p className="summary-value">{filteredExpenses.length}</p>
          </div>
        </div>
      </div>

      {/* Expense List with optimized rendering */}
      {loading ? (
        <div className="expense-items-grid">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <NoExpenses />
      ) : filteredExpenses.length === 0 ? (
        <NoSearchResults />
      ) : (
        <div className="expense-items-grid">
          {filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Expense"
        message={`Are you sure you want to delete this ${deleteModal.expense?.category} expense of ${deleteModal.expense?.currency === 'THB' ? '฿' : '₹'}${Number(deleteModal.expense?.amount || 0).toFixed(2)}?`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}

export default ExpenseList;
