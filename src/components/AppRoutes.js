import { Suspense } from 'react';
import { Routes } from 'react-router-dom';

import RouteLoadingFallback from './common/RouteLoadingFallback';
import { getPublicRoutes } from './routes/PublicRoutes';
import { getProtectedRoutes, getAuthRoutes } from './routes/ProtectedRoutes';

const AppRoutes = () => (
  <Suspense fallback={<RouteLoadingFallback />}>
    <Routes>
      {getPublicRoutes()}
      {getProtectedRoutes()}
      {getAuthRoutes()}
    </Routes>
  </Suspense>
);

export default AppRoutes;
