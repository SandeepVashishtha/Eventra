/**
 * src/components/Common/ProtectedRoute.js
 *
 * Centralized route guard wrapper component.
 *
 * SECURITY: This component is the single source of truth for protecting routes
 * against unauthenticated access. It delegates all auth logic to the canonical
 * ProtectedRoute in `../auth/ProtectedRoute`, which queries the verified React
 * AuthContext state — NOT localStorage or sessionStorage strings.
 *
 * WHY THIS MATTERS:
 * - localStorage values can be faked by any JavaScript running on the page.
 * - React Context state is set only by the AuthProvider after server validation.
 * - Using Context prevents bypass via direct URL manipulation or state injection.
 *
 * Usage:
 *   import ProtectedRoute from '../Common/ProtectedRoute';
 *
 *   <ProtectedRoute>
 *     <SensitivePage />
 *   </ProtectedRoute>
 *
 *   // With role requirement:
 *   <ProtectedRoute requiredRoles={['ADMIN']}>
 *     <AdminPage />
 *   </ProtectedRoute>
 *
 *   // Redirect to a custom path instead of /login:
 *   <ProtectedRoute redirectTo="/unauthorized">
 *     <PrivatePage />
 *   </ProtectedRoute>
 */

export { default } from '../auth/ProtectedRoute';
