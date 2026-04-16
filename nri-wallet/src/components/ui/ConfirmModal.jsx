import React, { useEffect, useCallback } from 'react';
import './ConfirmModal.css';

/**
 * Optimized Confirmation Modal Component
 * Replaces intrusive alert() calls with better UX
 */
export const ConfirmModal = React.memo(({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning', 'danger', 'info', 'success'
  isLoading = false
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isLoading]);

  const handleConfirm = useCallback(async () => {
    await onConfirm();
  }, [onConfirm]);

  if (!isOpen) return null;

  // Icon based on type (using emojis)
  const icons = {
    warning: '⚠️',
    danger: '🗑️',
    info: 'ℹ️',
    success: '✅'
  };

  // Button colors based on type
  const buttonColors = {
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    success: '#10b981'
  };

  return (
    <div className="confirm-modal-overlay">
      {/* Backdrop */}
      <div 
        className="confirm-modal-backdrop"
        onClick={!isLoading ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="confirm-modal-content">
        {/* Close button */}
        {!isLoading && (
          <button
            onClick={onClose}
            className="confirm-modal-close"
          >
            ✕
          </button>
        )}

        {/* Content */}
        <div className="confirm-modal-body">
          {/* Icon */}
          <div className="confirm-modal-icon">
            {icons[type]}
          </div>

          {/* Title */}
          <h2 className="confirm-modal-title">
            {title}
          </h2>

          {/* Message */}
          <p className="confirm-modal-message">
            {message}
          </p>

          {/* Actions */}
          <div className="confirm-modal-actions">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="confirm-modal-btn confirm-modal-btn-cancel"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="confirm-modal-btn confirm-modal-btn-confirm"
              style={{ backgroundColor: buttonColors[type] }}
            >
              {isLoading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ConfirmModal.displayName = 'ConfirmModal';

export default ConfirmModal;
