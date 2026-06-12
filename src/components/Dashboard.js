import { lazy, Suspense } from "react";
import { useAuth } from "../context/AuthContext";
import FeatureErrorBoundary from "../components/common/FeatureErrorBoundary";
import SEOHead from "../components/SEOHead";
import Loading from "./common/Loading";

const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
const UserDashboard = lazy(() => import("./user/UserDashboard"));

const Dashboard = () => {
  const { isAdmin } = useAuth();

  return (
    <>
      <SEOHead
        title="My Dashboard"
        description="Manage your events, registrations, and account settings on Eventra."
        url={window.location.href}
      />
      <FeatureErrorBoundary>
        <Suspense fallback={<Loading text="Loading dashboard..." />}>
          {isAdmin() ? <AdminDashboard /> : <UserDashboard />}
        </Suspense>
      </FeatureErrorBoundary>
    </>
  );
};

export default Dashboard;
