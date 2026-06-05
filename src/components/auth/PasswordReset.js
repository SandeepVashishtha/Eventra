import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { motion } from "framer-motion";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { RESET_COOLDOWN_SECONDS, secondsUntilUnlock } from '../../utils/rateLimitUtils';

const PasswordReset = () => {
  useDocumentTitle("Reset Password | Eventra");
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const lastSubmitRef = useRef(0);
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
      setMessage(response.data?.message || 'Password reset link sent! Check your email.');
      lastSubmitRef.current = Date.now();
      startCooldownTimer();
      navTimerRef.current = setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const backendMessage = err.response?.data?.message || err?.data?.message;
      setError(backendMessage || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || isCoolingDown();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-lg shadow-lg">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform duration-200"
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </motion.div>

        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 text-center">Reset Password</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Secure your account and get back to creating events.</p>

        {isCoolingDown() && cooldownSeconds > 0 && (
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

          {error && <div className="bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm">{error}</div>}
          {message && <div className="bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-md text-sm">{message}</div>}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : isCoolingDown() ? `Wait ${cooldownSeconds}s` : 'Send Reset Link'}
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