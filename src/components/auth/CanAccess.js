import Gate from "./Gate";

const CanAccess = ({ roles = [], permissions = [], children, fallback = null }) => {
  const noConstraints = roles.length === 0 && permissions.length === 0;
  if (noConstraints && process.env.NODE_ENV !== "production") {
    console.warn(
      "[CanAccess] No roles or permissions specified - access denied. " +
      "Pass at least one role or permission to allow access."
    );
  }

  return (
    <Gate
      requireAuth
      requiredRoles={roles}
      requiredPermissions={permissions}
      fallback={fallback}
    >
      {children}
    </Gate>
  );
};

export default CanAccess;
