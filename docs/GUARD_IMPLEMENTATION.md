# Guard Component - RBAC Implementation Guide

## Overview

The **Guard** component is a declarative, flexible wrapper for role-based access control (RBAC) in Eventra. It replaces manual role checks with a clean, reusable component that centralizes authorization logic.

## Features

- ✅ Single role checking (`requireRole`)
- ✅ Multiple roles with OR logic (`requireRoles`)
- ✅ Permission checking with AND/OR logic
- ✅ Custom fallback UI
- ✅ Optional authentication requirement
- ✅ Composable/nestable
- ✅ Full backward compatibility
- ✅ Comprehensive test coverage

## Quick Start

### Basic Single Role

```jsx
import Guard from '../components/auth/Guard';

export function AdminPanel() {
  return (
    <Guard requireRole="ADMIN">
      <div>Admin-only content here</div>
    </Guard>
  );
}
```

### Multiple Roles (OR Logic)

```jsx
<Guard requireRoles={["ADMIN", "ORGANIZER"]}>
  <ManagerDashboard />
</Guard>
```

### With Custom Fallback

```jsx
<Guard
  requireRoles={["ADMIN"]}
  fallback={<UnauthorizedPage />}
>
  <AdminDashboard />
</Guard>
```

### Public Content

```jsx
<Guard requireAuth={false}>
  <PublicContent />
</Guard>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `requireRole` | `string` | `null` | Single role to check (case-insensitive) |
| `requireRoles` | `string[]` | `[]` | Multiple roles; uses OR logic (any role matches) |
| `requirePermissions` | `string[]` | `[]` | Permissions to validate |
| `requirePermissionsMatch` | `"any" \| "all"` | `"any"` | Permission matching logic |
| `requireAuth` | `boolean` | `true` | Whether authentication is required |
| `fallback` | `React.ReactNode` | `null` | UI when access denied |
| `children` | `React.ReactNode` | - | Content when access granted |

### Available Roles

From `src/config/roles.js`:

- `SUPER_ADMIN` - Full system access
- `ADMIN` - Manage events, users, analytics
- `ORGANIZER` - Create/edit events, view analytics
- `VOLUNTEER` - Moderate content
- `ATTENDEE` - View and register for events

### Available Permissions

From `src/config/roles.js`:

- `CREATE_EVENT`
- `EDIT_EVENT`
- `DELETE_EVENT`
- `HOST_HACKATHON`
- `MANAGE_USERS`
- `VIEW_ANALYTICS`
- `MODERATE_CONTENT`
- `EDIT_USER`
- `DELETE_USER`

## Usage Examples

### Example 1: Admin-Only Delete Button

**Before (Manual Check):**

```jsx
export function DeleteEventButton({ eventId }) {
  const { hasRole } = useAuth();

  if (!hasRole('ADMIN')) {
    return null; // Hide button
  }

  return (
    <button onClick={() => deleteEvent(eventId)}>
      Delete Event
    </button>
  );
}
```

**After (Guard Component):**

```jsx
export function DeleteEventButton({ eventId }) {
  return (
    <Guard requireRole="ADMIN">
      <button onClick={() => deleteEvent(eventId)}>
        Delete Event
      </button>
    </Guard>
  );
}
```

---

### Example 2: Dashboard Conditional Rendering

**Before (Dashboard.js):**

```jsx
export default function Dashboard() {
  const { isAdmin } = useAuth() || {};

  return (
    <div>
      {isAdmin?.() ? <AdminDashboard /> : <UserDashboard />}
    </div>
  );
}
```

**After (Using Guard):**

```jsx
export default function Dashboard() {
  return (
    <>
      <Guard requireRole="ADMIN">
        <AdminDashboard />
      </Guard>
      <Guard
        requireRoles={["ADMIN", "ORGANIZER", "VOLUNTEER"]}
        requireAuth={false}
        fallback={<UserDashboard />}
      >
        <EmptyUI /> {/* Renders nothing, falling back to UserDashboard */}
      </Guard>
    </>
  );
}
```

---

### Example 3: Manager Panel (Multiple Roles)

```jsx
export function ManagerPanel() {
  return (
    <Guard
      requireRoles={["ADMIN", "ORGANIZER"]}
      fallback={
        <div className="p-4 text-center text-gray-500">
          You don't have permission to access manager tools.
        </div>
      }
    >
      <div className="p-6 bg-blue-50 rounded-lg">
        <h2>Manager Tools</h2>
        <EventManagement />
        <UserModeration />
      </div>
    </Guard>
  );
}
```

---

### Example 4: Permission-Based Actions

```jsx
export function AnalyticsView() {
  return (
    <Guard
      requireRoles={["ADMIN", "ORGANIZER"]}
      requirePermissions={["VIEW_ANALYTICS"]}
      requirePermissionsMatch="all"
      fallback={<AccessDenied />}
    >
      <AnalyticsDashboard />
    </Guard>
  );
}
```

---

### Example 5: Nested Guards for Complex Logic

```jsx
export function CriticalAdminSection() {
  return (
    <Guard requireRole="SUPER_ADMIN" fallback={<NotSuperAdmin />}>
      {/* First: User must be SUPER_ADMIN */}
      <Guard
        requirePermissions={["MANAGE_USERS", "DELETE_EVENT"]}
        requirePermissionsMatch="all"
        fallback={<MissingPermissions />}
      >
        {/* Then: Must have both permissions */}
        <SystemDangerZone />
      </Guard>
    </Guard>
  );
}
```

---

### Example 6: Event Management with Conditional Features

```jsx
export function EventCard({ event }) {
  return (
    <div className="event-card">
      <h3>{event.title}</h3>
      <p>{event.description}</p>

      {/* Everyone can register */}
      <Guard requireAuth={true}>
        <button onClick={() => registerEvent(event.id)}>
          Register
        </button>
      </Guard>

      {/* Organizers can edit */}
      <Guard requireRole="ORGANIZER">
        <button onClick={() => editEvent(event.id)}>
          Edit Event
        </button>
      </Guard>

      {/* Only admin/super-admin can delete */}
      <Guard requireRoles={["ADMIN", "SUPER_ADMIN"]}>
        <button
          onClick={() => deleteEvent(event.id)}
          className="btn-danger"
        >
          Delete Event
        </button>
      </Guard>
    </div>
  );
}
```

## Migration Guide

### Step 1: Audit Existing Code

Find all manual role checks:

```bash
# Search for manual checks
grep -r "isAdmin()" src/
grep -r "hasRole(" src/
grep -r "includes(ROLES\." src/
```

**Current patterns to replace:**

1. **Inline ternary checks**

   ```jsx
   {isAdmin?.() ? <AdminUI /> : <UserUI />}
   ```

2. **Conditional rendering**

   ```jsx
   if (!hasRole('ADMIN')) return null;
   ```

3. **Manual role array checks**

   ```jsx
   const isAdmin = userRoles.includes(ROLES.ADMIN);
   ```

---

### Step 2: Replace Incrementally

**File: `src/components/Dashboard.js`**

**Current:**

```jsx
const { isAdmin } = useAuth() || {};
return (
  <>
    {isAdmin?.() ? <AdminDashboard /> : <UserDashboard />}
  </>
);
```

**Updated:**

```jsx
return (
  <>
    <Guard requireRole="ADMIN">
      <AdminDashboard />
    </Guard>
    <Guard
      requireRoles={["ADMIN", "ORGANIZER", "VOLUNTEER"]}
      requireAuth={false}
      fallback={<UserDashboard />}
    >
      <EmptyUI />
    </Guard>
  </>
);
```

---

**File: `src/components/admin/AdminDashboard.js`**

**Current (line 104):**

```jsx
const isAdmin = userRoles.includes(ROLES.ADMIN) || userRoles.includes(ROLES.SUPER_ADMIN);
```

**Updated:**

```jsx
// Remove the manual check, use Guard at component boundaries instead
// Inside rendering:
<Guard
  requireRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}
  fallback={<UnauthorizedPage />}
