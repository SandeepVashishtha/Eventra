import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { User, AtSign } from 'lucide-react'

const assessStrength = (password) => {
  if (!password) {
    return { criteriaMet: 0 };
  }

  let criteriaMet = 0;

  if (password.length >= 8) {
    criteriaMet++;
  }
  if (/[A-Z]/.test(password)) {
    criteriaMet++;
  }
  if (/[a-z]/.test(password)) {
    criteriaMet++;
  }
  if (/\d/.test(password)) {
    criteriaMet++;
  }
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    criteriaMet++;
  }

  return { criteriaMet };
};

const Signup = () => {
  useDocumentTitle("Sign Up | Eventra");
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatchMessage, setPasswordMatchMessage] = useState("");
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();
  const introPoints = [
    "Create your account to post events, join hackathons, and submit projects.",
    "Track your activity, registrations, and community engagement from one profile.",
    "Get quick access to the tools you need to start contributing immediately.",
  ];

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const newData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newData);

    if (e.target.name === "confirmPassword" || e.target.name === "password") {
      const password = e.target.name === "password" ? e.target.value : newData.password;
      const confirmPassword = e.target.name === "confirmPassword" ? e.target.value : newData.confirmPassword;

      if (password && confirmPassword) {
        if (password === confirmPassword) {
          setError("");
          setPasswordMatchMessage("Passwords match!");
        } else {
          setError("Passwords do not match");
          setPasswordMatchMessage("");
        }
      } else {
        setPasswordMatchMessage("");
        if (e.target.name === "confirmPassword" && e.target.value) {
          setError("Passwords do not match");
        } else {
          // password field was cleared, reset error too
          setError("");
        }
      }
    }

    if (e.target.name === "email") {
      setEmailError(validateEmail(e.target.value) ? "" : "Invalid email");
    }

    if (e.target.name === "firstName") {
      if (!e.target.value.trim())
        setFirstNameError("First name is required");
      else if (e.target.value.length < 2)
        setFirstNameError("At least 2 characters");
      else if (e.target.value.length > 50)
        setFirstNameError("Less than 50 characters");
      else setFirstNameError("");
    }

    if (e.target.name === "lastName") {
      if (!e.target.value.trim())
        setLastNameError("Last name is required");
      else if (e.target.value.length < 2)
        setLastNameError("At least 2 characters");
      else if (e.target.value.length > 50)
        setLastNameError("Less than 50 characters");
      else setLastNameError("");
    }

    // FIX: Only clear the error when changing non-password fields,
    // so the "Passwords do not match" error persists correctly.
    if (error && e.target.name !== "password" && e.target.name !== "confirmPassword") {
      setError("");
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  useEffect(() => {
  const timer = setTimeout(() => {
    const { password, confirmPassword } = formData;

    if (!password || !confirmPassword) {
      setError("");
      setPasswordMatchMessage("");
      return;
    }

    if (password === confirmPassword) {
      setError("");
      setPasswordMatchMessage("Passwords match!");
    } else {
      setError("Passwords do not match");
      setPasswordMatchMessage("");
    }
  }, 1000);

  return () => clearTimeout(timer);
}, [formData]);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.firstName.trim()) {
    setError("First name is required");
    return;
  }

  if (formData.firstName.trim().length < 2) {
    setError("First name must be at least 2 characters");
    return;
  }

  if (!formData.lastName.trim()) {
    setError("Last name is required");
    return;
  }

  if (formData.lastName.trim().length < 2) {
    setError("Last name must be at least 2 characters");
    return;
  }

  if (!formData.email.trim()) {
    setError("Email is required");
    return;
  }

  if (!validateEmail(formData.email)) {
    setEmailError("Invalid email format");
    return;
  }

  if (!formData.password.trim()) {
    setError("Password is required");
    return;
  }

  if (formData.password.length < 8) {
    setError(
      "Password must be at least 8 characters long"
    );
    return;
  }

  if (!formData.confirmPassword.trim()) {
    setError("Confirm password is required");
    return;
  }

  if (
    formData.password !==
    formData.confirmPassword
  ) {
    setError("Passwords do not match");
    return;
  }

  const { criteriaMet } = assessStrength(
    formData.password
  );

  if (criteriaMet < 5) {
    setError(
      "Password doesn't meet the security criteria (must meet all 5 requirements)."
    );
    return;
  }

  setLoading(true);
  setError("");

  try {
    const response = await apiUtils.post(
      API_ENDPOINTS.AUTH.SIGNUP,
      {
        firstName:
          formData.firstName.trim(),
        lastName:
          formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword:
          formData.confirmPassword,
      }
    );

    const responseText =
      await response.text();

    let data = null;

    try {
      data = responseText
        ? JSON.parse(responseText)
        : null;
    } catch {
      data = null;
    }

    if (!response.ok) {
      const backendMessage =
        data?.message ||
        data?.error ||
        "";

      if (backendMessage) {
        setError(
          `${backendMessage} (${response.status})`
        );
      } else {
        setError(
          `Registration failed (${response.status})`
        );
      }

      return;
    }

    const sessionToken = data?.token;

    const sessionUser = {
      id: data?.id,
      firstName:
        data?.firstName ??
        formData.firstName.trim(),
      lastName:
        data?.lastName ??
        formData.lastName.trim(),
      email:
        data?.email ??
        formData.email.trim(),
      username:
        data?.username ??
        formData.email.trim(),
      role: data?.role ?? "USER",
      roles: data?.role
        ? [data.role]
        : ["USER"],
      permissions:
        data?.permissions ?? [],
    };

    if (!sessionToken) {
      throw new Error(
        "Token missing from signup response"
      );
    }

    setAuthSession(
      sessionToken,
      sessionUser
    );

    setSuccess(
      "Account created successfully! Redirecting to dashboard..."
    );

    setTimeout(
      () =>
        navigate("/dashboard", {
          replace: true,
        }),
      1200
    );
  } catch (err) {
    setError(
      err.message ||
        "Network error. Please try again."
    );

    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="pastel-grid-bg  min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
    >
       <div className="max-w-4xl w-full mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full pl-3 pr-4 py-3 my-14 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:shadow-md text-gray-900 dark:text-white"
        >
        <div className="md:flex">  

          {/* LEFT PANEL */}
          <div className="relative z-10 md:w-[38%] bg-gradient-to-br from-blue-100 via-yellow-50 to-pink-100 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white p-12 flex flex-col justify-between rounded-3xl">
            <div>
              <h2 className="text-4xl text-center font-extrabold mb-5" style={{ fontFamily: '"Anton", sans-serif' }}>
                Join Eventra
              </h2>
              
              <p className="mb-8 text-lg opacity-90 leading-relaxed">
                Create your free account and start building amazing events.
              </p>
              <div className="space-y-3">
                {introPoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3 rounded-xl border border-white/20 bg-white/10 py-3 text-sm text-gray-800 dark:text-gray-100 backdrop-blur-sm"
                  >
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" />
                    <span className="leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
           {/* RIGHT PANEL */}
        <div className="md:w-3/5 p-10 bg-white dark:bg-gray-800">

          <div className="text-center space-y-2">
            <motion.div
               whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-yellow-100 rounded-3xl flex items-center justify-center shadow-md border border-blue-100"
            >
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Create Your Account
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 pt-2 pb-5">
              Join Eventra and start building amazing events
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm text-gray-700 dark:text-gray-300">
                  First name <sup className="text-red-500">*</sup>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:shadow-md text-gray-900 dark:text-white"
                    required
                  />
                </div>
                {firstNameError && (
                  <p className="text-red-500 text-xs">{firstNameError}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm text-gray-700 dark:text-gray-300">
                  Last name <sup className="text-red-500">*</sup>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:shadow-md text-gray-900 dark:text-white"
                    required
                  />
                </div>
                {lastNameError && (
                  <p className="text-red-500 text-xs">{lastNameError}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 dark:text-gray-300">
                Email address <sup className="text-red-500">*</sup>
              </label>

              <div className="relative">
                <AtSign
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 w-5 h-5 pointer-events-none"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-4 py-3 bg-white/60 dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:shadow-md text-gray-900 dark:text-white"
                  required
                />
              </div>

              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 dark:text-gray-300">
                Password <sup className="text-red-500">*</sup>
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  // FIX: Border turns green when passwords match, red when they don't
                  className={`w-full pl-10 pr-10 py-3 bg-white/60 dark:bg-gray-700/70 border rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:shadow-md text-gray-900 dark:text-white ${
                    formData.password && formData.confirmPassword
                      ? passwordMatchMessage
                        ? "border-green-500"
                        : "border-red-400"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.958 9.958 0 012.09-6.019M21.364 21.364l-18.728-18.728"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {formData.password && (
                <PasswordStrengthIndicator password={formData.password} />
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-gray-700 dark:text-gray-300">
                Confirm Password <sup className="text-red-500">*</sup>
              </label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  // FIX: Border turns green when passwords match, red when they don't
                  className={`w-full pl-10 pr-10 py-3 bg-white/60 dark:bg-gray-700/70 border rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:shadow-md text-gray-900 dark:text-white ${
                    formData.confirmPassword
                      ? passwordMatchMessage
                        ? "border-green-500"
                        : "border-red-400"
                      : "border-gray-200 dark:border-gray-600"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.958 9.958 0 012.09-6.019M21.364 21.364l-18.728-18.728"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {passwordMatchMessage && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="text-xs mt-1 text-green-600 dark:text-green-400"
                >
                  {passwordMatchMessage}
                </motion.p>
              )}
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/40 p-2 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/40 p-2 rounded-md">
                {success}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-300 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-75 transition-all duration-300"
            >
              {loading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : null}
              {loading ? "Creating Account..." : "Create Account"}
            </motion.button>
          </form>

          <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-4 leading-relaxed">
            By clicking on sign up, you agree to our{" "}
            <Link
              to="/terms"
              className="hover:underline text-blue-600 dark:text-blue-400 font-semibold transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="hover:underline text-blue-600 dark:text-blue-400 font-semibold transition-colors"
            >
              Privacy Policy
            </Link>
          </p>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
            
        </div>

        </div> 
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Signup;