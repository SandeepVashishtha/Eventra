# Issue #005: ConfirmationModal missing focus trap, ARIA dialog role, and keyboard handling

**Tags:** `a11y`, `enhancement`, `intermediate`  
**Category:** Quality Exceptional — WCAG A compliance  
**Files:** `src/components/common/ConfirmationModal.js`

---

## Description

The `ConfirmationModal` component has critical accessibility violations and usability issues:

1. **No focus trap** — When the modal opens, focus stays on the triggering element (or is lost entirely). The Tab key allows focus to escape behind the modal overlay, making the page content accessible behind the modal.
2. **No ARIA dialog role** — Screen readers cannot identify this as a modal dialog.
3. **No `aria-modal`** — Assistive technology is not told that content behind the modal is inert.
4. **No `aria-labelledby`** — The dialog is not labelled by its title, so screen readers announce it generically.
5. **No Escape key handler** — Keyboard users cannot dismiss the modal.
6. **No focus restoration on close** — When the modal closes, focus is not returned to the element that triggered it.

### Current Code

`src/components/common/ConfirmationModal.js` (complete file, 51 lines):

```javascript
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
          <button className="..." onClick={onClose}>{cancelText}</button>
          <button className="..." onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};
```

### WCAG Violations

- **WCAG 2.4.3 Focus Order (A)**: Focus order must be logical. Tab can escape behind the modal.
- **WCAG 4.1.2 Name, Role, Value (A)**: The modal has no `role="dialog"`, so its role is not announced.
- **WCAG 2.1.1 Keyboard (A)**: Escape key does not close the modal.
- **WCAG 2.4.7 Focus Visible (AA)**: Focus is not moved into the modal when it opens.

## Proposed Fix

Convert the component to use `useEffect` and `useRef` to implement proper focus management:

```jsx
import React, { useEffect, useRef } from 'react';
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
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      // Focus the first focusable element (cancel button)
      const firstFocusable = modalRef.current?.querySelector('button');
      if (firstFocusable) {
        firstFocusable.focus();
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Restore focus to the trigger element
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap: cycle Tab within modal
  const handleKeyDown = (e) => {
    if (e.key !== 'Tab') return;

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

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
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
    >
      <div
        className="confirmation-modal-content"
        ref={modalRef}
        onKeyDown={handleKeyDown}
      >
        <div className="confirmation-modal-header">
          <h3 id="confirmation-modal-title">{title}</h3>
        </div>
        <div className="confirmation-modal-body">
          <p>{message}</p>
        </div>
        <div className="confirmation-modal-actions">
          <button className="..." onClick={onClose}>{cancelText}</button>
          <button className="..." onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
```

### Key Changes

1. **`role="dialog"`** and **`aria-modal="true"`** on the overlay
2. **`aria-labelledby="confirmation-modal-title"`** referencing the `<h3>` title
3. **Focus on open**: `useEffect` auto-focuses the first focusable element (Cancel button)
4. **Focus restoration on close**: `previousActiveElement.current?.focus()` in cleanup
5. **Escape key**: Separate `useEffect` handles Escape to close
6. **Focus trap**: `handleKeyDown` with Tab/Shift+Tab cycling between first and last focusable elements
7. **Body scroll lock**: `document.body.style.overflow = 'hidden'` while modal is open

## Acceptance Criteria

- [ ] Screen reader announces "dialog" role and reads the title when modal opens
- [ ] Focus moves to the Cancel button when modal opens
- [ ] Tab key cycles only between Cancel and Confirm buttons (focus trap)
- [ ] Shift+Tab reverses focus cycling correctly
- [ ] Escape key closes the modal
- [ ] Clicking overlay backdrop closes the modal
- [ ] When modal closes, focus returns to the element that triggered it
- [ ] Body scroll is locked while modal is open
- [ ] No breaking changes to existing functionality (logout, confirmation flows)

## Testing

- Use keyboard: Tab through the modal, verify focus doesn't escape
- Use screen reader (NVDA/VoiceOver): verify "dialog" role and title announcement
- Click backdrop, verify modal closes and focus returns
- Press Escape, verify modal closes
