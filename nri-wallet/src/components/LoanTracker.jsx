import React, { useState, useEffect } from 'react';
import { getAllRecords } from '../db';
import './LoanTracker.css';

function LoanTracker() {
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prepayment, setPrepayment] = useState(10000);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [view, setView] = useState('overview'); // overview, schedule, calculator

  useEffect(() => {
    loadLoanData();
  }, []);

  const loadLoanData = async () => {
    try {
      const response = await fetch('/loan_schedule.json');
      const data = await response.json();
      setLoanData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading loan data:', error);
      setLoading(false);
    }
  };

  const calculatePrepaymentImpact = () => {
    if (!loanData) return null;
    
    const monthlyRate = loanData.interestRate / 12 / 100;
    let balance = loanData.outstandingBalance;
    let months = 0;
    const emi = loanData.monthlyEMI;
    
    while (balance > 0 && months < 500) {
      const interest = balance * monthlyRate;
      const principal = emi - interest + prepayment;
      balance -= principal;
      months++;
    }
    
    const originalMonths = loanData.remainingTenure;
    const savedMonths = originalMonths - months;
    const savedInterest = savedMonths * emi;
    
    return {
      newTenure: months,
      savedMonths,
      savedInterest,
      newClosureDate: new Date(new Date().setMonth(new Date().getMonth() + months)).toLocaleDateString()
    };
  };

  if (loading) {
    return (
      <div className="loan-tracker-container">
        <div className="loading-container">
          <div className="loading"></div>
          <p>Loading loan data...</p>
        </div>
      </div>
    );
  }

  if (!loanData) {
    return (
      <div className="loan-tracker-container">
        <div className="empty-state">
          <div className="empty-state-icon">🏦</div>
          <h3>No Loan Data Found</h3>
          <p>Import your loan schedule to get started</p>
        </div>
      </div>
    );
  }

  const impact = calculatePrepaymentImpact();
  const totalInterest = loanData.amortization_schedule.reduce((sum, p) => sum + p.interest_paid, 0);
  const totalPrincipal = loanData.amortization_schedule.reduce((sum, p) => sum + p.principal_paid, 0);
  const paidPayments = loanData.amortization_schedule.filter(p => p.status?.includes('Paid')).length;

  return (
    <div className="loan-tracker-container">
      {/* Header */}
      <div className="loan-header">
        <div>
          <h2>🏠 Home Loan Tracker</h2>
          <p className="loan-subtitle">{loanData.lender} | {loanData.interestRate}% PA</p>
        </div>
        <div className="view-tabs">
          <button 
            className={view === 'overview' ? 'active' : ''}
            onClick={() => setView('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={view === 'schedule' ? 'active' : ''}
            onClick={() => setView('schedule')}
          >
            📅 Schedule
          </button>
          <button 
            className={view === 'calculator' ? 'active' : ''}
            onClick={() => setView('calculator')}
          >
            💰 Calculator
          </button>
        </div>
      </div>

      {/* Overview View */}
      {view === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="loan-metrics-grid">
            <div className="metric-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="metric-icon">💰</div>
              <div className="metric-content">
                <p className="metric-label">Outstanding Balance</p>
                <p className="metric-value">₹{loanData.outstandingBalance.toLocaleString()}</p>
                <p className="metric-sub">{((loanData.outstandingBalance / loanData.sanctionedAmount) * 100).toFixed(1)}% of loan</p>
              </div>
            </div>

            <div className="metric-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <div className="metric-icon">📅</div>
              <div className="metric-content">
                <p className="metric-label">Remaining Tenure</p>
                <p className="metric-value">{loanData.remainingTenure} months</p>
                <p className="metric-sub">{(loanData.remainingTenure / 12).toFixed(1)} years</p>
              </div>
            </div>

            <div className="metric-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <div className="metric-icon">💳</div>
              <div className="metric-content">
                <p className="metric-label">Monthly EMI</p>
                <p className="metric-value">₹{loanData.monthlyEMI.toLocaleString()}</p>
                <p className="metric-sub">Due on 15th</p>
              </div>
            </div>

            <div className="metric-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <div className="metric-icon">✅</div>
              <div className="metric-content">
                <p className="metric-label">Payments Made</p>
                <p className="metric-value">{paidPayments}</p>
                <p className="metric-sub">₹{(paidPayments * loanData.monthlyEMI).toLocaleString()} paid</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-card">
            <h3>Loan Repayment Progress</h3>
            <div className="progress-stats">
              <div>
                <p className="progress-label">Principal Repaid</p>
                <p className="progress-amount">₹{loanData.principalRepaid.toLocaleString()}</p>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${(loanData.principalRepaid / loanData.sanctionedAmount) * 100}%` }}
                />
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="progress-label">Total Loan</p>
                <p className="progress-amount">₹{loanData.sanctionedAmount.toLocaleString()}</p>
              </div>
            </div>
            <p className="progress-percentage">
              {((loanData.principalRepaid / loanData.sanctionedAmount) * 100).toFixed(2)}% Completed
            </p>
          </div>

          {/* Prepayment Impact */}
          <div className="prepayment-card">
            <h3>💡 Prepayment Impact Simulator</h3>
            <div className="prepayment-input-section">
              <label>
                Monthly Prepayment Amount:
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="1000"
                  value={prepayment}
                  onChange={(e) => setPrepayment(Number(e.target.value))}
                  className="prepayment-slider"
                />
                <span className="prepayment-value">₹{prepayment.toLocaleString()}</span>
              </label>
            </div>

            {impact && (
              <div className="impact-results">
                <div className="impact-item">
                  <span className="impact-label">New Tenure:</span>
                  <span className="impact-value">{impact.newTenure} months ({(impact.newTenure / 12).toFixed(1)} years)</span>
                </div>
                <div className="impact-item highlight">
                  <span className="impact-label">Time Saved:</span>
                  <span className="impact-value">{impact.savedMonths} months ({(impact.savedMonths / 12).toFixed(1)} years)</span>
                </div>
                <div className="impact-item highlight">
                  <span className="impact-label">Interest Saved:</span>
                  <span className="impact-value">₹{impact.savedInterest.toLocaleString()}</span>
                </div>
                <div className="impact-item">
                  <span className="impact-label">New Closure Date:</span>
                  <span className="impact-value">{impact.newClosureDate}</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Schedule View */}
      {view === 'schedule' && (
        <div className="schedule-container">
          <h3>📅 Monthly Amortization Schedule</h3>
          <div className="schedule-table-container">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Date</th>
                  <th>Opening Balance</th>
                  <th>EMI</th>
                  <th>Interest</th>
                  <th>Principal</th>
                  <th>Closing Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loanData.amortization_schedule.slice(0, 50).map((payment, idx) => (
                  <tr key={idx} className={payment.status?.includes('Paid') ? 'paid-row' : ''}>
                    <td>{payment.month_number}</td>
                    <td>{payment.payment_date}</td>
                    <td>₹{payment.opening_balance.toLocaleString()}</td>
                    <td>₹{payment.emi_amount.toLocaleString()}</td>
                    <td className="interest-col">₹{payment.interest_paid.toLocaleString()}</td>
                    <td className="principal-col">₹{payment.principal_paid.toLocaleString()}</td>
                    <td>₹{payment.closing_balance.toLocaleString()}</td>
                    <td><span className="status-badge">{payment.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="schedule-note">
            Showing first 50 of {loanData.amortization_schedule.length} payments
          </p>
        </div>
      )}

      {/* Calculator View */}
      {view === 'calculator' && (
        <div className="calculator-container">
          <h3>🧮 EMI Calculator</h3>
          <p>Calculate EMI for any loan amount, interest rate, and tenure</p>
          <div className="calculator-form">
            <div className="calc-input-group">
              <label>Loan Amount (₹)</label>
              <input type="number" placeholder="Enter loan amount" />
            </div>
            <div className="calc-input-group">
              <label>Interest Rate (% PA)</label>
              <input type="number" step="0.01" placeholder="Enter interest rate" />
            </div>
            <div className="calc-input-group">
              <label>Tenure (Months)</label>
              <input type="number" placeholder="Enter tenure in months" />
            </div>
            <button className="calc-button">Calculate EMI</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoanTracker;
