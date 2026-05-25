import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "Are you sure you want to log out?",
  confirmText = "Yes, Logout",
  cancelText = "Cancel"
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="confirmation-modal-overlay" onClick={handleOverlayClick}>
      <div className="confirmation-modal-content">
        <div className="confirmation-modal-header">
          <h3>{title}</h3>
        </div>
        
        <div className="confirmation-modal-body">
          <p>{message}</p>
        </div>
        
        <div className="confirmation-modal-actions">
          <button 
            className="confirmation-modal-btn confirmation-modal-btn-cancel" 
            onClick={onClose}
          >
             {cancelText}
          </button>
          <button 
            className="confirmation-modal-btn confirmation-modal-btn-confirm" 
            onClick={onConfirm}
          >
             {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;