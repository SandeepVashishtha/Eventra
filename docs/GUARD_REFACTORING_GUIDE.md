# Guard Component - Refactoring Guide

## Overview

This guide provides concrete examples of how to refactor existing Eventra components to use the new Guard component.

## Identified Refactoring Targets

### 1. Dashboard.js - Conditional Dashboard Rendering

**File:** `src/components/Dashboard.js`

**Current Implementation (Lines 12-27):**

```jsx
const Dashboard = () => {
  // 🔥 FIX: Added safe destructuring with a fallback to prevent crashes if context is missing
  const { isAdmin } = useAuth() || {};

  // 🔥 FIX: Safely access window to prevent SSR (Server-Side Rendering) or testing environment crashes
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      <SEOHead
        title="My Dashboard"
        description="Manage your events, registrations, and account settings on Eventra."
        url={currentUrl}
      />
      <ErrorBoundary level="feature">
        <Suspense fallback={<Loading text="Loading dashboard..." />}>
          {/* 🔥 FIX: Safely invoked isAdmin with optional chaining to prevent TypeError crashes */}
          {isAdmin?.() ? <AdminDashboard /> : <UserDashboard />}
        </Suspense>
      </ErrorBoundary>
    </>
  );
};
```

**Refactored (Using Guard):**

```jsx
import Guard from '../auth/Guard';

const Dashboard = () => {
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      <SEOHead
        title="My Dashboard"
        description="Manage your events, registrations, and account settings on Eventra."
        url={currentUrl}
      />
      <ErrorBoundary level="feature">
        <Suspense fallback={<Loading text="Loading dashboard..." />}>
          <Guard requireRole="ADMIN" fallback={<UserDashboard />}>
            <AdminDashboard />
          </Guard>
        </Suspense>
      </ErrorBoundary>
    </>
  );
};
```

**Benefits:**

- ✅ Removes unsafe `?.()` optional chaining
- ✅ Clearer intent: "show admin if ADMIN, else user"
- ✅ Eliminates manual role extraction
- ✅ Automatically handles missing auth context

---

### 2. AdminDashboard.js - Manual Role Check

**File:** `src/components/admin/AdminDashboard.js`

**Current Implementation (Lines 94-106):**

```jsx
const AdminDashboard = () => {
  const { user, logout, hasPermission } = useAuth();
  const userRoles = user?.roles || [];
  const navigate = useNavigate();
  const location = useLocation();
  
  // Manual role checking
  const isAdmin = userRoles.includes(ROLES.ADMIN) || userRoles.includes(ROLES.SUPER_ADMIN);

  // If not admin, render error or restrict
  if (!isAdmin) {
    return <Navigate to="/unauthorized" />;
  }

  // ... rest of component
};
```

**Refactored (Using ProtectedRoute + Guard):**

```jsx
// Option 1: Wrap the entire component with Guard
export const AdminDashboardUnsafe = () => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // ... implementation without manual role check
};

// Wrapped export with Guard
export const AdminDashboard = () => (
  <Guard
    requireRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}
    fallback={<Navigate to="/unauthorized" />}
  >
    <AdminDashboardUnsafe />
  </Guard>
);
```

**Or Option 2: Use at route level (ProtectedRoute in ProtectedRoutes.js):**

```jsx
<Route
  key="/admin"
  path="/admin"
  element={
    <ProtectedRoute
      requiredRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}
      redirectTo="/login"
    >
      {withModuleBoundary(<AdminDashboard />, "Admin dashboard")}
    </ProtectedRoute>
  }
/>
```

**Benefits:**

- ✅ Eliminates manual `includes()` checks
- ✅ Cleaner component logic
- ✅ Reusable component export with built-in protection
- ✅ Consistent with other protected components

---

### 3. Event Card - Conditional Action Buttons

**File:** `src/components/events/EventCard.jsx` (hypothetical)

**Before:**

```jsx
function EventCard({ event }) {
  const { hasRole, hasPermission } = useAuth();

  const canEdit = hasRole('ORGANIZER') || hasRole('ADMIN');
  const canDelete = hasRole('ADMIN') || hasRole('SUPER_ADMIN');
  const canRegister = hasPermission('register:event');

  return (
    <div className="event-card">
      <h3>{event.title}</h3>
      <p>{event.description}</p>

      {canRegister && (
        <button onClick={() => register(event.id)}>Register</button>
      )}

      {canEdit && (
        <button onClick={() => editEvent(event.id)}>Edit</button>
      )}

      {canDelete && (
        <button onClick={() => deleteEvent(event.id)}>Delete</button>
      )}
    </div>
  );
}
```

**Refactored (Using Guard):**

