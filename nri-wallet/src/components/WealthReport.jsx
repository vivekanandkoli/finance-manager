import React, { useState, useEffect } from 'react';
import { getAllRecords } from '../db';
import './WealthReport.css';

function WealthReport() {
  const [summary, setSummary] = useState({
    assets: 0,
    liabilities: 0,
    netWorth: 0,
  });

  useEffect(() => {
    calculateWealth();
  }, []);

  const calculateWealth = async () => {
    const investments = await getAllRecords('investments');
    const loans = await getAllRecords('loans');

    const totalAssets = investments.reduce((sum, i) => sum + i.currentValue, 0);
    const totalLiabilities = loans.reduce((sum, l) => sum + l.currentOutstanding, 0);
    const netWorth = totalAssets - totalLiabilities;

    setSummary({ assets: totalAssets, liabilities: totalLiabilities, netWorth });
  };

  return (
    <div className="wealth-report">
      <h2>Wealth Report</h2>
      <div className="report-card">
        <h3>Assets</h3>
        <p>₹{summary.assets.toFixed(2)}</p>
        <h3>Liabilities</h3>
        <p>-₹{summary.liabilities.toFixed(2)}</p>
        <h3>Net Worth</h3>
        <p>₹{summary.netWorth.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default WealthReport;
