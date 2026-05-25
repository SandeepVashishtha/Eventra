import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

// --------------- COMPONENTS
import ProtectedRoute from "../auth/ProtectedRoute";
import EventCreation from "../common/EventCreation";
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
        <EventCreation />
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
        <AdminDashboard />
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
        <HostHackathon />
      </ProtectedRoute>
    }
  />,
  <Route
    key="/dashboard"
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />,
  <Route
    key="/profile"
    path="/profile"
    element={
      <ProtectedRoute>
        <EditProfile />
      </ProtectedRoute>
    }
  />,
  <Route
    key="/settings"
    path="/settings"
    element={
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    }
  />,
  <Route
    key="/feedback/survey-builder"
    path="/feedback/survey-builder"
    element={
      <ProtectedRoute requiredPermissions={["HOST_HACKATHON", "CREATE_EVENT"]}>
        <SurveyEngine />
      </ProtectedRoute>
    }
  />,
];

export const getAuthRoutes = () => [
  <Route key="/login" path="/login" element={<AuthPage />} />,
  <Route key="/signup" path="/signup" element={<AuthPage />} />,
  <Route key="/unauthorized" path="/unauthorized" element={<Unauthorized />} />,
  <Route key="/password-reset" path="/password-reset" element={<PasswordReset />} />,
  // <Route key="/*" path="/*" element={<NotFound />} />,
];
