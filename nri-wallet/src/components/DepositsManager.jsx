import React, { useState, useEffect } from 'react';
import { addRecord, getAllRecords, updateRecord, deleteRecord } from '../db';
import toast from 'react-hot-toast';
import './DepositsManager.css';

const DEPOSIT_TYPES = {
  fd: { 
    label: 'Fixed Deposit', 
    icon: '🏦', 
    color: '#3b82f6',
    description: 'Bank Fixed Deposit'
  },
  rd: { 
    label: 'Recurring Deposit', 
    icon: '📅', 
    color: '#06b6d4',
    description: 'Monthly Recurring Deposit'
  },
  ppf: { 
    label: 'PPF', 
    icon: '🏛️', 
    color: '#10b981',
    description: 'Public Provident Fund (15 years)'
  },
  epf: { 
    label: 'EPF', 
    icon: '💼', 
    color: '#8b5cf6',
    description: 'Employee Provident Fund'
  },
  nps: { 
    label: 'NPS', 
    icon: '🎯', 
    color: '#f59e0b',
    description: 'National Pension System'
  },
  nsc: { 
    label: 'NSC', 
    icon: '📜', 
    color: '#14b8a6',
    description: 'National Savings Certificate'
  },
  kvp: { 
    label: 'KVP', 
    icon: '📝', 
    color: '#ec4899',
    description: 'Kisan Vikas Patra'
  },
  scss: { 
    label: 'SCSS', 
    icon: '👴', 
    color: '#f43f5e',
    description: 'Senior Citizen Savings Scheme'
  }
};

