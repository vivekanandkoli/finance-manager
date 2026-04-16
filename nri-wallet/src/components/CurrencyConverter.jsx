import React, { useState, useEffect } from 'react';
import { getAllRecords, addRecord } from '../db';
import { currencyService } from '../services/currencyService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './CurrencyConverter.css';

function CurrencyConverter() {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('THB');
  const [toCurrency, setToCurrency] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState('');
  const [result, setResult] = useState(null);
  const [rateHistory, setRateHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rateSource, setRateSource] = useState(null);
  const [supportedCurrencies, setSupportedCurrencies] = useState(['THB', 'INR', 'USD', 'EUR', 'GBP', 'JPY', 'SGD']);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadSupportedCurrencies();
    loadRateHistory();
  }, []);

  useEffect(() => {
    if (autoUpdate && fromCurrency && toCurrency) {
      fetchLiveRate();
    }
  }, [fromCurrency, toCurrency]);

  const loadSupportedCurrencies = async () => {
    try {
      const currencies = await currencyService.getSupportedCurrencies();
      setSupportedCurrencies(currencies);
    } catch (error) {
      console.error('Failed to load currencies:', error);
    }
  };

  const loadRateHistory = async () => {
    try {
      const rates = await getAllRecords('exchangeRates');
      setRateHistory(rates.slice(-10).reverse());
    } catch (error) {
      console.error('Error loading rate history:', error);
    }
  };

  const fetchLiveRate = async () => {
    if (!fromCurrency || !toCurrency) return;
    
    setLoading(true);
    try {
      const { rate, source, api, warning, timestamp } = await currencyService.getExchangeRate(
        fromCurrency,
        toCurrency
      );
      
      setExchangeRate(rate.toFixed(4));
      setRateSource({ source, api, warning });
      setLastUpdated(new Date(timestamp));
      
      // Auto-convert if amount exists
      if (amount) {
        const converted = currencyService.convert(amount, rate);
        setResult(converted);
      }

      // Reload history to show newly saved rate
      await loadRateHistory();
      
    } catch (error) {
      console.error('Failed to fetch rate:', error);
      setRateSource({ 
        source: 'error', 
        warning: error.message || 'Failed to fetch exchange rate. Please enter manually.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = () => {
    if (amount && exchangeRate) {
      const converted = currencyService.convert(amount, exchangeRate);
      setResult(converted);
    }
  };

  const handleSaveRate = async () => {
    if (!exchangeRate) {
      alert('Please enter an exchange rate');
      return;
    }

    try {
      await addRecord('exchangeRates', {
        rate: parseFloat(exchangeRate),
        fromCurrency,
        toCurrency,
        source: 'manual',
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString()
      });
      alert('✅ Exchange rate saved successfully!');
      await loadRateHistory();
    } catch (error) {
      alert('❌ Error saving rate: ' + error.message);
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setExchangeRate('');
    setResult(null);
    setRateSource(null);
  };

  const getHistoricalChartData = () => {
    return rateHistory
      .filter(r => r.fromCurrency === fromCurrency && r.toCurrency === toCurrency)
      .reverse()
      .map(r => ({
        date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rate: parseFloat(r.rate),
      }));
  };

  return (
    <div className="currency-converter">
      <div className="converter-header">
        <h2>💱 Currency Converter</h2>
        <p className="converter-subtitle">Real-time exchange rates powered by live APIs</p>
        {lastUpdated && (
          <p className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="converter-card">
        <div className="settings-row">
          <label className="auto-update-toggle">
            <input
              type="checkbox"
              checked={autoUpdate}
              onChange={(e) => setAutoUpdate(e.target.checked)}
            />
            <span>Auto-update rates</span>
          </label>
        </div>

        <div className="converter-main">
          <div className="currency-input-group">
            <label>From</label>
            <div className="input-row">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                step="0.01"
                min="0"
              />
              <select 
                value={fromCurrency} 
                onChange={(e) => setFromCurrency(e.target.value)}
              >
                {supportedCurrencies.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>
          </div>

          <button className="swap-button" onClick={handleSwapCurrencies} title="Swap currencies">
            ⇄
          </button>

          <div className="currency-input-group">
            <label>To</label>
            <div className="input-row">
              <input
                type="text"
                value={result !== null ? result : ''}
                readOnly
                placeholder="Result"
              />
              <select 
                value={toCurrency} 
                onChange={(e) => setToCurrency(e.target.value)}
              >
                {supportedCurrencies.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="exchange-rate-section">
          <label>Exchange Rate</label>
          <div className="rate-display">
            <input
              type="number"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              step="0.0001"
              min="0"
              placeholder={loading ? "Loading..." : "Enter rate or fetch live"}
              disabled={loading}
            />
            <button
              onClick={fetchLiveRate}
              className={`btn-refresh ${loading ? 'loading' : ''}`}
              disabled={loading}
              title="Fetch live exchange rate"
            >
              {loading ? '⟳ Loading...' : '🔄 Refresh'}
            </button>
            <button 
              onClick={handleSaveRate} 
              className="btn-save-rate"
              disabled={!exchangeRate}
              title="Save this rate"
            >
              💾 Save
            </button>
          </div>
          
          {rateSource && (
            <div className={`rate-source ${rateSource.warning ? 'warning' : 'success'}`}>
              <span className="source-icon">
                {rateSource.source === 'live' ? '🌐' : 
                 rateSource.source === 'cache' ? '💾' : 
                 rateSource.source === 'database' ? '📦' : '⚠️'}
              </span>
              <span className="source-text">
                {rateSource.warning ? rateSource.warning : 
                 rateSource.source === 'live' ? `Live from ${rateSource.api}` :
                 rateSource.source === 'cache' ? 'Cached (updated within 1 hour)' :
                 rateSource.source === 'database' ? 'Last known rate from database' : ''}
              </span>
            </div>
          )}
        </div>

        <button 
          onClick={handleConvert} 
          className="btn-convert"
          disabled={!amount || !exchangeRate || loading}
        >
          Convert {amount && exchangeRate ? `${amount} ${fromCurrency} → ${toCurrency}` : ''}
        </button>

        {result !== null && (
          <div className="conversion-result">
            <h3>💰 Result</h3>
            <p className="result-value">
              {amount} {fromCurrency} = <strong>{result.toLocaleString()} {toCurrency}</strong>
            </p>
            <p className="result-rate">
              Rate: 1 {fromCurrency} = {exchangeRate} {toCurrency}
            </p>
          </div>
        )}
      </div>

      {/* Historical Chart */}
      {getHistoricalChartData().length > 1 && (
        <div className="rate-chart-card">
          <h3>📈 Exchange Rate History ({fromCurrency}/{toCurrency})</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={getHistoricalChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#4f46e5" 
                strokeWidth={2}
                dot={{ fill: '#4f46e5', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="quick-conversions">
        <h3>🚀 Quick Conversions</h3>
        <div className="quick-grid">
          {[1000, 5000, 10000, 50000].map(val => (
            <div key={val} className="quick-card" onClick={() => {
              setAmount(val.toString());
              if (exchangeRate) {
                const converted = currencyService.convert(val, exchangeRate);
                setResult(converted);
              }
            }}>
              <span className="quick-amount">{val.toLocaleString()} {fromCurrency}</span>
              <span className="quick-arrow">→</span>
              <span className="quick-result">
                {exchangeRate ? currencyService.convert(val, exchangeRate).toLocaleString() : '---'} {toCurrency}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rate-history">
        <h3>📜 Recent Exchange Rates</h3>
        {rateHistory.length === 0 ? (
          <p className="no-data">No rate history yet. Fetch a live rate to begin tracking!</p>
        ) : (
          <div className="history-list">
            {rateHistory.map((entry, index) => (
              <div key={index} className="history-item">
                <span className="history-date">
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="history-pair">
                  {entry.fromCurrency} → {entry.toCurrency}
                </span>
                <span className="history-rate">
                  {parseFloat(entry.rate).toFixed(4)}
                </span>
                <span className={`history-source ${entry.source === 'manual' ? 'manual' : 'live'}`}>
                  {entry.source === 'manual' ? '✏️' : '🌐'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CurrencyConverter;
