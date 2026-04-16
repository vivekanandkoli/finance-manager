import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllRecords, addRecord, deleteRecord } from '../db';
import './InvestmentPortfolio.css';

function InvestmentPortfolio() {
  const [investments, setInvestments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fundName: '',
    category: 'Equity',
    investmentDate: new Date().toISOString().split('T')[0],
    investedAmount: '',
    currentValue: '',
    units: '',
    currency: 'INR',
    folioNumber: ''
  });

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      const allInvestments = await getAllRecords('investments');
      setInvestments(allInvestments);
    } catch (error) {
      console.error('Error loading investments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const investment = {
      ...formData,
      investedAmount: parseFloat(formData.investedAmount),
      currentValue: parseFloat(formData.currentValue),
      units: parseFloat(formData.units),
      timestamp: new Date().toISOString()
    };

    try {
      await addRecord('investments', investment);
      alert('Investment added successfully!');
      setFormData({
        fundName: '',
        category: 'Equity',
        investmentDate: new Date().toISOString().split('T')[0],
        investedAmount: '',
        currentValue: '',
        units: '',
        currency: 'INR',
        folioNumber: ''
      });
      setShowForm(false);
      loadInvestments();
    } catch (error) {
      alert('Error adding investment: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      try {
        await deleteRecord('investments', id);
        loadInvestments();
      } catch (error) {
        alert('Error deleting investment: ' + error.message);
      }
    }
  };

  // Memoized handleChange for form inputs
  const handleChange = useCallback((e) => {
    setFormData(prevData => ({
      ...prevData,
      [e.target.name]: e.target.value
    }));
  }, []);

  // Memoized portfolio stats calculations
  const portfolioStats = useMemo(() => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalGains = totalCurrentValue - totalInvested;
    const returnsPercentage = totalInvested > 0 ? ((totalGains / totalInvested) * 100).toFixed(2) : 0;

    return {
      totalInvested,
      totalCurrentValue,
      totalGains,
      returnsPercentage
    };
  }, [investments]);

  const { totalInvested, totalCurrentValue, totalGains, returnsPercentage } = portfolioStats;

  // Memoized category-wise breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown = investments.reduce((acc, inv) => {
      if (!acc[inv.category]) {
        acc[inv.category] = {
          invested: 0,
          current: 0,
          count: 0
        };
      }
      acc[inv.category].invested += inv.investedAmount;
      acc[inv.category].current += inv.currentValue;
      acc[inv.category].count += 1;
      return acc;
    }, {});

    return Object.entries(breakdown).map(([category, data]) => ({
      category,
      ...data,
      returns: data.invested > 0 ? ((data.current - data.invested) / data.invested * 100).toFixed(2) : 0
    }));
  }, [investments]);

  // Memoized top and bottom performers
  const performanceMetrics = useMemo(() => {
    const investmentsWithReturns = investments.map(inv => ({
      ...inv,
      returns: inv.investedAmount > 0 ? ((inv.currentValue - inv.investedAmount) / inv.investedAmount * 100) : 0
    }));

    const sortedByReturns = [...investmentsWithReturns].sort((a, b) => b.returns - a.returns);
    
    return {
      topPerformer: sortedByReturns[0] || null,
      bottomPerformer: sortedByReturns[sortedByReturns.length - 1] || null,
      avgReturns: investmentsWithReturns.length > 0 
        ? (investmentsWithReturns.reduce((sum, inv) => sum + inv.returns, 0) / investmentsWithReturns.length).toFixed(2)
        : 0
    };
  }, [investments]);

  return (
    <div className="investment-portfolio">
      <div className="portfolio-header">
        <h2>Investment Portfolio</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Add Investment'}
        </button>
      </div>

      {showForm && (
        <div className="investment-form-container">
          <form onSubmit={handleSubmit} className="investment-form">
            <div className="form-row">
              <div className="form-group">
                <label>Fund Name</label>
                <input type="text" name="fundName" value={formData.fundName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="Equity">Equity</option>
                  <option value="Debt">Debt</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Index">Index</option>
                  <option value="ELSS">ELSS</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Investment Date</label>
                <input type="date" name="investmentDate" value={formData.investmentDate} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Folio Number</label>
                <input type="text" name="folioNumber" value={formData.folioNumber} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Invested Amount</label>
                <input type="number" name="investedAmount" value={formData.investedAmount} onChange={handleChange} step="0.01" required />
              </div>
              <div className="form-group">
                <label>Current Value</label>
                <input type="number" name="currentValue" value={formData.currentValue} onChange={handleChange} step="0.01" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Units</label>
                <input type="number" name="units" value={formData.units} onChange={handleChange} step="0.001" required />
              </div>
              <div className="form-group">
                <label>Currency</label>
                <select name="currency" value={formData.currency} onChange={handleChange}>
                  <option value="INR">INR</option>
                  <option value="THB">THB</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-submit">Add Investment</button>
          </form>
        </div>
      )}

      <div className="portfolio-summary">
        <div className="summary-card">
          <h3>Total Invested</h3>
          <p>{totalInvested.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Current Value</h3>
          <p>{totalCurrentValue.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Gains</h3>
          <p>{totalGains.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Returns</h3>
          <p>{returnsPercentage}%</p>
        </div>
      </div>

      <div className="investments-list">
        <h3>Your Investments</h3>
        {investments.length === 0 ? (
          <p>No investments yet</p>
        ) : (
          <div className="investment-grid">
            {investments.map(inv => (
              <div key={inv.id} className="investment-card">
                <h4>{inv.fundName}</h4>
                <p>Category: {inv.category}</p>
                <p>Invested: {inv.investedAmount}</p>
                <p>Current: {inv.currentValue}</p>
                <button onClick={() => handleDelete(inv.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InvestmentPortfolio;
