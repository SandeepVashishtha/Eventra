import React, { lazy, Suspense } from "react";
import { useAuth } from "../context/AuthContext";
import FeatureErrorBoundary from "../components/common/FeatureErrorBoundary";
import Loading from "./common/Loading";

const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
const UserDashboard = lazy(() => import("./user/UserDashboard"));

const Dashboard = () => {
  const { isAdmin } = useAuth();

  return (
    <FeatureErrorBoundary>
      <Suspense fallback={<Loading text="Loading dashboard..." />}>
        {isAdmin() ? <AdminDashboard /> : <UserDashboard />}
      </Suspense>
    </FeatureErrorBoundary>
  );
};

export default Dashboard;
