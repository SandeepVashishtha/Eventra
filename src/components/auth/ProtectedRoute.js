import Gate from "./Gate";

const ProtectedRoute = (props) => {
  const {
    children,
    requiredRoles = [],
    requiredPermissions = [],
    requiredScopes = [],
    validateContext = null,
    requireAuth = true,
    redirectTo = "/login",
  } = props;

  return (
    <Gate
      requireAuth={requireAuth}
      requiredRoles={requiredRoles}
      requiredPermissions={requiredPermissions}
      requiredScopes={requiredScopes}
      validateContext={validateContext}
      redirectTo={redirectTo}
    >
      {children}
    </Gate>
  );
};

export default ProtectedRoute;
