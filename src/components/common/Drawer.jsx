import React, { useEffect } from "react";
import FocusTrap from "./FocusTrap";

/**
 * Drawer
 *
 * Accessible side-drawer (off-canvas) component.
 *
 * Accessibility features added (issue #5308):
 *  - Focus is trapped inside the drawer while it is open (WCAG 2.1 SC 2.1.2).
 *  - Pressing Escape closes the drawer.
 *  - Focus returns to the trigger element when the drawer closes.
 *  - `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` are set.
 *  - Background scroll is locked while the drawer is open.
 *
 * @param {object}   props
 * @param {boolean}  props.isOpen      - Controls visibility.
 * @param {Function} props.onClose     - Called to close the drawer.
 * @param {string}  [props.title]      - Drawer title text.
 * @param {string}  [props.titleId]    - Optional id for aria-labelledby.
 * @param {'left'|'right'} [props.side] - Which side the drawer slides in from. Default: 'right'.
 * @param {React.ReactNode} props.children
 * @param {string}  [props.className]  - Extra classes for the drawer panel.
 */
const SIDE_CLASSES = {
  left: {
    panel: "left-0 translate-x-0",
    hidden: "-translate-x-full",
  },
  right: {
    panel: "right-0 translate-x-0",
    hidden: "translate-x-full",
  },
};

const Drawer = ({
  isOpen,
  onClose,
  title,
  titleId = "drawer-title",
  side = "right",
  children,
  className = "",
}) => {
  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const { panel, hidden } = SIDE_CLASSES[side] ?? SIDE_CLASSES.right;
  const translateClass = isOpen ? panel : hidden;

  return (
    /* Portal-like overlay; always rendered so CSS transitions work */
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-50" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel wrapped in FocusTrap */}
      <FocusTrap isActive={isOpen} onEscape={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          className={`absolute top-0 ${side}-0 flex h-full w-80 max-w-full flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-gray-900 ${translateClass} ${className}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
            {title ? (
              <h2 id={titleId} className="text-base font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
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
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        </div>
      </FocusTrap>
    </div>
  );
};

export default Drawer;
