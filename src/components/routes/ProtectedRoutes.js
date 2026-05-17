import { lazy } from 'react';
import { Route } from 'react-router-dom';

import ProtectedRoute from '../auth/ProtectedRoute';

const EventCreation = lazy(() => import('../common/EventCreation'));
const AdminDashboard = lazy(() => import('../admin/AdminDashboard'));
const HostHackathon = lazy(() => import('../../Pages/Hackathons/HostHackathon'));
const Dashboard = lazy(() => import('../Dashboard'));
const EditProfile = lazy(() => import('../user/EditProfile'));
const Settings = lazy(() => import('../../Pages/Settings'));
const Login = lazy(() => import('../auth/Login'));
const Signup = lazy(() => import('../auth/Signup'));
const Unauthorized = lazy(() => import('../auth/Unauthorized'));
const PasswordReset = lazy(() => import('../auth/PasswordReset'));
const NotFound = lazy(() => import('../NotFound'));

export const getProtectedRoutes = () => [
  <Route
    key="/create-event"
    path="/create-event"
    element={
      <ProtectedRoute requiredPermissions={['CREATE_EVENT']}>
        <EventCreation />
      </ProtectedRoute>
    }
  />,
  <Route
    key="/admin"
    path="/admin"
    element={
      <ProtectedRoute requiredRoles={['ADMIN']}>
        <AdminDashboard />
      </ProtectedRoute>
    }
  />,
  <Route
    key="/host-hackathon"
    path="/host-hackathon"
    element={
      <ProtectedRoute requiredPermissions={['HOST_HACKATHON']}>
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
