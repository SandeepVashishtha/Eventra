import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AtSign, Eye, EyeOff, Lock, User, Zap } from "lucide-react";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { FormFieldWrapper, ValidationMessage } from "../forms";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { User, AtSign, Lock, Eye, EyeOff, Zap } from "lucide-react";
import { validate, validateEmailAvailability, validatePasswordStrength } from "../../validation";

const getResultMessage = (result, fallback = "") =>
  result?.isValid ? "" : result?.message || fallback;

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
  const emailValidationRequestRef = useRef(0);

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

  // Real-time password match feedback
  useEffect(() => {
    const timer = setTimeout(() => {
      const { password, confirmPassword } = formData;
      if (!password || !confirmPassword) {
        setPasswordMatchMessage("");
        return;
      }
      if (password === confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
        setPasswordMatchMessage("Passwords match!");
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
        setPasswordMatchMessage("");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [formData.password, formData.confirmPassword]);

  const runValidation = async () => {
    const nextErrors = {};

    const firstNameResult = validate.firstName(formData.firstName.trim());
    if (firstNameResult !== true) nextErrors.firstName = firstNameResult;

    const lastNameResult = validate.lastName(formData.lastName.trim());
    if (lastNameResult !== true) nextErrors.lastName = lastNameResult;

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (validate.email(formData.email) !== true) {
      nextErrors.email = "Invalid email format";
    } else {
      const emailAvailability = await validateEmailAvailability(formData.email.trim());
      if (!emailAvailability?.isValid) {
        nextErrors.email = getResultMessage(emailAvailability, "Email is already registered");
      }
    }

    // PASSWORD STRENGTH VALIDATION
    const passwordResult = await validatePasswordStrength(formData.password);
    if (!passwordResult?.isValid) {
      nextErrors.password = getResultMessage(passwordResult, "Password does not meet strength requirements");
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
  useEffect(() => {
    const { password, confirmPassword } = formData;
    if (password && confirmPassword && password === confirmPassword) {
      setPasswordMatchMessage("Passwords match!");
    } else {
      setPasswordMatchMessage("");
    }
  }, [formData.password, formData.confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      });

      const { ok, status, data } = await response.json().catch(() => ({ ok: false, status: response.status, data: null }));

      if (!ok) {
        setSubmitError(data?.message || data?.error || "Registration failed");
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

      <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-describedby="signup-form-error signup-form-success">
        <div className="grid grid-cols-2 gap-4">
          <FormFieldWrapper id="firstName" label="First name" message={errors.firstName} prefix={<User className="w-4 h-4 text-slate-500" />}>
            <input name="firstName" type="text" value={formData.firstName} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-[#0f172a]/50 border border-slate-700/50 rounded-lg text-sm text-white" required disabled={loading} />
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

        <FormFieldWrapper id="password" label="Password" message={errors.password} prefix={<Lock className="w-4 h-4 text-slate-500" />}>
          <div className="relative">
            <input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} className="w-full pl-9 pr-9 py-2.5 bg-[#0f172a]/50 border border-slate-700/50 rounded-lg text-sm text-white" required disabled={loading} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300" aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </FormFieldWrapper>

        {/* Password Strength Meter */}
        <PasswordStrengthIndicator password={formData.password} />

        <FormFieldWrapper id="confirmPassword" label="Confirm password" message={errors.confirmPassword} prefix={<Lock className="w-4 h-4 text-slate-500" />}>
          <div className="relative">
            <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} className="w-full pl-9 pr-9 py-2.5 bg-[#0f172a]/50 border border-slate-700/50 rounded-lg text-sm text-white" required disabled={loading} />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300" aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}>
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </FormFieldWrapper>

        {passwordMatchMessage && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs mt-1 text-green-400" role="status" aria-live="polite">
            {passwordMatchMessage}
          </motion.p>
        )}

        {submitError && <ValidationMessage id="signup-form-error" message={submitError} state="error" />}
        {success && <ValidationMessage id="signup-form-success" message={success} state="success" />}

        <motion.button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-sm font-bold text-[#0f172a] bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 transition disabled:opacity-50">
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