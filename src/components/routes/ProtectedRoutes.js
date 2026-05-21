import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

// --------------- COMPONENTS
import ProtectedRoute from "../auth/ProtectedRoute";
import EventCreation from "../common/EventCreation";
import HostHackathon from "../../Pages/Hackathons/HostHackathon";
import EditProfile from "../user/EditProfile";
import Settings from "../../Pages/Settings";
import Login from "../auth/Login";
import Signup from "../auth/Signup";
import Unauthorized from "../auth/Unauthorized";
import PasswordReset from "../auth/PasswordReset";
import NotFound from "../NotFound";

const AdminDashboard = lazy(() => import("../admin/AdminDashboard"));
const Dashboard = lazy(() => import("../Dashboard"));

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
