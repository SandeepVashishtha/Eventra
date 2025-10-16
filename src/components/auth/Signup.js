import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import GoogleSignInButton from "../GoogleSignInButton";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import {User, AtSign} from 'lucide-react'

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
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "USER",
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

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(
          API_ENDPOINTS.AUTH.REGISTER.replace("/signup", "/health"),
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );
        console.log("Backend connection test:", response.status);
      } catch (error) {
        console.error("Backend test failed:", error);
      }
    };
    testConnection();
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const newData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newData);

    if (e.target.name === "confirm_password" || e.target.name === "password") {
        const password = e.target.name === "password" ? e.target.value : newData.password;
        const confirmPassword = e.target.name === "confirm_password" ? e.target.value : newData.confirm_password;
        
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
             if (e.target.name === "confirm_password" && e.target.value) {
                setError("Passwords do not match");
             }
        }
    }

    if (e.target.name === "email") {
      setEmailError(validateEmail(e.target.value) ? "" : "Invalid email");
    }

    if (e.target.name === "firstName") {
      if (!e.target.value.trim())
        setFirstNameError("First name is required");
      else if (e.target.value.length < 3)
        setFirstNameError("At least 3 characters");
      else if (e.target.value.length > 20)
        setFirstNameError("Less than 20 characters");
      else setFirstNameError("");
    }

    if (e.target.name === "lastName") {
      if (!e.target.value.trim())
        setLastNameError("Last name is required");
      else if (e.target.value.length < 3)
        setLastNameError("At least 3 characters");
      else if (e.target.value.length > 20)
        setLastNameError("Less than 20 characters");
      else setLastNameError("");
    }

    if (error) setError("");
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      setEmailError("Invalid email format");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    
    const { criteriaMet } = assessStrength(formData.password);
    if (criteriaMet < 5) {
      setError("Password doesn't meet the security criteria (must meet all 5 requirements).");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const response = await apiUtils.post(API_ENDPOINTS.AUTH.REGISTER, {
        ...formData,
        role: formData.role || "USER",
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message) setError(errorData.message);
        else setError(`Registration failed (${response.status})`);
        return;
      }

      setSuccess("Account created successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("Network error. Please try again.");
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
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 p-8 rounded-lg shadow-lg backdrop-blur-xl"
        >
          <div className="mb-4">
            <GoogleSignInButton className="w-full" />
          </div>

          <div className="text-center space-y-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <svg
                className="w-8 h-8 text-white"
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
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Create Your Account
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Join Eventra and start building amazing events
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300">
                  First name <sup className="text-red-500">*</sup>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:shadow-md text-gray-900 dark:text-white"
                    required
                  />
                </div>
                {firstNameError && (
                  <p className="text-red-500 text-xs">{firstNameError}</p>
                )}
              </div>
              <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300">
                    Last name <sup className="text-red-500">*</sup>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                      className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:shadow-md text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  {lastNameError && (
                    <p className="text-red-500 text-xs">{lastNameError}</p>
                  )}
              </div>
          </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300">
                Email address <sup className="text-red-500">*</sup>
              </label>

              <div className="relative">
                {/* @ Icon */}
                <AtSign
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 w-5 h-5 pointer-events-none"
                />

                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:shadow-md text-gray-900 dark:text-white"
                  required
                />
              </div>

              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300">
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                 className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:shadow-md text-gray-900 dark:text-white"
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
              <label className="block text-sm text-gray-700 dark:text-gray-300">
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
                  name="confirm_password"
                  type={showConfirmPassword ? "text" : "password"} 
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                 className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:shadow-md text-gray-900 dark:text-white"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
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
            <Link to="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Signup;