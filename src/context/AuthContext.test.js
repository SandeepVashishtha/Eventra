import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from './AuthContext';
import { isTokenValid, decodeTokenPayload } from '../utils/tokenUtils';
import { apiUtils } from '../config/api';
import { syncSecureStorage } from '../utils/secureStorage';

vi.mock('../config/api', () => ({
  API_ENDPOINTS: {
    AUTH: { LOGIN: '/api/auth/login', GOOGLE: '/api/auth/google' },
    USERS: { PROFILE: '/api/users/profile' },
  },
  apiUtils: { post: vi.fn(), get: vi.fn() },
  setOnUnauthorizedHandler: vi.fn(),
  setAuthToken: vi.fn(),
}));

vi.mock('../utils/tokenUtils', () => ({
  isTokenValid: vi.fn(),
  decodeTokenPayload: vi.fn(),
}));

vi.mock('../utils/offlineQueue', () => ({
  clearQueue: vi.fn(),
}));

vi.mock('react-toastify', () => ({
  toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() },
}));

const FUTURE_EXP = Math.floor(Date.now() / 1000) + 3600;

const AuthConsumer = () => {
  const { user, token, loading, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'ready'}</span>
      <span data-testid="user-status">{user ? 'logged-in' : 'logged-out'}</span>
      <span data-testid="token-val">{token || 'no-token'}</span>
      {user && <span data-testid="username">{user.email}</span>}
      <button onClick={logout} data-testid="logout-btn">Logout</button>
    </div>
  );
};

const renderConsumer = () =>
  render(<AuthProvider><AuthConsumer /></AuthProvider>);

