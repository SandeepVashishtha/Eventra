import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiUtils, API_ENDPOINTS } from '../../config/api';
import { validateOAuthState } from '../../utils/oauthState';
import { toast } from 'react-toastify';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import useReducedMotion from '../../hooks/useReducedMotion';
import { motion } from 'framer-motion';

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
      const error = params.get('error');
      const stateParam = params.get('state');

      if (error) {
        toast.error(`Authentication failed: ${error}`);
        navigate('/login', { replace: true });
        return;
      }

      if (!token) {
        toast.error('Authentication failed: No token received.');
        navigate('/login', { replace: true });
        return;
      }

      // Validate the CSRF state parameter before accepting the token.
      // RFC 6749 §10.12: the state must match the nonce generated when the
      // OAuth flow was initiated to prevent login CSRF (account fixation).
      const stateResult = validateOAuthState(stateParam);
      if (!stateResult.valid) {
        console.error('[OAuthCallback] State validation failed:', stateResult.reason);
        toast.error('Authentication failed: invalid session state. Please try logging in again.');
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
