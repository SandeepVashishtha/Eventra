import { forwardRef } from 'react';
import './Button.css';

// 🔥 FIX: Hoisted static arrays outside the render cycle to prevent memory reallocation on every single button render
const validVariants = ['primary', 'secondary', 'danger', 'outline'];
const validSizes = ['small', 'medium', 'large'];

// 🔥 FIX: Wrapped component in forwardRef to allow focus management and integration with external libraries
export const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'medium',
  className = '',
  type = 'button',
  disabled = false,
  ariaLabel,
  ...props
}, ref) => {

  // Allowed variants and sizes
  
  // Fallback protection
  const safeVariant = validVariants.includes(variant)
    ? variant
    : 'primary';

  const safeSize = validSizes.includes(size)
    ? size
    : 'medium';

  // Combined class names
  const buttonClass = `btn btn-${safeVariant} btn-${safeSize} ${disabled ? 'btn-disabled' : ''} ${className}`;

  return (
    <button
      ref={ref} // 🔥 FIX: Attached the forwarded ref to the actual DOM node
      type={type}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      className={buttonClass.trim()}
      {...props}
    >
      {children}
    </button>
  );
});

// 🔥 FIX: Added displayName for clean debugging in React DevTools
Button.displayName = 'Button';