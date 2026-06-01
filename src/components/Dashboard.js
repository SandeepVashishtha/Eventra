import React from "react";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./admin/AdminDashboard";
import UserDashboard from "./user/UserDashboard";
import FeatureErrorBoundary from "../components/common/FeatureErrorBoundary";

const Dashboard = () => {
  const auth = useAuth();
  
  if (!auth || typeof auth.isAdmin !== "function") {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Loading dashboard...
      </div>
    );
  }

  if (auth.isAdmin()) {
    return (
      <FeatureErrorBoundary>
        <AdminDashboard />
      </FeatureErrorBoundary>
    );
  }

  return (
    <FeatureErrorBoundary>
      <UserDashboard />
    </FeatureErrorBoundary>
  );
};

export default Dashboard;
