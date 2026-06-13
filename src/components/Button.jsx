import React, { forwardRef } from "react";
import "./Button.css";

// 🔥 FIX: Hoisted static arrays outside the render cycle
const validVariants = ["primary", "secondary", "danger", "outline"];
const validSizes = ["small", "medium", "large"];

export const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "medium",
      className = "",
      type = "button",
      disabled = false,
      "aria-label": ariaLabel, // Changed to destructure standard aria-label
      ...props
    },
    ref
  ) => {
    // Fallback protection
    const safeVariant = validVariants.includes(variant) ? variant : "primary";
    const safeSize = validSizes.includes(size) ? size : "medium";

    // Combined class names
    const buttonClass = `btn btn-${safeVariant} btn-${safeSize} ${disabled ? "btn-disabled" : ""} ${className}`;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        aria-disabled={disabled}
        aria-label={ariaLabel} // Now uses the destructured prop correctly
        className={buttonClass.trim()}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
