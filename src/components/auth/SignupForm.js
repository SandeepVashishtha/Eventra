import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { FormFieldWrapper, ValidationMessage } from "../forms";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { User, AtSign, Lock, Eye, EyeOff, Zap } from "lucide-react";
import {
  validate,
  validateEmailAvailability,
  validatePasswordStrength,
} from "../../validation";

const getResultMessage = (result, fallback) =>
  result?.isValid ? "" : result?.message || fallback;

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

const SignupForm = () => {
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    setSubmitError("");
    setSuccess("");

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

    setLoading(true);

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
        const backendMessage = data?.message || data?.error || "Registration failed";
        setSubmitError(`${backendMessage} (${status})`);
        return;
      }

      const sessionToken = data?.token;
      if (!sessionToken) {
        setSubmitError("Signup completed but no token was returned.");
        return;
      }

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

      setAuthSession(sessionToken, sessionUser);
      setSuccess("Account created successfully. Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard", { replace: true }), 1000);
    } catch (err) {
      setSubmitError(err?.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center space-y-3 mb-6">
        <motion.div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-100 to-yellow-100 rounded-2xl flex items-center justify-center">
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
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-bold text-[#0f172a] bg-gradient-to-r from-blue-400 to-indigo-400"
        >
          {loading ? "Creating account..." : "Create Account"}
        </motion.button>
      </form>

      <p className="text-center text-sm text-slate-400 mt-4">
        Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300">Sign in</Link>
      </p>
    </div>
  );
};

export default SignupForm;