import { lazy, Suspense } from "react";
import { useAuth } from "../context/AuthContext";
import FeatureErrorBoundary from "../components/common/FeatureErrorBoundary";
import SEOHead from "../components/SEOHead";
import Loading from "./common/Loading";

const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
const UserDashboard = lazy(() => import("./user/UserDashboard"));

const Dashboard = () => {
  // 🔥 FIX: Added safe destructuring with a fallback to prevent crashes if context is missing
  const { isAdmin } = useAuth() || {};

  // 🔥 FIX: Safely access window to prevent SSR (Server-Side Rendering) or testing environment crashes
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      <SEOHead
        title="My Dashboard"
        description="Manage your events, registrations, and account settings on Eventra."
        url={currentUrl}
      />
      <FeatureErrorBoundary>
        <Suspense fallback={<Loading text="Loading dashboard..." />}>
          {/* 🔥 FIX: Safely invoked isAdmin with optional chaining to prevent TypeError crashes */}
          {isAdmin?.() ? <AdminDashboard /> : <UserDashboard />}
        </Suspense>
      </FeatureErrorBoundary>
    </>
  );
};

export default Dashboard;