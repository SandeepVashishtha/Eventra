import React from "react";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./admin/AdminDashboard";
import UserDashboard from "./user/UserDashboard";
import FeatureErrorBoundary from "../components/common/FeatureErrorBoundary";

const Dashboard = () => {
  const { isAdmin } = useAuth();

  if (isAdmin()) {
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
