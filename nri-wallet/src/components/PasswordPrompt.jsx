/**
 * Password Prompt Modal
 * Asks for password for password-protected PDF files
 */

import React, { useState, useEffect, useRef } from 'react';
import './PasswordPrompt.css';

function PasswordPrompt({ file, onSubmit, onSkip }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus input when modal opens
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [file]);

  function handleSubmit(e) {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }
    
    setError('');
    onSubmit(file, password);
    setPassword(''); // Clear for next file
  }

  function handleSkip() {
    setPassword('');
    setError('');
    onSkip(file);
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      handleSkip();
    }
  }

  return (
    <div className="password-modal-overlay" onClick={handleSkip}>
      <div className="password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🔒 Password Required</h3>
        </div>
        
        <div className="modal-body">
          <div className="file-info">
            <span className="file-icon">📄</span>
            <div className="file-details">
              <p className="file-name">{file.name}</p>
              <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          
          <p className="hint">This PDF is password protected. Please enter the password to extract data.</p>
          
          <form onSubmit={handleSubmit}>
            <div className="password-input-group">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                className={error ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            
            {error && <p className="error-message">{error}</p>}
            
            <div className="modal-actions">
              <button
                type="button"
                onClick={handleSkip}
                className="btn-secondary"
              >
                Skip This File
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Continue
              </button>
            </div>
          </form>
          
          <p className="security-note">
            🔒 Your password is only used locally and never stored or sent anywhere.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PasswordPrompt;
