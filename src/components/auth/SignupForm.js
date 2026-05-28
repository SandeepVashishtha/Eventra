import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
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
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();
  const emailValidationRequestRef = useRef(0);
  const { password, confirmPassword } = formData;

  const setFieldState = useCallback((fieldName, state) => {
    setFieldValidationState((prev) => ({ ...prev, [fieldName]: state }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  const runValidation = async () => {
    const nextErrors = {};

    const firstNameResult = validate.firstName(formData.firstName.trim());
    if (firstNameResult !== true) nextErrors.firstName = firstNameResult;

    const lastNameResult = validate.lastName(formData.lastName.trim());
    if (lastNameResult !== true) nextErrors.lastName = lastNameResult;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }

  useEffect(() => {
    const timer = setTimeout(() => {
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
  }, [password, confirmPassword, setFieldState]);

  useEffect(() => {
    let isActive = true;

    const validatePassword = async () => {
      if (!formData.password) {
        setPasswordError("");
        setFieldState("password", "idle");
        return;
    const emailValue = formData.email.trim();
    const emailFormatResult = validate.email(emailValue);
    if (emailFormatResult !== true) {
      nextErrors.email = emailFormatResult;
    } else {
      const emailAvailability = await validateEmailAvailability(emailValue);
      if (!emailAvailability?.isValid) {
        nextErrors.email = getResultMessage(emailAvailability, "Email is already registered");
      }
    }

    const passwordResult = await validatePasswordStrength(formData.password);
    if (!passwordResult?.isValid) {
      nextErrors.password = getResultMessage(
        passwordResult,
        "Password does not meet strength requirements"
      );
    }

    const confirmPasswordResult = validate.confirmPassword(formData.confirmPassword, {
      password: formData.password,
    });
    if (confirmPasswordResult !== true) {
      nextErrors.confirmPassword = confirmPasswordResult;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSuccess("");

    const valid = await runValidation();
    if (!valid) return;

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
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
        aria-describedby="signup-form-error signup-form-success"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormFieldWrapper id="firstName" label="First name" message={errors.firstName} prefix={<User className="w-4 h-4 text-slate-500" />}>
            <input name="firstName" type="text" value={formData.firstName} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-[#0f172a]/50 border border-slate-700/50 rounded-lg text-sm text-white" required disabled={loading} />
          </FormFieldWrapper>
          <FormFieldWrapper id="lastName" label="Last name" message={errors.lastName} prefix={<User className="w-4 h-4 text-slate-500" />}>
            <input name="lastName" type="text" value={formData.lastName} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-[#0f172a]/50 border border-slate-700/50 rounded-lg text-sm text-white" required disabled={loading} />
          </FormFieldWrapper>
        </div>

        <FormFieldWrapper id="email" label="Email" message={errors.email} prefix={<AtSign className="w-4 h-4 text-slate-500" />}>
          <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full pl-9 pr-3 py-2.5 bg-[#0f172a]/50 border border-slate-700/50 rounded-lg text-sm text-white" required disabled={loading} />
        </FormFieldWrapper>

        <FormFieldWrapper
          id="password"
          label="Password"
          message={errors.password}
          prefix={<Lock className="w-4 h-4 text-slate-500" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-500 hover:text-slate-300"
              type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-controls="password"
              aria-pressed={showPassword}
            >
            <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="text-slate-500 hover:text-blue-400" aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        >
          <input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} className="w-full pl-9 pr-9 py-2.5 bg-[#0f172a]/50 border border-slate-700/50 rounded-lg text-sm text-white" required disabled={loading} />
        </FormFieldWrapper>

        <PasswordStrengthIndicator password={formData.password} />

        <FormFieldWrapper
          id="confirmPassword"
          label="Confirm password"
          message={errors.confirmPassword}
          prefix={<Lock className="w-4 h-4 text-slate-500" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-slate-500 hover:text-slate-300"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              aria-controls="confirmPassword"
              aria-pressed={showConfirmPassword}
            >
            <button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)} className="text-slate-500 hover:text-blue-400" aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}>
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        >
          <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} className="w-full pl-9 pr-9 py-2.5 bg-[#0f172a]/50 border border-slate-700/50 rounded-lg text-sm text-white" required disabled={loading} />
        </FormFieldWrapper>
        {passwordMatchMessage && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-[10px] mt-1 text-green-400" role="status" aria-live="polite">
            {passwordMatchMessage}
          </motion.p>
        )}

        <ValidationMessage
          id="signup-form-error"
          message={error}
          state="error"
          className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-lg"
        />
        <ValidationMessage
          id="signup-form-success"
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

        <ValidationMessage message={submitError} state="error" />
        {success ? <ValidationMessage message={success} state="success" /> : null}

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
