import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { FormFieldWrapper, ValidationMessage } from "../forms";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { User, AtSign, Lock, Eye, EyeOff, Zap } from "lucide-react";
import { validate, validateEmailAvailability, validatePasswordStrength } from "../../validation";

const getResultMessage = (result, fallback) => (result?.isValid ? "" : result?.message || fallback);

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

  // Reconstructed missing state variables from the fragmented file
  const [error, setError] = useState("");
  const [, setConfirmPasswordError] = useState("");
  const [, setPasswordError] = useState("");
  const [, setFieldValidationState] = useState({});
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
      nextErrors.email = "Email is required";
    } else {
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

    const validatePwd = async () => {
      if (!formData.password) {
        setPasswordError("");
        setFieldState("password", "idle");
        return;
      }
    };
    validatePwd();

  }, [formData.password, setFieldState]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 FIX 1: Prevent double-click API spam by returning early if already loading
    if (loading) return;

    setSubmitError("");
    setSuccess("");

    // 🔥 FIX 2: Set loading immediately to lock the form BEFORE async validation
    setLoading(true);

    const valid = await runValidation();
    if (!valid) {
      // 🔥 FIX 3: Safely unlock the form if validation fails
      setLoading(false);
      return;
    }
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
        setLoading(false);
        return;
      }

      const sessionToken = data?.token;
      if (!sessionToken) {
        setSubmitError("Signup completed but no token was returned.");
        setLoading(false);
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
        <div className="grid grid-cols-2 gap-4">
          <FormFieldWrapper
            id="firstName"
            label="First name"
            message={errors.firstName}
            prefix={<User className="w-4 h-4 text-text-light" />}
          >
            <input
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full pl-9 pr-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-text-light"
              required
              disabled={loading}
            />
          </FormFieldWrapper>
          <FormFieldWrapper
            id="lastName"
            label="Last name"
            message={errors.lastName}
            prefix={<User className="w-4 h-4 text-text-light" />}
          >
            <input
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
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
          prefix={<AtSign className="w-4 h-4 text-text-light" />}
        >
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-9 pr-3 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-text-light"
            required
            disabled={loading}
          />
        </FormFieldWrapper>

        <FormFieldWrapper
          id="password"
          label="Password"
          message={errors.password}
          prefix={<Lock className="w-4 h-4 text-text-light" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-primary"
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
            className="w-full pl-9 pr-9 py-2.5 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-text-light"
            required
            disabled={loading}
          />
        </FormFieldWrapper>

        {errors.password && (
          <p id="password-error" className="text-red-600 text-[10px] mt-1" role="alert">
            {errors.password}
          </p>
        )}
        {formData.password && <PasswordStrengthIndicator password={formData.password} />}

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-xs font-medium text-text">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light group-focus-within:text-primary pointer-events-none" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              className={`w-full pl-9 pr-9 py-2.5 bg-bg border rounded-lg text-sm placeholder:text-text-light focus:ring-2 focus:ring-primary/25 transition-all duration-200 text-text ${
                errors.confirmPassword
                  ? "border-red-500"
                  : formData.confirmPassword
                    ? passwordMatchMessage
                      ? "border-green-500"
                      : "border-red-400"
                    : "border-border focus:border-primary"
              }`}
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-primary"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="text-red-600 text-[10px] mt-1" role="alert">
              {errors.confirmPassword}
            </p>
          )}
          {passwordMatchMessage && !errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-[10px] mt-1 text-green-600"
            >
              {passwordMatchMessage}
            </motion.p>
          )}
        </div>

        <ValidationMessage
          id="signup-form-error"
          message={submitError || error}
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
