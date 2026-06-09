import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Guard from './Guard';
import { AuthProvider } from '../../context/AuthContext';

// Mock useAuth hook for testing
vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

import { useAuth as useAuthMock } from '../../context/AuthContext';

const MOCK_AUTH_METHODS = {
  isAuthenticated: () => true,
  hasRole: (role) => role === 'ADMIN',
  hasAnyRole: (...roles) => roles.includes('ADMIN'),
  hasPermission: (perm) => perm === 'MANAGE_USERS',
  hasAnyPermission: (...perms) => perms.includes('MANAGE_USERS'),
};

describe('Guard Component', () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue(MOCK_AUTH_METHODS);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Single Role Requirements', () => {
    it('renders children when requireRole matches user role', () => {
      render(
        <Guard requireRole="ADMIN">
          <div data-testid="admin-content">Admin Panel</div>
        </Guard>
      );
      expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    });

    it('renders fallback when requireRole does not match', () => {
      useAuthMock.mockReturnValue({
        ...MOCK_AUTH_METHODS,
        hasRole: (role) => role === 'ADMIN',
        hasAnyRole: (...roles) => roles.includes('ADMIN'),
      });

      render(
        <Guard
          requireRole="ORGANIZER"
          fallback={<div data-testid="fallback">No Access</div>}
        >
          <div data-testid="protected">Protected</div>
        </Guard>
      );
      expect(screen.getByTestId('fallback')).toBeInTheDocument();
      expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
    });
  });

  describe('Multiple Role Requirements', () => {
    it('renders children when user has one of the requireRoles', () => {
      render(
        <Guard requireRoles={["ADMIN", "ORGANIZER"]}>
          <div data-testid="manager-content">Manager Panel</div>
        </Guard>
      );
      expect(screen.getByTestId('manager-content')).toBeInTheDocument();
    });

    it('renders fallback when user has none of the requireRoles', () => {
      useAuthMock.mockReturnValue({
        ...MOCK_AUTH_METHODS,
        hasAnyRole: (...roles) => false,
      });

      render(
        <Guard
          requireRoles={["ADMIN", "ORGANIZER"]}
          fallback={<div data-testid="unauthorized">Unauthorized</div>}
        >
          <div data-testid="restricted">Restricted Content</div>
        </Guard>
      );
      expect(screen.getByTestId('unauthorized')).toBeInTheDocument();
    });

    it('supports combining requireRole and requireRoles', () => {
      useAuthMock.mockReturnValue({
        ...MOCK_AUTH_METHODS,
        hasAnyRole: (...roles) => roles.includes('VOLUNTEER'),
      });

      render(
        <Guard
          requireRole="ADMIN"
          requireRoles={["VOLUNTEER"]}
          fallback={<div data-testid="fb">No Access</div>}
        >
          <div data-testid="content">Content</div>
        </Guard>
      );
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Authentication Requirements', () => {
    it('renders fallback when requireAuth=true and user not authenticated', () => {
      useAuthMock.mockReturnValue({
        ...MOCK_AUTH_METHODS,
        isAuthenticated: () => false,
      });

      render(
        <Guard
          requireAuth={true}
          fallback={<div data-testid="login-prompt">Please Log In</div>}
        >
          <div data-testid="dashboard">Dashboard</div>
        </Guard>
      );
      expect(screen.getByTestId('login-prompt')).toBeInTheDocument();
      expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
    });

    it('renders children when requireAuth=false even if not authenticated', () => {
      useAuthMock.mockReturnValue({
        ...MOCK_AUTH_METHODS,
        isAuthenticated: () => false,
      });

      render(
        <Guard requireAuth={false}>
          <div data-testid="public-content">Public Content</div>
        </Guard>
      );
      expect(screen.getByTestId('public-content')).toBeInTheDocument();
    });
  });

  describe('Permission Requirements', () => {
    it('renders children when user has required permission (ANY logic)', () => {
      render(
        <Guard requirePermissions={["MANAGE_USERS", "DELETE_EVENT"]}>
          <div data-testid="perm-content">Privileged Action</div>
        </Guard>
      );
      expect(screen.getByTestId('perm-content')).toBeInTheDocument();
    });

    it('renders fallback when user lacks required permission (ANY logic)', () => {
      useAuthMock.mockReturnValue({
        ...MOCK_AUTH_METHODS,
        hasAnyPermission: (...perms) => false,
      });

      render(
        <Guard
          requirePermissions={["ADMIN_ONLY"]}
          fallback={<div data-testid="denied">Denied</div>}
        >
          <div data-testid="action">Action</div>
        </Guard>
      );
      expect(screen.getByTestId('denied')).toBeInTheDocument();
    });

    it('supports ALL logic for permission matching', () => {
      useAuthMock.mockReturnValue({
        ...MOCK_AUTH_METHODS,
        hasPermission: (perm) =>
          perm === 'MANAGE_USERS' || perm === 'VIEW_ANALYTICS',
      });

      render(
        <Guard
          requirePermissions={["MANAGE_USERS", "VIEW_ANALYTICS"]}
          requirePermissionsMatch="all"
        >
          <div data-testid="all-perms">All Permissions Met</div>
        </Guard>
      );
      expect(screen.getByTestId('all-perms')).toBeInTheDocument();
    });

    it('renders fallback when user lacks ALL required permissions', () => {
      useAuthMock.mockReturnValue({
        ...MOCK_AUTH_METHODS,
        hasPermission: (perm) => perm === 'MANAGE_USERS',
      });

      render(
        <Guard
          requirePermissions={["MANAGE_USERS", "VIEW_ANALYTICS"]}
          requirePermissionsMatch="all"
          fallback={<div data-testid="missing-perm">Missing Permission</div>}
        >
          <div data-testid="content">Content</div>
        </Guard>
      );
      expect(screen.getByTestId('missing-perm')).toBeInTheDocument();
    });
  });

  describe('Complex Authorization Scenarios', () => {
    it('checks all conditions in order: auth -> roles -> permissions', () => {
      useAuthMock.mockReturnValue({
        isAuthenticated: () => false,
        hasRole: vi.fn(),
        hasAnyRole: vi.fn(),
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
      });

      render(
        <Guard
          requireAuth={true}
          requireRoles={["ADMIN"]}
          requirePermissions={["MANAGE_USERS"]}
          fallback={<div data-testid="blocked">Blocked</div>}
        >
          <div>Should not render</div>
        </Guard>
      );

      expect(screen.getByTestId('blocked')).toBeInTheDocument();
      // hasRole should never be called since auth check fails first
      expect(useAuthMock().hasAnyRole).not.toHaveBeenCalled();
    });

    it('handles nested Guards correctly', () => {
      const mockAuth = {
        ...MOCK_AUTH_METHODS,
        hasAnyRole: (...roles) => roles.includes('ADMIN'),
        hasAnyPermission: (...perms) => perms.includes('MANAGE_USERS'),
      };
      useAuthMock.mockReturnValue(mockAuth);

      render(
        <Guard requireRoles={["ADMIN"]}>
          <div data-testid="outer">
            <Guard requirePermissions={["MANAGE_USERS"]}>
              <div data-testid="inner">Nested Content</div>
            </Guard>
          </div>
        </Guard>
      );

      expect(screen.getByTestId('inner')).toBeInTheDocument();
    });

    it('handles edge case: empty arrays treated as no requirement', () => {
      render(
        <Guard requireRoles={[]} requirePermissions={[]}>
          <div data-testid="no-requirements">No Requirements</div>
        </Guard>
      );
      expect(screen.getByTestId('no-requirements')).toBeInTheDocument();
    });
  });

  describe('Fallback Handling', () => {
    it('renders null fallback by default when access denied', () => {
      useAuthMock.mockReturnValue({
        ...MOCK_AUTH_METHODS,
        hasRole: () => false,
        hasAnyRole: () => false,
      });

      const { container } = render(
        <Guard requireRole="DENIED">
          <div>Should not render</div>
        </Guard>
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders custom fallback component', () => {
      useAuthMock.mockReturnValue({
        ...MOCK_AUTH_METHODS,
        isAuthenticated: () => false,
      });

      render(
        <Guard
          requireAuth={true}
          fallback={
            <div data-testid="custom-fallback">
              <h2>Access Denied</h2>
              <p>You do not have permission.</p>
            </div>
          }
        >
          <div>Protected</div>
        </Guard>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('You do not have permission.')).toBeInTheDocument();
    });

    it('renders fallback with dynamic content', () => {
      useAuthMock.mockReturnValue({
        ...MOCK_AUTH_METHODS,
        hasAnyRole: () => false,
      });

      const FallbackComponent = () => (
        <div data-testid="dynamic-fallback">
          Required roles: ADMIN or ORGANIZER
        </div>
      );

      render(
        <Guard
          requireRoles={["ADMIN", "ORGANIZER"]}
          fallback={<FallbackComponent />}
        >
          <div>Content</div>
        </Guard>
      );

      expect(screen.getByTestId('dynamic-fallback')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing useAuth gracefully', () => {
      useAuthMock.mockReturnValue(null);
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { container } = render(
        <Guard fallback={<div data-testid="no-auth-fallback">No Auth</div>}>
          <div>Content</div>
        </Guard>
      );

      expect(screen.getByTestId('no-auth-fallback')).toBeInTheDocument();
      consoleSpy.mockRestore();
    });

    it('handles null children gracefully', () => {
      const { container } = render(
        <Guard requireAuth={false}>
          {null}
        </Guard>
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Backward Compatibility', () => {
    it('works as drop-in replacement for CanAccess with requireRoles', () => {
      useAuthMock.mockReturnValue({
        ...MOCK_AUTH_METHODS,
        hasAnyRole: (...roles) => roles.includes('ADMIN'),
      });

      // Old CanAccess API: roles prop
      render(
        <Guard
          requireRoles={["ADMIN", "ORGANIZER"]}
          fallback={<div data-testid="no-access">No Access</div>}
        >
          <div data-testid="protected">Protected</div>
        </Guard>
      );

      expect(screen.getByTestId('protected')).toBeInTheDocument();
    });
  });
});
