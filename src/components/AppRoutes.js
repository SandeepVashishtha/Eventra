import React from 'react';
import { Routes } from 'react-router-dom';
import { getPublicRoutes } from './routes/PublicRoutes';
import { getProtectedRoutes, getAuthRoutes } from './routes/ProtectedRoutes';

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
