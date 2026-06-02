import { lazy } from "react";
import { Route } from "react-router-dom";

import ProtectedRoute from "../auth/ProtectedRoute";
import ErrorBoundary from "../common/ErrorBoundary";
import { ROLES, PERMISSIONS } from "../../config/roles";

// 🔥 FIX: Removed all duplicate const declarations that were causing fatal SyntaxErrors
const NotificationSettings = lazy(() => import("../../Pages/NotificationSettings"));
const EventCreation = lazy(() => import("../common/EventCreation/EventCreation"));
const HostHackathon = lazy(() => import("../../Pages/Hackathons/HostHackathon"));
const UserProfile = lazy(() => import("../user/UserProfile"));
const EditProfile = lazy(() => import("../user/EditProfile"));
const Settings = lazy(() => import("../../Pages/Settings"));
const AuthPage = lazy(() => import("../auth/AuthPage"));
const Unauthorized = lazy(() => import("../auth/Unauthorized"));
const PasswordReset = lazy(() => import("../auth/PasswordReset"));
const AdminDashboard = lazy(() => import("../admin/AdminDashboard"));
const Dashboard = lazy(() => import("../Dashboard"));
const SurveyEngine = lazy(() => import("../../Pages/Feedback/SurveyEngine"));
const MatchmakingHub = lazy(() => import("../../Pages/Networking/MatchmakingHub"));
const CollaborativeFloorPlan = lazy(() => import("../events/CollaborativeFloorPlan"));
const MFASetup = lazy(() => import("../../Pages/Auth/MFASetup"));
const AuditLogs = lazy(() => import("../../Pages/Admin/AuditLogs"));

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
      <ProtectedRoute redirectTo="/login">
        {withModuleBoundary(<EventCreation />, "Event creation")}
      </ProtectedRoute>
    }
  />,
  <Route
    key="/admin"
    path="/admin"
    element={
      <ProtectedRoute
  requiredRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}
  redirectTo="/login"
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
      requiredPermissions={[PERMISSIONS.HOST_HACKATHON]}
      requiredScopes={["hackathon:write"]}
      validateContext={({ user }) =>
        user?.roles?.includes(ROLES.ADMIN) || user?.roles?.includes(ROLES.ORGANIZER)
      }
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
    key="/dashboard/profile"
    path="/dashboard/profile"
    element={
      <ProtectedRoute>
        <UserProfile />
      </ProtectedRoute>
    }
  />,
  <Route
    key="/networking"
    path="/networking"
    element={
      <ProtectedRoute>
        {withModuleBoundary(<MatchmakingHub />, "Matchmaking Hub")}
      </ProtectedRoute>
    }
  />,
  <Route
    key="/auth/mfa"
    path="/auth/mfa"
    element={
      <ProtectedRoute>
        {withModuleBoundary(<MFASetup />, "MFA Setup")}
      </ProtectedRoute>
    }
  />,
  <Route
    key="/admin/audit-logs"
    path="/admin/audit-logs"
    element={
      <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
        {withModuleBoundary(<AuditLogs />, "Security Audit Logs")}
      </ProtectedRoute>
    }
  />,
  <Route
    key="/profile/edit"
    path="/profile/edit"
    element={
      <ProtectedRoute>
        {withModuleBoundary(<EditProfile />, "Profile editor")}
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
        {withModuleBoundary(<Settings />, "Settings")}
      </ProtectedRoute>
    }
  />,
  <Route
    key="/settings/notifications"
    path="/settings/notifications"
    element={
      <ProtectedRoute>
        <NotificationSettings />
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
        {withModuleBoundary(<SurveyEngine />, "Survey builder")}
      </ProtectedRoute>
    }
  />,
  <Route
    key="/events/:eventId/floorplan-editor"
    path="/events/:eventId/floorplan-editor"
    element={
      <ProtectedRoute>
        {withModuleBoundary(<CollaborativeFloorPlan />, "Floor Plan Designer")}
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