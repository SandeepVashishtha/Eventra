
import { useFocusTrap } from '../../hooks/useFocusTrap';

/**
 * FocusTrap
 *
 * A zero-dependency wrapper component that constrains keyboard focus to its
 * children while `isActive` is true, and closes on Escape.
 *
 * Usage:
 *
 *   <FocusTrap isActive={isOpen} onEscape={handleClose}>
 *     <div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
 *       …dialog content…
 *     </div>
 *   </FocusTrap>
 *
 * @param {object}   props
 * @param {boolean}  props.isActive   - Activates the trap when true.
 * @param {Function} props.onEscape   - Called when the Escape key is pressed.
 * @param {React.ReactNode} props.children
 * @param {string}  [props.className] - Optional class forwarded to the wrapper div.
 */
const FocusTrap = ({ isActive, onEscape, children, className = '' }) => {
  const { containerRef } = useFocusTrap(isActive, onEscape);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

export default FocusTrap;
// Optimized for lazy loading