>
  <AdminContent />
</Guard>
```

---

### Step 3: Export from Index

Add to `src/components/auth/index.js` (or create if missing):

```jsx
export { default as Guard } from './Guard';
export { default as CanAccess } from './CanAccess';
```

---

### Step 4: Update Component Exports

Update component files to export Guard-wrapped versions:

```jsx
// src/components/admin/AdminTools.jsx
import Guard from '../auth/Guard';
import { ROLES } from '../../config/roles';

function AdminToolsUnsafe() {
  return <div>Admin tools...</div>;
}

export function AdminTools() {
  return (
    <Guard requireRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
      <AdminToolsUnsafe />
    </Guard>
  );
}

export default AdminTools;
```

## Performance Considerations

1. **Memoization**: Guard doesn't cause unnecessary re-renders if auth state hasn't changed
2. **Composability**: Nest Guards for complex scenarios; each guard evaluates independently
3. **No API Calls**: All checks are based on stored user data (JWT claims)
4. **Server Validation**: Guard is UX only; server must validate on all API calls

## Testing

### Unit Test Example

```jsx
import { render, screen } from '@testing-library/react';
import Guard from './Guard';
import * as authContext from '../../context/AuthContext';

vi.spyOn(authContext, 'useAuth').mockReturnValue({
  isAuthenticated: () => true,
  hasRole: (role) => role === 'ADMIN',
  hasAnyRole: (...roles) => roles.includes('ADMIN'),
  hasPermission: () => true,
  hasAnyPermission: () => true,
});

