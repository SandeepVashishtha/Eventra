import { useState, useCallback, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useReducedMotion from '../../hooks/useReducedMotion';
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { getPublicErrorMessage, AUTH_ERRORS } from "../../utils/errorMessages";
import { useAuth } from "../../context/AuthContext";
import { validate } from "../../validation";
import {
  Sparkles, Check, ArrowRight, EyeOff, Eye, User, Mail, Lock, AlertCircle, X
} from "lucide-react";

const PASSWORD_REQUIREMENTS = [
  { id: 'length', label: 'At least 8 characters', regex: /.{8,}/ },
  { id: 'uppercase', label: 'One uppercase letter', regex: /[A-Z]/ },
  { id: 'lowercase', label: 'One lowercase letter', regex: /[a-z]/ },
  { id: 'number', label: 'One number', regex: /\d/ },
  { id: 'special', label: 'One special character', regex: /[!@#$%^&*(),.?":{}|<>]/ },
];

const NAME_VALIDATION = {
  min: 2,
  max: 50,
  pattern: /^[a-zA-Z\s'-]+$/,
  patternError: "Only letters, spaces, hyphens & apostrophes allowed",
};

// ============ UTILITY FUNCTIONS (Outside Component) ============
const INTRO_POINTS = [
  { icon: Sparkles, text: "Post events, join hackathons, and submit projects" },
  { icon: Check, text: "Track activity & community engagement from one profile" },
  { icon: ArrowRight, text: "Quick access to tools for immediate contribution" },
];

const validateName = (name, type) => {
  if (!name?.trim()) return `${type} name is required`;
  if (name.length < NAME_VALIDATION.min) return `At least ${NAME_VALIDATION.min} characters`;
  if (name.length > NAME_VALIDATION.max) return `Max ${NAME_VALIDATION.max} characters`;
  if (!NAME_VALIDATION.pattern.test(name)) return NAME_VALIDATION.patternError;
  return "";
};

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "Empty", color: "text-gray-400" };
  let score = 0;
  if (password.length >= 8) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/[0-9]/.test(password)) score += 25;
  if (/[^A-Za-z0-9]/.test(password)) score += 25;

  if (score >= 100) return { score, label: "Strong", color: "text-green-500" };
  if (score >= 75) return { score, label: "Good", color: "text-blue-500" };
  if (score >= 50) return { score, label: "Fair", color: "text-yellow-500" };
  return { score, label: "Weak", color: "text-red-500" };
};

const checkPasswordRequirement = (password, req) => req.regex.test(password);

const ToggleEyeIcon = ({ visible, className }) => 
  visible ? <EyeOff className={className} /> : <Eye className={className} />;

// ============ CUSTOM HOOK: useSignupForm ============
const useSignupForm = () => {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const updateField = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));

    // Real-time validation on blur
    if (name === 'firstName' || name === 'lastName') {
      const error = validateName(formData[name], name === 'firstName' ? 'First' : 'Last');
      setErrors(prev => ({ ...prev, [name]: error }));
    }
    if (name === 'email') {
      const result = validate.email(formData.email);
      setErrors(prev => ({ ...prev, email: result === true ? "" : result }));
    }
  }, [formData]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    const firstNameErr = validateName(formData.firstName, 'First');
    const lastNameErr = validateName(formData.lastName, 'Last');
    if (firstNameErr) newErrors.firstName = firstNameErr;
    if (lastNameErr) newErrors.lastName = lastNameErr;

    const emailErr = validate.email(formData.email);
    if (emailErr !== true) newErrors.email = emailErr;

    const strength = getPasswordStrength(formData.password);
    if (strength.score < 75) {
      newErrors.password = "Password must be at least 'Good' strength";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  return {
    formData, errors, touched, loading, submitStatus,
    updateField, handleBlur, validateForm, setLoading, setSubmitStatus,
    setTouched, setErrors
  };
};

