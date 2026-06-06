import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { showAuthToast } from "../../utils/toast";
import { ValidationMessage } from "../forms";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { validate as fieldValidators } from "../../validation";
import { getSafeRedirectPath } from "../../utils/redirectValidation";

const LoginForm = () => {
  const [formData, setFormData] = useState({ usernameOrEmail: "", password: "" });
  const [error, setError] = useState({});
  const [, setValidationState] = useState({
    usernameOrEmail: "idle",
    password: "idle",
  });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, authRequest } = useAuth();
  const from = location.state?.from;
  const redirectPath = getSafeRedirectPath(
    typeof from === "string"
      ? from
      : from?.pathname
        ? `${from.pathname}${from.search || ""}${from.hash || ""}`
        : "/dashboard",
    "/dashboard"
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: "" }));
    setValidationState((prev) => ({ ...prev, [name]: "idle" }));
  };

  const validateLoginForm = () => {
    const newErrors = {};

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = fieldValidators.usernameOrEmail(formData.usernameOrEmail);
    } else if (
      formData.usernameOrEmail.includes("@") &&
      fieldValidators.email(formData.usernameOrEmail) !== true
    ) {
      newErrors.usernameOrEmail = fieldValidators.email(formData.usernameOrEmail);
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (fieldValidators.password(formData.password) !== true) {
      newErrors.password = fieldValidators.password(formData.password);
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
          navigate(redirectPath, { replace: true })
        );
      }
    } catch (err) {
      const errorMsg = err.message || "Invalid email or password";
      setError({ general: errorMsg });
      toast.error(errorMsg);
    }
    // Note: loading state is now handled by authRequest.loading from context
  };

  return (
    <div className="w-full">
      <div className="text-center space-y-3 mb-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center bg-bg-secondary border border-border transition-all duration-300"
        >
          <LogIn className="w-7 h-7 text-primary" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-extrabold text-text tracking-tight"
        >
          Welcome Back
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-text-light"
        >
          Sign in to your <span className="text-primary font-semibold">Eventra</span> account
        </motion.p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Username/Email Field */}
        <div className="space-y-1.5">
          <label htmlFor="usernameOrEmail" className="block text-sm font-semibold text-text">
            Email or Username <span className='ml-1 text-red-500'>*</span>
          </label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light group-focus-within:text-primary transition-all duration-300 pointer-events-none" />
            <input
              id="usernameOrEmail"
              name="usernameOrEmail"
              type="text"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              required
              disabled={authRequest.loading}
              placeholder="john@example.com / yourname@email.com / eventra.team@gmail.com"
              aria-invalid={!!error.usernameOrEmail}
              aria-describedby={error.usernameOrEmail ? "usernameOrEmail-error" : undefined}
              className={`w-full pl-10 pr-4 py-3 bg-bg border ${
                error.usernameOrEmail ? "border-red-500" : "border-border"
              } rounded-xl placeholder:text-text-light focus:ring-2 focus:ring-primary/25 focus:border-primary hover:bg-card-bg transition-all duration-300 text-text text-sm`}
            />
          </div>
          {error.usernameOrEmail && (
            <motion.p id="usernameOrEmail-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-600 text-xs mt-1 flex items-center gap-1" role="alert">
              <span>⚠</span> {error.usernameOrEmail}
            </motion.p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-semibold text-text">
            Password <span className='ml-1 text-red-500'>*</span>
          </label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light group-focus-within:text-primary transition-all duration-300 pointer-events-none" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              disabled={authRequest.loading}
              placeholder="••••••••"
              aria-invalid={!!error.password}
              aria-describedby={error.password ? "password-error" : undefined}
              className={`w-full pl-10 pr-10 py-3 bg-bg border ${
                error.password ? "border-red-500" : "border-border"
              } rounded-xl placeholder:text-text-light focus:ring-2 focus:ring-primary/25 focus:border-primary hover:bg-card-bg transition-all duration-300 text-text text-sm`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-primary transition-all duration-200"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {error.password && (
            <motion.p id="password-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-600 text-xs mt-1 flex items-center gap-1" role="alert">
              <span>⚠</span> {error.password}
            </motion.p>
          )}
          <div className="flex justify-end pt-1">
            <Link
              to="/password-reset"
              className="text-xs text-primary hover:text-primary-hover transition-colors duration-200 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* General Error Message */}
        <ValidationMessage
          message={error.general}
          state="error"
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
        />
        {authRequest.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {authRequest.error}
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={authRequest.loading}
          className="relative w-full overflow-hidden flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 group"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
          {authRequest.loading ? (
            <div className="flex items-center gap-2 relative z-10">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Signing In...</span>
            </div>
          ) : (
            <span className="relative z-10 flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Sign In
            </span>
          )}
        </motion.button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-border"></div>
        <span className="text-xs text-text-light uppercase tracking-widest">or</span>
        <div className="flex-1 h-px bg-border"></div>
      </div>

      {/* Signup Link */}
      <p className="text-center text-sm text-text-light">
        Don&apos;t have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold text-primary hover:text-primary-hover transition-all duration-300 hover:underline"
        >
          Create one here -&gt;
        </Link>
      </p>

      {/* Terms & Privacy */}
      <p className="text-[11px] text-center text-text-light mt-4 leading-relaxed">
        By signing in, you agree to our{" "}
        <Link to="/terms" className="text-primary hover:text-primary-hover underline transition-colors duration-200">Terms of Service</Link>{" "}
        and{" "}
        <Link to="/privacy" className="text-primary hover:text-primary-hover underline transition-colors duration-200">Privacy Policy</Link>
      </p>
    </div>
  );
};

export default LoginForm;
