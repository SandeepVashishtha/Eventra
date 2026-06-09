import { useAuth } from '../../context/AuthContext';

const CanAccess = ({ roles = [], permissions = [], children, fallback = null }) => {
  const { hasAnyRole, hasAnyPermission, isAuthenticated } = useAuth();

  if (!isAuthenticated()) return fallback;

  // Fail-closed: no constraints = deny. Prevents silent misconfiguration.
  if (roles.length === 0 && permissions.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[CanAccess] No roles or permissions specified — access denied. ' +
        'Pass at least one role or permission to allow access.'
      );
    }
    return fallback;
  }

  if (roles.length > 0 && !hasAnyRole(...roles)) return fallback;
  if (permissions.length > 0 && !hasAnyPermission(...permissions)) return fallback;

  return children;
};

export default CanAccess;
