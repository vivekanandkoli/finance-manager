/**
 * Bank Statement Uploader Component
 * Supports multiple file upload with password protection
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import BankStatementService from '../services/bankParser/BankStatementService';
import PasswordPrompt from './PasswordPrompt';
import TransactionExtractor from './TransactionExtractor';
import { addRecord } from '../db';
import toast from 'react-hot-toast';
import './BankStatementUploader.css';

function BankStatementUploader({ onComplete }) {
  const [files, setFiles] = useState([]);
  const [passwords, setPasswords] = useState({});
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [currentPasswordFile, setCurrentPasswordFile] = useState(null);
  const [fileStatuses, setFileStatuses] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [showTransactionExtractor, setShowTransactionExtractor] = useState(false);

  const bankService = new BankStatementService();

  // Drag & drop setup
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(rejection => {
        toast.error(`${rejection.file.name}: ${rejection.errors[0].message}`);
      });
    }

    // Validate accepted files
    const { valid, invalid } = bankService.validateFiles(acceptedFiles);
    
    // Show errors for invalid files
    invalid.forEach(({ file, error }) => {
      toast.error(`${file.name}: ${error}`);
    });

    if (valid.length > 0) {
      setFiles(valid);
      
      // Initialize file statuses
      const statuses = {};
      valid.forEach(file => {
        statuses[file.name] = { status: 'pending', progress: 0 };
      });
      setFileStatuses(statuses);
      
      // Check which files need passwords (PDFs)
      const pdfFiles = valid.filter(f => 
        f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
      );
      
      if (pdfFiles.length > 0) {
        setCurrentPasswordFile(pdfFiles[0]); // Ask for first PDF
      } else {
        // No PDFs, process directly
        processAllFiles(valid, {});
      }
      
      toast.success(`${valid.length} file(s) selected`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  function handlePasswordSubmit(file, password) {
    const newPasswords = { ...passwords, [file.name]: password };
    setPasswords(newPasswords);
    
    // Find next PDF that needs password
    const pdfFiles = files.filter(f => 
      f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    const nextPdf = pdfFiles.find(f => !newPasswords[f.name]);
    
    if (nextPdf) {
      setCurrentPasswordFile(nextPdf);
    } else {
      // All passwords collected, process files
      setCurrentPasswordFile(null);
      processAllFiles(files, newPasswords);
    }
  }

  function handlePasswordSkip(file) {
    // Skip this file's password (will try without password)
    const newPasswords = { ...passwords, [file.name]: null };
    setPasswords(newPasswords);
    
    // Find next PDF
    const pdfFiles = files.filter(f => 
      f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    const nextPdf = pdfFiles.find(f => !(f.name in newPasswords));
    
    if (nextPdf) {
      setCurrentPasswordFile(nextPdf);
    } else {
      // Done with passwords, process files
      setCurrentPasswordFile(null);
      processAllFiles(files, newPasswords);
    }
  }

  async function processAllFiles(filesToProcess, filePasswords) {
    setProcessing(true);
    setResults([]);
    setOverallProgress(0);
    
    try {
      const results = await bankService.processFiles(
        filesToProcess,
        filePasswords,
        (fileName, status, progress) => {
          // Update individual file status
          setFileStatuses(prev => ({
            ...prev,
            [fileName]: { status, progress }
          }));
          
          // Update overall progress
          setOverallProgress(progress);
        }
      );
      
      setResults(results);
      
      // Count successes and errors
      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;
      
      if (successCount > 0) {
        toast.success(`✅ ${successCount} file(s) processed successfully!`);
      }
      
      if (errorCount > 0) {
        toast.error(`❌ ${errorCount} file(s) failed to process`);
      }
      
      // Call completion callback
      if (onComplete) {
        onComplete(results);
      }
      
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Failed to process files: ' + error.message);
    } finally {
      setProcessing(false);
    }
  }

  function handleReset() {
    setFiles([]);
    setPasswords({});
    setResults([]);
    setFileStatuses({});
    setOverallProgress(0);
    setCurrentPasswordFile(null);
    setShowExtractedText(false);
    setShowTransactionExtractor(false);
  }

  function handleContinueToExtraction() {
    setShowTransactionExtractor(true);
  }

  async function handleImportTransactions(transactions) {
    toast.loading('Importing transactions...');
    
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const transaction of transactions) {
        try {
          // Add to expenses or income based on type
          if (transaction.type === 'expense') {
            await addRecord('expenses', {
              date: transaction.date,
              amount: transaction.amount,
              category: transaction.category,
              description: transaction.description,
              paymentMethod: transaction.paymentMethod || 'Bank Transfer',
              timestamp: transaction.timestamp || new Date().toISOString(),
              source: transaction.source,
              imported: true,
              importedAt: transaction.importedAt
            });
          } else if (transaction.type === 'income') {
            await addRecord('income', {
              date: transaction.date,
              amount: transaction.amount,
              source: transaction.category,
              description: transaction.description,
              timestamp: transaction.timestamp || new Date().toISOString(),
              imported: true,
              importedAt: transaction.importedAt
            });
          }
          successCount++;
        } catch (error) {
          console.error('Error importing transaction:', error);
          errorCount++;
        }
      }

      toast.dismiss();
      
      if (successCount > 0) {
        toast.success(`✅ Successfully imported ${successCount} transaction${successCount !== 1 ? 's' : ''}!`);
      }
      
      if (errorCount > 0) {
        toast.error(`❌ Failed to import ${errorCount} transaction${errorCount !== 1 ? 's' : ''}`);
      }

      // Notify parent component
      if (onComplete) {
        onComplete({ 
          imported: successCount, 
          failed: errorCount,
          transactions 
        });
      }

      // Reset after successful import
      setTimeout(() => {
        handleReset();
      }, 2000);

    } catch (error) {
      toast.dismiss();
      toast.error('Failed to import transactions: ' + error.message);
    }
  }

  function getFileIcon(fileName) {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf': return '📄';
      case 'csv': return '📊';
      case 'xlsx':
      case 'xls': return '📗';
      default: return '📁';
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'processing': return '⏳';
      default: return '⏸️';
    }
  }

  // Show Transaction Extractor if enabled
  if (showTransactionExtractor && results.length > 0) {
    const successfulResults = results.filter(r => r.status === 'success');
    return (
      <TransactionExtractor 
        extractedData={successfulResults}
        onImport={handleImportTransactions}
        onBack={() => setShowTransactionExtractor(false)}
      />
    );
  }

  return (
    <div className="bank-statement-uploader">
      <div className="uploader-header">
        <h2>🏦 Upload Bank Statements</h2>
        <p>Support for PDF, CSV, and Excel files from any bank</p>
      </div>

      {/* Drag & Drop Area */}
      {files.length === 0 && !processing && (
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <div className="dropzone-content">
            <div className="dropzone-icon">📁</div>
            {isDragActive ? (
              <p className="dropzone-text">Drop files here...</p>
            ) : (
              <>
                <p className="dropzone-text">Drag & drop bank statements here</p>
                <p className="dropzone-hint">or click to select files</p>
              </>
            )}
            <div className="dropzone-formats">
              <span>📄 PDF</span>
              <span>📊 CSV</span>
              <span>📗 Excel</span>
            </div>
            <p className="dropzone-note">Supports password-protected PDFs • Max 50MB per file</p>
          </div>
        </div>
      )}

      {/* Selected Files List */}
      {files.length > 0 && !processing && results.length === 0 && (
        <div className="selected-files">
          <div className="section-header">
            <h3>📋 Selected Files ({files.length})</h3>
            <button onClick={handleReset} className="btn-reset">Clear All</button>
          </div>
          <div className="files-list">
            {files.map((file, idx) => (
              <div key={idx} className="file-item">
                <span className="file-icon">{getFileIcon(file.name)}</span>
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Password Prompt Modal */}
      {currentPasswordFile && (
        <PasswordPrompt
          file={currentPasswordFile}
          onSubmit={handlePasswordSubmit}
          onSkip={handlePasswordSkip}
        />
      )}

      {/* Processing Status */}
      {processing && (
        <div className="processing">
          <div className="processing-header">
            <h3>⚙️ Processing Files...</h3>
            <p className="progress-text">{Math.round(overallProgress)}%</p>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          
          <div className="files-status">
            {files.map((file, idx) => {
              const status = fileStatuses[file.name] || { status: 'pending' };
              return (
                <div key={idx} className={`status-item status-${status.status}`}>
                  <span className="status-icon">{getStatusIcon(status.status)}</span>
                  <span className="status-name">{file.name}</span>
                  <span className="status-label">{status.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="results">
          <div className="results-header">
            <h3>📊 Extraction Results</h3>
            <button onClick={handleReset} className="btn-reset">Upload More</button>
          </div>
          
          <div className="results-summary">
            <div className="summary-card success">
              <div className="summary-number">
                {results.filter(r => r.status === 'success').length}
              </div>
              <div className="summary-label">Successful</div>
            </div>
            <div className="summary-card error">
              <div className="summary-number">
                {results.filter(r => r.status === 'error').length}
              </div>
              <div className="summary-label">Failed</div>
            </div>
          </div>
          
          <div className="results-list">
            {results.map((result, idx) => (
              <div key={idx} className={`result-item result-${result.status}`}>
                <div className="result-header">
                  <span className="result-icon">{getFileIcon(result.fileName)}</span>
                  <span className="result-name">{result.fileName}</span>
                  <span className="result-status">{getStatusIcon(result.status)}</span>
                </div>
                
                {result.status === 'success' && result.data && (
                  <div className="result-details">
                    {result.data.text && (
                      <p>📝 Extracted {result.data.text.length} characters from {result.data.pages} pages</p>
                    )}
                    {result.data.rowCount !== undefined && (
                      <p>📊 Found {result.data.rowCount} rows</p>
                    )}
                  </div>
                )}
                
                {result.status === 'error' && (
                  <div className="result-error">
                    <p>❌ {result.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="results-actions">
            <button 
              className="btn-primary" 
              onClick={handleContinueToExtraction}
            >
              📊 Continue to Transaction Extraction →
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => setShowExtractedText(!showExtractedText)}
              style={{ marginLeft: '12px' }}
            >
              {showExtractedText ? '⬆️ Hide Text' : '👁️ View Raw Text'}
            </button>
          </div>
          
          {/* Show Extracted Text */}
          {showExtractedText && (
            <div className="extracted-text-section">
              <h3>📄 Extracted Text Preview</h3>
              <p className="text-hint">
                This is the raw text extracted from your bank statements. 
                Phase 2 will parse this into individual transactions.
              </p>
              
              {results.map((result, idx) => {
                if (result.status !== 'success' || !result.data) return null;
                
                return (
                  <div key={idx} className="extracted-text-card">
                    <div className="text-card-header">
                      <h4>📄 {result.fileName}</h4>
                      <span className="text-stats">
                        {result.data.pages} page(s) • {result.data.text?.length || 0} characters
                      </span>
                    </div>
                    
                    <div className="extracted-text-content">
                      <pre>{result.data.text || 'No text extracted'}</pre>
                    </div>
                    
                    <div className="text-actions">
                      <button 
                        className="btn-copy"
                        onClick={() => {
                          navigator.clipboard.writeText(result.data.text || '');
                          toast.success('Text copied to clipboard!');
                        }}
                      >
                        📋 Copy Text
                      </button>
                      <button 
                        className="btn-download"
                        onClick={() => {
                          const blob = new Blob([result.data.text || ''], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${result.fileName}.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                          toast.success('Text file downloaded!');
                        }}
                      >
                        💾 Download as TXT
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BankStatementUploader;
