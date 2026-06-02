import React from "react";
import SectionErrorBoundary from "./SectionErrorBoundary";

/**
 * withErrorBoundary HOC
 * 
 * A Higher-Order Component that wraps a component with a SectionErrorBoundary.
 * Useful for isolating features or sections without cluttering JSX.
 * 
 * @param {React.ComponentType} Component - The component to wrap
 * @param {Object} options - Configuration options
 * @param {string} options.label - Label for the error boundary
 * @param {boolean} options.silent - Whether to render nothing on error
 * @param {React.ReactNode} options.fallback - Custom fallback UI
 */
export const withErrorBoundary = (Component, options = {}) => {
  const { label, silent, fallback } = options;
  
  const WrappedComponent = (props) => (
    <SectionErrorBoundary 
      label={label || Component.displayName || Component.name || "Component"} 
      silent={silent}
      fallback={fallback}
    >
      <Component {...props} />
    </SectionErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || "Component"})`;
  
  return WrappedComponent;
};
