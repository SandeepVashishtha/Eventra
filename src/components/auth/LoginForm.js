import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { showAuthToast } from "../../utils/toast";
import { FormFieldWrapper, ValidationMessage } from "../forms";
import { validate as fieldValidators } from "../../validation";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationState, setValidationState] = useState({
    usernameOrEmail: "idle",
    password: "idle",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { login, authRequest = {} } = useAuth();
  const isLoading = Boolean(authRequest.loading);
  const from = location.state?.from;
  const redirectPath =
    typeof from === "string"
      ? from
      : from?.pathname
        ? `${from.pathname}${from.search || ""}${from.hash || ""}`
        : "/dashboard";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: "" }));
    setValidationState((prev) => ({ ...prev, [name]: "idle" }));
  };

  const validateLoginForm = () => {
    const newErrors = {};
    const usernameOrEmail = formData.usernameOrEmail.trim();
    const password = formData.password.trim();

    if (!usernameOrEmail) {
      newErrors.usernameOrEmail = fieldValidators.usernameOrEmail(usernameOrEmail);
    } else if (
      usernameOrEmail.includes("@") &&
      fieldValidators.email(usernameOrEmail) !== true
    ) {
      newErrors.usernameOrEmail = fieldValidators.email(usernameOrEmail);
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (fieldValidators.password(password) !== true) {
      newErrors.password = fieldValidators.password(password);
    }

    setError(newErrors);
    setValidationState({
      usernameOrEmail: newErrors.usernameOrEmail ? "error" : "success",
      password: newErrors.password ? "error" : "success",
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateLoginForm()) return;

    try {
      const ok = await login(formData.usernameOrEmail, formData.password);
      if (ok) {
        showAuthToast("Login successful! Redirecting...", () =>
          navigate(redirectPath, { replace: true }),
        );
      }
    } catch (err) {
      const message = err.message || "Login failed. Please check your credentials.";
      setError({ general: message });
      toast.error(message);
      console.error("Login error:", err);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 space-y-4 text-center">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 8 }}
          whileTap={{ scale: 0.92 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 shadow-[0_0_25px_rgba(59,130,246,0.35)] transition-all duration-300 hover:shadow-[0_0_35px_rgba(59,130,246,0.6)]"
        >
          <LogIn className="h-8 w-8 text-blue-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-white via-blue-200 to-indigo-300 bg-clip-text text-3xl font-extrabold text-transparent transition-all duration-500 hover:from-blue-200 hover:via-purple-200 hover:to-pink-200"
          style={{ fontFamily: '"Anton", sans-serif', letterSpacing: "1px" }}
        >
          Welcome Back
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-slate-400 transition-colors duration-300 hover:text-slate-200"
        >
          Sign in to your{" "}
          <span className="font-semibold text-blue-400">Eventra</span> account
        </motion.p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormFieldWrapper
          id="usernameOrEmail"
          label="Email or username"
          required
          validationState={validationState.usernameOrEmail}
          message={error.usernameOrEmail}
          className="space-y-1.5"
          labelClassName="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
          messageClassName="text-red-400 text-xs mt-1"
          prefix={<Mail className="h-5 w-5 text-slate-500" />}
        >
          <input
            name="usernameOrEmail"
            type="text"
            value={formData.usernameOrEmail}
            onChange={handleChange}
            required
            disabled={isLoading}
            placeholder="Enter your email or username"
            className="bg-[#0f172a]/60 text-white placeholder:text-slate-600 hover:border-slate-600 hover:bg-[#0f172a]/80"
          />
        </FormFieldWrapper>

        {/* Password Field */}
        <div className="space-y-1.5">
          <FormFieldWrapper
            id="password"
            label="Password"
            required
            validationState={validationState.password}
            message={error.password}
            labelClassName="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
            messageClassName="text-red-400 text-xs mt-1"
            showStatusIcon={false}
            prefix={<Lock className="h-5 w-5 text-slate-500" />}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-500 transition-all duration-200 hover:text-blue-400"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
          >
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              placeholder="Enter your password"
              className="w-full bg-[#0f172a]/60 text-white placeholder:text-slate-600 hover:border-slate-600 hover:bg-[#0f172a]/80 rounded-lg py-2.5 pl-9 pr-9 border border-slate-700/50"
            />
          </FormFieldWrapper>
          <div className="flex justify-end pt-1">
            <Link
              to="/password-reset"
              className="min-h-[44px] text-xs text-slate-400 transition-colors duration-200 hover:text-blue-400 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* General Error Message */}
        <ValidationMessage
          message={error.general}
          state="error"
          className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        />

        {authRequest.error && (
          <div
            className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            role="alert"
          >
            {authRequest.error}
          </div>
        )}


        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(59,130,246,0.6)" }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={isLoading}
          className="group relative flex min-h-[48px] w-full justify-center overflow-hidden rounded-xl bg-gradient-to-r from-blue-400 to-indigo-400 px-4 py-3.5 text-sm font-bold text-[#0f172a] shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300 hover:from-blue-300 hover:to-indigo-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0f172a]"
        >
          <span className="absolute inset-0 h-full w-full -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
          {isLoading ? (
            <span className="relative z-10 flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0f172a] border-t-transparent" />
              Signing In...
            </span>
          ) : (
            <span className="relative z-10 flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </span>
          )}
        </motion.button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-700" />
        <span className="text-xs uppercase tracking-widest text-slate-600">or</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-700" />
      </div>

      {/* Signup Link */}
      <p className="text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          to="/signup"
          className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text font-semibold text-transparent transition-all duration-300 hover:from-blue-300 hover:to-purple-300 hover:underline"
        >
          Create one here -&gt;
        </Link>
      </p>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-600">
        By signing in, you agree to our{" "}
        <Link
          to="/terms"
          className="text-slate-500 underline transition-colors duration-200 hover:text-blue-400"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          to="/privacy"
          className="text-slate-500 underline transition-colors duration-200 hover:text-blue-400"
        >
          Privacy Policy
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;