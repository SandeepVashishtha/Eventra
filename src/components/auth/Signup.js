import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Check,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  X,
} from "lucide-react";
import SignupForm from "./SignupForm";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import useReducedMotion from "../../hooks/useReducedMotion";

const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "At least 8 characters", regex: /.{8,}/ },
  { id: "uppercase", label: "One uppercase letter", regex: /[A-Z]/ },
  { id: "lowercase", label: "One lowercase letter", regex: /[a-z]/ },
  { id: "number", label: "One number", regex: /\d/ },
  { id: "special", label: "One special character", regex: /[^A-Za-z0-9]/ },
];

const INTRO_POINTS = [
  { icon: Sparkles, text: "Post events, join hackathons, and submit projects" },
  { icon: Check, text: "Track activity and community engagement from one profile" },
  { icon: ArrowRight, text: "Get quick access to the tools you need to contribute" },
];

const checkPasswordRequirement = (password, requirement) => requirement.regex.test(password);

export const FormField = ({
  id,
  label,
  type = "text",
  icon: Icon,
  value,
  onChange,
  onBlur,
  error,
  success,
  hint,
  required = false,
  autoComplete,
  placeholder,
  toggleVisibility = false,
  initialDelay = 0,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = toggleVisibility ? (showPassword ? "text" : "password") : type;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: initialDelay }}
      className="space-y-1.5"
    >
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        )}

        <input
          id={id}
          name={id}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`w-full rounded-xl border bg-white/70 py-3 text-gray-900 transition-all duration-200 placeholder:text-gray-400 dark:bg-gray-700/70 dark:text-white dark:placeholder:text-gray-500 ${
            Icon ? "pl-10" : "pl-4"
          } ${toggleVisibility ? "pr-10" : "pr-4"} ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 dark:border-red-700"
              : success
                ? "border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 dark:border-green-700"
                : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:hover:border-gray-500"
          }`}
          placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
          required={required}
        />

        {toggleVisibility && (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>

      {hint && !error && !success && (
        <p id={`${id}-hint`} className="text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400"
            role="alert"
            aria-live="assertive"
          >
            <X className="h-3.5 w-3.5" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {success && !error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400"
          >
            <Check className="h-3.5 w-3.5" />
            {success}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const PasswordField = ({
  id,
  label,
  value,
  onChange,
  error,
  strength = { score: 0, color: "text-gray-400", label: "None" },
  requirements = PASSWORD_REQUIREMENTS,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

        <input
          id={id}
          name={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete="new-password"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : `${id}-strength`}
          className={`w-full rounded-xl border bg-white/70 py-3 pl-10 pr-10 text-gray-900 transition-all duration-200 placeholder:text-gray-400 dark:bg-gray-700/70 dark:text-white dark:placeholder:text-gray-500 ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 dark:border-red-700"
              : strength.score >= 75
                ? "border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 dark:border-green-700"
                : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:hover:border-gray-500"
          }`}
          placeholder="Create a strong password"
          required
        />

        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {value && (
        <div id={`${id}-strength`} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${strength.score}%` }}
                transition={{ duration: 0.3 }}
                className={`h-full rounded-full ${
                  strength.score >= 75
                    ? "bg-green-500"
                    : strength.score >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              />
            </div>
            <span className={`text-xs font-medium ${strength.color}`}>{strength.label}</span>
          </div>

          <ul className="grid grid-cols-2 gap-1.5 text-xs">
            {requirements.map((requirement) => {
              const met = checkPasswordRequirement(value, requirement);
              return (
                <li
                  key={requirement.id}
                  className={`flex items-center gap-1.5 ${
                    met ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {met ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-current text-[10px]">
                      *
                    </span>
                  )}
                  <span>{requirement.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400"
            role="alert"
            aria-live="assertive"
          >
            <X className="h-3.5 w-3.5" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

const Signup = () => {
  const prefersReducedMotion = useReducedMotion();
  useDocumentTitle("Sign Up | Eventra");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 px-4 py-8 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 sm:px-6 lg:px-8"
    >
      <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2">
        <motion.section
          initial={{ x: prefersReducedMotion ? 0 : -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-16 right-10 h-40 w-40 rounded-full bg-yellow-300 blur-3xl" />
          </div>

          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Sparkles className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold tracking-tight">Eventra</span>
              </div>

              <h1 className="mb-4 text-3xl font-extrabold leading-tight md:text-4xl">
                Build Your Community,
                <br />
                <span className="text-yellow-300">One Event at a Time</span>
              </h1>

              <p className="mb-8 text-lg leading-relaxed text-blue-100">
                Join developers, designers, and creators building better event experiences together.
              </p>

              <ul className="space-y-4">
                {INTRO_POINTS.map(({ icon: Icon, text }, index) => (
                  <motion.li
                    key={text}
                    initial={{ x: prefersReducedMotion ? 0 : -12, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: prefersReducedMotion ? 0 : index * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/20">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-blue-50">{text}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 border-t border-white/20 pt-6">
              <blockquote className="text-sm italic text-blue-100">
                &quot;Eventra helped me find collaborators and ship faster for my last hackathon.&quot;
              </blockquote>
              <cite className="mt-2 block text-xs not-italic text-blue-200">
                - Priya S., Full-Stack Developer
              </cite>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ x: prefersReducedMotion ? 0 : 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.1 }}
          className="rounded-3xl border border-gray-200/60 bg-white/90 p-6 shadow-2xl backdrop-blur-xl dark:border-gray-700/60 dark:bg-gray-800/85 md:p-8"
        >
          <SignupForm />
          <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              Privacy Policy
            </Link>
            .
          </p>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default Signup;
