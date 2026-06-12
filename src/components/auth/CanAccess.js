import { useAuth } from '../../context/AuthContext';

const CanAccess = ({ roles = [], permissions = [], children, fallback = null }) => {
  const { hasAnyRole, hasAnyPermission, isAuthenticated } = useAuth();

  if (!isAuthenticated()) return fallback;
  if (roles.length > 0 && !hasAnyRole(...roles)) return fallback;
  if (permissions.length > 0 && !hasAnyPermission(...permissions)) return fallback;

  return children;
};

export default CanAccess;