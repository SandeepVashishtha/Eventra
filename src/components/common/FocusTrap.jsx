import React, { useCallback } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

/**
 * FocusTrap Component
 *
 * A zero-dependency wrapper component that constrains keyboard focus to its
 * children while `isActive` is true, and closes on Escape key press.
 *
 * Features:
 *  - Traps focus within component using keyboard navigation (WCAG 2.1 SC 2.1.2)
 *  - Handles Escape key to trigger close callback
 *  - Properly restores focus on deactivation
 *  - Supports nested focus traps
 *  - Performance optimized with minimal DOM operations
 *
 * Usage:
 *
 *   <FocusTrap isActive={isOpen} onEscape={handleClose} data-testid="modal-trap">
 *     <div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
 *       …dialog content…
 *     </div>
 *   </FocusTrap>
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isActive - Activates the trap when true. Focus is only trapped when active.
 * @param {Function} props.onEscape - Callback invoked when Escape key is pressed while trap is active.
 * @param {React.ReactNode} props.children - Content to be wrapped by the focus trap.
 * @param {string} [props.className=''] - Optional CSS class(es) forwarded to the wrapper div.
 * @param {string} [props.id] - Optional id for the wrapper element.
 * @param {string} [props.role='group'] - Optional ARIA role for the wrapper (default: 'group').
 * @returns {React.ReactElement} Rendered focus trap wrapper.
 *
 * @example
 * // Modal with focus trap
 * const [isOpen, setIsOpen] = React.useState(false);
 * return (
 *   <FocusTrap isActive={isOpen} onEscape={() => setIsOpen(false)}>
 *     <div role="dialog" aria-modal="true">
 *       <h2>Modal Title</h2>
 *       <button onClick={() => setIsOpen(false)}>Close</button>
 *     </div>
 *   </FocusTrap>
 * );
 */
const FocusTrap = ({ 
  isActive, 
  onEscape, 
  children, 
  className = '',
  id,
  role = 'group',
  ...rest 
}) => {
  const { containerRef } = useFocusTrap(isActive, onEscape);

  // Memoized escape handler for performance
  const handleEscape = useCallback(() => {
    if (isActive && onEscape) {
      onEscape();
    }
  }, [isActive, onEscape]);

  return (
    <div 
      ref={containerRef} 
      className={className}
      id={id}
      role={role}
      data-focus-trap-active={isActive}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && isActive) {
          e.preventDefault();
          handleEscape();
        }
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

FocusTrap.displayName = 'FocusTrap';

export default FocusTrap;