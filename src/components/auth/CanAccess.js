import Gate from "./Gate";

const CanAccess = ({ roles = [], permissions = [], children, fallback = null }) => {
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
