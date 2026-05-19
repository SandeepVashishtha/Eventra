import React from 'react';
import { Routes , Route} from 'react-router-dom';
import { getPublicRoutes } from './routes/PublicRoutes';
import { getProtectedRoutes, getAuthRoutes } from './routes/ProtectedRoutes';
import UserAchievements from '../Pages/UserAchievements'; // Check path distance relative to AppRoutes location

// Inside your <Routes> structure inside AppRoutes.jsx:
<Route path="/dashboard/achievements" element={<UserAchievements />} />
const AppRoutes = () => {
  return (
    <Routes>
      {getPublicRoutes()}
      {getProtectedRoutes()}
      {getAuthRoutes()}
    </Routes>
  );
};

export default AppRoutes;
