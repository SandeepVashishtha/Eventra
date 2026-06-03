import React, { useEffect } from 'react';
import FocusTrap from './FocusTrap';

/**
 * Modal
 *
 * Accessible modal dialog component.
 *
 * Accessibility features added (issue #5308):
 *  - Focus is trapped inside the modal while it is open (WCAG 2.1 SC 2.1.2).
 *  - Pressing Escape closes the modal (WCAG 2.1 SC 2.1.2 / common pattern).
 *  - Focus returns to the trigger element when the modal closes.
 *  - `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` are set.
 *  - Background scroll is locked while the modal is open.
 *
 * @param {object}   props
 * @param {boolean}  props.isOpen        - Controls visibility.
 * @param {Function} props.onClose       - Called to close the modal.
 * @param {string}  [props.title]        - Modal title text (rendered in header).
 * @param {string}  [props.titleId]      - Optional id for aria-labelledby; auto-generated if omitted.
 * @param {React.ReactNode} props.children
 * @param {string}  [props.className]    - Extra classes for the modal panel.
 * @param {boolean} [props.hideCloseBtn] - Hides the × button when true.
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  titleId = 'modal-title',
  children,
  className = '',
  hideCloseBtn = false,
}) => {
  // Lock background scroll while the modal is open.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-hidden="false"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog panel wrapped in FocusTrap */}
      <FocusTrap isActive={isOpen} onEscape={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          className={`relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 ${className}`}
        >
          {/* Header */}
          {(title || !hideCloseBtn) && (
            <div className="mb-4 flex items-center justify-between">
              {title && (
                <h2
                  id={titleId}
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  {title}
                </h2>
              )}
              {!hideCloseBtn && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="ml-auto rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                >
                  {/* × icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          {children}
        </div>
      </FocusTrap>
    </div>
  );
};

export default Modal;
