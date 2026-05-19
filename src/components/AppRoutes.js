import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { getPublicRoutes } from './routes/PublicRoutes';
import { getProtectedRoutes, getAuthRoutes } from './routes/ProtectedRoutes';
import ProtectedRoute from './auth/ProtectedRoute';
import UserAchievements from '../Pages/UserAchievements';

const AppRoutes = () => {
  return (
    <Routes>
      {getPublicRoutes()}
      {getProtectedRoutes()}
      {getAuthRoutes()}
      <Route
        path="/dashboard/achievements"
        element={
          <ProtectedRoute>
            <UserAchievements />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