```jsx
import Guard from '../auth/Guard';

function EventCard({ event }) {
  return (
    <div className="event-card">
      <h3>{event.title}</h3>
      <p>{event.description}</p>

      <Guard requireAuth={true} fallback={<LoginPrompt />}>
        <button onClick={() => register(event.id)}>Register</button>
      </Guard>

      <Guard requireRoles={["ORGANIZER", "ADMIN"]}>
        <button onClick={() => editEvent(event.id)}>Edit</button>
      </Guard>

      <Guard requireRoles={["ADMIN", "SUPER_ADMIN"]}>
        <button onClick={() => deleteEvent(event.id)}>Delete</button>
      </Guard>
    </div>
  );
}
```

**Benefits:**

- ✅ Each action is visually associated with its permission
- ✅ No intermediate state variables
- ✅ Custom fallback for each action
- ✅ Easier to test individual actions

---

### 4. Event Creation - Permission Gating

**File:** `src/components/EventCreation.jsx`

**Before:**

```jsx
const EventCreation = () => {
  const { hasPermission, hasRole } = useAuth();
  
  // Manual permission check
  const canCreateEvent = 
    hasPermission('CREATE_EVENT') || 
    hasRole('ADMIN') || 
    hasRole('ORGANIZER');

  if (!canCreateEvent) {
    return (
      <div className="p-6 text-center text-red-600">
        <h2>Access Denied</h2>
        <p>You don't have permission to create events.</p>
      </div>
    );
  }

  return <EventForm />;
};
```

**Refactored (Using Guard):**

```jsx
import Guard from '../auth/Guard';
import { PERMISSIONS, ROLES } from '../../config/roles';

const EventCreation = () => {
  const accessDenied = (
    <div className="p-6 text-center text-red-600">
      <h2>Access Denied</h2>
      <p>You don't have permission to create events.</p>
    </div>
  );

  return (
    <Guard
      requireRoles={[ROLES.ADMIN, ROLES.ORGANIZER]}
      requirePermissions={[PERMISSIONS.CREATE_EVENT]}
      requirePermissionsMatch="any"
      fallback={accessDenied}
    >
      <EventForm />
    </Guard>
  );
};
```

**Benefits:**

- ✅ Clear authorization requirements
- ✅ Centralized access logic
- ✅ Custom error UI
- ✅ Easy to audit permissions

---

### 5. User Management Panel

**File:** `src/components/admin/UserManagement.jsx` (hypothetical)

**Before:**

```jsx
const UserManagement = () => {
  const { user, hasRole } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (!hasRole('ADMIN') && !hasRole('SUPER_ADMIN')) {
    return <Navigate to="/unauthorized" />;
  }

  return <UserList />;
};
```

**Refactored:**

```jsx
import Guard from '../auth/Guard';

const UserManagement = () => (
  <Guard
    requireRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}
    fallback={<Navigate to="/unauthorized" />}
  >
    <UserList />
  </Guard>
);
```

**Benefits:**

- ✅ 3 lines of authorization logic → 1 component
- ✅ Consistent with other protected components
- ✅ Easier to maintain

---

### 6. Nested Authorization - Analytics Dashboard

**File:** `src/components/analytics/AnalyticsDashboard.jsx` (hypothetical)

**Before:**

```jsx
const AnalyticsDashboard = () => {
  const { hasRole, hasPermission } = useAuth();

  const canViewBasic = hasRole('ORGANIZER') || hasRole('ADMIN');
  const canViewAdvanced = 
    hasPermission('VIEW_ANALYTICS') && 
    (hasRole('ADMIN') || hasRole('SUPER_ADMIN'));

  return (
    <div>
      {canViewBasic && (
        <div>
          <BasicMetrics />
        </div>
      )}

      {canViewAdvanced && (
        <div>
          <AdvancedAnalytics />
          <UserBehaviorTracking />
          <PredictiveMetrics />
        </div>
      )}

      {!canViewBasic && <AccessDenied />}
    </div>
  );
};
```

**Refactored (Using Nested Guards):**

```jsx
import Guard from '../auth/Guard';

const AnalyticsDashboard = () => (
  <div>
    <Guard
      requireRoles={["ORGANIZER", "ADMIN"]}
      fallback={<AccessDenied />}
    >
      <BasicMetrics />

      {/* Nested Guard for advanced features */}
      <Guard
        requireRoles={["ADMIN", "SUPER_ADMIN"]}
        requirePermissions={["VIEW_ANALYTICS"]}
        fallback={null}
      >
        <AdvancedAnalytics />
        <UserBehaviorTracking />
        <PredictiveMetrics />
      </Guard>
    </Guard>
  </div>
);
```

**Benefits:**

- ✅ Clearer hierarchy of permissions
- ✅ Each section visually protected
- ✅ Easier to extend/add new sections
- ✅ Reduced state variables

---

### 7. Admin Toolbar - Multiple Conditional Actions

**File:** `src/components/admin/AdminToolbar.jsx` (hypothetical)

**Before:**

