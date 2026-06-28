import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import { getPublicRoutes } from "./routes/PublicRoutes";
import { getProtectedRoutes, getAuthRoutes } from "./routes/ProtectedRoutes";
import ProtectedRoute from "./auth/ProtectedRoute";

const UserAchievements = lazy(() => import("../Pages/UserAchievements"));
const NotFoundPage = lazy(() => import("../Pages/NotFoundPage"));

const RouteFallback = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 bg-transparent">
    <div className="w-full max-w-2xl animate-pulse space-y-8">
      {/* Skeleton Header */}
      <div className="flex items-center space-x-4">
        <div className="h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-800"></div>
        <div className="space-y-3 flex-1">
          <div className="h-5 w-1/3 rounded bg-slate-200 dark:bg-slate-800"></div>
          <div className="h-4 w-1/4 rounded bg-slate-200 dark:bg-slate-800"></div>
        </div>
      </div>
      
      {/* Skeleton Content */}
      <div className="space-y-4 pt-4">
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
        <div className="h-4 w-11/12 rounded bg-slate-200 dark:bg-slate-800"></div>
        <div className="h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-800"></div>
      </div>
      
      {/* Skeleton Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="h-32 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
        <div className="h-32 rounded-xl bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
        <div className="h-32 rounded-xl bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
      </div>

      <div className="flex justify-center pt-8">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
          <span className="sr-only" role="status" aria-live="polite">Loading...</span>
        </div>
      </div>
    </div>
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
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

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}