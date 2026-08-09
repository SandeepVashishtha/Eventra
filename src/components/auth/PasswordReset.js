import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
// Under the hood, password reset requests go to API_ENDPOINTS.AUTH.FORGOT_PASSWORD
// (request a reset token) and API_ENDPOINTS.AUTH.RESET_PASSWORD (set a new password) via authService.
import { authService } from 'services/authService';
import { motion } from "framer-motion";
import useDocumentTitle from "hooks/useDocumentTitle";
import { RESET_COOLDOWN_SECONDS, secondsUntilUnlock, STORAGE_KEY_RESET_LAST_SUBMIT } from 'utils/rateLimitUtils';

// ---------------------------------------------------------------------------
// sessionStorage helpers — persist cooldown across page refreshes (Issue #5720)
// ---------------------------------------------------------------------------

/**
 * Read the last submit timestamp from sessionStorage.
 * Returns 0 if missing or corrupt so the cooldown is treated as expired.
 */
const readLastSubmit = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_RESET_LAST_SUBMIT);
    if (raw === null) return 0;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
};

/**
 * Persist the last submit timestamp to sessionStorage.
 * Fails silently (privacy mode / storage full) — the in-memory ref is the
 * authoritative source within the same page lifecycle.
 */
const writeLastSubmit = (ts) => {
  try {
    sessionStorage.setItem(STORAGE_KEY_RESET_LAST_SUBMIT, String(ts));
  } catch {
    // best-effort
  }
};

const PasswordReset = () => {
  useDocumentTitle("Reset Password | Eventra");
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [searchParams] = useSearchParams();
  // Token from a reset link (?token=...) or returned inline by the forgot-password step.
  const [resetToken, setResetToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // FIX (Issue #5720): Seed from sessionStorage so cooldown survives page refresh.
  // useRef is still used as the authoritative in-memory source within the lifecycle;
  // sessionStorage provides durability across remounts/refreshes.
  const lastSubmitRef = useRef(readLastSubmit());
  const intervalRef = useRef(null);
  const navTimerRef = useRef(null);
  const emailInputRef = useRef(null);
  const navigate = useNavigate();

  // 🔥 MERGED FIX: Unified cleanup for both interval and navigation timers
  const clearAllTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (navTimerRef.current) {
      clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }
  }, []);

  const startCooldownTimer = useCallback(() => {
    clearAllTimers();
    const unlockAt = lastSubmitRef.current + RESET_COOLDOWN_SECONDS * 1000;
    setCooldownSeconds(secondsUntilUnlock(unlockAt));

    intervalRef.current = setInterval(() => {
      const remaining = secondsUntilUnlock(unlockAt);
      setCooldownSeconds(remaining);
      if (remaining <= 0) {
        clearAllTimers();
      }
    }, 1000);
  }, [clearAllTimers]);

  useEffect(() => {
    return () => clearAllTimers(); // Safely clean up everything on unmount
  }, [clearAllTimers]);

  // Auto-focus the email input on mount for keyboard and accessibility UX.
  // emailInputRef was already wired to the input but the focus call was missing.
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  // FIX (Issue #5720): On mount, if a persisted cooldown is still active,
  // start the countdown timer so the UI reflects the correct remaining time.
  useEffect(() => {
    if (lastSubmitRef.current > 0) {
      const remaining = secondsUntilUnlock(lastSubmitRef.current + RESET_COOLDOWN_SECONDS * 1000);
      if (remaining > 0) {
        startCooldownTimer();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once on mount

  const isCoolingDown = () => {
    return Date.now() - lastSubmitRef.current < RESET_COOLDOWN_SECONDS * 1000;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Step 2 — a reset token is available, set the new password.
    if (resetToken) {
      if (!newPassword || newPassword.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Password and confirmation do not match.");
        return;
      }
      setLoading(true);
      try {
        await authService.confirmPasswordReset({ token: resetToken, newPassword, confirmPassword });
        setMessage("Password updated successfully. Redirecting to login...");
        navTimerRef.current = setTimeout(() => navigate('/login'), 2000);
      } catch (err) {
        const backendMessage = err.response?.data?.message || err?.data?.message;
        setError(backendMessage || 'Failed to reset password. The link may be invalid or expired.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Step 1 — request a reset link for the email address.
    if (isCoolingDown()) {
      setError(`Please wait ${cooldownSeconds}s before requesting another reset link.`);
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please provide a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resetPassword(email);
      const token = response.data?.resetToken;
      if (token) {
        // No email transport configured — advance inline to the new-password step.
        setResetToken(token);
        setEmail('');
        setMessage(response.data?.message || 'Reset token issued. Choose a new password below.');
      } else {
        setMessage(response.data?.message || 'Password reset link sent! Check your email.');
        lastSubmitRef.current = Date.now();
        writeLastSubmit(lastSubmitRef.current); // FIX (Issue #5720): persist so refresh can't bypass cooldown
        startCooldownTimer();
        navTimerRef.current = setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      const backendMessage = err.response?.data?.message || err?.data?.message;
      setError(backendMessage || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Compute once per render so isSubmitDisabled, the banner, and the button
  // label all read the same snapshot — prevents inconsistent UI at cooldown boundary.
  const coolingDown = isCoolingDown();
  const isSubmitDisabled = loading || coolingDown;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-lg shadow-lg">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="mx-auto w-16 h-16 bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform duration-200"
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </motion.div>

        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 text-center">Reset Password</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Secure your account and get back to creating events.</p>

        {coolingDown && cooldownSeconds > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/30 px-4 py-3 text-sm text-amber-700 dark:text-amber-300"
            role="status"
            aria-live="polite"
          >
            <span>Reset link sent. You can request another in <strong>{cooldownSeconds}s</strong>.</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {resetToken ? (
            <>
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New password <sup className="ml-1 text-red-500">*</sup>
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:bg-gray-50 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm new password <sup className="ml-1 text-red-500">*</sup>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                  placeholder="Re-enter the new password"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:bg-gray-50 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed"
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address <sup className="ml-1 text-red-500">*</sup>
              </label>
              <input
                ref={emailInputRef}
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitDisabled}
                placeholder="@ Enter your email address"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:bg-gray-50 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed"
              />
            </div>
          )}

          {error && <div className="bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm">{error}</div>}
          {message && <div className="bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-md text-sm">{message}</div>}

          <button
            type="submit"
            disabled={loading || (!resetToken && isSubmitDisabled)}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {resetToken
              ? loading ? 'Updating...' : 'Update Password'
              : loading ? 'Sending...' : coolingDown ? `Wait ${cooldownSeconds}s` : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
