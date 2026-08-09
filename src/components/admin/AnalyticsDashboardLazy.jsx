
import React, { Suspense, lazy } from 'react';

const LazyAnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));

const AnalyticsDashboardLazy = (props) => (
  <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Analytics Dashboard...</div>}>
    <LazyAnalyticsDashboard {...props} />
  </Suspense>
);

export default AnalyticsDashboardLazy;
