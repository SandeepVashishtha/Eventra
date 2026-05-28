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
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
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
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
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
          message={submitError}
          state="error"
          className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-lg"
        />
        <ValidationMessage
          id="signup-form-success"
          message={success}
          state="success"
          className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 p-2 rounded-lg"
        />

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
