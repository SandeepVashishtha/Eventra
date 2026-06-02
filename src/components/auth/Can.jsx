import React from 'react';
import { useRBAC } from '../../context/RBACContext';

/**
 * Can Component
 * 
 * Conditionally renders UI elements based on the user's granular permissions.
 * Example: <Can I="ticket:scan" a="event"><ScanButton /></Can>
 */
const Can = ({ I, a, children, fallback = null }) => {
  const { can } = useRBAC();
  
  // Combine action and resource (e.g. "ticket:scan") if provided separately,
  // or just use 'I' if it's already a full action string.
  const action = a ? `${a}:${I}` : I;

  if (can(action)) {
    return <>{children}</>;
  }

  return fallback;
};

export default Can;
