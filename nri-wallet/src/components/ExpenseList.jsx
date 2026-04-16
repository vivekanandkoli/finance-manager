import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllRecords, deleteRecord, updateRecord } from '../db';
import toast from 'react-hot-toast';
import { currencyService } from '../services/currencyService';
import './ExpenseList.css';

function ExpenseList({ refreshTrigger }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, expense: null });
  const [exchangeRates, setExchangeRates] = useState({});
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Load expenses
  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const allExpenses = await getAllRecords('expenses');
      const sortedExpenses = allExpenses.sort((a, b) => 
        new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)
      );
      setExpenses(sortedExpenses);
    } catch (error) {
      console.error('Failed to load expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses, refreshTrigger]);

  // Load exchange rates for non-INR currencies
  useEffect(() => {
    const loadExchangeRates = async () => {
      const uniqueCurrencies = [...new Set(expenses.map(e => e.currency || 'INR'))];
      const rates = {};
      
      for (const currency of uniqueCurrencies) {
        if (currency !== 'INR') {
          try {
            const rateData = await currencyService.getExchangeRate(currency, 'INR');
            rates[currency] = rateData.rate;
          } catch (error) {
            console.error(`Failed to get exchange rate for ${currency}:`, error);
            // Fallback rates
            rates[currency] = currency === 'THB' ? 2.5 : 1;
          }
        }
      }
      
      setExchangeRates(rates);
    };
    
    if (expenses.length > 0) {
      loadExchangeRates();
    }
  }, [expenses]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const count = expenses.length;
    const avgExpense = count > 0 ? total / count : 0;
    
    // Count by currency
    const currencyTotals = expenses.reduce((acc, exp) => {
      const curr = exp.currency || 'INR';
      acc[curr] = (acc[curr] || 0) + (exp.amount || 0);
      return acc;
    }, {});

    return { total, count, avgExpense, currencyTotals };
  }, [expenses]);

  // Memoized categories
  const categories = useMemo(() => 
    [...new Set(expenses.map(e => e.category))].filter(Boolean).sort(),
    [expenses]
  );

  // Memoized currencies
  const currencies = useMemo(() => 
    [...new Set(expenses.map(e => e.currency || 'INR'))].sort(),
    [expenses]
  );

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = !searchTerm || 
        (expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         expense.category?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCurrency = selectedCurrency === 'all' || 
        (expense.currency || 'INR') === selectedCurrency;
      
      const matchesCategory = selectedCategory === 'all' || 
        expense.category === selectedCategory;
      
      const matchesStartDate = !startDate || 
        new Date(expense.date || expense.timestamp) >= new Date(startDate);
      
      const matchesEndDate = !endDate || 
        new Date(expense.date || expense.timestamp) <= new Date(endDate);
      
      return matchesSearch && matchesCurrency && matchesCategory && 
             matchesStartDate && matchesEndDate;
    });
  }, [expenses, searchTerm, selectedCurrency, selectedCategory, startDate, endDate]);

  // Pagination
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredExpenses, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCurrency, selectedCategory, startDate, endDate]);

  // Delete handlers
  const handleDeleteClick = useCallback((expense) => {
    setDeleteModal({ isOpen: true, expense });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      const expense = deleteModal.expense;
      
      // Refund account balance if expense was linked to an account
      if (expense.accountId) {
        try {
          const accounts = await getAllRecords('accounts');
          const account = accounts.find(acc => acc.id === expense.accountId);
          
          if (account) {
            const refundedBalance = account.balance + expense.amount;
            await updateRecord('accounts', {
              ...account,
              id: account.id,
              balance: refundedBalance,
              updatedAt: new Date().toISOString()
            });
          }
        } catch (accountError) {
          console.error('Failed to refund account:', accountError);
        }
      }
      
      await deleteRecord('expenses', expense.id);
      toast.success('Expense deleted successfully');
      await loadExpenses();
      setDeleteModal({ isOpen: false, expense: null });
    } catch (error) {
      console.error('Failed to delete expense:', error);
      toast.error('Failed to delete expense');
    }
  }, [deleteModal, loadExpenses]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModal({ isOpen: false, expense: null });
  }, []);

  // Bulk delete handler
  const handleBulkDelete = useCallback(async () => {
    try {
      // Delete all selected expenses
      for (const expenseId of selectedExpenses) {
        await deleteRecord('expenses', expenseId);
      }
      
      toast.success(`Successfully deleted ${selectedExpenses.length} expense(s)`);
      setSelectedExpenses([]);
      await loadExpenses();
    } catch (error) {
      console.error('Failed to delete expenses:', error);
      toast.error('Failed to delete some expenses');
    }
  }, [selectedExpenses, loadExpenses]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCurrency('all');
    setSelectedCategory('all');
    setStartDate('');
    setEndDate('');
  }, []);

  const hasActiveFilters = searchTerm || selectedCurrency !== 'all' || 
                           selectedCategory !== 'all' || startDate || endDate;

  const getCategoryIcon = useCallback((category) => {
    const icons = {
      'Food & Dining': '🍽️',
      'Transportation': '🚗',
      'Bills & Utilities': '💡',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Healthcare': '🏥',
      'Education': '📚',
      'Travel': '✈️',
      'Income': '💰',
      'Transfer': '🔄',
      'Credit Card Payment': '💳',
      'Mobile & Internet': '📱',
      'Services': '⚙️',
      'Other Expenses': '📦',
      'Salary': '💵',
      'Investment': '📈',
      'Gifts': '🎁',
      'Personal Care': '💅'
    };
    return icons[category] || '💸';
  }, []);

  // Convert amount to INR
  const convertToINR = useCallback((amount, currency) => {
    if (!currency || currency === 'INR') {
      return amount;
    }
    const rate = exchangeRates[currency] || 1;
    return amount * rate;
  }, [exchangeRates]);

  // Get currency symbol
  const getCurrencySymbol = useCallback((currency) => {
    const symbols = {
      'INR': '₹',
      'THB': '฿',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    return symbols[currency] || currency;
  }, []);

  if (loading) {
    return (
      <div className="expense-list">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-list">
      {/* Header */}
      <div className="expense-list-header">
        <h2>📝 Expense History</h2>
        <p className="subtitle">View and manage all your transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <div className="summary-label">Total Expenses</div>
            <div className="summary-value">{summaryStats.count}</div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <div className="summary-label">Total Amount</div>
            <div className="summary-value">
              {Object.entries(summaryStats.currencyTotals).map(([curr, amount]) => (
                <div key={curr} className="currency-amount">
                  {curr} {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">📈</div>
          <div className="summary-content">
            <div className="summary-label">Average Expense</div>
            <div className="summary-value">
              ₹{summaryStats.avgExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="expense-filters">
        <div className="filter-row">
          <input
            type="text"
            placeholder="🔍 Search by description or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="filter-select"
          >
            <option value="all">💱 All Currencies</option>
            {currencies.map(curr => (
              <option key={curr} value={curr}>{curr}</option>
            ))}
          </select>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">📂 All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-row">
          <div className="date-filter">
            <label>From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
          </div>
          
          <div className="date-filter">
            <label>To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
          </div>
          
          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn-clear-filters">
              ✖ Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <span>
          Showing {paginatedExpenses.length} of {filteredExpenses.length} expenses
          {hasActiveFilters && ` (filtered from ${expenses.length} total)`}
        </span>
      </div>

      {/* Bulk Actions Bar */}
      {selectedExpenses.length > 0 && (
        <div className="bulk-actions-bar">
          <span className="bulk-selected-count">
            {selectedExpenses.length} expense{selectedExpenses.length > 1 ? 's' : ''} selected
          </span>
          <button
            className="btn-bulk-delete"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${selectedExpenses.length} expense(s)? This action cannot be undone.`)) {
                handleBulkDelete();
              }
            }}
          >
            🗑️ Delete Selected
          </button>
          <button
            className="btn-bulk-clear"
            onClick={() => setSelectedExpenses([])}
          >
            ✖ Clear Selection
          </button>
        </div>
      )}

      {/* Table */}
      {filteredExpenses.length === 0 ? (
        <div className="no-expenses">
          <div className="no-expenses-icon">📭</div>
          <h3>{expenses.length === 0 ? 'No expenses recorded yet' : 'No expenses match your filters'}</h3>
          <p>{expenses.length === 0 ? 'Start adding expenses to track your spending' : 'Try adjusting your search criteria'}</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th className="col-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedExpenses.length === paginatedExpenses.length && paginatedExpenses.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedExpenses(paginatedExpenses.map(exp => exp.id));
                        } else {
                          setSelectedExpenses([]);
                        }
                      }}
                      title="Select all on this page"
                    />
                  </th>
                  <th className="col-icon"></th>
                  <th className="col-date">Date</th>
                  <th className="col-category">Category</th>
                  <th className="col-description">Description</th>
                  <th className="col-method">Payment Method</th>
                  <th className="col-amount">Amount</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedExpenses.map((expense) => (
                  <tr key={expense.id} className={`expense-row ${selectedExpenses.includes(expense.id) ? 'selected' : ''}`}>
                    <td className="col-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedExpenses.includes(expense.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedExpenses([...selectedExpenses, expense.id]);
                          } else {
                            setSelectedExpenses(selectedExpenses.filter(id => id !== expense.id));
                          }
                        }}
                      />
                    </td>
                    <td className="col-icon">
                      <span className="category-icon">
                        {getCategoryIcon(expense.category)}
                      </span>
                    </td>
                    <td className="col-date">
                      {new Date(expense.date || expense.timestamp).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="col-category">
                      <span className="category-badge">{expense.category}</span>
                    </td>
                    <td className="col-description">
                      <div className="description-cell">
                        <span className="description-text">{expense.description}</span>
                        {expense.imported && (
                          <span className="imported-badge" title="Imported from bank statement">
                            📥 Imported
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="col-method">
                      {expense.paymentMethod || 'N/A'}
                    </td>
                    <td className="col-amount">
                      <div className="amount-cell">
                        <div className="amount-primary">
                          {getCurrencySymbol(expense.currency || 'INR')} {expense.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                        {expense.currency && expense.currency !== 'INR' && (
                          <div className="amount-converted">
                            ≈ ₹ {convertToINR(expense.amount, expense.currency).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="col-actions">
                      <button
                        onClick={() => handleDeleteClick(expense)}
                        className="btn-delete"
                        title="Delete expense"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="btn-page"
              >
                « First
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn-page"
              >
                ‹ Previous
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`btn-page ${currentPage === pageNum ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="btn-page"
              >
                Next ›
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="btn-page"
              >
                Last »
              </button>
              
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>🗑️ Delete Expense</h3>
            <p>Are you sure you want to delete this expense?</p>
            <div className="expense-details-modal">
              <p><strong>Description:</strong> {deleteModal.expense.description}</p>
              <p><strong>Amount:</strong> {deleteModal.expense.currency || 'INR'} {deleteModal.expense.amount}</p>
              <p><strong>Category:</strong> {deleteModal.expense.category}</p>
              <p><strong>Date:</strong> {new Date(deleteModal.expense.date || deleteModal.expense.timestamp).toLocaleDateString()}</p>
            </div>
            <div className="modal-actions">
              <button onClick={handleDeleteCancel} className="btn-cancel">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="btn-confirm-delete">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpenseList;
