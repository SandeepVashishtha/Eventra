import { forwardRef } from "react";

const VARIANTS = ["primary", "secondary", "danger", "outline", "ghost"];
const SIZES = ["sm", "md", "lg"];

export const Button = forwardRef(({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled = false,
  loading = false,
  ariaLabel,
  onClick,
  ...props
}, ref) => {
  const safeVariant = VARIANTS.includes(variant) ? variant : "primary";
  const safeSize = SIZES.includes(size) ? size : "md";

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      onClick={onClick}
      className={`ds-btn ds-btn-${safeVariant} ds-btn-${safeSize} ${disabled || loading ? "ds-btn-disabled" : ""} ${className}`}
      {...props}
    >
      {loading && <span className="ds-btn-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
});

Button.displayName = "Button";
