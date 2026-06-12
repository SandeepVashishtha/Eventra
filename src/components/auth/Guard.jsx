import Gate from "./Gate";

const Guard = ({
  requireRole = null,
  requireRoles = [],
  requirePermissions = [],
  requirePermissionsMatch = "any",
  requireAuth = true,
  fallback = null,
  children,
}) => {
  const roles = [...(requireRole ? [requireRole] : []), ...requireRoles];

  return (
    <Gate
      requireAuth={requireAuth}
      requiredRoles={roles}
      requiredPermissions={requirePermissions}
      permissionsMatch={requirePermissionsMatch === "all" ? "all" : "any"}
      fallback={fallback}
    >
      {children}
    </Gate>
  );
};

export default Guard;
