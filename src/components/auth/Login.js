import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { toast } from "react-toastify";
import { showAuthToast } from "../../utils/toast";
import { getPublicErrorMessage, AUTH_ERRORS } from "../../utils/errorMessages";
import useReducedMotion from "../../hooks/useReducedMotion";
import FieldError from '../common/FieldError';
import useLoginRateLimit from '../../hooks/useLoginRateLimit';
import { MAX_LOGIN_ATTEMPTS, parseRetryAfterMs } from '../../utils/rateLimitUtils';
import '../../styles/auth.css';

const Login = () => {
  useDocumentTitle("Login | Eventra");
  const prefersReducedMotion = useReducedMotion();
  const [formData, setFormData] = useState({ usernameOrEmail: "", password: "" });
  const [error, setError] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, token, authRequest } = useAuth();
  const {
    lockedOutSeconds,
    remainingAttempts,
    recordAttempt,
    resetAttempts,
    isLockedOut,
    applyServerLockout,
  } = useLoginRateLimit();

  // If ProtectedRoute redirected here because the JWT expired, show a notice.
  const sessionExpired = location.state?.sessionExpired ?? false;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = "Email or username is required";
    } else if (
      formData.usernameOrEmail.includes("@") &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.usernameOrEmail)
    ) {
      newErrors.usernameOrEmail = "Invalid email format";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, isAuthenticated, user, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (authRequest.loading) return;
    if (isLockedOut()) return;
    if (!validate()) return;

    try {
      const sanitizedUsernameOrEmail = formData.usernameOrEmail.trim();
      const ok = await login(sanitizedUsernameOrEmail, formData.password);
      if (ok) {
        resetAttempts();
        showAuthToast("Login successful! Redirecting to dashboard...", () =>
          navigate("/dashboard", { replace: true })
        );
      }
    } catch (err) {
      toast.error(getPublicErrorMessage(err, AUTH_ERRORS.loginFailed));
      const retryAfterHeader =
        err?.response?.headers?.['retry-after'] ||
        err?.response?.headers?.['Retry-After'] ||
        err?.retryAfter ||
        null;

      const serverDelayMs = parseRetryAfterMs(retryAfterHeader);
      if (serverDelayMs > 0) {
        applyServerLockout(serverDelayMs / 1000);
        toast.error(
          `Too many requests. Please wait ${Math.ceil(serverDelayMs / 1000)} seconds before trying again.`,
        );
      } else {
        recordAttempt();
        toast.error(err.message || 'Login failed. Please check your credentials.');
      }
    }
  };

  const isSubmitDisabled = authRequest.loading || isLockedOut();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
      className="pastel-grid-bg min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 section-theme"
    >
      <div className="max-w-4xl w-full mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.2 }}
          className="relative w-full my-8 sm:my-12 overflow-hidden rounded-2xl border p-4 sm:p-6 lg:p-8 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl card-theme"
        >
          <div className="pointer-events-none absolute top-8 left-6 h-16 w-16 rounded-full bg-blue-100 opacity-60 blur-sm"></div>
          <div className="pointer-events-none absolute bottom-10 left-20 h-20 w-20 rounded-full bg-pink-100 opacity-60 blur-sm"></div>
          <div className="pointer-events-none absolute top-16 right-10 h-14 w-14 rounded-full bg-yellow-100 opacity-60 blur-sm"></div>
          <div className="relative z-10 w-full p-10 space-y-6 backdrop-blur-xl section-theme">

              {/* Session-expired banner */}
              {sessionExpired && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
                  className="session-expired-banner"
                  role="alert"
                  aria-live="polite"
                >
                  ⚠️ Your session has expired. Please log in again.
                </motion.div>
              )}

              {/* Lockout banner */}
              {isLockedOut() && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                  className="bg-red-50 dark:bg-red-900/40 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm font-medium"
                  role="alert"
                  aria-live="assertive"
                >
                  Too many failed attempts. Try again in {lockedOutSeconds}s.
                </motion.div>
              )}

              {/* Remaining attempts warning */}
              {!isLockedOut() && remainingAttempts <= MAX_LOGIN_ATTEMPTS - 3 && remainingAttempts > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 px-4 py-3 rounded-xl text-sm"
                  role="status"
                  aria-live="polite"
                >
                  {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining before temporary lockout.
                </motion.div>
              )}

              {/* Logo / Title */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.3, type: "spring", stiffness: 200 }}
                className="text-center space-y-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="mx-auto w-16 h-16 bg-white/10 dark:bg-white/5 rounded-3xl flex items-center justify-center shadow-md border border-white/20 dark:border-white/10"
                >
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </motion.div>
                <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
                <p className="text-md" style={{ color: "var(--text-color-light)" }}>
                  Sign in to your Eventra account
                </p>
              </motion.div>

              {/* Login Form */}
              <motion.form onSubmit={handleSubmit} className="space-y-6" noValidate>

                {/* Email / Username */}
                <div className="space-y-2">
                  <label htmlFor="usernameOrEmail" className="block text-sm font-semibold" style={{ color: "var(--text-color)" }}>
                    Email or username <sup className='ml-1 text-sm text-red-500'>*</sup>
                  </label>
                  <div className="relative group">
                    <input
                      id="usernameOrEmail"
                      name="usernameOrEmail"
                      type="text"
                      value={formData.usernameOrEmail}
                      onChange={handleChange}
                      required
                      disabled={isSubmitDisabled}
                      placeholder="john@example.com / yourname@email.com / eventra.team@gmail.com"
                      aria-invalid={!!error.usernameOrEmail}
                      aria-describedby={error.usernameOrEmail ? 'usernameOrEmail-error' : undefined}
                      className={`w-full pl-3 pr-4 py-3 bg-white dark:bg-gray-800 border ${error.usernameOrEmail ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'
                        } rounded-xl placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:shadow-md text-gray-900 dark:text-white`}
                    />
                  </div>
                  <FieldError id="usernameOrEmail-error" message={error.usernameOrEmail} />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold" style={{ color: "var(--text-color)" }}>
                    Password <sup className='ml-1 text-sm text-red-500'>*</sup>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={isSubmitDisabled}
                      placeholder="Enter secure password / Minimum 8 characters / Use strong password"
                      aria-invalid={!!error.password}
                      aria-describedby={error.password ? 'password-error' : undefined}
                      className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border ${error.password ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-gray-600'
                        } rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:shadow-md text-gray-900 dark:text-white`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <FieldError id="password-error" message={error.password} />
                  <div className="flex justify-end">
                    <Link to="/password-reset" className="text-blue-600 hover:underline text-sm">
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                {/* Auth error */}
                {authRequest.error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
                  >
                    {authRequest.error}
                  </motion.div>
                )}

                {/* Sign in button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-75 transition-all duration-300"
                >
                  {isLockedOut() ? (
                    `Locked — wait ${lockedOutSeconds}s`
                  ) : authRequest.loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing In...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </motion.button>

              </motion.form>

              {/* Sign up link */}
              <div className="text-center">
                <p style={{ color: "var(--text-color-light)" }}>
                  Don&apos;t have an account?{' '}
                  <Link to="/signup" className="text-blue-600 hover:underline font-semibold">
                    Create one here
                  </Link>
                </p>
              </div>

              {/* Terms */}
              <p className="text-xs text-center" style={{ color: "var(--text-color-light)" }}>
                By signing in, you agree to our{' '}
                <Link to="/terms" className="hover:underline text-blue-600 font-semibold">Terms of Service</Link>{' '}
                and{' '}
                <Link to="/privacy" className="hover:underline text-blue-600 font-semibold">Privacy Policy</Link>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
};

export default Login;