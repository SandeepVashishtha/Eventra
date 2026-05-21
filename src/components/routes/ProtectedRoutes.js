import React from 'react';
import { Route } from 'react-router-dom';

import ProtectedRoute from "../auth/ProtectedRoute";

// --------------- COMPONENTS
const EventCreation = React.lazy(() => import("../common/EventCreation"));
const AdminDashboard = React.lazy(() => import("../admin/AdminDashboard"));
const HostHackathon = React.lazy(() => import("../../Pages/Hackathons/HostHackathon"));
const Dashboard = React.lazy(() => import("../Dashboard"));
const EditProfile = React.lazy(() => import("../user/EditProfile"));
const Settings = React.lazy(() => import("../../Pages/Settings"));
const Login = React.lazy(() => import("../auth/Login"));
const Signup = React.lazy(() => import("../auth/Signup"));
const Unauthorized = React.lazy(() => import("../auth/Unauthorized"));
const PasswordReset = React.lazy(() => import("../auth/PasswordReset"));
const NotFound = React.lazy(() => import("../NotFound"));

export const getProtectedRoutes = () => [
  <Route
    key="/create-event"
    path="/create-event"
    element={
      <ProtectedRoute requiredPermissions={["CREATE_EVENT"]}>
        <EventCreation />
      </ProtectedRoute>
    }
  />,
  <Route
    key="/admin"
    path="/admin"
    element={
      <ProtectedRoute requiredRoles={["ADMIN"]}>
        <AdminDashboard />
      </ProtectedRoute>
    }
  />,
  <Route
    key="/host-hackathon"
    path="/host-hackathon"
    element={
      <ProtectedRoute requiredPermissions={["HOST_HACKATHON"]}>
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
];

export const getAuthRoutes = () => [
  <Route key="/login" path="/login" element={<Login />} />,
  <Route key="/signup" path="/signup" element={<Signup />} />,
  <Route key="/unauthorized" path="/unauthorized" element={<Unauthorized />} />,
  <Route key="/password-reset" path="/password-reset" element={<PasswordReset />} />,
  <Route key="/*" path="/*" element={<NotFound />} />,
];