function DepositsManager() {
  const [deposits, setDeposits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'fd',
    accountName: '',
    institution: '',
    accountNumber: '',
    principalAmount: '',
    currentValue: '',
    interestRate: '',
    startDate: new Date().toISOString().split('T')[0],
    maturityDate: '',
    tenure: '',
    tenureUnit: 'years',
    monthlyContribution: '',
    autoRenewal: false,
    notes: ''
  });

  useEffect(() => {
    loadDeposits();
  }, []);

  const loadDeposits = async () => {
    try {
      const data = await getAllRecords('deposits');
      setDeposits(data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)));
    } catch (error) {
      console.error('Error loading deposits:', error);
      toast.error('Failed to load deposits');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.accountName || !formData.principalAmount) {
      toast.error('Please fill required fields');
      return;
    }

    const depositData = {
      ...formData,
      principalAmount: parseFloat(formData.principalAmount),
      currentValue: parseFloat(formData.currentValue || formData.principalAmount),
      interestRate: parseFloat(formData.interestRate || 0),
      monthlyContribution: parseFloat(formData.monthlyContribution || 0),
      tenure: parseInt(formData.tenure || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        depositData.id = editingId;
        await updateRecord('deposits', depositData);
        toast.success('Deposit updated successfully');
      } else {
        await addRecord('deposits', depositData);
        toast.success('Deposit added successfully');
      }
      
      resetForm();
      loadDeposits();
    } catch (error) {
      console.error('Error saving deposit:', error);
      toast.error('Failed to save deposit');
    }
  };

  const handleEdit = (deposit) => {
    setFormData({
      ...deposit,
      startDate: new Date(deposit.startDate).toISOString().split('T')[0],
      maturityDate: deposit.maturityDate ? new Date(deposit.maturityDate).toISOString().split('T')[0] : ''
    });
    setEditingId(deposit.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this deposit?')) {
      try {
        await deleteRecord('deposits', id);
        toast.success('Deposit deleted successfully');
        loadDeposits();
      } catch (error) {
        console.error('Error deleting deposit:', error);
        toast.error('Failed to delete deposit');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'fd',
      accountName: '',
      institution: '',
      accountNumber: '',
      principalAmount: '',
      currentValue: '',
      interestRate: '',
      startDate: new Date().toISOString().split('T')[0],
      maturityDate: '',
      tenure: '',
      tenureUnit: 'years',
      monthlyContribution: '',
      autoRenewal: false,
      notes: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getTotalInvested = () => {
    return deposits.reduce((sum, d) => sum + d.principalAmount, 0);
  };

  const getTotalCurrentValue = () => {
    return deposits.reduce((sum, d) => sum + (d.currentValue || d.principalAmount), 0);
  };

  const getTotalGains = () => {
    return getTotalCurrentValue() - getTotalInvested();
  };

  const getReturnPercentage = () => {
    const invested = getTotalInvested();
    if (invested === 0) return 0;
    return ((getTotalGains() / invested) * 100).toFixed(2);
  };

  const calculateDaysToMaturity = (maturityDate) => {
    if (!maturityDate) return null;
    const today = new Date();
    const maturity = new Date(maturityDate);
    const diffTime = maturity - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="deposits-manager">
      <div className="deposits-header">
        <h1>🏦 Deposits & Savings</h1>
        <button 
          className="add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Deposit'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card total-invested">
          <div className="summary-icon">💰</div>
          <div className="summary-info">
            <div className="summary-label">Total Invested</div>
            <div className="summary-value">₹{getTotalInvested().toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
          </div>
        </div>
        <div className="summary-card current-value">
          <div className="summary-icon">📈</div>
          <div className="summary-info">
            <div className="summary-label">Current Value</div>
            <div className="summary-value">₹{getTotalCurrentValue().toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
          </div>
        </div>
        <div className="summary-card total-gains">
          <div className="summary-icon">🎯</div>
          <div className="summary-info">
            <div className="summary-label">Total Gains</div>
            <div className="summary-value gains">
              ₹{getTotalGains().toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              <span className="return-percentage">({getReturnPercentage()}%)</span>
            </div>
          </div>
        </div>
        <div className="summary-card total-count">
          <div className="summary-icon">📊</div>
          <div className="summary-info">
            <div className="summary-label">Active Deposits</div>
            <div className="summary-value">{deposits.length}</div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="deposit-form-card">
          <h2>{editingId ? 'Edit Deposit' : 'Add New Deposit'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Deposit Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  {Object.entries(DEPOSIT_TYPES).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.icon} {val.label} - {val.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Account Name *</label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="e.g., HDFC FD #1"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Bank/Institution *</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="e.g., HDFC Bank, SBI"
                  required
                />
              </div>

              <div className="form-group">
                <label>Account Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="Last 4 digits"
                  maxLength="4"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Principal Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.principalAmount}
                  onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                  placeholder="Initial investment"
                  required
                />
              </div>

              <div className="form-group">
                <label>Current Value</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                  placeholder="Current maturity value"
                />
              </div>

              <div className="form-group">
                <label>Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  placeholder="e.g., 7.5"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Maturity Date</label>
                <input
                  type="date"
                  value={formData.maturityDate}
                  onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Tenure</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    value={formData.tenure}
                    onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
                    placeholder="5"
                    style={{ flex: 2 }}
                  />
                  <select
                    value={formData.tenureUnit}
                    onChange={(e) => setFormData({ ...formData, tenureUnit: e.target.value })}
                    style={{ flex: 1 }}
                  >
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
            </div>

            {(formData.type === 'rd' || formData.type === 'ppf' || formData.type === 'nps') && (
              <div className="form-group">
                <label>Monthly Contribution</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthlyContribution}
                  onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
                  placeholder="Monthly deposit amount"
                />
              </div>
            )}

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.autoRenewal}
                  onChange={(e) => setFormData({ ...formData, autoRenewal: e.target.checked })}
                />
                <span>Auto-renewal enabled</span>
              </label>
            </div>

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
                {editingId ? 'Update Deposit' : 'Add Deposit'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Deposits Grid */}
      <div className="deposits-grid">
        {deposits.map((deposit) => {
          const depositType = DEPOSIT_TYPES[deposit.type];
          const gains = (deposit.currentValue || deposit.principalAmount) - deposit.principalAmount;
          const returnPercentage = deposit.principalAmount > 0 
            ? ((gains / deposit.principalAmount) * 100).toFixed(2) 
            : 0;
          const daysToMaturity = calculateDaysToMaturity(deposit.maturityDate);
          const isMaturing = daysToMaturity !== null && daysToMaturity <= 30 && daysToMaturity >= 0;
          const isMatured = daysToMaturity !== null && daysToMaturity < 0;

          return (
            <div 
              key={deposit.id} 
              className="deposit-card"
              style={{ borderLeftColor: depositType.color }}
            >
              <div className="deposit-header">
                <div className="deposit-icon" style={{ backgroundColor: depositType.color + '20', color: depositType.color }}>
                  {depositType.icon}
                </div>
                <div className="deposit-info">
                  <h3>{deposit.accountName}</h3>
                  <span className="deposit-type">{depositType.label}</span>
                </div>
                <div className="deposit-actions">
                  <button onClick={() => handleEdit(deposit)} className="btn-icon" title="Edit">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(deposit.id)} className="btn-icon" title="Delete">
                    🗑️
                  </button>
                </div>
              </div>

              <div className="deposit-amounts">
                <div className="amount-item">
                  <div className="amount-label">Invested</div>
                  <div className="amount-value">₹{deposit.principalAmount.toLocaleString('en-IN')}</div>
                </div>
                <div className="amount-item">
                  <div className="amount-label">Current Value</div>
                  <div className="amount-value current">
                    ₹{(deposit.currentValue || deposit.principalAmount).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {gains !== 0 && (
                <div className="deposit-gains">
                  <div className={`gains-value ${gains >= 0 ? 'positive' : 'negative'}`}>
                    {gains >= 0 ? '↑' : '↓'} ₹{Math.abs(gains).toLocaleString('en-IN')} ({returnPercentage}%)
                  </div>
                </div>
              )}

              <div className="deposit-details">
                <div className="detail-row">
                  <span className="detail-label">Bank:</span>
                  <span className="detail-value">{deposit.institution}</span>
                </div>
                {deposit.interestRate > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Interest Rate:</span>
                    <span className="detail-value">{deposit.interestRate}% p.a.</span>
                  </div>
                )}
                {deposit.tenure > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Tenure:</span>
                    <span className="detail-value">{deposit.tenure} {deposit.tenureUnit}</span>
                  </div>
                )}
                {deposit.monthlyContribution > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Monthly:</span>
                    <span className="detail-value">₹{deposit.monthlyContribution.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">Start Date:</span>
                  <span className="detail-value">
                    {new Date(deposit.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {deposit.maturityDate && (
                  <div className="detail-row">
                    <span className="detail-label">Maturity:</span>
                    <span className="detail-value">
                      {new Date(deposit.maturityDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>

              {(isMaturing || isMatured) && (
                <div className={`maturity-alert ${isMatured ? 'matured' : 'maturing'}`}>
                  {isMatured ? '✅ Matured' : `⚠️ Maturing in ${daysToMaturity} days`}
                </div>
              )}

              {deposit.autoRenewal && (
                <div className="auto-renewal-badge">
                  🔄 Auto-renewal
                </div>
              )}

              {deposit.notes && (
                <div className="deposit-notes">
                  📝 {deposit.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {deposits.length === 0 && !showForm && (
        <div className="empty-state">
          <div className="empty-icon">🏦</div>
          <h3>No deposits yet</h3>
          <p>Add your FDs, PPF, EPF, NPS, and other savings to track your long-term wealth</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Add Your First Deposit
          </button>
        </div>
      )}
    </div>
  );
}

export default DepositsManager;
