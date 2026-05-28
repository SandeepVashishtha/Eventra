import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AtSign, Eye, EyeOff, Lock, User, Zap } from "lucide-react";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { FormFieldWrapper, ValidationMessage } from "../forms";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import {
  validate,
  validateEmailAvailability,
  validatePasswordStrength,
} from "../../validation";

const getResultMessage = (result, fallback = "") =>
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
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();
  const emailValidationRequestRef = useRef(0);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [fieldValidationState, setFieldValidationState] = useState({
    firstName: "idle",
    lastName: "idle",
    email: "idle",
    password: "idle",
    confirmPassword: "idle",
  });
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatchMessage, setPasswordMatchMessage] = useState("");

  const setFieldState = useCallback((fieldName, state) => {
    setFieldValidationState((prev) => ({ ...prev, [fieldName]: state }));
  }, []);

  const setFieldError = useCallback((fieldName, message) => {
    setErrors((prev) => ({ ...prev, [fieldName]: message }));
    setFieldState(fieldName, getFieldState(message, "success"));
  }, [setFieldState]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    setSubmitError("");

    if (name === "firstName") {
      const result = validate.firstName(value);
      setFieldError("firstName", result === true ? "" : result);
    }

    if (name === "lastName") {
      const result = validate.lastName(value);
      setFieldError("lastName", result === true ? "" : result);
    }

    if (name === "email") {
      const result = value ? validate.email(value) : true;
      setErrors((prev) => ({ ...prev, email: result === true ? "" : result }));
      setFieldState("email", result === true && value ? "validating" : getFieldState(result === true ? "" : result));
    }

    if (name === "password" || name === "confirmPassword") {
      const password = name === "password" ? value : nextData.password;
      const confirmPassword = name === "confirmPassword" ? value : nextData.confirmPassword;

      if (password && confirmPassword && password === confirmPassword) {
        setPasswordMatchMessage("Passwords match!");
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
        setFieldState("confirmPassword", "success");
      } else if (confirmPassword) {
        setPasswordMatchMessage("");
        setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
        setFieldState("confirmPassword", "error");
      } else {
        setPasswordMatchMessage("");
        setFieldState("confirmPassword", "idle");
      }
    }
  };

  useEffect(() => {
    const email = formData.email.trim();
    const requestId = emailValidationRequestRef.current + 1;
    emailValidationRequestRef.current = requestId;

    if (!email) {
      setErrors((prev) => ({ ...prev, email: "" }));
      setFieldState("email", "idle");
      return undefined;
    }

    const formatResult = validate.email(email);
    if (formatResult !== true) {
      setErrors((prev) => ({ ...prev, email: formatResult }));
      setFieldState("email", "error");
      return undefined;
    }

    setErrors((prev) => ({ ...prev, email: "" }));
    setFieldState("email", "validating");

    const timer = setTimeout(async () => {
      const result = await validateEmailAvailability(email);
      if (emailValidationRequestRef.current !== requestId) return;

      const message = getResultMessage(result, "Email is already registered");
      setErrors((prev) => ({ ...prev, email: message }));
      setFieldState("email", result.isValid ? "success" : "error");
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email, setFieldState]);

  useEffect(() => {
    let isActive = true;

    const validatePassword = async () => {
      if (!formData.password) {
        setErrors((prev) => ({ ...prev, password: "" }));
        setFieldState("password", "idle");
        return;
      }

      setFieldState("password", "validating");
      const result = await validatePasswordStrength(formData.password);
      if (!isActive) return;

      const message = getResultMessage(result, "Password does not meet strength requirements");
      setErrors((prev) => ({ ...prev, password: message }));
      setFieldState("password", result.isValid ? "success" : "error");
    };

    validatePassword();

    return () => {
      isActive = false;
    };
  }, [formData.password, setFieldState]);

  const runValidation = async () => {
    const nextErrors = {};

    const firstNameResult = validate.firstName(formData.firstName.trim());
    if (firstNameResult !== true) nextErrors.firstName = firstNameResult;

    const lastNameResult = validate.lastName(formData.lastName.trim());
    if (lastNameResult !== true) nextErrors.lastName = lastNameResult;

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required";
    } else {
      const emailResult = validate.email(formData.email.trim());
      if (emailResult !== true) {
        nextErrors.email = emailResult;
      } else {
        const availability = await validateEmailAvailability(formData.email.trim());
        if (!availability.isValid) {
          nextErrors.email = getResultMessage(availability, "Email is already registered");
        }
      }
    }

    if (!formData.password.trim()) {
      nextErrors.password = "Password is required";
    } else {
      const passwordResult = await validatePasswordStrength(formData.password);
      if (!passwordResult.isValid) {
        nextErrors.password = getResultMessage(
          passwordResult,
          "Password does not meet strength requirements",
        );
        setSubmitError(
          "Password doesn't meet the security criteria (must meet all 5 requirements).",
        );
      }
    }

    if (!formData.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);
    setFieldValidationState((prev) => ({
      ...prev,
      firstName: getFieldState(nextErrors.firstName, "success"),
      lastName: getFieldState(nextErrors.lastName, "success"),
      email: getFieldState(nextErrors.email, "success"),
      password: getFieldState(nextErrors.password, "success"),
      confirmPassword: getFieldState(nextErrors.confirmPassword, "success"),
    }));

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSuccess("");

    const isValid = await runValidation();
    if (!isValid) return;

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

      if (!data?.token) {
        setSubmitError("Signup completed but no token was returned.");
        return;
      }

      setAuthSession(data.token, {
        id: data?.id,
        firstName: data?.firstName ?? formData.firstName.trim(),
        lastName: data?.lastName ?? formData.lastName.trim(),
        email: data?.email ?? formData.email.trim(),
        username: data?.username ?? formData.email.trim(),
        role: data?.role ?? "USER",
        roles: data?.role ? [data.role] : ["USER"],
        permissions: data?.permissions ?? [],
      });
      setSuccess("Account created successfully. Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard", { replace: true }), 1000);
    } catch (error) {
      setSubmitError(error?.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 space-y-3 text-center">
        <motion.div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-yellow-100">
          <Zap className="h-7 w-7 text-blue-600" aria-hidden="true" />
        </motion.div>
        <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
        aria-describedby="signup-form-error signup-form-success"
      >
        <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
          <FormFieldWrapper
            id="firstName"
            label="First name"
            required
            validationState={fieldValidationState.firstName}
            message={errors.firstName}
            prefix={<User className="h-4 w-4 text-slate-500" aria-hidden="true" />}
          >
            <input
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700/50 bg-[#0f172a]/50 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500"
              required
              disabled={loading}
            />
          </FormFieldWrapper>

          <FormFieldWrapper
            id="lastName"
            label="Last name"
            required
            validationState={fieldValidationState.lastName}
            message={errors.lastName}
            prefix={<User className="h-4 w-4 text-slate-500" aria-hidden="true" />}
          >
            <input
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700/50 bg-[#0f172a]/50 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500"
              required
              disabled={loading}
            />
          </FormFieldWrapper>
        </div>

        <FormFieldWrapper
          id="email"
          label="Email"
          required
          validationState={fieldValidationState.email}
          message={
            fieldValidationState.email === "validating"
              ? "Checking email availability..."
              : errors.email
          }
          prefix={<AtSign className="h-4 w-4 text-slate-500" aria-hidden="true" />}
        >
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-700/50 bg-[#0f172a]/50 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500"
            required
            disabled={loading}
          />
        </FormFieldWrapper>

        <FormFieldWrapper
          id="password"
          label="Password"
          required
          validationState={fieldValidationState.password}
          message={errors.password}
          showStatusIcon={false}
          prefix={<Lock className="h-4 w-4 text-slate-500" aria-hidden="true" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-slate-500 hover:text-blue-400"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-controls="password"
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        >
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-700/50 bg-[#0f172a]/50 py-2.5 pl-9 pr-9 text-sm text-white placeholder:text-slate-500"
            required
            disabled={loading}
          />
        </FormFieldWrapper>

        {formData.password && <PasswordStrengthIndicator password={formData.password} />}

        <FormFieldWrapper
          id="confirmPassword"
          label="Confirm password"
          required
          validationState={fieldValidationState.confirmPassword}
          message={errors.confirmPassword}
          showStatusIcon={false}
          prefix={<Lock className="h-4 w-4 text-slate-500" aria-hidden="true" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="text-slate-500 hover:text-blue-400"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              aria-controls="confirmPassword"
              aria-pressed={showConfirmPassword}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        >
          <input
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-700/50 bg-[#0f172a]/50 py-2.5 pl-9 pr-9 text-sm text-white placeholder:text-slate-500"
            required
            disabled={loading}
          />
        </FormFieldWrapper>

        {passwordMatchMessage && !errors.confirmPassword && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-1 text-[10px] text-green-400"
            role="status"
            aria-live="polite"
          >
            {passwordMatchMessage}
          </motion.p>
        )}

        <ValidationMessage
          id="signup-form-error"
          message={submitError}
          state="error"
          className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-xs text-red-400"
        />
        <ValidationMessage
          id="signup-form-success"
          message={success}
          state="success"
          className="rounded-lg border border-green-500/20 bg-green-500/10 p-2 text-xs text-green-400"
        />

        <motion.button
          type="submit"
          disabled={loading}
          className="min-h-[48px] w-full rounded-xl bg-gradient-to-r from-blue-400 to-indigo-400 py-3 text-sm font-bold text-[#0f172a] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Create Account"}
        </motion.button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-400 hover:text-blue-300">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignupForm;
