import React, { useState, useEffect } from 'react';
import { addRecord, getAllRecords, updateRecord, deleteRecord } from '../db';
import { currencyService } from '../services/currencyService';
import { getCurrencySymbol } from '../utils/currencies';
import toast from 'react-hot-toast';
import './AccountsManager.css';

const ACCOUNT_TYPES = {
  bank: { label: 'Bank Account', icon: '🏦', color: '#3b82f6' },
  savings: { label: 'Savings Account', icon: '💰', color: '#10b981' },
  credit: { label: 'Credit Card', icon: '💳', color: '#ef4444' },
  cash: { label: 'Cash', icon: '💵', color: '#f59e0b' },
  wallet: { label: 'Digital Wallet', icon: '📱', color: '#8b5cf6' }
};

function AccountsManager() {
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [totalBalanceINR, setTotalBalanceINR] = useState(0);
  const [isConvertingBalances, setIsConvertingBalances] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank',
    balance: '',
    currency: 'INR',
    accountNumber: '',
    bankName: '',
    creditLimit: '',
    notes: ''
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showForm]);

  const loadAccounts = async () => {
    try {
      const data = await getAllRecords('accounts');
      setAccounts(data);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Failed to load accounts');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.balance) {
      toast.error('Please fill required fields');
      return;
    }

    const accountData = {
      ...formData,
      balance: parseFloat(formData.balance),
      creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : 0,
      updatedAt: new Date().toISOString()
    };

    // Only set createdAt for new records
    if (!editingId) {
      accountData.createdAt = new Date().toISOString();
    }

    try {
      if (editingId) {
        // Include the id in the record for updating
        accountData.id = editingId;
        await updateRecord('accounts', accountData);
        toast.success('Account updated successfully');
      } else {
        await addRecord('accounts', accountData);
        toast.success('Account added successfully');
      }
      
      resetForm();
      loadAccounts();
    } catch (error) {
      console.error('Error saving account:', error);
      toast.error('Failed to save account');
    }
  };

  const handleEdit = (account) => {
    // Exclude id from formData to avoid overwriting it
    const { id, ...accountData } = account;
    setFormData(accountData);
    setEditingId(id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteRecord('accounts', id);
        toast.success('Account deleted successfully');
        loadAccounts();
      } catch (error) {
        console.error('Error deleting account:', error);
        toast.error('Failed to delete account');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'bank',
      balance: '',
      currency: 'INR',
      accountNumber: '',
      bankName: '',
      creditLimit: '',
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Calculate total balance with live currency conversion
  useEffect(() => {
    const calculateTotalBalanceWithConversion = async () => {
      if (accounts.length === 0) {
        setTotalBalanceINR(0);
        return;
      }

      setIsConvertingBalances(true);
      let total = 0;

      for (const account of accounts) {
        if (account.type === 'credit') continue; // Skip credit cards
        
        if (account.currency === 'INR') {
          total += account.balance;
        } else {
          try {
            const rateResult = await currencyService.getExchangeRate(account.currency, 'INR');
            const converted = currencyService.convert(account.balance, rateResult.rate);
            total += converted;
          } catch (error) {
            console.error(`Failed to convert ${account.currency}:`, error);
            // Fallback to approximate conversion
            total += account.balance * 83; // Approximate fallback
          }
        }
      }

      setTotalBalanceINR(total);
      setIsConvertingBalances(false);
    };

    calculateTotalBalanceWithConversion();
  }, [accounts]);

  const getTotalBalance = () => {
    return totalBalanceINR;
  };

  const getTotalDebt = () => {
    return accounts
      .filter(acc => acc.type === 'credit')
      .reduce((sum, acc) => sum + (acc.creditLimit - acc.balance), 0);
  };

  return (
    <div className="accounts-manager">
      <div className="accounts-header">
        <h1>💼 Accounts Manager</h1>
        <button 
          className="add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Account'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card total-assets">
          <div className="summary-icon">💰</div>
          <div className="summary-info">
            <div className="summary-label">Total Assets</div>
            <div className="summary-value">₹{getTotalBalance().toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
          </div>
        </div>
        <div className="summary-card total-accounts">
          <div className="summary-icon">📊</div>
          <div className="summary-info">
            <div className="summary-label">Total Accounts</div>
            <div className="summary-value">{accounts.length}</div>
          </div>
        </div>
        <div className="summary-card total-debt">
          <div className="summary-icon">💳</div>
          <div className="summary-info">
            <div className="summary-label">Credit Card Debt</div>
            <div className="summary-value">₹{getTotalDebt().toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content account-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Account' : 'Add New Account'}</h2>
              <button type="button" className="modal-close" onClick={resetForm}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Account Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  {Object.entries(ACCOUNT_TYPES).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.icon} {val.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Account Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., HDFC Salary Account"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{formData.type === 'credit' ? 'Available Credit' : 'Current Balance'} *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
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
            </div>

            {formData.type !== 'cash' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="e.g., HDFC Bank"
                  />
                </div>

                <div className="form-group">
                  <label>Account Number (Last 4 digits)</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="XXXX1234"
                    maxLength="4"
                  />
                </div>
              </div>
            )}

            {formData.type === 'credit' && (
              <div className="form-group">
                <label>Credit Limit</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  placeholder="Total credit limit"
                />
              </div>
            )}

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows="2"
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? 'Update Account' : 'Add Account'}
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* Accounts List */}
      <div className="accounts-grid">
        {accounts.map((account) => {
          const accountType = ACCOUNT_TYPES[account.type];
          const isCredit = account.type === 'credit';
          const usedCredit = isCredit ? account.creditLimit - account.balance : 0;
          const creditUtilization = isCredit && account.creditLimit > 0 
            ? ((usedCredit / account.creditLimit) * 100).toFixed(1) 
            : 0;

          return (
            <div 
              key={account.id} 
              className="account-card"
              style={{ borderLeftColor: accountType.color }}
            >
              <div className="account-header">
                <div className="account-icon" style={{ backgroundColor: accountType.color + '20', color: accountType.color }}>
                  {accountType.icon}
                </div>
                <div className="account-info">
                  <h3>{account.name}</h3>
                  <span className="account-type">{accountType.label}</span>
                </div>
                <div className="account-actions">
                  <button onClick={() => handleEdit(account)} className="btn-icon" title="Edit">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(account.id)} className="btn-icon" title="Delete">
                    🗑️
                  </button>
                </div>
              </div>

              <div className="account-balance">
                <div className="balance-label">
                  {isCredit ? 'Available Credit' : 'Current Balance'}
                </div>
                <div className="balance-amount">
                  {getCurrencySymbol(account.currency)}
                  {account.balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </div>

              {isCredit && account.creditLimit > 0 && (
                <div className="credit-usage">
                  <div className="credit-usage-header">
                    <span>Credit Used</span>
                    <span className={creditUtilization > 70 ? 'warning' : ''}>
                      {creditUtilization}%
                    </span>
                  </div>
                  <div className="credit-usage-bar">
                    <div 
                      className="credit-usage-fill"
                      style={{ 
                        width: `${creditUtilization}%`,
                        backgroundColor: creditUtilization > 70 ? '#ef4444' : '#3b82f6'
                      }}
                    />
                  </div>
                  <div className="credit-limit">
                    Limit: ₹{account.creditLimit.toLocaleString('en-IN')}
                  </div>
                </div>
              )}

              {account.bankName && (
                <div className="account-details">
                  <div className="detail-item">
                    <span className="detail-label">Bank:</span>
                    <span className="detail-value">{account.bankName}</span>
                  </div>
                  {account.accountNumber && (
                    <div className="detail-item">
                      <span className="detail-label">Account:</span>
                      <span className="detail-value">••••{account.accountNumber}</span>
                    </div>
                  )}
                </div>
              )}

              {account.notes && (
                <div className="account-notes">
                  📝 {account.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {accounts.length === 0 && !showForm && (
        <div className="empty-state">
          <div className="empty-icon">💼</div>
          <h3>No accounts yet</h3>
          <p>Add your bank accounts, credit cards, and wallets to track your finances</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Add Your First Account
          </button>
        </div>
      )}
    </div>
  );
}

export default AccountsManager;
