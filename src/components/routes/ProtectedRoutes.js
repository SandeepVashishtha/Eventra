import React from "react";
import { Route } from "react-router-dom";

import { lazyWithRetry } from "../../utils/lazyWithRetry";
import ProtectedRoute from "../auth/ProtectedRoute";
import { ROLES, PERMISSIONS } from "../../config/roles";

const EventCreation = lazyWithRetry(() => import("../common/EventCreation/EventCreation"));
const HostHackathon = lazyWithRetry(() => import("../../Pages/Hackathons/HostHackathon"));
const UserProfile = lazyWithRetry(() => import("../user/UserProfile"));
const EditProfile = lazyWithRetry(() => import("../user/EditProfile"));
const Settings = lazyWithRetry(() => import("../../Pages/Settings"));
const AuthPage = lazyWithRetry(() => import("../auth/AuthPage"));
const Unauthorized = lazyWithRetry(() => import("../auth/Unauthorized"));
const PasswordReset = lazyWithRetry(() => import("../auth/PasswordReset"));
const AdminDashboard = lazyWithRetry(() => import("../admin/AdminDashboard"));
const Dashboard = lazyWithRetry(() => import("../Dashboard"));
const SurveyEngine = lazyWithRetry(() => import("../../Pages/Feedback/SurveyEngine"));

export const getProtectedRoutes = () => [
  <Route
    key="/create-event"
    path="/create-event"
    element={
      <ProtectedRoute
        requiredPermissions={[PERMISSIONS.CREATE_EVENT]}
        requiredScopes={["event:write"]}
        validateContext={({ user }) =>
          user?.roles?.includes(ROLES.ADMIN) || user?.roles?.includes(ROLES.ORGANIZER)
        }
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
        requiredRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}
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
        requiredPermissions={[PERMISSIONS.HOST_HACKATHON]}
        requiredScopes={["hackathon:write"]}
        validateContext={({ user }) =>
          user?.roles?.includes(ROLES.ADMIN) || user?.roles?.includes(ROLES.ORGANIZER)
        }
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
    key="/dashboard/profile"
    path="/dashboard/profile"
    element={
      <ProtectedRoute>
        <UserProfile />
      </ProtectedRoute>
    }
  />,
  <Route
    key="/profile/edit"
    path="/profile/edit"
    element={
      <ProtectedRoute>
        <EditProfile />
      </ProtectedRoute>
    }
  />,
  <Route
    key="/profile"
    path="/profile"
    element={
      <ProtectedRoute>
        <UserProfile />
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
      <ProtectedRoute
        requiredPermissions={[
          PERMISSIONS.HOST_HACKATHON,
          PERMISSIONS.CREATE_EVENT,
        ]}
      >
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
];
