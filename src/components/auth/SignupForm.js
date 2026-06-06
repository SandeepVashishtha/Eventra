import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { authService } from "../../services/authService";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { ROLES } from "../../config/roles";
import { useAuth } from "../../context/AuthContext";
import { FormFieldWrapper, ValidationMessage } from "../forms";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { User, AtSign, Lock, Eye, EyeOff, Zap } from "lucide-react";
import { validate, validateEmailAvailability, validatePasswordStrength } from "../../validation";

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
          setErrors((prev) => ({ ...prev, email: result?.message || "Email is already registered" }));
          setFieldState("email", "error");
        }
      } catch (err) {
        setErrors((prev) => ({ ...prev, email: "Validation failed" }));
        setFieldState("email", "error");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email, setFieldState]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setSubmitError("");
    setSuccess("");
    setLoading(true);

    const valid = await runValidation();
    if (!valid) {
      setLoading(false);
      return;
    }
    try {
      const response = await authService.register({
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
        setLoading(false);
        return;
      }

      const sessionToken = data?.token;
      if (!sessionToken) {
        setSubmitError("Signup completed but no token was returned.");
        setLoading(false);
        return;
      }

      const sessionRoles = normalizeSignupRoles(data);
      const sessionUser = {
        id: data?.id,
        firstName: data?.firstName ?? formData.firstName.trim(),
        lastName: data?.lastName ?? formData.lastName.trim(),
        email: data?.email ?? formData.email.trim(),
        username: data?.username ?? formData.email.trim(),
        role: sessionRoles[0],
        roles: sessionRoles,
        permissions: data?.permissions ?? [],
      };

      setAuthSession(sessionToken, sessionUser);
      setLoading(false);
      setSuccess("Account created successfully. Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard", { replace: true }), 1000);
    } catch (err) {
      setSubmitError(err?.message || "Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center space-y-3 mb-6">
        <motion.div className="mx-auto w-14 h-14 bg-bg-secondary border border-border rounded-2xl flex items-center justify-center">
          <Zap className="w-7 h-7 text-primary" />
        </motion.div>
        <h1 className="text-2xl font-bold text-text">Create Your Account</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
        aria-describedby="signup-form-error signup-form-success"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormFieldWrapper
            id="firstName"
            label="First name"
            message={errors.firstName}
            validationState={fieldValidationState.firstName}
            prefix={<User className="w-4 h-4 text-text-light" />}
          >
            <input
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              className="w-full pl-9 pr-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-text-light"
              required
              disabled={loading}
            />
          </FormFieldWrapper>
          <FormFieldWrapper
            id="lastName"
            label="Last name"
            message={errors.lastName}
            validationState={fieldValidationState.lastName}
            prefix={<User className="w-4 h-4 text-text-light" />}
          >
            <input
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              className="w-full pl-9 pr-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-text-light"
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
          prefix={<AtSign className="w-4 h-4 text-text-light" />}
        >
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            className="w-full pl-9 pr-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-text-light"
            required
            disabled={loading}
          />
        </FormFieldWrapper>

        <FormFieldWrapper
          id="password"
          label="Password"
          message={errors.password}
          validationState={fieldValidationState.password}
          prefix={<Lock className="w-4 h-4 text-text-light" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="flex items-center justify-center text-text-light hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-controls="password"
              aria-pressed={showPassword ? "true" : "false"}
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
            placeholder="Create a strong password"
            className="w-full pl-9 pr-9 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-text-light"
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
          prefix={<Lock className="w-4 h-4 text-text-light" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="flex items-center justify-center text-text-light hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded p-1"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              aria-controls="confirmPassword"
              aria-pressed={showConfirmPassword ? "true" : "false"}
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
            placeholder="Re-enter your password"
            className="w-full pl-9 pr-9 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-text-light"
            required
            disabled={loading}
          />
        </FormFieldWrapper>

        <ValidationMessage
          id="signup-form-error"
          message={submitError}
          state="error"
          className="text-xs text-red-700 bg-red-50 border border-red-200 p-2 rounded-lg"
        />
        {success && (
          <ValidationMessage
            id="signup-form-success"
            message={success}
            state="success"
            className="text-xs text-green-700 bg-green-50 border border-green-200 p-2 rounded-lg"
          />
        )}

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </motion.button>
      </form>

      <p className="text-center text-sm text-text-light mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-primary hover:text-primary-hover">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignupForm;
