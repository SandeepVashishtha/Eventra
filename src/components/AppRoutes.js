import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import { getPublicRoutes } from "./routes/PublicRoutes";
import {
  getProtectedRoutes,
  getAuthRoutes,
} from "./routes/ProtectedRoutes";

import ProtectedRoute from "./auth/ProtectedRoute";
import PageLoader from "./common/PageLoader";

const UserAchievements = React.lazy(() => import("../Pages/UserAchievements"));
const NotFoundPage = React.lazy(() => import("../Pages/NotFoundPage"));

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