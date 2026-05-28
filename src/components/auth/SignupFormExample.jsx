import React from "react";
import { motion } from "framer-motion";
import { logger } from "../../utils/logger";
import { Check, AlertCircle, Loader } from "lucide-react";
import useFormValidation from "../hooks/useFormValidation.enhanced";
import useValidationState from "../hooks/useValidationState";

/**
 * Example SignupForm component demonstrating the enhanced useFormValidation hook
 * with async validation, real-time feedback, and visual indicators
 */
const SignupFormExample = ({ onSignupSuccess }) => {
  // Mock async validators (in production, these would call your API)
  const validateUsernameAvailable = async (username) => {
    if (!username || username.length < 3) return true; // Skip validation

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock taken usernames
    const takenUsernames = ["admin", "john", "jane", "testuser"];
    return (
      !takenUsernames.includes(username.toLowerCase()) ||
      "Username already taken"
    );
  };

  const validateEmailAvailable = async (email) => {
    if (!email) return true; // Skip validation

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock registered emails
    const registeredEmails = [
      "test@example.com",
      "admin@example.com",
      "demo@test.com",
    ];
    return (
      !registeredEmails.includes(email.toLowerCase()) ||
      "Email already registered"
    );
  };

  // Validation rules with both sync and async validators
  const validationRules = {
    firstName: [
      (val) => (val && val.trim() !== "") || "First name is required",
      (val) => val.length >= 2 || "At least 2 characters",
      (val) => val.length <= 50 || "Maximum 50 characters",
    ],
    lastName: [
      (val) => (val && val.trim() !== "") || "Last name is required",
      (val) => val.length >= 2 || "At least 2 characters",
      (val) => val.length <= 50 || "Maximum 50 characters",
    ],
    username: [
      (val) => (val && val.trim() !== "") || "Username is required",
      (val) => val.length >= 3 || "At least 3 characters",
      (val) => val.length <= 30 || "Maximum 30 characters",
      (val) =>
        /^[a-zA-Z0-9_-]+$/.test(val) ||
        "Only alphanumeric, underscore, and dash allowed",
      validateUsernameAvailable, // Async validator
    ],
    email: [
      (val) => (val && val.trim() !== "") || "Email is required",
      (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || "Invalid email format",
      validateEmailAvailable, // Async validator
    ],
    password: [
      (val) => (val && val.trim() !== "") || "Password is required",
      (val) => val.length >= 8 || "At least 8 characters",
      (val) => /[A-Z]/.test(val) || "Must contain uppercase letter",
      (val) => /[a-z]/.test(val) || "Must contain lowercase letter",
      (val) => /[0-9]/.test(val) || "Must contain number",
      (val) =>
        /[!@#$%^&*]/.test(val) || "Must contain special character (!@#$%^&*)",
    ],
    confirmPassword: [
      (val) => (val && val.trim() !== "") || "Please confirm your password",
      (val, allValues) =>
        val === allValues.password || "Passwords do not match",
    ],
  };

  // Initialize form with validation
  const {
    values,
    errors,
    touched,
    validationState,
    isFormValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useFormValidation(
    {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationRules,
    {
      debounceMs: 500,
      validateOnBlur: false,
      asyncValidationTimeout: 15000,
      cacheResults: true,
    },
  );

  // Handle form submission
  const handleFormSubmit = handleSubmit(async (formValues) => {
    try {
      logger.info("Form submitted with values:", formValues);
      // In production, call your signup API here
      // await api.post('/auth/signup', formValues);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Success feedback
      alert("Signup successful! Check console for values.");
      resetForm();

      if (onSignupSuccess) {
        onSignupSuccess(formValues);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Signup failed. Please try again.");
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        Create Account
      </h1>

      <form onSubmit={handleFormSubmit} className="space-y-5">
        {/* First Name Field */}
        <FormField
          label="First Name"
          name="firstName"
          type="text"
          value={values.firstName}
          error={errors.firstName}
          touched={touched.firstName}
          validationState={validationState.firstName}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="John"
        />

        {/* Last Name Field */}
        <FormField
          label="Last Name"
          name="lastName"
          type="text"
          value={values.lastName}
          error={errors.lastName}
          touched={touched.lastName}
          validationState={validationState.lastName}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Doe"
        />

        {/* Username Field - with async validation */}
        <FormField
          label="Username"
          name="username"
          type="text"
          value={values.username}
          error={errors.username}
          touched={touched.username}
          validationState={validationState.username}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="johndoe"
          helpText="3-30 characters, alphanumeric and dash"
        />

        {/* Email Field - with async validation */}
        <FormField
          label="Email"
          name="email"
          type="email"
          value={values.email}
          error={errors.email}
          touched={touched.email}
          validationState={validationState.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="john@example.com"
        />

        {/* Password Field */}
        <FormField
          label="Password"
          name="password"
          type="password"
          value={values.password}
          error={errors.password}
          touched={touched.password}
          validationState={validationState.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="••••••••"
          helpText="Min 8 chars, uppercase, lowercase, number, and special char"
        />

        {/* Confirm Password Field */}
        <FormField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          error={errors.confirmPassword}
          touched={touched.confirmPassword}
          validationState={validationState.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="••••••••"
        />

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          whileHover={{ scale: isFormValid && !isSubmitting ? 1.02 : 1 }}
          whileTap={{ scale: isFormValid && !isSubmitting ? 0.98 : 1 }}
          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
            isFormValid && !isSubmitting
              ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader size={18} className="animate-spin" />
              Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </motion.button>

        {/* Form Status */}
        <div className="text-sm text-center text-gray-600 dark:text-gray-400">
          {isFormValid ? (
            <p className="text-green-600 dark:text-green-400 font-medium">
              ✓ Form is ready to submit
            </p>
          ) : (
            <p>Complete all fields to continue</p>
          )}
        </div>
      </form>
    </motion.div>
  );
};

/**
 * FormField Component
 * Reusable form field with validation indicators, error messages, and help text
 */
const FormField = ({
  label,
  name,
  type = "text",
  value,
  error,
  touched,
  validationState,
  onChange,
  onBlur,
  placeholder,
  helpText,
}) => {
  const validation = useValidationState(name, validationState, error, touched);

  const fieldClasses = `
    w-full px-4 py-2 border-2 rounded-lg
    bg-white dark:bg-gray-800
    text-gray-900 dark:text-white
    placeholder-gray-400 dark:placeholder-gray-500
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500
    ${
      touched
        ? validation.validationState === "success"
          ? "border-green-500 dark:border-green-400"
          : validation.validationState === "error"
            ? "border-red-500 dark:border-red-400"
            : validation.validationState === "validating"
              ? "border-blue-500 dark:border-blue-400"
              : "border-gray-300 dark:border-gray-700"
        : "border-gray-300 dark:border-gray-700"
    }
  `;

  return (
    <div className="space-y-2">
      {/* Label */}
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>

      {/* Input with validation indicator */}
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={validation.isValidating}
          className={fieldClasses}
          {...validation.ariaAttributes}
        />

        {/* Validation Status Icon */}
        {touched && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {validation.isValidating && (
              <Loader size={20} className="text-blue-500 animate-spin" />
            )}
            {validation.validationState === "success" && (
              <Check size={20} className="text-green-500" />
            )}
            {validation.validationState === "error" && (
              <AlertCircle size={20} className="text-red-500" />
            )}
          </motion.div>
        )}
      </div>

      {/* Error Message */}
      {validation.shouldShowError && (
        <motion.p
          id={`${name}-error`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </motion.p>
      )}

      {/* Success Message */}
      {touched && validation.validationState === "success" && (
        <motion.p
          id={`${name}-success`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-green-600 dark:text-green-400"
        >
          Looks good!
        </motion.p>
      )}

      {/* Help Text */}
      {helpText && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
      )}
    </div>
  );
};

export default SignupFormExample;
