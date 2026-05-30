import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AuthProvider, useAuth } from './AuthContext';
import { isTokenValid, decodeTokenPayload } from '../utils/tokenUtils';
import { apiUtils } from '../config/api';

jest.mock('../config/api', () => ({
  API_ENDPOINTS: {
    AUTH: { LOGIN: '/api/auth/login', GOOGLE: '/api/auth/google' },
  },
  apiUtils: { post: jest.fn() },
  setOnUnauthorizedHandler: jest.fn(),
}));

jest.mock('../utils/tokenUtils', () => ({
  isTokenValid: jest.fn(),
  decodeTokenPayload: jest.fn(),
}));

jest.mock('../utils/offlineQueue', () => ({
  clearQueue: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: { info: jest.fn(), success: jest.fn(), error: jest.fn() },
}));

const FUTURE_EXP = Math.floor(Date.now() / 1000) + 3600;

const AuthConsumer = () => {
  const { user, loading, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'ready'}</span>
      <span data-testid="user-status">{user ? 'logged-in' : 'logged-out'}</span>
      {user && <span data-testid="username">{user.email}</span>}
      <button onClick={logout} data-testid="logout-btn">Logout</button>
    </div>
  );
};

const renderConsumer = () =>
  render(<AuthProvider><AuthConsumer /></AuthProvider>);

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
    isTokenValid.mockReturnValue(true);
    decodeTokenPayload.mockReturnValue({ exp: FUTURE_EXP });
  });

  describe('initial state', () => {
    it('reports ready and logged-out when storage is empty', async () => {
      renderConsumer();
      await waitFor(() =>
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      );
      expect(screen.getByTestId('user-status')).toHaveTextContent('logged-out');
    });

    it('does not render username when unauthenticated', async () => {
      renderConsumer();
      await waitFor(() =>
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      );
      expect(screen.queryByTestId('username')).not.toBeInTheDocument();
    });
  });

  describe('session restoration', () => {
    it('restores user from storage when token is valid', async () => {
      sessionStorage.setItem('token', 'valid-jwt');
      localStorage.setItem(
        'user',
        JSON.stringify({ email: 'alice@example.com', roles: ['ATTENDEE'] })
      );
      isTokenValid.mockReturnValue(true);

      renderConsumer();

      await waitFor(() =>
        expect(screen.getByTestId('user-status')).toHaveTextContent('logged-in')
      );
      expect(screen.getByTestId('username')).toHaveTextContent('alice@example.com');
    });

    it('clears storage when the stored token is expired', async () => {
      sessionStorage.setItem('token', 'expired-jwt');
      localStorage.setItem(
        'user',
        JSON.stringify({ email: 'alice@example.com', roles: [] })
      );
      isTokenValid.mockReturnValue(false);

      renderConsumer();

      await waitFor(() =>
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      );
      expect(screen.getByTestId('user-status')).toHaveTextContent('logged-out');
      expect(sessionStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('logout', () => {
    it('clears user state and removes token/user from storage on logout', async () => {
      sessionStorage.setItem('token', 'valid-jwt');
      localStorage.setItem(
        'user',
        JSON.stringify({ email: 'alice@example.com', roles: ['ATTENDEE'] })
      );
      isTokenValid.mockReturnValue(true);

      renderConsumer();
      await waitFor(() =>
        expect(screen.getByTestId('user-status')).toHaveTextContent('logged-in')
      );

      const user = userEvent.setup();
      await user.click(screen.getByTestId('logout-btn'));

      expect(screen.getByTestId('user-status')).toHaveTextContent('logged-out');
      expect(sessionStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('login', () => {
    it('persists token to sessionStorage and user to localStorage after successful login', async () => {
      apiUtils.post.mockResolvedValueOnce({
        status: 200,
        data: {
          token: 'fresh-jwt',
          user: { email: 'bob@example.com', roles: ['ATTENDEE'] },
        },
        headers: {},
      });

      const LoginTrigger = () => {
        const { login, user } = useAuth();
        return (
          <>
            <span data-testid="user-status">{user ? 'logged-in' : 'logged-out'}</span>
            <button
              data-testid="login-btn"
              onClick={() => login('bob@example.com', 'password123')}
            >
              Login
            </button>
          </>
        );
      };

      render(<AuthProvider><LoginTrigger /></AuthProvider>);
      await waitFor(() =>
        expect(screen.getByTestId('user-status')).toHaveTextContent('logged-out')
      );

      const user = userEvent.setup();
      await user.click(screen.getByTestId('login-btn'));

      await waitFor(() =>
        expect(screen.getByTestId('user-status')).toHaveTextContent('logged-in')
      );
      expect(sessionStorage.getItem('token')).toBe('fresh-jwt');
      expect(JSON.parse(localStorage.getItem('user')).email).toBe('bob@example.com');
    });

    it('throws when API returns non-200 status', async () => {
      apiUtils.post.mockResolvedValueOnce({
        status: 401,
        data: { message: 'Invalid credentials' },
        headers: {},
      });

      let thrownError;
      const LoginTrigger = () => {
        const { login } = useAuth();
        return (
          <button
            data-testid="login-btn"
            onClick={() => login('bad@example.com', 'wrong').catch((e) => { thrownError = e; })}
          >
            Login
          </button>
        );
      };

      render(<AuthProvider><LoginTrigger /></AuthProvider>);
      const user = userEvent.setup();
      await user.click(screen.getByTestId('login-btn'));

      await waitFor(() => expect(thrownError).toBeDefined());
      expect(thrownError.message).toMatch(/invalid credentials/i);
    });
  });

  describe('hasRole', () => {
    it('returns true for a role the user has', async () => {
      sessionStorage.setItem('token', 'valid-jwt');
      localStorage.setItem(
        'user',
        JSON.stringify({ email: 'admin@example.com', roles: ['ADMIN'] })
      );

      let roleResult;
      const RoleChecker = () => {
        const { hasRole } = useAuth();
        roleResult = hasRole('ADMIN');
        return null;
      };

      render(<AuthProvider><RoleChecker /></AuthProvider>);
      await waitFor(() => expect(roleResult).toBe(true));
    });

    it('returns false for a role the user does not have', async () => {
      sessionStorage.setItem('token', 'valid-jwt');
      localStorage.setItem(
        'user',
        JSON.stringify({ email: 'user@example.com', roles: ['ATTENDEE'] })
      );

      let roleResult;
      const RoleChecker = () => {
        const { hasRole } = useAuth();
        roleResult = hasRole('ADMIN');
        return null;
      };

      render(<AuthProvider><RoleChecker /></AuthProvider>);
      await waitFor(() => expect(roleResult).toBe(false));
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when a valid token and user are present', async () => {
      sessionStorage.setItem('token', 'valid-jwt');
      localStorage.setItem(
        'user',
        JSON.stringify({ email: 'user@example.com', roles: ['ATTENDEE'] })
      );
      isTokenValid.mockReturnValue(true);

      let result;
      const Checker = () => {
        const { isAuthenticated } = useAuth();
        result = isAuthenticated();
        return null;
      };

      render(<AuthProvider><Checker /></AuthProvider>);
      await waitFor(() => expect(result).toBe(true));
    });

    it('returns false when there is no user', async () => {
      let result;
      const Checker = () => {
        const { isAuthenticated } = useAuth();
        result = isAuthenticated();
        return null;
      };

      render(<AuthProvider><Checker /></AuthProvider>);
      await waitFor(() => expect(result).toBe(false));
    });
  });

  describe('corrupted storage', () => {
    it('clears session when localStorage user is invalid JSON', async () => {
      sessionStorage.setItem('token', 'valid-jwt');
      localStorage.setItem('user', '{not valid json}');

      renderConsumer();

      await waitFor(() =>
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      );
      expect(screen.getByTestId('user-status')).toHaveTextContent('logged-out');
    });
  });

  describe('setAuthSession', () => {
    it('persists a session when called with a token and user object', async () => {
      const Trigger = () => {
        const { setAuthSession, user } = useAuth();
        return (
          <>
            <span data-testid="user-status">{user ? 'logged-in' : 'logged-out'}</span>
            <button
              data-testid="set-session-btn"
              onClick={() =>
                setAuthSession('manual-jwt', {
                  email: 'manual@example.com',
                  roles: ['ORGANIZER'],
                })
              }
            >
              SetSession
            </button>
          </>
        );
      };

      render(<AuthProvider><Trigger /></AuthProvider>);
      await waitFor(() =>
        expect(screen.getByTestId('user-status')).toHaveTextContent('logged-out')
      );

      const user = userEvent.setup();
      await user.click(screen.getByTestId('set-session-btn'));

      await waitFor(() =>
        expect(screen.getByTestId('user-status')).toHaveTextContent('logged-in')
      );
      expect(sessionStorage.getItem('token')).toBe('manual-jwt');
    });
  });

  describe('role helpers', () => {
    const setupUser = (roles) => {
      sessionStorage.setItem('token', 'valid-jwt');
      localStorage.setItem('user', JSON.stringify({ email: 'u@test.com', roles }));
    };

    it('isAdmin returns true for ADMIN role', async () => {
      setupUser(['ADMIN']);
      let result;
      const C = () => { const { isAdmin } = useAuth(); result = isAdmin(); return null; };
      render(<AuthProvider><C /></AuthProvider>);
      await waitFor(() => expect(result).toBe(true));
    });

    it('isOrganizer returns true for ORGANIZER role', async () => {
      setupUser(['ORGANIZER']);
      let result;
      const C = () => { const { isOrganizer } = useAuth(); result = isOrganizer(); return null; };
      render(<AuthProvider><C /></AuthProvider>);
      await waitFor(() => expect(result).toBe(true));
    });

    it('hasAnyRole returns true if user has at least one matching role', async () => {
      setupUser(['ATTENDEE']);
      let result;
      const C = () => {
        const { hasAnyRole } = useAuth();
        result = hasAnyRole('ADMIN', 'ATTENDEE');
        return null;
      };
      render(<AuthProvider><C /></AuthProvider>);
      await waitFor(() => expect(result).toBe(true));
    });

    it('EVENT_MANAGER role is normalised to ORGANIZER on restore', async () => {
      setupUser(['EVENT_MANAGER']);
      let result;
      const C = () => {
        const { isOrganizer } = useAuth();
        result = isOrganizer();
        return null;
      };
      render(<AuthProvider><C /></AuthProvider>);
      await waitFor(() => expect(result).toBe(true));
    });
  });
});
