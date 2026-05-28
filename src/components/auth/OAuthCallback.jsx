import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiUtils, API_ENDPOINTS } from '../../config/api';
import { toast } from 'react-toastify';
import { validateOAuthState } from '../../utils/oauthState';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useReducedMotion from '../../hooks/useReducedMotion';
import { motion } from 'framer-motion';

const MAX_ERROR_DISPLAY_LENGTH = 100;

const OAuthCallback = () => {
  useDocumentTitle("Authenticating | Eventra");
  const prefersReducedMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();
  const processedRef = useRef(false);

  useEffect(() => {
    const processCallback = async () => {
      if (processedRef.current) return;
      processedRef.current = true;

      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const receivedState = params.get('state');
      const rawError = params.get('error');

      // Sanitise the `error` parameter before displaying — it arrives from
      // an external OAuth provider via URL and must not be trusted as-is.
      if (rawError) {
        const safeError = String(rawError).slice(0, MAX_ERROR_DISPLAY_LENGTH);
        toast.error(`Authentication failed: ${safeError}`);
        navigate('/login', { replace: true });
        return;
      }

      if (!token) {
        toast.error('Authentication failed: No token received.');
        navigate('/login', { replace: true });
        return;
      }

      // ── CSRF state validation (RFC 6749 §10.12) ───────────────────────────
      // The state value must match what was stored by generateOAuthState()
      // at the start of the OAuth flow. A mismatch means either:
      //   (a) The callback URL was crafted by an attacker (login CSRF), or
      //   (b) The user navigated directly to the callback URL, or
      //   (c) The session was cleared between flow start and callback.
      // In all cases we reject the token and redirect to /login.
      if (!validateOAuthState(receivedState)) {
        toast.error('Authentication failed: Invalid or expired state parameter. Please try again.');
        navigate('/login', { replace: true });
        return;
      }

      try {
        const res = await apiUtils.get(API_ENDPOINTS.USERS.PROFILE, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = res.data || res;

        if (res.ok && data) {
          const rawUser = data?.user ?? data?.data ?? data;

          const sessionUser = {
            ...rawUser,
            firstName: rawUser?.firstName ?? "",
            lastName: rawUser?.lastName ?? "",
            email: rawUser?.email ?? "",
            role: rawUser?.role ?? "USER",
            roles: rawUser?.roles ?? [rawUser?.role ?? "USER"],
            permissions: rawUser?.permissions ?? [],
          };

          setAuthSession(token, sessionUser);
          toast.success('Successfully authenticated!');
          navigate('/dashboard', { replace: true });
        } else {
          throw new Error('Failed to fetch user profile');
        }
      } catch (err) {
        console.error('OAuth Callback Error:', err);
        toast.error('Failed to complete authentication.');
        navigate('/login', { replace: true });
      }
    };

    processCallback();
  }, [location, navigate, setAuthSession]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"
    >
      <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Completing authentication...
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please wait while we set up your session.
        </p>
      </div>
    </motion.div>
  );
};

export default OAuthCallback;
