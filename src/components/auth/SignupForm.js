import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { authService } from "../../services/authService";

import { ROLES } from "../../config/roles";
import { useAuth } from "../../context/AuthContext";
import { FormFieldWrapper, ValidationMessage } from "../forms";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { User, AtSign, Lock, Eye, EyeOff, Zap, LoaderCircle } from "lucide-react";
import { validate, validateEmailAvailability, validatePasswordStrength } from "../../validation";
import { getPublicErrorMessage, AUTH_ERRORS } from "../../utils/errorMessages";

const getResultMessage = (result, fallback) => (result?.isValid ? "" : result?.message || fallback);

export const normalizeSignupRoles = (data) => {
  const responseRoles = Array.isArray(data?.roles)
    ? data.roles.filter((role) => typeof role === "string" && role.trim())
    : [];

  if (responseRoles.length > 0) {
    return responseRoles;
  }

  if (typeof data?.role === "string" && data.role.trim()) {
    return [data.role];
  }

  return [ROLES.ATTENDEE];
};

const SignupForm = () => {
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();
  // useRef-based guard prevents double-click submissions even when
  // the loading state update hasn't propagated yet (setState is async).
  const isSubmittingRef = useRef(false);

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
  const [passwordMatchMessage, setPasswordMatchMessage] = useState("");

  const [fieldValidationState, setFieldValidationState] = useState({});
  const { password, confirmPassword } = formData;

  const setFieldState = useCallback((fieldName, state) => {
    setFieldValidationState((prev) => ({ ...prev, [fieldName]: state }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFieldState(name, "idle");
    setSubmitError("");
  };

  const runValidation = async () => {
    const nextErrors = {};

    const firstNameResult = validate.firstName(formData.firstName.trim());
    if (firstNameResult !== true) {
      nextErrors.firstName = firstNameResult;
      setFieldState("firstName", "error");
    } else {
      setFieldState("firstName", "success");
    }

    const lastNameResult = validate.lastName(formData.lastName.trim());
    if (lastNameResult !== true) {
      nextErrors.lastName = lastNameResult;
      setFieldState("lastName", "error");
    } else {
      setFieldState("lastName", "success");
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required";
      setFieldState("email", "error");
    } else {
      const emailValue = formData.email.trim();
      const emailFormatResult = validate.email(emailValue);
      if (emailFormatResult !== true) {
        nextErrors.email = emailFormatResult;
        setFieldState("email", "error");
      } else {
        const emailAvailability = await validateEmailAvailability(emailValue);
        if (!emailAvailability?.isValid) {
          nextErrors.email = getResultMessage(emailAvailability, "Email is already registered");
          setFieldState("email", "error");
        } else {
          setFieldState("email", "success");
        }
      }
    }

    const passwordResult = await validatePasswordStrength(formData.password);
    if (!passwordResult?.isValid) {
      nextErrors.password = "Password doesn't meet the security criteria";
      setFieldState("password", "error");
    } else {
      setFieldState("password", "success");
    }

    const confirmPasswordResult = validate.confirmPassword(formData.confirmPassword, {
      password: formData.password,
    });
    if (confirmPasswordResult !== true) {
      nextErrors.confirmPassword = confirmPasswordResult;
      setFieldState("confirmPassword", "error");
    } else {
      setFieldState("confirmPassword", "success");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // Confirm Password matching useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!password || !confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
        setPasswordMatchMessage("");
        setFieldState("confirmPassword", "idle");
        return;
      }
      if (password === confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
        setFieldState("confirmPassword", "success");
        setPasswordMatchMessage("Passwords match!");
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
        setFieldState("confirmPassword", "error");
        setPasswordMatchMessage("");
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [password, confirmPassword, setFieldState]);

  // Password strength check useEffect
  useEffect(() => {
    const validatePwd = async () => {
      if (!formData.password) {
        setErrors((prev) => ({ ...prev, password: "" }));
        setFieldState("password", "idle");
        return;
      }
      const result = await validatePasswordStrength(formData.password);
      if (result?.isValid) {
        setErrors((prev) => ({ ...prev, password: "" }));
        setFieldState("password", "success");
      } else {
        setErrors((prev) => ({ ...prev, password: result?.message }));
        setFieldState("password", "error");
      }
    };
    validatePwd();
  }, [formData.password, setFieldState]);

  // Email validation check useEffect with 500ms debounce
  useEffect(() => {
    const email = formData.email.trim();
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "" }));
      setFieldState("email", "idle");
      return;
    }

    const emailFormatResult = validate.email(email);
    if (emailFormatResult !== true) {
      setErrors((prev) => ({ ...prev, email: emailFormatResult }));
      setFieldState("email", "error");
      return;
    }

    // Set validating/loading state immediately
    setErrors((prev) => ({ ...prev, email: "Checking email availability..." }));
    setFieldState("email", "loading");

    const timer = setTimeout(async () => {
      try {
        const result = await validateEmailAvailability(email);
        if (result?.isValid) {
          setErrors((prev) => ({ ...prev, email: "" }));
          setFieldState("email", "success");
        } else {
          setErrors((prev) => ({
            ...prev,
            email: result?.message || "Email is already registered",
          }));
          setFieldState("email", "error");
        }
      } catch {
        setErrors((prev) => ({ ...prev, email: "Validation failed" }));
        setFieldState("email", "error");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email, setFieldState]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Dual-layer double-submit prevention:
    // 1. isSubmittingRef — synchronous, blocks re-entry immediately.
    // 2. loading state — keeps the button disabled in the UI.
    if (isSubmittingRef.current || loading) return;
    isSubmittingRef.current = true;

    setSubmitError("");
    setSuccess("");
    setLoading(true);

    try {
      const valid = await runValidation();
      if (!valid) {
        setLoading(false);
        isSubmittingRef.current = false;
        return;
      }

      const response = await authService.register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (!response.ok) {
        const status = response.status;
        let message;
        if (status === 409) {
          message = "An account with this email already exists.";
        } else if (status === 429) {
          message = "Too many signup attempts. Please try again later.";
        } else if (status === 400) {
          message =
            response.data?.message ||
            response.data?.error ||
            "Please check your input and try again.";
        } else {
          message =
            response.data?.message || response.data?.error || AUTH_ERRORS.registrationFailed;
        }
        setSubmitError(message);
        toast.error(message);
        setLoading(false);
        isSubmittingRef.current = false;
        return;
      }

      const responseData = response.data || {};
      const sessionToken = responseData.token || "cookie-managed";
      // Under the HttpOnly-cookie auth model the server sets the session
      // cookie on the signup response. The client never sees a raw JWT.

      const sessionRoles = normalizeSignupRoles(responseData);
      const sessionUser = {
        id: responseData?.id,
        firstName: responseData?.firstName ?? formData.firstName.trim(),
        lastName: responseData?.lastName ?? formData.lastName.trim(),
        email: responseData?.email ?? formData.email.trim(),
        username: responseData?.username ?? formData.email.trim(),
        role: sessionRoles[0],
        roles: sessionRoles,
        permissions: responseData?.permissions ?? [],
      };

      setAuthSession(sessionToken, sessionUser);
      setLoading(false);
      setSuccess("Account created successfully. Redirecting to dashboard...");
      toast.success("Account created successfully!");
      setTimeout(() => navigate("/dashboard", { replace: true }), 1000);
    } catch (err) {
      const networkMessage = "Unable to connect to the server. Please try again.";
      const message = err?.isNetworkError
        ? networkMessage
        : getPublicErrorMessage(err, AUTH_ERRORS.registrationFailed);
      setSubmitError(message);
      toast.error(message);
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 space-y-3 text-center">
        <motion.div className="bg-bg-secondary border-border mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border">
          <Zap className="text-primary h-7 w-7" />
        </motion.div>
        <h1 className="text-text text-2xl font-bold">Create Your Account</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
        aria-describedby="signup-form-error signup-form-success"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormFieldWrapper
            id="firstName"
            label="First name"
            message={errors.firstName}
            validationState={fieldValidationState.firstName}
            prefix={<User className="text-text-light h-4 w-4" />}
          >
            <input
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              className="bg-bg border-border text-text placeholder:text-text-light w-full rounded-lg border py-2.5 pr-3 pl-9 text-sm"
              required
              disabled={loading}
            />
          </FormFieldWrapper>
          <FormFieldWrapper
            id="lastName"
            label="Last name"
            message={errors.lastName}
            validationState={fieldValidationState.lastName}
            prefix={<User className="text-text-light h-4 w-4" />}
          >
            <input
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              className="bg-bg border-border text-text placeholder:text-text-light w-full rounded-lg border py-2.5 pr-3 pl-9 text-sm"
              required
              disabled={loading}
            />
          </FormFieldWrapper>
        </div>

        <FormFieldWrapper
          id="email"
          label="Email"
          message={errors.email}
          validationState={fieldValidationState.email}
          prefix={<AtSign className="text-text-light h-4 w-4" />}
        >
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            className="bg-bg border-border text-text placeholder:text-text-light w-full rounded-lg border py-2.5 pr-3 pl-9 text-sm"
            required
            disabled={loading}
          />
        </FormFieldWrapper>

        <FormFieldWrapper
          id="password"
          label="Password"
          message={errors.password}
          validationState={fieldValidationState.password}
          prefix={<Lock className="text-text-light h-4 w-4" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-text-light hover:text-primary focus-visible:ring-primary/40 flex items-center justify-center rounded p-1 focus:outline-none focus-visible:ring-2"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-controls="password"
              aria-pressed={showPassword ? "true" : "false"}
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
            placeholder="Create a strong password"
            className="bg-bg border-border text-text placeholder:text-text-light w-full rounded-lg border py-2.5 pr-9 pl-9 text-sm"
            required
            disabled={loading}
          />
        </FormFieldWrapper>

        {formData.password && <PasswordStrengthIndicator password={formData.password} />}

        <FormFieldWrapper
          id="confirmPassword"
          label="Confirm Password"
          message={errors.confirmPassword || passwordMatchMessage}
          validationState={fieldValidationState.confirmPassword}
          prefix={<Lock className="text-text-light h-4 w-4" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="text-text-light hover:text-primary focus-visible:ring-primary/40 flex items-center justify-center rounded p-1 focus:outline-none focus-visible:ring-2"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              aria-controls="confirmPassword"
              aria-pressed={showConfirmPassword ? "true" : "false"}
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
            placeholder="Re-enter your password"
            className="bg-bg border-border text-text placeholder:text-text-light w-full rounded-lg border py-2.5 pr-9 pl-9 text-sm"
            required
            disabled={loading}
          />
        </FormFieldWrapper>

        <ValidationMessage
          id="signup-form-error"
          message={submitError}
          state="error"
          className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700"
        />
        {success && (
          <ValidationMessage
            id="signup-form-success"
            message={success}
            state="success"
            className="rounded-lg border border-green-200 bg-green-50 p-2 text-xs text-green-700"
          />
        )}

        <motion.button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary-hover flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {loading ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </motion.button>
      </form>

      <p className="text-text-light mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-primary hover:text-primary-hover">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignupForm;
