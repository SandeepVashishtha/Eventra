import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
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

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
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

    // Clear the error for this field as the user corrects it
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

      setConfirmPasswordError("");
      if (password && confirmPassword) {
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
      } else {
        setPasswordMatchMessage("");
        if (e.target.name === "confirmPassword" && e.target.value) {
          setError("Passwords do not match");
          setConfirmPasswordError("Passwords do not match");
          setFieldState("confirmPassword", "error");
        } else {
          setError("");
          setFieldState("confirmPassword", "idle");
        }
    // Show password match indicator (positive-only feedback while typing)
    if (name === "confirmPassword" || name === "password") {
      const password = name === "password" ? value : formData.password;
      const confirmPassword = name === "confirmPassword" ? value : formData.confirmPassword;
      if (password && confirmPassword) {
        setPasswordMatchMessage(password === confirmPassword ? "Passwords match!" : "");
      } else {
        setPasswordMatchMessage("");
      }
    }
  };

    if (e.target.name === "email") {
      const emailResult = validate.email(e.target.value);
      setEmailError(emailResult === true ? "" : emailResult);
      setFieldState("email", emailResult === true ? "validating" : "error");
    }

    if (e.target.name === "firstName") {
      const firstNameResult = validate.firstName(e.target.value);
      const message = firstNameResult === true ? "" : firstNameResult;
      setFirstNameError(message);
      setFieldState("firstName", getFieldState(message, "success"));
    }

    if (e.target.name === "lastName") {
      const lastNameResult = validate.lastName(e.target.value);
      const message = lastNameResult === true ? "" : lastNameResult;
      setLastNameError(message);
      setFieldState("lastName", getFieldState(message, "success"));
  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "At least 2 characters";
    } else if (formData.firstName.trim().length > 50) {
      newErrors.firstName = "Less than 50 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "At least 2 characters";
    } else if (formData.lastName.trim().length > 50) {
      newErrors.lastName = "Less than 50 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }

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

    return () => {
      isActive = false;
    };
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
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else {
      const { criteriaMet } = assessStrength(formData.password);
      if (criteriaMet < 5) {
        newErrors.password = "Password doesn't meet the security criteria (must meet all 5 requirements)";
      }
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const firstNameResult = validate.firstName(formData.firstName);
    if (firstNameResult !== true) {
      setFirstNameError(firstNameResult);
      setFieldState("firstName", "error");
      setError(firstNameResult);
      return;
    }

    const lastNameResult = validate.lastName(formData.lastName);
    if (lastNameResult !== true) {
      setLastNameError(lastNameResult);
      setFieldState("lastName", "error");
      setError(lastNameResult);
      return;
    }

    if (!formData.email.trim()) {
      setEmailError("Email is required");
      setFieldState("email", "error");
      setError("Email is required");
      return;
    }

    const emailFormatResult = validate.email(formData.email);
    if (emailFormatResult !== true) {
      setEmailError(emailFormatResult);
      setFieldState("email", "error");
      setError(emailFormatResult);
      return;
    }

    setFieldState("email", "validating");
    const emailAvailabilityResult = await validateEmailAvailability(formData.email.trim());
    if (!emailAvailabilityResult.isValid) {
      const message = getResultMessage(emailAvailabilityResult);
      setEmailError(message);
      setFieldState("email", "error");
      setError(message);
      return;
    }
    setEmailError("");
    setFieldState("email", "success");

    if (!formData.password.trim()) {
      setPasswordError("Password is required");
      setFieldState("password", "error");
      setError("Password is required");
      return;
    }

    const passwordStrengthResult = await validatePasswordStrength(formData.password);
    if (!passwordStrengthResult.isValid) {
      const message = getResultMessage(passwordStrengthResult);
      setPasswordError(message);
      setFieldState("password", "error");
      setError("Password doesn't meet the security criteria (must meet all 5 requirements).");
      return;
    }
    setPasswordError("");
    setFieldState("password", "success");
    if (!validate()) return;

    if (!formData.confirmPassword.trim()) {
      setConfirmPasswordError("Confirm password is required");
      setFieldState("confirmPassword", "error");
      setError("Confirm password is required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      setFieldState("confirmPassword", "error");
      setError("Passwords do not match");
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
      const data = response.data || {};

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
        <h1 className="text-2xl font-bold text-white">
          Create Your Account
        </h1>
        <p className="text-sm text-slate-400">
          Join Eventra and start building amazing events
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <FormFieldWrapper
            id="firstName"
            label="First name"
            required
            validationState={fieldValidationState.firstName}
            message={firstNameError}
            className="space-y-1.5"
            labelClassName="block text-xs font-medium text-slate-300"
            messageClassName="text-red-400 text-[10px] mt-1"
            prefix={<User className="w-4 h-4 text-slate-500" />}
          >
            <input
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First name"
              className="w-full pl-9 pr-3 py-2.5 bg-[#0f172a]/50 border border-slate-700/50 rounded-lg text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-white"
              required
            />
          </FormFieldWrapper>
          <FormFieldWrapper
            id="lastName"
            label="Last name"
            required
            validationState={fieldValidationState.lastName}
            message={lastNameError}
            className="space-y-1.5"
            labelClassName="block text-xs font-medium text-slate-300"
            messageClassName="text-red-400 text-[10px] mt-1"
            prefix={<User className="w-4 h-4 text-slate-500" />}
          >
            <input
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last name"
              className="w-full pl-9 pr-3 py-2.5 bg-[#0f172a]/50 border border-slate-700/50 rounded-lg text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-white"
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
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? "firstName-error" : undefined}
                className={`w-full pl-9 pr-3 py-2.5 bg-[#0f172a]/50 border ${
                  errors.firstName ? "border-red-500" : "border-slate-700/50 focus:border-blue-500"
                } rounded-lg text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-white`}
                required
              />
            </div>
            {errors.firstName && (
              <p id="firstName-error" className="text-red-400 text-[10px] mt-1" role="alert">{errors.firstName}</p>
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
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? "lastName-error" : undefined}
                className={`w-full pl-9 pr-3 py-2.5 bg-[#0f172a]/50 border ${
                  errors.lastName ? "border-red-500" : "border-slate-700/50 focus:border-blue-500"
                } rounded-lg text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-white`}
                required
              />
            </div>
            {errors.lastName && (
              <p id="lastName-error" className="text-red-400 text-[10px] mt-1" role="alert">{errors.lastName}</p>
            )}
          </div>
        </div>

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
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`w-full pl-9 pr-3 py-2.5 bg-[#0f172a]/50 border ${
                errors.email ? "border-red-500" : "border-slate-700/50 focus:border-blue-500"
              } rounded-lg text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-white`}
              required
            />
          </div>
          {errors.email && (
            <p id="email-error" className="text-red-400 text-[10px] mt-1" role="alert">{errors.email}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-medium text-slate-300">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 pointer-events-none" />
            <input
              id="password" name="password" type={showPassword ? "text" : "password"}
              value={formData.password} onChange={handleChange}
              placeholder="Enter your password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={`w-full pl-9 pr-9 py-2.5 bg-[#0f172a]/50 border rounded-lg text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-white ${
                errors.password
                  ? "border-red-500"
                  : formData.password && formData.confirmPassword
                    ? passwordMatchMessage ? "border-green-500" : "border-red-400"
                    : "border-slate-700/50 focus:border-blue-500"
              }`}
              required
            />
          </FormFieldWrapper>
        </div>

        <FormFieldWrapper
          id="email"
          label="Email address"
          required
          validationState={fieldValidationState.email}
          message={
            fieldValidationState.email === "validating"
              ? "Checking email availability..."
              : emailError
          }
          className="space-y-1.5"
          labelClassName="block text-xs font-medium text-slate-300"
          messageClassName="text-[10px] mt-1"
          prefix={<AtSign className="w-4 h-4 text-slate-500" />}
        >
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            className="w-full pl-9 pr-3 py-2.5 bg-[#0f172a]/50 border border-slate-700/50 rounded-lg text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-white"
            required
          />
        </FormFieldWrapper>

        <FormFieldWrapper
          id="password"
          label="Password"
          required
          validationState={fieldValidationState.password}
          message={passwordError}
          className="space-y-1.5"
          labelClassName="block text-xs font-medium text-slate-300"
          messageClassName="text-red-400 text-[10px] mt-1"
          showStatusIcon={false}
          prefix={<Lock className="w-4 h-4 text-slate-500" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-500 hover:text-slate-300"
              type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        >
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className={`w-full pl-9 pr-9 py-2.5 bg-[#0f172a]/50 border rounded-lg text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-white ${
              formData.password && formData.confirmPassword
                ? passwordMatchMessage ? "border-green-500" : "border-red-400"
                : "border-slate-700/50 focus:border-blue-500"
            }`}
            required
          />
        </FormFieldWrapper>
        {formData.password && <PasswordStrengthIndicator password={formData.password} />}

        <FormFieldWrapper
          id="confirmPassword"
          label="Confirm Password"
          required
          validationState={fieldValidationState.confirmPassword}
          message={confirmPasswordError}
          className="space-y-1.5"
          labelClassName="block text-xs font-medium text-slate-300"
          messageClassName="text-red-400 text-[10px] mt-1"
          showStatusIcon={false}
          prefix={<Lock className="w-4 h-4 text-slate-500" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-slate-500 hover:text-slate-300"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        >
          <input
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            className={`w-full pl-9 pr-9 py-2.5 bg-[#0f172a]/50 border rounded-lg text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-white ${
              formData.confirmPassword
                ? passwordMatchMessage ? "border-green-500" : "border-red-400"
                : "border-slate-700/50 focus:border-blue-500"
            }`}
            required
          />
        </FormFieldWrapper>
        {passwordMatchMessage && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-[10px] mt-1 text-green-400" role="status" aria-live="polite">
            {passwordMatchMessage}
          </motion.p>
        )}

        <ValidationMessage
          message={error}
          state="error"
          className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-lg"
        />
        <ValidationMessage
          message={success}
          state="success"
          className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 p-2 rounded-lg"
        />
          </div>
          {errors.password && (
            <p id="password-error" className="text-red-400 text-[10px] mt-1" role="alert">{errors.password}</p>
          )}
          {formData.password && <PasswordStrengthIndicator password={formData.password} />}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-300">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 pointer-events-none" />
            <input
              id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword} onChange={handleChange}
              placeholder="Confirm your password"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              className={`w-full pl-9 pr-9 py-2.5 bg-[#0f172a]/50 border rounded-lg text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-white ${
                errors.confirmPassword
                  ? "border-red-500"
                  : formData.confirmPassword
                    ? passwordMatchMessage ? "border-green-500" : "border-red-400"
                    : "border-slate-700/50 focus:border-blue-500"
              }`}
              required
            />
            <button
              type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="text-red-400 text-[10px] mt-1" role="alert">{errors.confirmPassword}</p>
          )}
          {passwordMatchMessage && !errors.confirmPassword && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-[10px] mt-1 text-green-400">
              {passwordMatchMessage}
            </motion.p>
          )}
        </div>

        {errors.submit && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-lg" role="alert">
            {errors.submit}
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
