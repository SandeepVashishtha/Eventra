import { memo, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { logger } from "../../utils/logger";
import { 
  Check, 
  AlertCircle, 
  Loader, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  UserCheck, 
  Info 
} from "lucide-react";
import useFormValidation from "../hooks/useFormValidation.enhanced";
import useValidationState from "../hooks/useValidationState";

// =========================================================================
// INTERFACE DESIGN CONSTANTS (PREVENTING INLINE REDECLARATIONS)
// =========================================================================
const INITIAL_FORM_VALUES = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const DEBOUNCE_CONFIGURATION_PRESETS = {
  debounceMs: 500,
  validateOnBlur: false,
  asyncValidationTimeout: 15000,
  cacheResults: true,
};

// =========================================================================
// COMPACT EXTENDED LAYOUT SUB-COMPONENTS
// =========================================================================
const FormHeaderRibbon = memo(() => {
  return (
    <div className="text-center mb-6 header-branding-wrapper select-none">
      <div className="inline-flex p-3 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mb-3 border border-blue-100/30">
        <ShieldCheck className="w-6 h-6 animate-pulse" />
      </div>
      <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
        Create Account
      </h1>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
        Join the Eventra network portal to securely manage, map, and organize live interactive project hub environments.
      </p>
    </div>
  );
});

FormHeaderRibbon.displayName = "FormHeaderRibbon";

const FormFieldIconSelector = memo(({ fieldName }) => {
  const iconClasses = "w-4 h-4 text-gray-400 dark:text-gray-500 transition-colors duration-200 group-focus-within:text-blue-500";
  
  switch (fieldName) {
    case "firstName":
    case "lastName":
      return <User className={iconClasses} />;
    case "username":
      return <UserCheck className={iconClasses} />;
    case "email":
      return <Mail className={iconClasses} />;
    case "password":
    case "confirmPassword":
      return <Lock className={iconClasses} />;
    default:
      return <Info className={iconClasses} />;
  }
});

FormFieldIconSelector.displayName = "FormFieldIconSelector";

// =========================================================================
// MAIN EXPORTED AUTHSIGNUP COMPONENT CORE
// =========================================================================
/**
 * SignupFormExample Component
 * Demonstrates async validation pipelines, high contrast accessibility hooks,
 * and layout-stabilized feedback nodes preventing interface page shifts.
 */
const SignupFormExample = ({ onSignupSuccess }) => {
  
  // ── MOCK ASYNC VALIDATION MICRO-SERVICES ───────────────────────────────
  const validateUsernameAvailable = useCallback(async (username) => {
    if (!username || username.length < 3) return true;

    // Simulate standard asynchronous API fetch delay parameters
    await new Promise((resolve) => setTimeout(resolve, 800));

    const takenUsernames = ["admin", "john", "jane", "testuser"];
    return (
      !takenUsernames.includes(username.toLowerCase()) ||
      "Username already taken"
    );
  }, []);

  const validateEmailAvailable = useCallback(async (email) => {
    if (!email) return true;

    // Simulate standard asynchronous API fetch delay parameters
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const registeredEmails = [
      "test@example.com",
      "admin@example.com",
      "demo@test.com",
    ];
    return (
      !registeredEmails.includes(email.toLowerCase()) ||
      "Email already registered"
    );
  }, []);

  // ── VALIDATION SCHEMA STRUCTURAL PRESETS ────────────────────────────────
  const validationRules = useMemo(() => ({
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
      (val) => /^[a-zA-Z0-9_-]+$/.test(val) || "Alphanumeric, underscore, dash only",
      validateUsernameAvailable,
    ],
    email: [
      (val) => (val && val.trim() !== "") || "Email is required",
      (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || "Invalid email format",
      validateEmailAvailable,
    ],
    password: [
      (val) => (val && val.trim() !== "") || "Password is required",
      (val) => val.length >= 8 || "At least 8 characters",
      (val) => /[A-Z]/.test(val) || "Must contain an uppercase letter",
      (val) => /[a-z]/.test(val) || "Must contain a lowercase letter",
      (val) => /[0-9]/.test(val) || "Must contain a digit number",
      (val) => /[!@#$%^&*]/.test(val) || "Must contain special character (!@#$%^&*)",
    ],
    confirmPassword: [
      (val) => (val && val.trim() !== "") || "Please confirm your password",
      (val, allValues) => val === allValues.password || "Passwords do not match",
    ],
  }), [validateUsernameAvailable, validateEmailAvailable]);

  // Hook Initialization
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
    INITIAL_FORM_VALUES,
    validationRules,
    DEBOUNCE_CONFIGURATION_PRESETS,
  );

  // Form submission execution pipeline
  const handleFormSubmit = useMemo(
  () =>
    handleSubmit(async (formValues) => {
      const fieldOrder = [
        "firstName",
        "lastName",
        "username",
        "email",
        "password",
        "confirmPassword",
      ];

      const firstInvalidField = fieldOrder.find(
         (field) => errors[field]
      );

      if (firstInvalidField) {
        const element = document.getElementById(firstInvalidField);

        element?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        element?.focus();

        return;
      }
    try {
      logger.info("Form validation pipeline passed. Submitting credentials payload:", formValues);
      
      // Simulate underlying network delivery framework latency
      await new Promise((resolve) => setTimeout(resolve, 1500));

      alert("Registration process completed successfully! Logging data parameters.");
      resetForm();

      if (onSignupSuccess) {
        onSignupSuccess(formValues);
      }
    } catch {
      alert("Registration failed. Please audit inputs or try again later.");
    }
  }), [handleSubmit, resetForm, onSignupSuccess,errors,]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="max-w-md mx-auto mt-8 p-6 md:p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800/60 registration-card-container"
    >
      {/* Decoupled header segment insertion */}
      <FormHeaderRibbon />

      <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
        
        <div className="grid grid-cols-2 gap-4 names-split-row">
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
        </div>

        <FormField
          label="Username Handle"
          name="username"
          type="text"
          value={values.username}
          error={errors.username}
          touched={touched.username}
          validationState={validationState.username}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="johndoe"
          helpText="3-30 characters, alphanumeric rules apply"
        />

        <FormField
          label="Email Address"
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

        <FormField
          label="Password Account Credential"
          name="password"
          type="password"
          value={values.password}
          error={errors.password}
          touched={touched.password}
          validationState={validationState.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="••••••••"
          helpText="Min 8 characters, alphanumeric mixed parameters required"
        />

        <FormField
          label="Confirm Password Match"
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
        {Object.keys(errors).some((key) => touched[key] && errors[key]) && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            Please correct the highlighted fields before continuing.
          </div>
        )}
        {/* Action Button Segment Wrapper */}
        <div className="pt-2 action-submission-wrapper">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: !isSubmitting ? 1.015 : 1 }}
            whileTap={{ scale: !isSubmitting ? 0.985 : 1 }}
            className={`w-full py-3 rounded-xl font-bold transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 tracking-wide text-sm ${
              !isSubmitting
                ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-blue-500/10"
                : "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader size={16} className="animate-spin text-blue-500" />
                Validating Ledger Credentials...
              </span>
            ) : (
              "Create Account Profile"
            )}
          </motion.button>
        </div>

        {/* Stabilization Context Ribbon */}
        <div className="text-center text-xs font-semibold h-4 mt-2 transition-colors duration-200 tracking-wide select-none">
          {isFormValid ? (
            <p className="text-green-600 dark:text-green-400 font-bold animate-pulse">
              ✓ Token checks initialized successfully. Form validation clear.
            </p>
          ) : (
            <p className="text-gray-400 dark:text-gray-500">
              Please complete all mandatory parameters to unlock submission routes.
            </p>
          )}
        </div>
      </form>
    </motion.div>
  );
};

// =========================================================================
// RESILIENT FORMFIELD LAYOUT COMPONENT
// =========================================================================
const FormField = memo(({
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

  // Compute dynamic focus/border indicators cleanly
  const fieldBorderClasses = useMemo(() => {
    if (!touched) return "border-gray-300 dark:border-gray-700 focus-within:border-blue-500";
    
    switch (validation.validationState) {
      case "success":
        return "border-green-500 dark:border-green-400";
      case "error":
        return "border-red-500 dark:border-red-400";
      case "validating":
        return "border-blue-500 dark:border-blue-400";
      default:
        return "border-gray-300 dark:border-gray-700 focus-within:border-blue-500";
    }
  }, [touched, validation.validationState]);

  return (
    <div className="space-y-1.5 field-structural-node-block group">
      
      {/* Accessible Label Node */}
      <label
        htmlFor={name}
        className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
      >
        {label}
      </label>

      {/* Input Outer Control Frame Wrapper */}
      <div 
        className={`
          flex items-center gap-3 w-full px-3.5 py-2 border-2 rounded-xl
          bg-white dark:bg-gray-800 transition-all duration-200
          focus-within:ring-2 focus-within:ring-blue-500/20 shadow-sm
          ${fieldBorderClasses}
        `}
      >
        {/* Dynamic Inner Prefix Indicator Icon Node */}
        <FormFieldIconSelector fieldName={name} />

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={validation.isValidating}
          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0 p-0"
          {...validation.ariaAttributes}
        />

        {/* Real-time Loading/Status Icon Overlay */}
        <AnimatePresence mode="wait">
          {touched && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="shrink-0 selection-indicator-node"
            >
              {validation.isValidating && (
                <Loader size={16} className="text-blue-500 animate-spin" />
              )}
              {validation.validationState === "success" && (
                <Check size={16} className="text-green-500 font-bold" />
              )}
              {validation.validationState === "error" && (
                <AlertCircle size={16} className="text-red-500" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🎯 PRE-ALLOCATED STABILIZATION CONTAINER FOR ALERT MESSAGE PLACEMENT */}
      <div className="h-5 px-1 overflow-hidden layout-stabilizer-container select-none">
        <AnimatePresence mode="wait">
          {validation.shouldShowError ? (
            <motion.p
              key={`${name}-error-message`}
              id={`${name}-error`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs font-bold text-red-600 dark:text-red-400 tracking-tight"
              role="alert"
              aria-live="assertive"
            >
              ⚠️ {error}
            </motion.p>
          ) : touched && validation.validationState === "success" ? (
            <motion.p
              key={`${name}-success-message`}
              id={`${name}-success`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs font-semibold text-green-600 dark:text-green-400 tracking-tight flex items-center gap-1"
            >
              Field entry verified.
            </motion.p>
          ) : helpText ? (
            <motion.p
              key={`${name}-help-text`}
              className="text-[11px] text-gray-400 dark:text-gray-500 tracking-tight leading-none"
            >
              {helpText}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

    </div>
  );
});

FormField.displayName = "FormField";

export default SignupFormExample;