const AuthValueProbe = ({ compute, onResult }) => {
  const auth = useAuth();

  useEffect(() => {
    onResult(compute(auth));
  }, [auth, compute, onResult]);

  return null;
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
    isTokenValid.mockReturnValue(true);
    decodeTokenPayload.mockReturnValue({ exp: FUTURE_EXP });
    
    // By default, profile validation fails (user is unauthenticated)
    apiUtils.get.mockResolvedValue({
      ok: false,
      status: 401,
      data: null,
    });
  });

  describe('initial state', () => {
    it('reports ready and logged-out when profile validation fails', async () => {
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

  describe('session restoration and cookie validation', () => {
    it('restores user profile when backend validation is successful', async () => {
      apiUtils.get.mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: {
          user: { email: 'alice@example.com', roles: ['ATTENDEE'] },
        },
      });

      renderConsumer();

      await waitFor(() =>
        expect(screen.getByTestId('user-status')).toHaveTextContent('logged-in')
      );
      expect(screen.getByTestId('username')).toHaveTextContent('alice@example.com');
      expect(screen.getByTestId('token-val')).toHaveTextContent('cookie-managed');
    });

    it('does not restore user profile (remains logged out) when backend validation fails', async () => {
      apiUtils.get.mockResolvedValueOnce({
        ok: false,
        status: 401,
        data: null,
      });

      renderConsumer();

      await waitFor(() =>
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      );
      expect(screen.getByTestId('user-status')).toHaveTextContent('logged-out');
      expect(screen.queryByTestId('username')).not.toBeInTheDocument();
    });

    it('creates authenticated state only after successful profile validation', async () => {
      let resolveProfile;
      const profilePromise = new Promise((resolve) => {
        resolveProfile = resolve;
      });
      apiUtils.get.mockReturnValueOnce(profilePromise);

      renderConsumer();

      // Should be loading and logged-out while promise is pending
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');
      expect(screen.getByTestId('user-status')).toHaveTextContent('logged-out');

      // Resolve the profile API successfully
      resolveProfile({
        ok: true,
        status: 200,
        data: { user: { email: 'alice@example.com', roles: ['ATTENDEE'] } },
      });

      await waitFor(() =>
        expect(screen.getByTestId('loading')).toHaveTextContent('ready')
      );
      expect(screen.getByTestId('user-status')).toHaveTextContent('logged-in');
    });

    it('ignores client-visible tokens (data.token and data.accessToken) in profile response', async () => {
      apiUtils.get.mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: {
          token: 'bad-token-injection',
          accessToken: 'bad-token-injection',
          user: { email: 'alice@example.com', roles: ['ATTENDEE'] },
        },
      });

      renderConsumer();

      await waitFor(() =>
        expect(screen.getByTestId('user-status')).toHaveTextContent('logged-in')
      );
      expect(screen.getByTestId('token-val')).toHaveTextContent('cookie-managed');
    });

    it('ignores Authorization response headers in profile response', async () => {
      apiUtils.get.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          authorization: 'Bearer bad-token-injection',
          Authorization: 'Bearer bad-token-injection',
        },
        data: {
          user: { email: 'alice@example.com', roles: ['ATTENDEE'] },
        },
      });

      renderConsumer();

      await waitFor(() =>
        expect(screen.getByTestId('user-status')).toHaveTextContent('logged-in')
      );
      expect(screen.getByTestId('token-val')).toHaveTextContent('cookie-managed');
    });
  });

  describe('logout', () => {
    it('clears user state and removes user from storage on logout', async () => {
      apiUtils.get.mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: { user: { email: 'alice@example.com', roles: ['ATTENDEE'] } },
      });

      renderConsumer();
      await waitFor(() =>
        expect(screen.getByTestId('user-status')).toHaveTextContent('logged-in')
      );

      const user = userEvent.setup();
      await user.click(screen.getByTestId('logout-btn'));

      expect(screen.getByTestId('user-status')).toHaveTextContent('logged-out');
      expect(screen.getByTestId('token-val')).toHaveTextContent('no-token');
      const storedUser = await syncSecureStorage.getItemAsync('user');
      expect(storedUser).toBeNull();
    });
  });

  describe('login', () => {
    it('persists user to localStorage and ignores tokens returned in response after successful login', async () => {
      apiUtils.post.mockResolvedValueOnce({
        status: 200,
        data: {
          token: 'fresh-jwt',
          accessToken: 'fresh-jwt',
          user: { email: 'bob@example.com', roles: ['ATTENDEE'] },
        },
        headers: {
          Authorization: 'Bearer fresh-jwt',
        },
      });

      const LoginTrigger = () => {
        const { login, user, token } = useAuth();
        return (
          <>
            <span data-testid="user-status">{user ? 'logged-in' : 'logged-out'}</span>
            <span data-testid="token-val">{token || 'no-token'}</span>
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
      expect(screen.getByTestId('token-val')).toHaveTextContent('cookie-managed');
      const storedUser = await syncSecureStorage.getItemAsync('user');
      expect(JSON.parse(storedUser).email).toBe('bob@example.com');
    });

    it('returns false and sets error when API returns non-200 status', async () => {
      apiUtils.post.mockRejectedValueOnce(new Error('Invalid credentials'));

      const LoginTrigger = () => {
        const { login, authRequest } = useAuth();
        return (
          <div>
            <span data-testid="error-msg">{authRequest.error || 'no-error'}</span>
            <button
              data-testid="login-btn"
              onClick={() => login('bad@example.com', 'wrong')}
            >
              Login
            </button>
          </div>
        );
      };

      render(<AuthProvider><LoginTrigger /></AuthProvider>);
      const user = userEvent.setup();
      await user.click(screen.getByTestId('login-btn'));

      await waitFor(() =>
        expect(screen.getByTestId('error-msg')).toHaveTextContent('Invalid credentials')
      );
    });
  });

  describe('hasRole', () => {
    it('returns true for a role the user has', async () => {
      apiUtils.get.mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: {
          user: { email: 'admin@example.com', roles: ['ADMIN'] },
        },
      });
      const onResult = vi.fn();

      render(
        <AuthProvider>
          <AuthValueProbe compute={({ hasRole }) => hasRole('ADMIN')} onResult={onResult} />
        </AuthProvider>
      );
      await waitFor(() => expect(onResult).toHaveBeenLastCalledWith(true));
    });

    it('returns false for a role the user does not have', async () => {
      apiUtils.get.mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: {
          user: { email: 'user@example.com', roles: ['ATTENDEE'] },
        },
      });
      const onResult = vi.fn();

      render(
        <AuthProvider>
          <AuthValueProbe compute={({ hasRole }) => hasRole('ADMIN')} onResult={onResult} />
        </AuthProvider>
      );
      await waitFor(() => expect(onResult).toHaveBeenLastCalledWith(false));
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when user is authenticated with cookie-managed token', async () => {
      apiUtils.get.mockResolvedValueOnce({
        ok: true,
        status: 200,
        data: {
          user: { email: 'user@example.com', roles: ['ATTENDEE'] },
        },
      });
      const onResult = vi.fn();

      render(
        <AuthProvider>
          <AuthValueProbe compute={({ isAuthenticated }) => isAuthenticated()} onResult={onResult} />
        </AuthProvider>
      );
      await waitFor(() => expect(onResult).toHaveBeenLastCalledWith(true));
    });

    it('returns false when there is no user', async () => {
      const onResult = vi.fn();

      render(
        <AuthProvider>
          <AuthValueProbe compute={({ isAuthenticated }) => isAuthenticated()} onResult={onResult} />
        </AuthProvider>
      );
      await waitFor(() => expect(onResult).toHaveBeenLastCalledWith(false));
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
                setAuthSession('cookie-managed', {
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
    });
  });

  describe('role helpers', () => {
    const setupUser = (roles) => {
      apiUtils.get.mockResolvedValue({
        ok: true,
        status: 200,
        data: {
          user: { email: 'u@test.com', roles },
        },
      });
    };

    it('isAdmin returns true for ADMIN role', async () => {
      setupUser(['ADMIN']);
      const onResult = vi.fn();
      render(
        <AuthProvider>
          <AuthValueProbe compute={({ isAdmin }) => isAdmin()} onResult={onResult} />
        </AuthProvider>
      );
      await waitFor(() => expect(onResult).toHaveBeenLastCalledWith(true));
    });

    it('isOrganizer returns true for ORGANIZER role', async () => {
      setupUser(['ORGANIZER']);
      const onResult = vi.fn();
      render(
        <AuthProvider>
          <AuthValueProbe compute={({ isOrganizer }) => isOrganizer()} onResult={onResult} />
        </AuthProvider>
      );
      await waitFor(() => expect(onResult).toHaveBeenLastCalledWith(true));
    });

    it('hasAnyRole returns true if user has at least one matching role', async () => {
      setupUser(['ATTENDEE']);
      const onResult = vi.fn();
      render(
        <AuthProvider>
          <AuthValueProbe
            compute={({ hasAnyRole }) => hasAnyRole('ADMIN', 'ATTENDEE')}
            onResult={onResult}
          />
        </AuthProvider>
      );
      await waitFor(() => expect(onResult).toHaveBeenLastCalledWith(true));
    });

    it('EVENT_MANAGER role is normalised to ORGANIZER on restore', async () => {
      setupUser(['EVENT_MANAGER']);
      const onResult = vi.fn();
      render(
        <AuthProvider>
          <AuthValueProbe compute={({ isOrganizer }) => isOrganizer()} onResult={onResult} />
        </AuthProvider>
      );
      await waitFor(() => expect(onResult).toHaveBeenLastCalledWith(true));
    });
  });
});
