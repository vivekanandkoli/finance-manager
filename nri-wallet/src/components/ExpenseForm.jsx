import React, { useState, useEffect } from 'react';
import { addRecord } from '../db';
import { categorizationService } from '../services/categorizationService';
import { useDebounce } from '../hooks/useDebounce';
import './ExpenseForm.css';

const EXPENSE_CATEGORIES = [
  { value: 'Food & Dining', icon: '🍽️' },
  { value: 'Transportation', icon: '🚗' },
  { value: 'Utilities', icon: '💡' },
  { value: 'Rent', icon: '🏠' },
  { value: 'Shopping', icon: '🛍️' },
  { value: 'Entertainment', icon: '🎬' },
  { value: 'Healthcare', icon: '🏥' },
  { value: 'Insurance', icon: '🛡️' },
  { value: 'EMI/Loan', icon: '💳' },
  { value: 'Investment', icon: '📈' },
  { value: 'Other', icon: '📦' }
];

const PAYMENT_MODES = [
  { value: 'Cash', icon: '💵' },
  { value: 'Credit Card', icon: '💳' },
  { value: 'Debit Card', icon: '💳' },
  { value: 'Bank Transfer', icon: '🏦' },
  { value: 'UPI', icon: '📱' }
];

function ExpenseForm({ onExpenseAdded }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    currency: 'INR',
    category: 'Food & Dining',
    description: '',
    paymentMethod: 'UPI'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [autoCategorizationEnabled, setAutoCategorizationEnabled] = useState(true);
  const [aiPrediction, setAiPrediction] = useState(null);

  const debouncedDescription = useDebounce(formData.description, 500);

  // Initialize ML model on mount
  useEffect(() => {
    categorizationService.trainFromHistory().then(success => {
      if (success) {
        console.log('✅ Auto-categorization ready!');
      }
    });
  }, []);

  // Auto-categorize when description changes
  useEffect(() => {
    if (autoCategorizationEnabled && debouncedDescription.length > 2) {
      predictCategory();
    }
  }, [debouncedDescription, formData.amount]);

  const predictCategory = async () => {
    try {
      const prediction = await categorizationService.predictCategory(
        formData.description,
        formData.amount
      );

      if (prediction.confidence > 0.6) {
        setAiPrediction(prediction);
        // Auto-apply if high confidence
        if (prediction.confidence > 0.85 && formData.category === 'Food & Dining') {
          setFormData(prev => ({ ...prev, category: prediction.category }));
        }
      }

      // Get top 3 suggestions
      const topSuggestions = await categorizationService.getSuggestions(formData.description);
      setSuggestions(topSuggestions);
      setShowSuggestions(topSuggestions.length > 0);
    } catch (error) {
      console.error('Prediction error:', error);
    }
  };

  const applySuggestion = (category) => {
    setFormData(prev => ({ ...prev, category }));
    setShowSuggestions(false);
    setAiPrediction(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const expense = {
      ...formData,
      amount: parseFloat(formData.amount),
      timestamp: new Date().toISOString(),
      autoCategorized: aiPrediction?.method || null,
    };

    try {
      await addRecord('expenses', expense);
      
      // Learn from user's final choice if it differs from AI prediction
      if (aiPrediction && aiPrediction.category !== formData.category) {
        await categorizationService.learnFromCorrection(
          formData.description,
          formData.category
        );
      }

      setSuccess(true);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        currency: 'INR',
        category: 'Food & Dining',
        description: '',
        paymentMethod: 'UPI'
      });
      setAiPrediction(null);
      setSuggestions([]);
      setShowSuggestions(false);
      
      if (onExpenseAdded) onExpenseAdded();
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Error adding expense: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear AI prediction when user manually changes category
    if (name === 'category') {
      setAiPrediction(null);
      setShowSuggestions(false);
    }
  };

  const getCategoryIcon = (category) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.value === category);
    return cat ? cat.icon : '📦';
  };

  return (
    <div className="expense-form-container">
      <div className="expense-form-header">
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>
            Add New Expense
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
            Track your spending and manage your finances
          </p>
        </div>
      </div>

      {success && (
        <div className="success-message">
          ✅ Expense added successfully!
        </div>
      )}

      {/* Auto-Categorization Toggle */}
      <div className="ai-settings-card">
        <label className="ai-toggle">
          <input
            type="checkbox"
            checked={autoCategorizationEnabled}
            onChange={(e) => setAutoCategorizationEnabled(e.target.checked)}
          />
          <span className="toggle-label">
            🤖 Smart Auto-Categorization 
            {categorizationService.isTrained && (
              <span className="badge badge-success">Active</span>
            )}
          </span>
        </label>
        <p className="ai-hint">AI suggests categories based on description</p>
      </div>

      <div className="expense-form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>
                <span className="label-icon">📅</span>
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>
                <span className="label-icon">💰</span>
                Amount
              </label>
              <div className="amount-input-group">
                <span className="currency-symbol">
                  {formData.currency === 'THB' ? '฿' : '₹'}
                </span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  className="form-input amount-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <span className="label-icon">💱</span>
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="form-select"
              >
                <option value="INR">INR (₹)</option>
                <option value="THB">THB (฿)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <span className="label-icon">{getCategoryIcon(formData.category)}</span>
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.value}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <span className="label-icon">💳</span>
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="form-select"
              >
                {PAYMENT_MODES.map(mode => (
                  <option key={mode.value} value={mode.value}>
                    {mode.icon} {mode.value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>
              <span className="label-icon">📝</span>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Lunch at McDonald's, Uber ride to office..."
              rows="3"
              className="form-textarea"
            />
            
            {/* AI Prediction Badge */}
            {aiPrediction && aiPrediction.confidence > 0.6 && (
              <div className="ai-prediction">
                <span className="ai-icon">🤖</span>
                <span className="ai-text">
                  AI suggests: <strong>{aiPrediction.category}</strong>
                </span>
                <span className={`confidence-badge confidence-${
                  aiPrediction.confidence > 0.85 ? 'high' : 
                  aiPrediction.confidence > 0.7 ? 'medium' : 'low'
                }`}>
                  {(aiPrediction.confidence * 100).toFixed(0)}% confident
                </span>
                {aiPrediction.category !== formData.category && (
                  <button
                    type="button"
                    className="apply-btn"
                    onClick={() => applySuggestion(aiPrediction.category)}
                  >
                    Apply
                  </button>
                )}
              </div>
            )}

            {/* Category Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-panel">
                <p className="suggestions-title">💡 Suggested categories:</p>
                <div className="suggestions-list">
                  {suggestions.slice(0, 3).map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`suggestion-chip ${
                        sug.category === formData.category ? 'active' : ''
                      }`}
                      onClick={() => applySuggestion(sug.category)}
                    >
                      {getCategoryIcon(sug.category)} {sug.category}
                      <span className="confidence-mini">
                        {(sug.confidence * 100).toFixed(0)}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Adding...
                </>
              ) : (
                <>
                  <span>✓</span>
                  Add Expense
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Tips */}
      <div className="tips-card">
        <h4>💡 Quick Tips</h4>
        <ul>
          <li>Add expenses regularly to maintain accurate records</li>
          <li>Use descriptive categories for better insights</li>
          <li>Include details in the description for reference</li>
        </ul>
      </div>
    </div>
  );
}

export default ExpenseForm;
