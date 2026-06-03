import { lazy, Suspense } from "react";
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
const UIInventory = lazy(() => import("../admin/UIInventory"));

// 🔥 FIX: Added Suspense wrapper required for React.lazy() to prevent layout thrashing and crashes
const withModuleBoundary = (children, boundaryName) => (
  <ErrorBoundary
    variant="section"
    boundaryName={boundaryName}
    title={`${boundaryName} needs a reset`}
  >
    <Suspense fallback={<div className="flex justify-center items-center min-h-[50vh] text-gray-500 animate-pulse">Loading {boundaryName}...</div>}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

// 🔥 FIX: Added helper for naked auth routes
const withAuthSuspense = (children) => (
  <Suspense fallback={<div className="flex justify-center items-center min-h-screen text-gray-500 animate-pulse">Loading...</div>}>
    {children}
  </Suspense>
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
        // 🔥 FIX: Prevented fatal destructuring crash if context is undefined
        validateContext={(context) =>
          context?.user?.roles?.includes(ROLES.ADMIN) || context?.user?.roles?.includes(ROLES.ORGANIZER)
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
        {/* 🔥 FIX: Wrapped previously naked component to prevent full-app crashes */}
        {withModuleBoundary(<UserProfile />, "User Profile")}
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
        {/* 🔥 FIX: Wrapped previously naked component */}
        {withModuleBoundary(<UserProfile />, "User Profile")}
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
        {/* 🔥 FIX: Wrapped previously naked component */}
        {withModuleBoundary(<NotificationSettings />, "Notification Settings")}
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
    key="/admin/ui-inventory"
    path="/admin/ui-inventory"
    element={
      <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
        {withModuleBoundary(<UIInventory />, "UI Inventory")}
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
  // 🔥 FIX: Safely suspended lazy-loaded auth routes
  <Route key="/login" path="/login" element={withAuthSuspense(<AuthPage />)} />,
  <Route key="/signup" path="/signup" element={withAuthSuspense(<AuthPage />)} />,
  <Route key="/unauthorized" path="/unauthorized" element={withAuthSuspense(<Unauthorized />)} />,
  <Route key="/password-reset" path="/password-reset" element={withAuthSuspense(<PasswordReset />)} />,
];