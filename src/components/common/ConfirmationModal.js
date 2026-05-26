import React, { useEffect, useId, useRef } from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel"
}) => {
  const cancelButtonRef = useRef(null);
  const modalRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocusedElement = document.activeElement;
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  useEffect(() => {
  document.body.style.overflow =
    "hidden";

  return () => {
    document.body.style.overflow =
      "auto";
  };
}, []);
useEffect(() => {
  const handleKeyDown =
    (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

  window.addEventListener(
    "keydown",
    handleKeyDown
  );

  return () =>
    window.removeEventListener(
      "keydown",
      handleKeyDown
    );
}, [onClose]);

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
