import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { FormFieldWrapper, ValidationMessage } from "../forms";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { User, AtSign, Lock, Eye, EyeOff, Zap } from 'lucide-react';
import {
  validate,
  validateEmailAvailability,
  validatePasswordStrength,
} from "../../validation";

const getResultMessage = (result) => (result?.isValid ? "" : result?.message || "");

const parseSignupResponse = async (response) => {
  if (typeof response?.text === "function") {
    const responseText = await response.text();
    let data = null;
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {
      data = null;
    }
    return { ok: response.ok, status: response.status, data };
  }
  return {
    ok: response?.status >= 200 && response?.status < 300,
    status: response?.status,
    data: response?.data || null,
  };
};

const getFieldState = (message, fallbackState = "idle") =>
  message ? "error" : fallbackState;

const SignupForm = () => {
  const prefersReducedMotion = useReducedMotion();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [fieldValidationState, setFieldValidationState] = useState({
    firstName: "idle",
    lastName: "idle",
    email: "idle",
    password: "idle",
    confirmPassword: "idle",
  });
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatchMessage, setPasswordMatchMessage] = useState("");
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();
  const emailValidationRequestRef = useRef(0);

  const setFieldState = useCallback((fieldName, state) => {
    setFieldValidationState((prev) => ({ ...prev, [fieldName]: state }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "confirmPassword" || name === "password") {
      const password = name === "password" ? value : formData.password;
      const confirmPassword = name === "confirmPassword" ? value : formData.confirmPassword;
      if (password && confirmPassword) {
        setPasswordMatchMessage(password === confirmPassword ? "Passwords match!" : "");
      } else {
        setPasswordMatchMessage("");
      }
    }

    if (name === "firstName") {
      const result = validate.firstName(value);
      const message = result === true ? "" : result;
      setFirstNameError(message);
      setFieldState("firstName", getFieldState(message, "success"));
    }

    if (name === "lastName") {
      const result = validate.lastName(value);
      const message = result === true ? "" : result;
      setLastNameError(message);
      setFieldState("lastName", getFieldState(message, "success"));
    }

    if (name === "email") {
      const result = validate.email(value);
      setEmailError(result === true ? "" : result);
      setFieldState("email", result === true ? "validating" : "error");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const { password, confirmPassword } = formData;
      if (!password || !confirmPassword) {
        setError("");
        setPasswordMatchMessage("");
        setConfirmPasswordError("");
        setFieldState("confirmPassword", "idle");
        return;
      }
      if (password === confirmPassword) {
        setError("");
        setConfirmPasswordError("");
        setFieldState("confirmPassword", "success");
        setPasswordMatchMessage("Passwords match!");
      } else {
        setError("Passwords do not match");
        setConfirmPasswordError("Passwords do not match");
        setFieldState("confirmPassword", "error");
        setPasswordMatchMessage("");
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData.password, formData.confirmPassword, setFieldState]);

  useEffect(() => {
    let isActive = true;

    const validatePassword = async () => {
      if (!formData.password) {
        setPasswordError("");
        setFieldState("password", "idle");
        return;
      }
      setFieldState("password", "validating");
      const result = await validatePasswordStrength(formData.password);
      if (!isActive) return;
      const message = getResultMessage(result);
      setPasswordError(message);
      setFieldState("password", result.isValid ? "success" : "error");
    };

    validatePassword();
    return () => { isActive = false; };
  }, [formData.password, setFieldState]);

  useEffect(() => {
    const email = formData.email.trim();
    const requestId = emailValidationRequestRef.current + 1;
    emailValidationRequestRef.current = requestId;

    if (!email) {
      setEmailError("");
      setFieldState("email", "idle");
      return undefined;
    }

    const emailResult = validate.email(email);
    if (emailResult !== true) {
      setEmailError(emailResult);
      setFieldState("email", "error");
      return undefined;
    }

    setEmailError("");
    setFieldState("email", "validating");

    const timer = setTimeout(async () => {
      const result = await validateEmailAvailability(email);
      if (emailValidationRequestRef.current !== requestId) return;
      const message = getResultMessage(result);
      setEmailError(message);
      setFieldState("email", result.isValid ? "success" : "error");
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email, setFieldState]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const firstNameResult = validate.firstName(formData.firstName);
    if (firstNameResult !== true) {
      setFirstNameError(firstNameResult);
      setFieldState("firstName", "error");
      return;
    }

    const lastNameResult = validate.lastName(formData.lastName);
    if (lastNameResult !== true) {
      setLastNameError(lastNameResult);
      setFieldState("lastName", "error");
      return;
    }

    if (!formData.email.trim()) {
      setEmailError("Email is required");
      setFieldState("email", "error");
      return;
    }

    const emailFormatResult = validate.email(formData.email);
    if (emailFormatResult !== true) {
      setEmailError(emailFormatResult);
      setFieldState("email", "error");
      return;
    }

    setFieldState("email", "validating");
    const emailAvailabilityResult = await validateEmailAvailability(formData.email.trim());
    if (!emailAvailabilityResult.isValid) {
      const message = getResultMessage(emailAvailabilityResult);
      setEmailError(message);
      setFieldState("email", "error");
      return;
    }
    setEmailError("");
    setFieldState("email", "success");

    if (!formData.password.trim()) {
      setPasswordError("Password is required");
      setFieldState("password", "error");
      return;
    }

    const passwordStrengthResult = await validatePasswordStrength(formData.password);
    if (!passwordStrengthResult.isValid) {
      const message = getResultMessage(passwordStrengthResult);
      setPasswordError(message);
      setFieldState("password", "error");
      return;
    }
    setPasswordError("");
    setFieldState("password", "success");

    if (!formData.confirmPassword.trim()) {
      setConfirmPasswordError("Confirm password is required");
      setFieldState("confirmPassword", "error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      setFieldState("confirmPassword", "error");
      return;
    }

    setConfirmPasswordError("");
    setFieldState("confirmPassword", "success");
    setLoading(true);
    setErrors({});

    try {
      const signupEndpoint = API_ENDPOINTS.AUTH.REGISTER || API_ENDPOINTS.AUTH.SIGNUP;
      const response = await apiUtils.post(signupEndpoint, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      const { ok, status, data } = await parseSignupResponse(response);

      if (!ok) {
        const backendMessage = data?.message || data?.error || "";
        setError(backendMessage ? `${backendMessage} (${status})` : `Registration failed (${status})`);
        return;
      }

      const sessionToken = data?.token;
      const sessionUser = {
        id: data?.id,
        firstName: data?.firstName ?? formData.firstName.trim(),
        lastName: data?.lastName ?? formData.lastName.trim(),
        email: data?.email ?? formData.email.trim(),
        username: data?.username ?? formData.email.trim(),
        role: data?.role ?? "USER",
        roles: data?.role ? [data.role] : ["USER"],
        permissions: data?.permissions ?? [],
      };

      if (!sessionToken) throw new Error("Token missing from signup response");

      setAuthSession(sessionToken, sessionUser);
      setSuccess("Account created successfully! Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard", { replace: true }), 1200);
    } catch (err) {
      setErrors({ submit: err.message || "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center space-y-3 mb-6">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-100 to-yellow-100 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(254,240,138,0.3)]"
        >
          <Zap className="w-7 h-7 text-blue-600" />
        </motion.div>
        <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
        <p className="text-sm text-slate-400">Join Eventra and start building amazing events</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* First Name + Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="firstName" className="block text-xs font-medium text-slate-300">
              First name <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 pointer-events-none" />
              <input
                id="firstName" name="firstName" type="text"
                value={formData.firstName} onChange={handleChange}
                placeholder="First name"
                aria-invalid={!!firstNameError}
                aria-describedby={firstNameError ? "firstName-error" : undefined}
                className={`w-full pl-9 pr-3 py-2.5 bg-[#0f172a]/50 border ${
                  firstNameError ? "border-red-500" : "border-slate-700/50 focus:border-blue-500"
                } rounded-lg text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-white`}
                required
              />
            </div>
            {firstNameError && (
              <p id="firstName-error" className="text-red-400 text-[10px] mt-1" role="alert">{firstNameError}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="lastName" className="block text-xs font-medium text-slate-300">
              Last name <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 pointer-events-none" />
              <input
                id="lastName" name="lastName" type="text"
                value={formData.lastName} onChange={handleChange}
                placeholder="Last name"
                aria-invalid={!!lastNameError}
                aria-describedby={lastNameError ? "lastName-error" : undefined}
                className={`w-full pl-9 pr-3 py-2.5 bg-[#0f172a]/50 border ${
                  lastNameError ? "border-red-500" : "border-slate-700/50 focus:border-blue-500"
                } rounded-lg text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-white`}
                required
              />
            </div>
            {lastNameError && (
              <p id="lastName-error" className="text-red-400 text-[10px] mt-1" role="alert">{lastNameError}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-medium text-slate-300">
            Email address <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 pointer-events-none" />
            <input
              id="email" name="email" type="email"
              value={formData.email} onChange={handleChange}
              placeholder="Enter your email address"
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error" : undefined}
              className={`w-full pl-9 pr-3 py-2.5 bg-[#0f172a]/50 border ${
                emailError ? "border-red-500" : "border-slate-700/50 focus:border-blue-500"
              } rounded-lg text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-white`}
              required
            />
          </div>
          {emailError && (
            <p id="email-error" className="text-red-400 text-[10px] mt-1" role="alert">{emailError}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-medium text-slate-300">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 pointer-events-none" />
            <input
              id="password" name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password} onChange={handleChange}
              placeholder="Enter your password"
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? "password-error" : undefined}
              className={`w-full pl-9 pr-9 py-2.5 bg-[#0f172a]/50 border rounded-lg text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-white ${
                passwordError
                  ? "border-red-500"
                  : formData.password && formData.confirmPassword
                    ? passwordMatchMessage ? "border-green-500" : "border-red-400"
                    : "border-slate-700/50 focus:border-blue-500"
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors duration-200"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordError && (
            <p id="password-error" className="text-red-400 text-[10px] mt-1" role="alert">{passwordError}</p>
          )}
          {formData.password && <PasswordStrengthIndicator password={formData.password} />}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-300">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 pointer-events-none" />
            <input
              id="confirmPassword" name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword} onChange={handleChange}
              placeholder="Confirm your password"
              aria-invalid={!!confirmPasswordError}
              aria-describedby={confirmPasswordError ? "confirmPassword-error" : undefined}
              className={`w-full pl-9 pr-9 py-2.5 bg-[#0f172a]/50 border rounded-lg text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-white ${
                confirmPasswordError
                  ? "border-red-500"
                  : formData.confirmPassword
                    ? passwordMatchMessage ? "border-green-500" : "border-red-400"
                    : "border-slate-700/50 focus:border-blue-500"
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors duration-200"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPasswordError && (
            <p id="confirmPassword-error" className="text-red-400 text-[10px] mt-1" role="alert">{confirmPasswordError}</p>
          )}
          {passwordMatchMessage && !confirmPasswordError && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-[10px] mt-1 text-green-400"
              role="status"
              aria-live="polite"
            >
              {passwordMatchMessage}
            </motion.p>
          )}
        </div>

        {errors.submit && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-lg" role="alert">
            {errors.submit}
          </div>
        )}
        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-lg" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 p-2 rounded-lg" role="status">
            {success}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-[0_0_15px_rgba(147,197,253,0.3)] text-sm font-bold text-[#0f172a] bg-blue-300 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f172a] focus:ring-blue-500 transition-all duration-300 mt-2"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin"></div>
              Creating Account...
            </div>
          ) : "Create Account"}
        </motion.button>
      </form>

      <p className="text-[10px] text-center text-slate-500 mt-4 leading-relaxed">
        By clicking on sign up, you agree to our{" "}
        <Link to="/terms" className="hover:text-slate-300 underline transition-colors">Terms of Service</Link>{" "}
        and{" "}
        <Link to="/privacy" className="hover:text-slate-300 underline transition-colors">Privacy Policy</Link>
      </p>

      <p className="text-center text-xs text-slate-400 mt-3">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-400 hover:text-blue-300 hover:underline font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignupForm;