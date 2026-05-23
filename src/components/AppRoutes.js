import React from "react";
import { Route, Routes } from "react-router-dom";

import { getPublicRoutes } from "./routes/PublicRoutes";
import {
  getProtectedRoutes,
  getAuthRoutes,
} from "./routes/ProtectedRoutes";

import ProtectedRoute from "./auth/ProtectedRoute";

import UserAchievements from "../Pages/UserAchievements";

import NotFoundPage from "../Pages/NotFoundPage";

const AppRoutes = () => {
  return (
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
  );
};

export default AppRoutes;