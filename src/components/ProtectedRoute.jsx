// Example implementation of inside your ./routes/ProtectedRoutes.js
import { Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import DashboardHome from "../Pages/DashboardHome";
import ProjectHub from "../Pages/ProjectHub";

export const getProtectedRoutes = () => {
  return [
    <Route 
      key="dashboard-home" 
      path="/dashboard" 
      element={
        <ProtectedRoute>
          <DashboardHome />
        </ProtectedRoute>
      } 
    />,
    <Route 
      key="dashboard-projects" 
      path="/dashboard/projects" 
      element={
        <ProtectedRoute>
          <ProjectHub />
        </ProtectedRoute>
      } 
    />
  ];
};