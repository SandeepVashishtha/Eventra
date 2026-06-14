import { useEffect, useCallback } from "react";
import { Button } from "./Button";

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlay = true,
}) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="ds-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "ds-modal-title" : undefined}
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div
        className={`ds-modal ds-modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ds-modal-header">
          {title && <h2 id="ds-modal-title" className="ds-modal-title">{title}</h2>}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            ariaLabel="Close modal"
            className="ds-modal-close"
          >
            ✕
          </Button>
        </div>
        <div className="ds-modal-body">{children}</div>
        {footer && <div className="ds-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="ds-modal-actions">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="ds-modal-message">{message}</p>
    </Modal>
  );
}
