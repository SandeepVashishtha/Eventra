import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { getPublicRoutes } from './routes/PublicRoutes';
import { getProtectedRoutes, getAuthRoutes } from './routes/ProtectedRoutes';
import UserAchievements from '../Pages/UserAchievements';

const AppRoutes = () => {
  return (
    <Routes>
      {getPublicRoutes()}
      {getProtectedRoutes()}
      {getAuthRoutes()}
      <Route path="/dashboard/achievements" element={<UserAchievements />} />
    </Routes>
  );
};

export default AppRoutes;