// ============ MAIN COMPONENT ============
const Signup = () => {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();

  const {
    formData, errors, touched, loading, submitStatus,
    updateField, handleBlur, validateForm, setLoading, setSubmitStatus,
    setTouched, setErrors
  } = useSignupForm();

  const passwordStrength = useMemo(() =>
    getPasswordStrength(formData.password), [formData.password]);

  const passwordsMatch = useMemo(() =>
    formData.confirmPassword && formData.password === formData.confirmPassword,
    [formData.password, formData.confirmPassword]);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = "Sign Up | Eventra";
    return () => { document.title = originalTitle; };
  }, []);

  useEffect(() => {
    if (submitStatus === 'success') {
      const timer = setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
      return () => clearTimeout(timer);
    }
  }, [submitStatus, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, email: true, password: true, confirmPassword: true });
    if (!validateForm()) return;

    setLoading(true);
    setSubmitStatus(null);

    try {
      const response = await apiUtils.post(API_ENDPOINTS.AUTH.REGISTER, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (!response.ok) {
        throw new Error(response.data?.message || response.data?.error || 'Registration failed');
      }

      const data = response.data;
      if (!data?.token) throw new Error("Authentication token missing");

      setAuthSession(data.token, {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role ?? "USER",
        permissions: data.permissions ?? [],
      });

      setSubmitStatus('success');
    } catch (err) {
      setSubmitStatus('error');
      setErrors(prev => ({ ...prev, submit: getPublicErrorMessage(err, AUTH_ERRORS.registrationFailed) }));
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: prefersReducedMotion ? 0 : 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: prefersReducedMotion ? 0 : 0.4 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="w-full max-w-5xl mx-auto">
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="grid md:grid-cols-2">
            <motion.div
              variants={itemVariants}
              className="relative p-8 md:p-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white flex flex-col justify-between"        
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">Eventra</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
                  Build Your Community, <br/>
                  <span className="text-yellow-300">One Event at a Time</span>
                </h2>
                <ul className="space-y-4">
                  {INTRO_POINTS.map(({ icon: Icon, text }, idx) => (
                    <motion.li key={text} className="flex items-start gap-3">
                      <div className="mt-1 w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-blue-50">{text}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="p-6 md:p-10">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Create your account</h1>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    id="firstName" label="First name" icon={User}
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    onBlur={() => handleBlur('firstName')}
                    error={touched.firstName && errors.firstName}
                    required
                  />
                  <FormField
                    id="lastName" label="Last name" icon={User}
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    onBlur={() => handleBlur('lastName')}
                    error={touched.lastName && errors.lastName}
                    required
                  />
                </div>
                <FormField
                  id="email" label="Email address" type="email" icon={Mail}
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  error={touched.email && errors.email}
                  required
                />
                <PasswordField
                  id="password" label="Password"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  error={touched.password && errors.password}
                  strength={passwordStrength}
                  requirements={PASSWORD_REQUIREMENTS}
                />
                <FormField
                  id="confirmPassword" label="Confirm password" type="password" icon={Lock}
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  error={touched.confirmPassword && errors.confirmPassword}
                  success={passwordsMatch ? "Passwords match" : ""}
                  required
                  toggleVisibility
                />

                <AnimatePresence>
                  {submitStatus === 'error' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
                      {errors.submit}
                    </motion.div>
                  )}
                  {submitStatus === 'success' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-green-50 text-green-700 rounded-xl text-sm border border-green-200">
                      Account created! Redirecting...
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-70"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </motion.button>
              </form>
              <p className="mt-6 text-center text-sm text-gray-500">
                Already have an account? <Link to="/login" className="text-blue-600 font-semibold">Sign in instead</Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export const FormField = ({ id, label, type = "text", icon: Icon, value, onChange, onBlur, error, success, required, toggleVisibility }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
        <input
          id={id} type={toggleVisibility && showPassword ? "text" : type} value={value} onChange={onChange} onBlur={onBlur}
          className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg text-sm ${error ? 'border-red-500' : 'border-gray-300'}`}
        />
        {toggleVisibility && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
            <ToggleEyeIcon visible={showPassword} className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {success && <p className="text-xs text-green-500">{success}</p>}
    </div>
  );
};

export const PasswordField = ({ id, label, value, onChange, error, strength, requirements }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          id={id} type={showPassword ? "text" : "password"} value={value} onChange={onChange}
          className="w-full pl-9 pr-9 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 rounded-lg text-sm"
        />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
          <ToggleEyeIcon visible={showPassword} className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      {value && (
        <div className="space-y-1">
          <div className="h-1 bg-gray-200 rounded-full"><motion.div animate={{ width: `${strength.score}%` }} className={`h-full rounded-full ${strength.score >= 75 ? 'bg-green-500' : 'bg-yellow-500'}`} /></div>
          <p className={`text-[10px] ${strength.color}`}>{strength.label}</p>
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Signup;
