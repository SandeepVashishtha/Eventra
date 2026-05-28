import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import { getPublicRoutes } from "./routes/PublicRoutes";
import {
  getProtectedRoutes,
  getAuthRoutes,
} from "./routes/ProtectedRoutes";

import ProtectedRoute from "./auth/ProtectedRoute";
import PageLoader from "./common/PageLoader";

const UserAchievements = lazy(() => import("../Pages/UserAchievements"));
const NotFoundPage = lazy(() => import("../Pages/NotFoundPage"));

const RouteFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center bg-white dark:bg-slate-950">
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm font-medium text-gray-700 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"
        aria-hidden="true"
      />
      <span role="status" aria-live="polite">
        Loading page...
      </span>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        {getPublicRoutes()}

        {/* Protected Routes */}
        {getProtectedRoutes()}

        {/* Auth Routes */}
        {getAuthRoutes()}

        {/* Achievements Route */}
        <Route
          path="/dashboard/achievements"
          element={
            <ProtectedRoute>
              <UserAchievements />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
