import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

// --------------- COMPONENTS
import ProtectedRoute from "../auth/ProtectedRoute";
import EventCreation from "../common/EventCreation";
import ErrorBoundary from "../common/ErrorBoundary";
import HostHackathon from "../../Pages/Hackathons/HostHackathon";
import EditProfile from "../user/EditProfile";
import Settings from "../../Pages/Settings";
import AuthPage from "../auth/AuthPage";
import Unauthorized from "../auth/Unauthorized";
import PasswordReset from "../auth/PasswordReset";
import NotFound from "../NotFound";
import SurveyEngine from "../../Pages/Feedback/SurveyEngine";

const AdminDashboard = lazy(() => import("../admin/AdminDashboard"));
const Dashboard = lazy(() => import("../Dashboard"));

const withModuleBoundary = (children, boundaryName) => (
  <ErrorBoundary
    variant="section"
    boundaryName={boundaryName}
    title={`${boundaryName} needs a reset`}
  >
    {children}
  </ErrorBoundary>
);

export const getProtectedRoutes = () => [
  <Route
    key="/create-event"
    path="/create-event"
    element={
      <ProtectedRoute 
        requiredPermissions={["CREATE_EVENT"]}
        requiredScopes={["event:write"]}
        validateContext={({ user }) => user?.roles?.includes("ADMIN") || user?.roles?.includes("EVENT_MANAGER")}
      >
        {withModuleBoundary(<EventCreation />, "Event creation")}
      </ProtectedRoute>
    }
  />,
  <Route
    key="/admin"
    path="/admin"
    element={
      <ProtectedRoute 
        requiredRoles={["ADMIN"]}
        requiredScopes={["admin:all"]}
        validateContext={({ user }) => user?.status !== "Suspended"}
      >
        {withModuleBoundary(<AdminDashboard />, "Admin dashboard")}
      </ProtectedRoute>
    }
  />,
  <Route
    key="/host-hackathon"
    path="/host-hackathon"
    element={
      <ProtectedRoute 
        requiredPermissions={["HOST_HACKATHON"]}
        requiredScopes={["hackathon:write"]}
        validateContext={({ user }) => user?.roles?.includes("ADMIN") || user?.roles?.includes("EVENT_MANAGER")}
      >
        {withModuleBoundary(<HostHackathon />, "Hackathon hosting")}
      </ProtectedRoute>
    }
  />,
  <Route
    key="/dashboard"
    path="/dashboard"
    element={
      <ProtectedRoute>
        {withModuleBoundary(<Dashboard />, "User dashboard")}
      </ProtectedRoute>
    }
  />,
  <Route
    key="/profile"
    path="/profile"
    element={
      <ProtectedRoute>
        {withModuleBoundary(<EditProfile />, "Profile editor")}
      </ProtectedRoute>
    }
  />,
  <Route
    key="/settings"
    path="/settings"
    element={
      <ProtectedRoute>
        {withModuleBoundary(<Settings />, "Settings")}
      </ProtectedRoute>
    }
  />,
  <Route
    key="/feedback/survey-builder"
    path="/feedback/survey-builder"
    element={
      <ProtectedRoute requiredPermissions={["HOST_HACKATHON", "CREATE_EVENT"]}>
        {withModuleBoundary(<SurveyEngine />, "Survey builder")}
      </ProtectedRoute>
    }
  />,
];

export const getAuthRoutes = () => [
  <Route key="/login" path="/login" element={<AuthPage />} />,
  <Route key="/signup" path="/signup" element={<AuthPage />} />,
  <Route key="/unauthorized" path="/unauthorized" element={<Unauthorized />} />,
  <Route key="/password-reset" path="/password-reset" element={<PasswordReset />} />,
  <Route key="/*" path="/*" element={<NotFound />} />,
];