```jsx
const AdminToolbar = () => {
  const { hasRole, hasPermission } = useAuth();

  return (
    <div className="toolbar">
      {(hasPermission('MANAGE_USERS') || hasRole('SUPER_ADMIN')) && (
        <button><Users /> Manage Users</button>
      )}

      {(hasPermission('VIEW_ANALYTICS') && hasRole('ADMIN')) && (
        <button><BarChart /> Analytics</button>
      )}

      {(hasRole('ADMIN') || hasRole('SUPER_ADMIN')) && (
        <button><Settings /> Settings</button>
      )}

      {hasRole('SUPER_ADMIN') && (
        <button><Lock /> System Config</button>
      )}
    </div>
  );
};
```

**Refactored:**

```jsx
import Guard from '../auth/Guard';

const AdminToolbar = () => (
  <div className="toolbar">
    <Guard requirePermissions={["MANAGE_USERS"]}>
      <button><Users /> Manage Users</button>
    </Guard>

    <Guard
      requireRole="ADMIN"
      requirePermissions={["VIEW_ANALYTICS"]}
      requirePermissionsMatch="all"
    >
      <button><BarChart /> Analytics</button>
    </Guard>

    <Guard requireRoles={["ADMIN", "SUPER_ADMIN"]}>
      <button><Settings /> Settings</button>
    </Guard>

    <Guard requireRole="SUPER_ADMIN">
      <button><Lock /> System Config</button>
    </Guard>
  </div>
);
```

**Benefits:**

- ✅ Each button's authorization is self-contained
- ✅ Easy to add/remove buttons
- ✅ Reduced cognitive load
- ✅ Clear audit trail

---

## Refactoring Checklist

- [ ] Identify all files with manual role checks
- [ ] Update imports to include Guard component
- [ ] Replace inline ternaries with Guard + fallback
- [ ] Replace if/return patterns with Guard
- [ ] Update component exports to wrap with Guard
- [ ] Test with different user roles
- [ ] Remove manual role extraction variables
- [ ] Simplify component logic
- [ ] Update JSDoc comments
- [ ] Add unit tests for authorization

## File Refactoring Priority

1. **High Priority** (Security/Core Logic)
   - `src/components/Dashboard.js`
   - `src/components/admin/AdminDashboard.js`
   - `src/components/routes/ProtectedRoutes.js`

2. **Medium Priority** (Feature-Specific)
   - `src/components/events/EventCard.jsx`
   - `src/components/EventCreation.jsx`
   - `src/Pages/Events/*.jsx`

3. **Low Priority** (UI/Non-Critical)
   - Navigation components
   - Toolbar components
   - Menu items

## Testing Refactored Components

**Example test for refactored EventCard:**

```jsx
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import EventCard from './EventCard';
import * as AuthContext from '../../context/AuthContext';

describe('EventCard - Guard Integration', () => {
  it('shows register button only when authenticated', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isAuthenticated: () => true,
      hasRole: () => false,
      hasAnyRole: () => false,
      hasPermission: () => false,
      hasAnyPermission: () => false,
    });

    render(
      <EventCard
        event={{ id: 1, title: 'Event', description: 'Test' }}
      />
    );

    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('shows edit button only for organizers', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isAuthenticated: () => true,
      hasRole: (role) => role === 'ORGANIZER',
      hasAnyRole: (...roles) => roles.includes('ORGANIZER'),
      hasPermission: () => false,
      hasAnyPermission: () => false,
    });

    render(
      <EventCard
        event={{ id: 1, title: 'Event', description: 'Test' }}
      />
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('shows delete button only for admins', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isAuthenticated: () => true,
      hasRole: (role) => role === 'ADMIN',
      hasAnyRole: (...roles) => roles.includes('ADMIN'),
      hasPermission: () => false,
      hasAnyPermission: () => false,
    });

    render(
      <EventCard
        event={{ id: 1, title: 'Event', description: 'Test' }}
      />
    );

    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});
```

## Common Patterns

### Pattern 1: Show Nothing (Default Fallback)

```jsx
<Guard requireRole="ADMIN">
  <AdminFeature />
</Guard>
// Renders nothing if not ADMIN
```

### Pattern 2: Show Disabled State

```jsx
<Guard
  requireRole="ADMIN"
  fallback={
    <button disabled title="Admin only">
      Delete
    </button>
  }
>
  <button onClick={handleDelete}>Delete</button>
</Guard>
```

### Pattern 3: Show Alternative Content

```jsx
<Guard
  requireRole="ADMIN"
  fallback={<UserDashboard />}
>
  <AdminDashboard />
</Guard>
```

### Pattern 4: Show Error Message

```jsx
<Guard
  requireRole="ADMIN"
  fallback={
    <ErrorBox
      title="Access Denied"
      message="This feature is only available to administrators."
    />
  }
>
  <AdminPanel />
</Guard>
```
