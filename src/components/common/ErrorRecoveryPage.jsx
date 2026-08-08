import { useRouteError } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";

function ErrorRecoveryContent() {
  const routeError = useRouteError();
  const error =
    routeError instanceof Error
      ? routeError
      : new Error(routeError?.statusText || routeError?.message || "Route failed to load");

  throw Object.assign(error, { status: routeError?.status });
}

export default function ErrorRecoveryPage() {
  return (
    <ErrorBoundary level="page" type="route">
      <ErrorRecoveryContent />
    </ErrorBoundary>
  );
}
