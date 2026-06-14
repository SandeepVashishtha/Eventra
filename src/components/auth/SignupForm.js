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
      <div className="text-center space-y-4 mb-8">
        <motion.div
          className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg"
        >
          <Zap className="w-8 h-8 text-white" />
        </motion.div>

        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Create Your Account
        </h1>

        <p className="text-base text-text-light max-w-md mx-auto leading-relaxed">
          Join thousands of developers discovering hackathons, workshops,
          networking events and career opportunities.
        </p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
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
                className="
              w-full pl-10 pr-4 py-3.5
              rounded-2xl
              border border-slate-300/20
              bg-white/5
              backdrop-blur-sm
              text-text
              placeholder:text-slate-400
              focus:ring-2
              focus:ring-indigo-500/30
              focus:border-indigo-500
              transition-all duration-300
              hover:border-indigo-400/50
              "
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
                className="
              w-full pl-10 pr-4 py-3.5
              rounded-2xl
              border border-slate-300/20
              bg-white/5
              backdrop-blur-sm
              text-text
              placeholder:text-slate-400
              focus:ring-2
              focus:ring-indigo-500/30
              focus:border-indigo-500
              transition-all duration-300
              hover:border-indigo-400/50
              "
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
              className="
            w-full pl-10 pr-4 py-3.5
            rounded-2xl
            border border-slate-300/20
            bg-white/5
            backdrop-blur-sm
            text-text
            placeholder:text-slate-400
            focus:ring-2
            focus:ring-indigo-500/30
            focus:border-indigo-500
            transition-all duration-300
            hover:border-indigo-400/50
            "
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
              className="
            w-full pl-10 pr-4 py-3.5
            rounded-2xl
            border border-slate-300/20
            bg-white/5
            backdrop-blur-sm
            text-text
            placeholder:text-slate-400
            focus:ring-2
            focus:ring-indigo-500/30
            focus:border-indigo-500
            transition-all duration-300
            hover:border-indigo-400/50
            "
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
              className="
            w-full pl-10 pr-4 py-3.5
            rounded-2xl
            border border-slate-300/20
            bg-white/5
            backdrop-blur-sm
            text-text
            placeholder:text-slate-400
            focus:ring-2
            focus:ring-indigo-500/30
            focus:border-indigo-500
            transition-all duration-300
            "
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
          <p className="text-xs text-center text-text-light">
            By creating an account, you agree to our
            <span className="text-primary cursor-pointer"> Terms of Service </span>
            and
            <span className="text-primary cursor-pointer"> Privacy Policy</span>.
          </p>
          <motion.button
            type="submit"
            disabled={loading}
            className="
          w-full py-4
          rounded-2xl
          font-semibold
          bg-gradient-to-r
          from-indigo-600
          via-purple-600
          to-pink-600
          hover:scale-[1.02]
          shadow-xl
          transition-all
          duration-300
          "
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

        <p className="text-center text-sm text-text-light mt-6">
          Already have an account?
          <Link
            to="/login"
            className="ml-1 font-semibold text-indigo-600 hover:text-purple-600 transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
