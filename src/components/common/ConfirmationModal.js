import React, { useEffect, useId, useRef } from "react";
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
  const modalRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    previouslyFocusedElementRef.current = document.activeElement;
    document.body.style.overflow = "hidden";

    // Focus cancel button or modal contents on open
    setTimeout(() => {
      cancelButtonRef.current?.focus();
    }, 0);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const focusableElements = Array.from(
        modalRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || []
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusableElements.length === 0) {
        e.preventDefault();
        modalRef.current?.focus();
        return;
      }

      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (e.shiftKey && activeElement === firstFocusableElement) {
        e.preventDefault();
        lastFocusableElement.focus();
      } else if (!e.shiftKey && activeElement === lastFocusableElement) {
        e.preventDefault();
        firstFocusableElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      if (previouslyFocusedElementRef.current?.isConnected) {
        previouslyFocusedElementRef.current.focus();
      }
      previouslyFocusedElementRef.current = null;
    };
  }, [isOpen, onClose]);

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