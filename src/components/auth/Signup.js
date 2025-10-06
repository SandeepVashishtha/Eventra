import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import GoogleSignInButton from "../components/GoogleSignInButton";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm_password: "",
    // countryCode: "+91",
    // phone: "",
    role: "USER", // Default to USER role
  });
  const [loading, setLoading] = useState(false);
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [error, setError] = useState("");
  // const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
  });
  
/* ADD: Show/Hide password state */
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  // Test backend connectivity on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("Testing backend connectivity...");
        const response = await fetch(
          API_ENDPOINTS.AUTH.REGISTER.replace("/signup", "/health"),
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log("Backend connection test result:", response.status);
      } catch (error) {
        console.error("Backend connectivity test failed:", error);
      }
    };
    testConnection();
  }, []);

  const validateEmail = (email) => {
    // simple regex for email validation
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) score += 1;
    else feedback.push("at least 8 characters");

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("one lowercase letter");

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("one uppercase letter");

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push("one number");

    if (/[@$!%*?&]/.test(password)) score += 1;
    else feedback.push("one special character (@$!%*?&)");

    return {
      score,
      feedback:
        feedback.length > 0
          ? `Needs: ${feedback.join(", ")}`
          : "Strong password!",
    };
  };

  // const handleChange = (e) => {
  //   const {name , value} = e.target;
  //   setFormData({...formData , [name]: value});
  // };

  const handleChange = (e) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    };
    setFormData(newFormData);

    // Check password strength in real-time
    if (e.target.name === "password") {
      const strength = checkPasswordStrength(e.target.value);
      setPasswordStrength(strength);
    }
    
    if (e.target.name === "confirm_password") {
      if (e.target.value !== formData.password) {
        setError("Passwords do not match"); 
      } else {
        setError(""); 
      }
      
    }
    if (e.target.name === "email") {
      if (!validateEmail(e.target.value)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
    }

    if (e.target.name === "firstName") {
      if (!e.target.value.trim()) {
        setFirstNameError("First name is required");
      } else if (e.target.value.length < 3) {
        setFirstNameError("First name must be at least 3 characters long");
      } else if (e.target.value.length > 20) {
        setFirstNameError("First name must be less than 20 characters");
      } else {
        setFirstNameError("");
      }
    }

    if (e.target.name === "lastName") {
      if (!e.target.value.trim()) {
        setLastNameError("Last name is required");
      } else if (e.target.value.length < 3) {
        setLastNameError("Last name must be at least 3 characters long");
      } else if (e.target.value.length > 20) {
        setLastNameError("Last name must be less than 20 characters");
      } else {
        setLastNameError("");
      }
    }

    // Clear error when user starts typing
    if (error) setError("");
  };

  const togglePasswordVisibility = () => { 
    setShowPassword(!showPassword); 
  }; 
  
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
    
    setLoading(true);
    setError("");

    try {
      // Ensure role field is included
      const submitData = {
        ...formData,
        role: formData.role || "USER", // Fallback to USER if not set
      };

      // Debug: Log the exact data being sent
      console.log("Submitting signup with data:", submitData);
      console.log("API endpoint:", API_ENDPOINTS.AUTH.REGISTER);

      const response = await apiUtils.post(
        API_ENDPOINTS.AUTH.REGISTER,
        submitData
      );

      // Check if the response is ok
      if (!response.ok) {
        // Try to parse error response
        try {
          const errorData = await response.json();
          if (
            errorData.validationErrors &&
            errorData.validationErrors.length > 0
          ) {
            const errorMessages = errorData.validationErrors
              .map((err) => err.message)
              .join(", ");
            setError(errorMessages);
          } else if (errorData.message) {
            setError(errorData.message);
          } else {
            setError(`Registration failed with status: ${response.status}`);
          }
        } catch (parseError) {
          setError(
            `Registration failed with status: ${response.status}. Please try again.`
          );
        }
        return;
      }

      // Success case
      const data = await response.json();
      console.log("Registration successful:", data);
      setSuccess("Account created successfully! Please login to continue.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Signup error:", error);
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        setError(
          "Unable to connect to server. Please check your internet connection and try again."
        );
      } else if (error.message.includes("CORS")) {
        setError(
          "Connection blocked by browser security. Please try again later."
        );
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      // UPDATED: Page background
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
    >
      {/* UPDATED: Subtle background haze */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10"
      ></motion.div>
      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          // UPDATED: Main card background and border
          className="space-y-6 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 p-8 rounded-lg shadow-lg backdrop-blur-xl"
        >
          /* 🔹 GOOGLE SIGN-IN ADDITION */
          <div className="mb-4">
            <GoogleSignInButton className="w-full" />
          </div>
            
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.3,
              type: "spring",
              stiffness: 200,
            }}
            className="space-y-2 text-center"
          >
            {/* UPDATED: Header text */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform duration-200"
            >
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
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
          </motion.div>

          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Name Fields Row */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="space-y-2">
                {/* UPDATED: Label text */}
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  First name <sup className="ml-1 text-red-500">*</sup>
                </label>
                <motion.input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="First name"
                  // UPDATED: Input styles
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 disabled:bg-gray-50 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                {/* IMPROVEMENT: Replaced inline style with theme-aware classes */}
                {firstNameError && (
                  <p className="text-red-500 dark:text-red-400 text-xs">
                    {firstNameError}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                {/* UPDATED: Label text */}
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Last name<sup className="ml-1 text-red-500">*</sup>
                </label>
                <motion.input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Last name"
                  // UPDATED: Input styles
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 disabled:bg-gray-50 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                {/* IMPROVEMENT: Replaced inline style with theme-aware classes */}
                {lastNameError && (
                  <p className="text-red-500 dark:text-red-400 text-xs">
                    {lastNameError}
                  </p>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="space-y-2"
            >
              {/* UPDATED: Label text */}
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email address<sup className="ml-1 text-red-500">*</sup>
              </label>
              <div className="relative group">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  aria-hidden
                >
                  <svg className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </motion.div>
                <motion.input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Email address"
                  // UPDATED: Input styles
                  className={`w-full px-10 py-2 bg-white dark:bg-gray-700/50 border rounded-md shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 disabled:bg-gray-50 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed ${emailError
                      ? "border-red-500 dark:border-red-400"
                      : "border-gray-300 dark:border-gray-600"
                    }`}
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              </div>
              <AnimatePresence>
                {emailError && (
                  <motion.p
                    // UPDATED: Error text
                    className="text-xs text-red-600 dark:text-red-500 mt-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {emailError}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="space-y-2"
            >
              {/* UPDATED: Label text */}

            {/* <motion.input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Enter your Contact Number"
                  // UPDATED: Input styles
                  className={`w-full px-3 py-2 bg-white dark:bg-gray-700/50 border rounded-md shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 disabled:bg-gray-50 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed ${
                    phoneError ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
                  }`}
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              </div>

            <AnimatePresence
            {phoneError && (
              <motion.p'

              className="text-xs text-red-600 dark:text-red-500 mt-1"
              initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {phoneError}
                  </motion.p>
            )}
            </AnimatePresence>
            </motion.div> */}

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="space-y-2"
            >
              {/* UPDATED: Label text */}
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password<sup className="ml-1 text-red-500">*</sup>
              </label>
              <div className="relative group">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  aria-hidden
                >
                  <svg className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </motion.div>
                <motion.input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"} /* ADD */
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength="8"
                  placeholder="Password"
                  // UPDATED: Input styles
                  className="w-full px-10 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 disabled:bg-gray-50 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />

                   {/* ADD: Toggle Button */}
                <button
                  type="button"
                  onClick={togglePasswordVisibility} /* ADD */
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.958 9.958 0 012.09-6.019M21.364 21.364l-18.728-18.728" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button> /* ADD */
                  
              </div>

              <AnimatePresence>
                {formData.password && (
                  <motion.div
                    className="mt-1"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* UPDATED: Password strength text */}
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>Password strength:</span>
                      <span
                        className={
                          passwordStrength.score >= 4
                            ? "text-green-600 font-medium"
                            : "text-yellow-600"
                        }
                      >
                        {passwordStrength.score}/5
                      </span>
                    </div>
                    {/* UPDATED: Strength bar background */}
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-1">
                      <motion.div
                        className={`h-1.5 rounded-full ${passwordStrength.score === 0
                            ? "bg-red-500 w-0"
                            : passwordStrength.score === 1
                              ? "bg-red-500 w-1/5"
                              : passwordStrength.score === 2
                                ? "bg-orange-500 w-2/5"
                                : passwordStrength.score === 3
                                  ? "bg-yellow-500 w-3/5"
                                  : passwordStrength.score === 4
                                    ? "bg-blue-500 w-4/5"
                                    : "bg-green-500 w-full"
                          }`}
                        initial={{ width: "0%" }}
                        animate={{
                          width: `${(passwordStrength.score / 5) * 100}%`,
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <motion.p
                      // UPDATED: Strength feedback text
                      className={`text-xs mt-1 ${passwordStrength.score >= 4
                          ? "text-green-600 dark:text-green-400"
                          : "text-yellow-600 dark:text-yellow-400"
                        }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {passwordStrength.feedback}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="space-y-2"
            >
              {/* UPDATED: Label text */}
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Confirm Password<sup className="ml-1 text-red-500">*</sup>
              </label>
              <div className="relative group">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  aria-hidden
                >
                  <svg className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </motion.div>
    
                <motion.input
                  id="confirm_password"
                  name="confirm_password"
                  type={showPassword ? "text" : "password"} /* ADD */
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength="8"
                  placeholder="Confirm Password"
                  // UPDATED: Input styles
                  className="w-full px-10 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 disabled:bg-gray-50 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                </div>
            </motion.div>
            
            {/* Error & Success Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  // UPDATED: Error message styles
                  className="bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm"
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {success && (
                <motion.div
                  // UPDATED: Success message styles
                  className="bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-md text-sm"
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    className="flex items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </motion.svg>
                    Creating Account...
                  </motion.div>
                ) : (
                  <motion.span
                    key="create"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Create Account
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.form>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.0 }}
            className="text-center"
          >
            {/* UPDATED: Text and link colors */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Sign in here
              </Link>
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">
              * indicates required fields
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.4 }}
            //  UPDATED: Text and link colors *
            className="text-xs text-center text-gray-500 dark:text-gray-500"
          >
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
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-xl"
        ></motion.div>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-pink-400 to-orange-500 rounded-full blur-xl"
        ></motion.div>
      </div>
    </motion.div>
  );
};

export default Signup;
