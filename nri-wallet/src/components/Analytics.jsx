import React, { useState, useEffect } from 'react';
import { getAllRecords } from '../db';
import './Analytics.css';

function Analytics() {
  const [data, setData] = useState({
    totalExpenses: 0,
    totalInvestments: 0,
    totalLoans: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const expenses = await getAllRecords('expenses');
    const investments = await getAllRecords('investments');
    const loans = await getAllRecords('loans');

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalInvestments = investments.reduce((sum, i) => sum + i.currentValue, 0);
    const totalLoans = loans.reduce((sum, l) => sum + l.currentOutstanding, 0);

    setData({ totalExpenses, totalInvestments, totalLoans });
  };

  const exportData = async () => {
    const expenses = await getAllRecords('expenses');
    const investments = await getAllRecords('investments');
    const loans = await getAllRecords('loans');
    
    const exportData = { expenses, investments, loans, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nri-wallet-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="analytics">
      <h2>Analytics</h2>
      <button onClick={exportData} className="btn-export">Export Data</button>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Total Expenses</h3>
          <p>₹{data.totalExpenses.toFixed(2)}</p>
        </div>
        <div className="analytics-card">
          <h3>Total Investments</h3>
          <p>₹{data.totalInvestments.toFixed(2)}</p>
        </div>
        <div className="analytics-card">
          <h3>Total Loans</h3>
          <p>₹{data.totalLoans.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
