import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
// Under the hood, password reset requests are sent to API_ENDPOINTS.AUTH.RESET_PASSWORD via authService.
import { authService } from "../../services/authService";
import { motion } from "framer-motion";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import {
  RESET_COOLDOWN_SECONDS,
  secondsUntilUnlock,
  STORAGE_KEY_RESET_LAST_SUBMIT,
} from "../../utils/rateLimitUtils";

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
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

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
      setMessage(response.data?.message || "Password reset link sent! Check your email.");
      lastSubmitRef.current = Date.now();
      writeLastSubmit(lastSubmitRef.current); // FIX (Issue #5720): persist so refresh can't bypass cooldown
      startCooldownTimer();
      navTimerRef.current = setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const backendMessage = err.response?.data?.message || err?.data?.message;
      setError(backendMessage || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || isCoolingDown();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-black">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="mx-auto flex h-16 w-16 transform items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg transition-transform duration-200"
        >
          <svg
            className="h-8 w-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </motion.div>

        <h1 className="text-center text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Reset Password
        </h1>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Secure your account and get back to creating events.
        </p>

        {isCoolingDown() && cooldownSeconds > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            role="status"
            aria-live="polite"
          >
            <span>
              Reset link sent. You can request another in <strong>{cooldownSeconds}s</strong>.
            </span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
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
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:disabled:bg-gray-700/50"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/40 dark:text-red-300">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-700 dark:bg-green-900/40 dark:text-green-300">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full rounded-md bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading
              ? "Sending..."
              : isCoolingDown()
                ? `Wait ${cooldownSeconds}s`
                : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-blue-600 hover:underline dark:text-blue-400">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
