import React from 'react';
import './Button.css';

export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  className = '',
  type = 'button',
  disabled = false,
  ariaLabel,
  onClick,
  ...props
}) => {

  const validVariants = ['primary', 'secondary', 'danger'];
  const validSizes = ['small', 'medium', 'large'];

  const safeVariant = validVariants.includes(variant) ? variant : 'primary';
  const safeSize = validSizes.includes(size) ? size : 'medium';

  const buttonClass = `
    btn
    btn-${safeVariant}
    btn-${safeSize}
    ${disabled ? 'btn-disabled' : ''}
    ${className}
  `;

  const handlePress = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (onClick && typeof onClick === 'function') {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      className={buttonClass.trim()}
      onClick={handlePress}
      {...props}
    >
      {children}
    </button>
  );
};
