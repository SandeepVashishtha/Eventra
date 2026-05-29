import React, { useEffect, useRef } from "react";
import "./ConfirmationModal.css";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  const cancelButtonRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevActive = document.activeElement;
    document.body.style.overflow = "hidden";
    cancelButtonRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevActive?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="confirmation-modal-overlay" onClick={handleOverlayClick} role="presentation">
      <div ref={modalRef} className="confirmation-modal-content" role="dialog" aria-modal="true">
        <div className="confirmation-modal-header">
          <h3>{title}</h3>
        </div>
        <div className="confirmation-modal-body">
          <p>{message}</p>
        </div>
        <div className="confirmation-modal-actions">
          <button ref={cancelButtonRef} type="button" className="confirmation-modal-btn confirmation-modal-btn-cancel" onClick={onClose} aria-label="Cancel">
            {cancelText}
          </button>
          <button type="button" className="confirmation-modal-btn confirmation-modal-btn-confirm" onClick={onConfirm} aria-label="Confirm">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
