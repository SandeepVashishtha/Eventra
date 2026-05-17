// Button.jsx
import React from 'react';
import './Button.css'; // Imports your standard styles

export const Button = ({ 
  children, 
  variant = 'primary', // Default color is primary
  size = 'medium',     // Default size is medium
  className = '',      // Allows adding extra custom classes if ever needed
  ...props             // Passes down onClick, disabled, type, etc.
}) => {
  
  // This stitches your standard classes together dynamically
  const buttonClass = `btn btn-${variant} btn-${size} ${className}`;

  return (
    <button className={buttonClass.trim()} {...props}>
      {children}
    </button>
  );
};