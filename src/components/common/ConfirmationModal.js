import useModalManager from "hooks/useModalManager";
import { useEffect, useId, useRef } from "react";
import "./ConfirmationModal.css";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

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
  const titleId = useId();
  const descriptionId = useId();

  // Fix: useModalManager replaces the entire 60-line escape+focustrap+scrolllock block
  const { modalRef } = useModalManager(isOpen, onClose, {
    initialFocusRef: cancelButtonRef,
  });

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="confirmation-modal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="confirmation-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
        <div className="confirmation-modal-header">
          <h3 id={titleId}>{title}</h3>
        </div>

        <div className="confirmation-modal-body">
          <p id={descriptionId}>{message}</p>
        </div>

        <div className="confirmation-modal-actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="confirmation-modal-btn confirmation-modal-btn-cancel"
            onClick={onClose}
          >
            {cancelText}
          </button>

          <button
            type="button"
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
