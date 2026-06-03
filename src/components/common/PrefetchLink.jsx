import React from "react";
import { Link } from "react-router-dom";

/**
 * PrefetchLink
 * 
 * An enhanced Link component that pre-fetches the lazy component
 * for the target route when the user hovers over the link.
 */
const PrefetchLink = ({ to, prefetch, children, ...props }) => {
  const handleMouseEnter = () => {
    if (prefetch && typeof prefetch === "function") {
      // Trigger the lazy component load
      prefetch();
    }
  };

  return (
    <Link to={to} onMouseEnter={handleMouseEnter} {...props}>
      {children}
    </Link>
  );
};

export default PrefetchLink;
