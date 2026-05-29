import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { getPublicErrorMessage, AUTH_ERRORS } from "../../utils/errorMessages";
import { showAuthToast } from "../../utils/toast";

const LOCKOUT_DURATION_MS = 30_000;
const MAX_ATTEMPTS = 5;

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isThrottled, setIsThrottled] = useState(false);
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState(0);

  const redirectPath = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email or username is required.";
    if (!formData.password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const startLockoutTimer = () => {
    setIsThrottled(true);
    let remaining = LOCKOUT_DURATION_MS / 1000;
    setLockoutSecondsLeft(remaining);
    const interval = setInterval(() => {
      remaining -= 1;
      setLockoutSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        setIsThrottled(false);
        setLoginAttempts(0);
        setLockoutSecondsLeft(0);
      }
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isThrottled) {
      toast.error(`Too many attempts. Please wait ${lockoutSecondsLeft}s before trying again.`);
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const ok = await login(formData.email, formData.password);
      if (ok) {
        setLoginAttempts(0);
        showAuthToast("Login successful! Redirecting...", () =>
          navigate(redirectPath, { replace: true }),
        );
      }
    } catch (err) {
      const newCount = loginAttempts + 1;
      setLoginAttempts(newCount);

      if (newCount >= MAX_ATTEMPTS) {
        startLockoutTimer();
        toast.warn(`Too many failed attempts. Locked for ${LOCKOUT_DURATION_MS / 1000} seconds.`);
      }

      const errorMsg = getPublicErrorMessage(err, AUTH_ERRORS.loginFailed);
      setErrors({ general: errorMsg });
      toast.error(errorMsg);
    } finally {
    const sanitizedEmail = email.trim();
    // Pass sanitizedEmail to your submission logic/payload
    setTimeout(() => {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Sign in</h2>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* General error */}
        {errors.general && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300"
          >
            {errors.general}
          </div>
        )}

        {/* Lockout warning */}
        {isThrottled && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-md bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300"
          >
            Account temporarily locked. Try again in{" "}
            <strong>{lockoutSecondsLeft}s</strong>.
          </div>
        )}

        {/* Remaining attempts warning */}
        {!isThrottled && loginAttempts > 0 && loginAttempts < MAX_ATTEMPTS && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-md bg-orange-50 border border-orange-200 px-4 py-3 text-sm text-orange-700 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-300"
          >
            {MAX_ATTEMPTS - loginAttempts} attempt
            {MAX_ATTEMPTS - loginAttempts !== 1 ? "s" : ""} remaining before lockout.
          </div>
        )}

        {/* Email / username */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Email or username
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="email"
              name="email"
              type="text"
              autoComplete="username"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
                errors.email
                  ? "border-red-400 dark:border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              required
            />
          </div>
          {errors.email && (
            <p id="email-error" role="alert" aria-live="polite" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={`w-full rounded-lg border pl-10 pr-10 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white ${
                errors.password
                  ? "border-red-400 dark:border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" role="alert" aria-live="polite" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || isThrottled}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <LogIn className="w-4 h-4" />
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="text-blue-600 hover:underline dark:text-blue-400">
          Create one
        </Link>
      </p>
    </motion.div>
  );
};

export default LoginForm;
