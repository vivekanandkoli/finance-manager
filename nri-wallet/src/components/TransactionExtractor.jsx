/**
 * Transaction Extractor Component
 * Parses bank statements and extracts transactions
 */

import React, { useState, useEffect } from 'react';
import SCBParser from '../services/bankParser/banks/SCBParser';
import toast from 'react-hot-toast';
import './TransactionExtractor.css';

function TransactionExtractor({ extractedData, onImport, onBack }) {
  const [parsedResults, setParsedResults] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [editedTransactions, setEditedTransactions] = useState({});
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  const scbParser = new SCBParser();

  // Available categories
  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Education',
    'Travel',
    'Income',
    'Transfer',
    'Credit Card Payment',
    'Mobile & Internet',
    'Services',
    'Other Expenses',
    'Salary',
    'Investment',
    'Gifts',
    'Personal Care'
  ];

  useEffect(() => {
    parseStatements();
  }, [extractedData]);

  async function parseStatements() {
    setLoading(true);
    const results = [];

    try {
      console.log('Starting to parse statements. Data:', extractedData);
      
      for (const fileData of extractedData) {
        console.log('Processing file:', fileData.fileName, 'Status:', fileData.status);
        
        if (fileData.status !== 'success' || !fileData.data?.text) {
          console.log('Skipping file - no text or failed');
          continue;
        }

        const text = fileData.data.text;
        console.log('Text length:', text.length);
        console.log('First 200 chars:', text.substring(0, 200));

        // Check if it's SCB statement
        if (scbParser.isSCBStatement(text)) {
          console.log('Detected as SCB statement');
          const parsed = scbParser.parseStatement(text);
          console.log('Parsed result:', parsed);
          console.log('Transactions found:', parsed.transactions.length);
          
          const appFormatTransactions = scbParser.convertToAppFormat(
            parsed.transactions,
            parsed.accountInfo
          );

          results.push({
            fileName: fileData.fileName,
            bank: 'SCB',
            accountInfo: parsed.accountInfo,
            transactions: appFormatTransactions,
            summary: parsed.summary
          });
        } else {
          console.log('Not recognized as SCB statement');
          toast.error(`${fileData.fileName}: Bank format not recognized yet`);
        }
      }

      setParsedResults(results);
      
      // Auto-select all transactions
      const allTransactionIds = results.flatMap((result, resultIdx) =>
        result.transactions.map((_, txIdx) => `${resultIdx}-${txIdx}`)
      );
      setSelectedTransactions(allTransactionIds);

      if (results.length > 0) {
        toast.success(`✅ Found ${results.reduce((sum, r) => sum + r.transactions.length, 0)} transactions!`);
      }

    } catch (error) {
      console.error('Error parsing statements:', error);
      toast.error('Failed to parse statements: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleTransaction(resultIdx, txIdx) {
    const id = `${resultIdx}-${txIdx}`;
    setSelectedTransactions(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  }

  function toggleAll() {
    if (selectedTransactions.length > 0) {
      setSelectedTransactions([]);
    } else {
      const allIds = parsedResults.flatMap((result, resultIdx) =>
        result.transactions.map((_, txIdx) => `${resultIdx}-${txIdx}`)
      );
      setSelectedTransactions(allIds);
    }
  }

  function handleEditTransaction(resultIdx, txIdx, field, value) {
    const id = `${resultIdx}-${txIdx}`;
    setEditedTransactions(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  }

  function getTransactionValue(resultIdx, txIdx, field, originalValue) {
    const id = `${resultIdx}-${txIdx}`;
    return editedTransactions[id]?.[field] ?? originalValue;
  }

  function handleImport() {
    const transactionsToImport = [];

    parsedResults.forEach((result, resultIdx) => {
      result.transactions.forEach((transaction, txIdx) => {
        const id = `${resultIdx}-${txIdx}`;
        if (selectedTransactions.includes(id)) {
          // Apply any edits
          const editedData = editedTransactions[id] || {};
          transactionsToImport.push({
            ...transaction,
            ...editedData
          });
        }
      });
    });

    if (transactionsToImport.length === 0) {
      toast.error('No transactions selected');
      return;
    }

    onImport(transactionsToImport);
  }

  if (loading) {
    return (
      <div className="transaction-extractor">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Parsing bank statements...</p>
        </div>
      </div>
    );
  }

  if (parsedResults.length === 0) {
    return (
      <div className="transaction-extractor">
        <div className="empty-state">
          <h3>❌ No Transactions Found</h3>
          <p>Could not parse any transactions from the uploaded files.</p>
          <button className="btn-secondary" onClick={onBack}>
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const totalTransactions = parsedResults.reduce((sum, r) => sum + r.transactions.length, 0);
  const selectedCount = selectedTransactions.length;

  return (
    <div className="transaction-extractor">
      <div className="extractor-header">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>
        <div>
          <h2>💰 Review Transactions</h2>
          <p>Review and select transactions to import</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <div className="summary-value">{totalTransactions}</div>
            <div className="summary-label">Total Transactions</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">✅</div>
          <div className="summary-content">
            <div className="summary-value">{selectedCount}</div>
            <div className="summary-label">Selected</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">🏦</div>
          <div className="summary-content">
            <div className="summary-value">{parsedResults.length}</div>
            <div className="summary-label">Bank Accounts</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bulk-actions">
        <button className="btn-toggle-all" onClick={toggleAll}>
          {selectedCount > 0 ? '☐ Deselect All' : '☑️ Select All'}
        </button>
        <button 
          className="btn-import" 
          onClick={handleImport}
          disabled={selectedCount === 0}
        >
          📥 Import {selectedCount} Transaction{selectedCount !== 1 ? 's' : ''}
        </button>
      </div>

      {/* Parsed Results */}
      {parsedResults.map((result, resultIdx) => (
        <div key={resultIdx} className="parsed-result">
          {/* Account Header */}
          <div className="account-header">
            <div className="account-info">
              <h3>🏦 {result.bank}</h3>
              <div className="account-details">
                <span>📄 {result.fileName}</span>
                {result.accountInfo.accountNumber && (
                  <span>💳 Account: {result.accountInfo.accountNumber}</span>
                )}
                {result.accountInfo.statementPeriod && (
                  <span>📅 {result.accountInfo.statementPeriod.from} - {result.accountInfo.statementPeriod.to}</span>
                )}
              </div>
            </div>
            
            <div className="account-summary">
              <div className="summary-item income">
                <span className="label">Income</span>
                <span className="value">
                  ฿{result.summary.totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="count">({result.summary.creditCount})</span>
              </div>
              <div className="summary-item expense">
                <span className="label">Expenses</span>
                <span className="value">
                  ฿{result.summary.totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="count">({result.summary.debitCount})</span>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="transactions-list">
            {result.transactions.map((transaction, txIdx) => {
              const id = `${resultIdx}-${txIdx}`;
              const isSelected = selectedTransactions.includes(id);
              const isIncome = transaction.type === 'income';
              const isEditing = editingTransaction === id;
              const currentDescription = getTransactionValue(resultIdx, txIdx, 'description', transaction.description);
              const currentCategory = getTransactionValue(resultIdx, txIdx, 'category', transaction.category);

              return (
                <div 
                  key={txIdx} 
                  className={`transaction-item ${isSelected ? 'selected' : ''} ${isIncome ? 'income' : 'expense'} ${isEditing ? 'editing' : ''}`}
                >
                  <div className="transaction-checkbox" onClick={() => toggleTransaction(resultIdx, txIdx)}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                    />
                  </div>

                  <div className="transaction-icon">
                    {isIncome ? '💰' : '💸'}
                  </div>

                  <div className="transaction-details">
                    <div className="transaction-primary">
                      {/* Editable Category */}
                      {isEditing ? (
                        <select
                          className="edit-category"
                          value={currentCategory}
                          onChange={(e) => handleEditTransaction(resultIdx, txIdx, 'category', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="transaction-category">{currentCategory}</span>
                      )}
                      
                      {/* Editable Description */}
                      {isEditing ? (
                        <input
                          type="text"
                          className="edit-description"
                          value={currentDescription}
                          onChange={(e) => handleEditTransaction(resultIdx, txIdx, 'description', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Transaction description"
                        />
                      ) : (
                        <span className="transaction-description">{currentDescription}</span>
                      )}
                    </div>
                    
                    {/* Auto-detected Information */}
                    <div className="transaction-metadata">
                      <div className="metadata-row">
                        <span className="metadata-label">🏦 Bank:</span>
                        <span className="metadata-value">{result.bank}</span>
                        
                        <span className="metadata-label">💳 Account:</span>
                        <span className="metadata-value">{result.accountInfo.accountNumber}</span>
                        
                        <span className="metadata-label">💱 Currency:</span>
                        <span className="metadata-value">{transaction.currency}</span>
                      </div>
                      
                      <div className="metadata-row">
                        <span className="metadata-label">📅 Date:</span>
                        <span className="metadata-value">{transaction.date}</span>
                        
                        <span className="metadata-label">🕐 Time:</span>
                        <span className="metadata-value">{transaction.time}</span>
                        
                        <span className="metadata-label">💳 Method:</span>
                        <span className="metadata-value">{transaction.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="transaction-actions">
                    <div className="transaction-amount">
                      <span className={`amount ${isIncome ? 'positive' : 'negative'}`}>
                        {isIncome ? '+' : '-'}฿{transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="balance">Balance: ฿{transaction.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    
                    <button
                      className="btn-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTransaction(isEditing ? null : id);
                      }}
                    >
                      {isEditing ? '✅ Done' : '✏️ Edit'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Bottom Actions */}
      <div className="bottom-actions">
        <button className="btn-secondary" onClick={onBack}>
          ← Upload More Files
        </button>
        <button 
          className="btn-primary" 
          onClick={handleImport}
          disabled={selectedCount === 0}
        >
          📥 Import {selectedCount} Selected Transaction{selectedCount !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}

export default TransactionExtractor;
