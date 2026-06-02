import './Button.css';

export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  className = '',
  type = 'button',
  disabled = false,
  ariaLabel,
  ...props
}) => {

  // Allowed variants and sizes
  const validVariants = ['primary', 'secondary', 'danger', 'outline'];
  const validSizes = ['small', 'medium', 'large'];

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
};