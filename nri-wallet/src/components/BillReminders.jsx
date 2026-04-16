import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { getAllRecords, addRecord, deleteRecord, updateRecord } from '../db';
import { SearchBar } from './ui';
import './BillReminders.css';

function BillReminders() {
  const [bills, setBills] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showBillForm, setShowBillForm] = useState(false);
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [activeTab, setActiveTab] = useState('bills'); // 'bills' | 'recurring' | 'subscriptions'
  const [searchTerm, setSearchTerm] = useState(''); // Internal search state

  const [billFormData, setBillFormData] = useState({
    billName: '',
    amount: '',
    dueDate: '',
    category: 'Utilities',
    recurringType: 'monthly',
    isPaid: false,
    notes: ''
  });

  const [recurringFormData, setRecurringFormData] = useState({
    name: '',
    amount: '',
    category: 'Food & Dining',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    nextDate: new Date().toISOString().split('T')[0],
    isActive: true,
    autoGenerate: true
  });

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
    'Subscription',
    'Other'
  ];

  useEffect(() => {
    loadData();
    // Check for due bills on load
    checkDueBills();
  }, []);

  const loadData = async () => {
    try {
      const [billsData, recurringData, expensesData] = await Promise.all([
        getAllRecords('billReminders'),
        getAllRecords('recurringTransactions'),
        getAllRecords('expenses')
      ]);

      setBills(billsData);
      setRecurringTransactions(recurringData);
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const checkDueBills = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const billsData = await getAllRecords('billReminders');
    const dueBills = billsData.filter(bill => {
      const dueDate = new Date(bill.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      return !bill.isPaid && daysUntilDue <= 3 && daysUntilDue >= 0;
    });

    if (dueBills.length > 0) {
      // Show notification for due bills
      const message = dueBills.length === 1
        ? `Reminder: ${dueBills[0].billName} is due soon!`
        : `You have ${dueBills.length} bills due soon!`;
      
      console.log('📅 Bill Reminder:', message);
      // In production, trigger actual notifications
    }
  };

  const handleBillSubmit = async (e) => {
    e.preventDefault();

    const bill = {
      ...billFormData,
      amount: parseFloat(billFormData.amount),
      createdAt: new Date().toISOString()
    };

    try {
      if (editingBill) {
        await updateRecord('billReminders', { ...bill, id: editingBill.id });
        alert('Bill updated successfully!');
        setEditingBill(null);
      } else {
        await addRecord('billReminders', bill);
        alert('Bill added successfully!');
      }

      resetBillForm();
      loadData();
    } catch (error) {
      alert('Error saving bill: ' + error.message);
    }
  };

  const handleRecurringSubmit = async (e) => {
    e.preventDefault();

    const recurring = {
      ...recurringFormData,
      amount: parseFloat(recurringFormData.amount),
      createdAt: new Date().toISOString()
    };

    try {
      if (editingRecurring) {
        await updateRecord('recurringTransactions', { ...recurring, id: editingRecurring.id });
        alert('Recurring transaction updated!');
        setEditingRecurring(null);
      } else {
        await addRecord('recurringTransactions', recurring);
        alert('Recurring transaction created!');
      }

      resetRecurringForm();
      loadData();
    } catch (error) {
      alert('Error saving recurring transaction: ' + error.message);
    }
  };

  const markBillAsPaid = async (bill) => {
    try {
      await updateRecord('billReminders', { ...bill, isPaid: true, paidDate: new Date().toISOString() });
      
      // If recurring, create next bill
      if (bill.recurringType !== 'once') {
        const nextDueDate = calculateNextDueDate(bill.dueDate, bill.recurringType);
        const nextBill = {
          ...bill,
          dueDate: nextDueDate,
          isPaid: false,
          createdAt: new Date().toISOString()
        };
        delete nextBill.id;
        delete nextBill.paidDate;
        await addRecord('billReminders', nextBill);
      }

      loadData();
    } catch (error) {
      alert('Error marking bill as paid: ' + error.message);
    }
  };

  // Memoized date calculation function
  const calculateNextDueDate = useCallback((currentDate, frequency) => {
    const date = new Date(currentDate);
    switch (frequency) {
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        break;
    }
    return date.toISOString().split('T')[0];
  }, []);

  const deleteBill = async (id) => {
    if (window.confirm('Delete this bill?')) {
      try {
        await deleteRecord('billReminders', id);
        loadData();
      } catch (error) {
        alert('Error deleting bill: ' + error.message);
      }
    }
  };

  const deleteRecurring = async (id) => {
    if (window.confirm('Delete this recurring transaction?')) {
      try {
        await deleteRecord('recurringTransactions', id);
        loadData();
      } catch (error) {
        alert('Error deleting transaction: ' + error.message);
      }
    }
  };

  const resetBillForm = () => {
    setBillFormData({
      billName: '',
      amount: '',
      dueDate: '',
      category: 'Utilities',
      recurringType: 'monthly',
      isPaid: false,
      notes: ''
    });
    setShowBillForm(false);
    setEditingBill(null);
  };

  const resetRecurringForm = () => {
    setRecurringFormData({
      name: '',
      amount: '',
      category: 'Food & Dining',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      nextDate: new Date().toISOString().split('T')[0],
      isActive: true,
      autoGenerate: true
    });
    setShowRecurringForm(false);
    setEditingRecurring(null);
  };

  // Memoized getDaysUntilDue function
  const getDaysUntilDue = useCallback((dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, []);

  // Memoized status helper functions
  const getStatusColor = useCallback((bill) => {
    if (bill.isPaid) return '#52B788';
    const daysUntil = getDaysUntilDue(bill.dueDate);
    if (daysUntil < 0) return '#FF6B6B'; // Overdue
    if (daysUntil <= 3) return '#F7DC6F'; // Due soon
    return '#667eea'; // Upcoming
  }, [getDaysUntilDue]);

  const getStatusText = useCallback((bill) => {
    if (bill.isPaid) return 'Paid ✓';
    const daysUntil = getDaysUntilDue(bill.dueDate);
    if (daysUntil < 0) return `Overdue by ${Math.abs(daysUntil)} days`;
    if (daysUntil === 0) return 'Due Today!';
    if (daysUntil === 1) return 'Due Tomorrow';
    if (daysUntil <= 3) return `Due in ${daysUntil} days`;
    return `Due in ${daysUntil} days`;
  }, [getDaysUntilDue]);

  // Calculate total monthly subscriptions
  const monthlySubscriptionTotal = recurringTransactions
    .filter(r => r.frequency === 'monthly' && r.isActive)
    .reduce((sum, r) => sum + r.amount, 0);

  // Calculate upcoming bills this month
  const upcomingBillsTotal = bills
    .filter(b => !b.isPaid && new Date(b.dueDate).getMonth() === new Date().getMonth())
    .reduce((sum, b) => sum + b.amount, 0);

  // Memoized filtered bills with search
  const filteredBills = useMemo(() => {
    if (!searchTerm) return bills;
    
    const search = searchTerm.toLowerCase();
    return bills.filter(bill => 
      bill.billName?.toLowerCase().includes(search) ||
      bill.category?.toLowerCase().includes(search) ||
      bill.notes?.toLowerCase().includes(search)
    );
  }, [bills, searchTerm]);

  // Memoized filtered recurring transactions with search
  const filteredRecurring = useMemo(() => {
    if (!searchTerm) return recurringTransactions;
    
    const search = searchTerm.toLowerCase();
    return recurringTransactions.filter(rec => 
      rec.name?.toLowerCase().includes(search) ||
      rec.category?.toLowerCase().includes(search)
    );
  }, [recurringTransactions, searchTerm]);

  // Sort bills by due date
  const sortedBills = useMemo(() => 
    [...filteredBills].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  , [filteredBills]);
  
  // Filter bills by status
  const unpaidBills = useMemo(() => sortedBills.filter(b => !b.isPaid), [sortedBills]);
  const paidBills = useMemo(() => sortedBills.filter(b => b.isPaid), [sortedBills]);
  const overdueBills = useMemo(() => 
    unpaidBills.filter(b => getDaysUntilDue(b.dueDate) < 0)
  , [unpaidBills, getDaysUntilDue]);
  const upcomingBills = useMemo(() => 
    unpaidBills.filter(b => getDaysUntilDue(b.dueDate) >= 0)
  , [unpaidBills, getDaysUntilDue]);

  // Memoized subscription breakdown
  const subscriptionsByCategory = useMemo(() => 
    filteredRecurring
      .filter(r => r.isActive)
      .reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + r.amount;
        return acc;
      }, {})
  , [filteredRecurring]);

  const subscriptionChartData = useMemo(() => 
    Object.entries(subscriptionsByCategory).map(([name, value]) => ({
      name,
      value: Math.round(value)
    }))
  , [subscriptionsByCategory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      className="bill-reminders"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div className="reminders-header" variants={itemVariants}>
        <div className="header-content">
          <h2>📅 Bills & Recurring Transactions</h2>
          <p className="subtitle">Never miss a payment with smart reminders</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowBillForm(!showBillForm)} className="btn-primary">
            {showBillForm ? '✕ Cancel' : '+ Add Bill'}
          </button>
          <button onClick={() => setShowRecurringForm(!showRecurringForm)} className="btn-secondary">
            {showRecurringForm ? '✕ Cancel' : '+ Add Recurring'}
          </button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div className="quick-overview" variants={itemVariants}>
        <div className="overview-card red">
          <div className="overview-icon">⚠️</div>
          <div className="overview-content">
            <div className="overview-label">Overdue Bills</div>
            <div className="overview-value">{overdueBills.length}</div>
          </div>
        </div>

        <div className="overview-card yellow">
          <div className="overview-icon">📅</div>
          <div className="overview-content">
            <div className="overview-label">Upcoming This Month</div>
            <div className="overview-value">₹{upcomingBillsTotal.toLocaleString()}</div>
          </div>
        </div>

        <div className="overview-card blue">
          <div className="overview-icon">🔄</div>
          <div className="overview-content">
            <div className="overview-label">Monthly Subscriptions</div>
            <div className="overview-value">₹{monthlySubscriptionTotal.toLocaleString()}</div>
          </div>
        </div>

        <div className="overview-card green">
          <div className="overview-icon">✅</div>
          <div className="overview-content">
            <div className="overview-label">Paid This Month</div>
            <div className="overview-value">{paidBills.filter(b => new Date(b.paidDate).getMonth() === new Date().getMonth()).length}</div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div className="tabs-container" variants={itemVariants}>
        <button
          className={`tab-button ${activeTab === 'bills' ? 'active' : ''}`}
          onClick={() => setActiveTab('bills')}
        >
          💳 Bills ({unpaidBills.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'recurring' ? 'active' : ''}`}
          onClick={() => setActiveTab('recurring')}
        >
          🔄 Recurring ({filteredRecurring.filter(r => r.isActive).length})
        </button>
        <button
          className={`tab-button ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          📺 Subscriptions
        </button>
      </motion.div>

      {/* Search Bar */}
      {(activeTab === 'bills' || activeTab === 'recurring') && (
        <motion.div variants={itemVariants} style={{ marginBottom: '1.5rem' }}>
          <SearchBar
            onSearch={setSearchTerm}
            placeholder={`Search ${activeTab === 'bills' ? 'bills' : 'recurring transactions'}...`}
            debounceDelay={300}
          />
        </motion.div>
      )}

      {/* Bill Form */}
      <AnimatePresence>
        {showBillForm && (
          <motion.div
            className="form-container"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleBillSubmit} className="reminder-form">
              <h3>{editingBill ? 'Edit Bill' : 'Add New Bill'}</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Bill Name</label>
                  <input
                    type="text"
                    value={billFormData.billName}
                    onChange={(e) => setBillFormData({ ...billFormData, billName: e.target.value })}
                    placeholder="e.g., Electricity Bill"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    value={billFormData.amount}
                    onChange={(e) => setBillFormData({ ...billFormData, amount: e.target.value })}
                    placeholder="e.g., 3500"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={billFormData.dueDate}
                    onChange={(e) => setBillFormData({ ...billFormData, dueDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={billFormData.category}
                    onChange={(e) => setBillFormData({ ...billFormData, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Recurring Type</label>
                  <select
                    value={billFormData.recurringType}
                    onChange={(e) => setBillFormData({ ...billFormData, recurringType: e.target.value })}
                  >
                    <option value="once">One-time</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <input
                    type="text"
                    value={billFormData.notes}
                    onChange={(e) => setBillFormData({ ...billFormData, notes: e.target.value })}
                    placeholder="Optional notes"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingBill ? 'Update Bill' : 'Add Bill'}
                </button>
                <button type="button" onClick={resetBillForm} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recurring Transaction Form */}
      <AnimatePresence>
        {showRecurringForm && (
          <motion.div
            className="form-container"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleRecurringSubmit} className="reminder-form">
              <h3>{editingRecurring ? 'Edit Recurring Transaction' : 'Create Recurring Transaction'}</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Transaction Name</label>
                  <input
                    type="text"
                    value={recurringFormData.name}
                    onChange={(e) => setRecurringFormData({ ...recurringFormData, name: e.target.value })}
                    placeholder="e.g., Netflix Subscription"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    value={recurringFormData.amount}
                    onChange={(e) => setRecurringFormData({ ...recurringFormData, amount: e.target.value })}
                    placeholder="e.g., 799"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={recurringFormData.category}
                    onChange={(e) => setRecurringFormData({ ...recurringFormData, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Frequency</label>
                  <select
                    value={recurringFormData.frequency}
                    onChange={(e) => setRecurringFormData({ ...recurringFormData, frequency: e.target.value })}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={recurringFormData.startDate}
                    onChange={(e) => setRecurringFormData({ ...recurringFormData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={recurringFormData.autoGenerate}
                      onChange={(e) => setRecurringFormData({ ...recurringFormData, autoGenerate: e.target.checked })}
                    />
                    <span>Auto-generate expenses</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingRecurring ? 'Update Transaction' : 'Create Transaction'}
                </button>
                <button type="button" onClick={resetRecurringForm} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Based on Active Tab */}
      {activeTab === 'bills' && (
        <motion.div className="bills-section" variants={itemVariants}>
          {unpaidBills.length === 0 && paidBills.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h4>No bills added yet</h4>
              <p>Add your first bill to track payments and get reminders</p>
              <button onClick={() => setShowBillForm(true)} className="btn-primary">
                Add Bill
              </button>
            </div>
          ) : (
            <>
              {unpaidBills.length > 0 && (
                <div className="bills-category">
                  <h3>Upcoming Bills ({unpaidBills.length})</h3>
                  <div className="bills-grid">
                    {upcomingBills.map((bill, index) => (
                      <motion.div
                        key={bill.id}
                        className="bill-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
                        style={{ borderLeftColor: getStatusColor(bill) }}
                      >
                        <div className="bill-header">
                          <h4>{bill.billName}</h4>
                          <span className="bill-amount">₹{bill.amount.toLocaleString()}</span>
                        </div>

                        <div className="bill-details">
                          <div className="detail-row">
                            <span className="detail-label">Due Date:</span>
                            <span className="detail-value">{new Date(bill.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Category:</span>
                            <span className="detail-value">{bill.category}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Status:</span>
                            <span className="detail-value status" style={{ color: getStatusColor(bill) }}>
                              {getStatusText(bill)}
                            </span>
                          </div>
                          {bill.notes && (
                            <div className="detail-row">
                              <span className="detail-label">Notes:</span>
                              <span className="detail-value">{bill.notes}</span>
                            </div>
                          )}
                        </div>

                        <div className="bill-actions">
                          <button onClick={() => markBillAsPaid(bill)} className="btn-pay">
                            Mark as Paid
                          </button>
                          <button onClick={() => deleteBill(bill.id)} className="btn-delete-small">
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {overdueBills.length > 0 && (
                <div className="bills-category">
                  <h3>⚠️ Overdue Bills ({overdueBills.length})</h3>
                  <div className="bills-grid">
                    {overdueBills.map((bill, index) => (
                      <motion.div
                        key={bill.id}
                        className="bill-card overdue"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(255,107,107,0.3)' }}
                      >
                        <div className="bill-header">
                          <h4>{bill.billName}</h4>
                          <span className="bill-amount">₹{bill.amount.toLocaleString()}</span>
                        </div>

                        <div className="bill-details">
                          <div className="detail-row">
                            <span className="detail-label">Due Date:</span>
                            <span className="detail-value">{new Date(bill.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Status:</span>
                            <span className="detail-value status overdue-text">
                              {getStatusText(bill)} 🚨
                            </span>
                          </div>
                        </div>

                        <div className="bill-actions">
                          <button onClick={() => markBillAsPaid(bill)} className="btn-pay">
                            Pay Now
                          </button>
                          <button onClick={() => deleteBill(bill.id)} className="btn-delete-small">
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      {activeTab === 'recurring' && (
        <motion.div className="recurring-section" variants={itemVariants}>
          {filteredRecurring.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔄</div>
              <h4>{searchTerm ? 'No matching recurring transactions' : 'No recurring transactions yet'}</h4>
              <p>{searchTerm ? 'Try adjusting your search' : 'Set up automatic transaction tracking for subscriptions and regular expenses'}</p>
              {!searchTerm && (
                <button onClick={() => setShowRecurringForm(true)} className="btn-primary">
                  Add Recurring Transaction
                </button>
              )}
            </div>
          ) : (
            <div className="recurring-grid">
              {filteredRecurring.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  className={`recurring-card ${!rec.isActive ? 'inactive' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
                >
                  <div className="recurring-header">
                    <h4>{rec.name}</h4>
                    <span className="recurring-badge">{rec.frequency}</span>
                  </div>

                  <div className="recurring-amount">
                    ₹{rec.amount.toLocaleString()}
                    <span className="per-period">/ {rec.frequency}</span>
                  </div>

                  <div className="recurring-details">
                    <div className="detail-row">
                      <span>Category:</span>
                      <span>{rec.category}</span>
                    </div>
                    <div className="detail-row">
                      <span>Next Date:</span>
                      <span>{new Date(rec.nextDate).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-row">
                      <span>Status:</span>
                      <span className={rec.isActive ? 'active-status' : 'inactive-status'}>
                        {rec.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </div>

                  <div className="recurring-actions">
                    <button onClick={() => deleteRecurring(rec.id)} className="btn-delete-small">
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'subscriptions' && (
        <motion.div className="subscriptions-section" variants={itemVariants}>
          <div className="subscription-overview">
            <div className="overview-card-large">
              <h3>💰 Total Monthly Subscriptions</h3>
              <div className="large-amount">₹{monthlySubscriptionTotal.toLocaleString()}</div>
              <p className="overview-description">
                You're spending ₹{(monthlySubscriptionTotal * 12).toLocaleString()} per year on subscriptions
              </p>
            </div>
          </div>

          {subscriptionChartData.length > 0 && (
            <div className="subscription-chart">
              <h3>Subscription Breakdown by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={subscriptionChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {subscriptionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#667eea', '#52B788', '#F7DC6F', '#FF6B6B', '#4ECDC4'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="subscription-list">
            <h3>Active Subscriptions</h3>
            {recurringTransactions.filter(r => r.isActive && r.frequency === 'monthly').length === 0 ? (
              <p className="no-data">No monthly subscriptions tracked yet</p>
            ) : (
              <div className="subscription-items">
                {recurringTransactions
                  .filter(r => r.isActive && r.frequency === 'monthly')
                  .map(sub => (
                    <div key={sub.id} className="subscription-item">
                      <div className="sub-info">
                        <h4>{sub.name}</h4>
                        <p>{sub.category}</p>
                      </div>
                      <div className="sub-amount">
                        ₹{sub.amount.toLocaleString()}/month
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default BillReminders;