it('renders children for authorized users', () => {
  render(
    <Guard requireRole="ADMIN">
      <div data-testid="admin-panel">Admin Panel</div>
    </Guard>
  );
  expect(screen.getByTestId('admin-panel')).toBeInTheDocument();
});

it('renders fallback for unauthorized users', () => {
  authContext.useAuth.mockReturnValue({
    ...authContext.useAuth(),
    hasRole: () => false,
  });

  render(
    <Guard
      requireRole="ADMIN"
      fallback={<div data-testid="denied">Denied</div>}
    >
      <div>Should not show</div>
    </Guard>
  );
  expect(screen.getByTestId('denied')).toBeInTheDocument();
});
```

---

### Integration Test Example

```jsx
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../context/AuthContext';
import Guard from './Guard';

// Assumes AuthContext is properly set up
it('integrates with AuthProvider', async () => {
  render(
    <AuthProvider>
      <Guard requireRole="ADMIN" fallback={<div>No Access</div>}>
        <div data-testid="protected">Protected Content</div>
      </Guard>
    </AuthProvider>
  );

  await waitFor(() => {
    // After auth loads, should show fallback or protected content
    const content = screen.queryByTestId('protected');
    const fallback = screen.queryByText('No Access');
    expect(content || fallback).toBeInTheDocument();
  });
});
```

## Backward Compatibility

The **enhanced CanAccess** component maintains 100% backward compatibility:

```jsx
// Old code still works
import CanAccess from '../components/auth/CanAccess';

<CanAccess
  roles={["ADMIN", "ORGANIZER"]}
  permissions={["MANAGE_USERS"]}
  fallback={<NotAuthorized />}
>
  <AdminPanel />
</CanAccess>
```

## Security Notes

⚠️ **Important**: Guard is for **UX control only**. It hides/shows UI based on client-side auth state.

**Security must always be enforced on the backend:**

1. All API endpoints must validate JWT tokens
2. Backend must check roles/permissions independently
3. Never trust client-side authorization checks
4. Guard is a performance optimization, not a security boundary

Example backend validation (Spring Boot):

```java
@PostMapping("/api/admin/delete-user/{id}")
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    userService.deleteUser(id);
    return ResponseEntity.ok().build();
}
```

## FAQ

**Q: Should I use Guard or CanAccess?**
A: Prefer Guard for new code. CanAccess is a backward-compatible wrapper for existing code.

**Q: Can I nest Guards?**
A: Yes! Each Guard evaluates independently. Nesting creates AND logic across guards.

**Q: What happens if `useAuth()` is called outside AuthProvider?**
A: Guard handles this gracefully and renders the fallback.

**Q: Can I use Guard for route protection?**
A: No, use `ProtectedRoute` for routes. Guard is for component-level access control.

**Q: Does Guard make API calls?**
A: No, all checks use the stored user object from AuthContext (populated from JWT).

## Related Components

- **ProtectedRoute** (`src/components/auth/ProtectedRoute.js`) - Route-level protection
- **CanAccess** (`src/components/auth/CanAccess.js`) - Legacy backward-compatible wrapper
- **AuthContext** (`src/context/AuthContext.js`) - Authorization data and methods

## Examples in Eventra

See these files for usage examples:

- `src/components/events/EventCard.jsx` - Conditional edit/delete buttons
- `src/components/admin/AdminTools.jsx` - Admin-only panel
- `src/Pages/Dashboard/Dashboard.js` - Dashboard role-based splitting
