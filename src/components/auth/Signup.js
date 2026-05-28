import { useState, useCallback, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { 
  User, Mail, Lock, Eye, EyeOff, Check, X, AlertCircle, 
  Github, Chrome, ArrowRight, Sparkles 
} from "lucide-react";

// ============ CONSTANTS & CONFIG ============
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
  patternError: "Only letters, spaces, hyphens & apostrophes allowed"
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INTRO_POINTS = [
  { icon: Sparkles, text: "Post events, join hackathons, and submit projects" },
  { icon: Check, text: "Track activity & community engagement from one profile" },
  { icon: ArrowRight, text: "Quick access to tools for immediate contribution" },
];

// ============ UTILITY FUNCTIONS (Outside Component) ============
const validateName = (name, type) => {
  if (!name?.trim()) return `${type} name is required`;
  if (name.length < NAME_VALIDATION.min) return `At least ${NAME_VALIDATION.min} characters`;
  if (name.length > NAME_VALIDATION.max) return `Max ${NAME_VALIDATION.max} characters`;
  if (!NAME_VALIDATION.pattern.test(name)) return NAME_VALIDATION.patternError;
  return "";
};

const validateEmail = (email) => {
  if (!email?.trim()) return "Email is required";
  if (!EMAIL_REGEX.test(email)) return "Invalid email format";
  return "";
};

const checkPasswordRequirement = (password, requirement) => {
  return requirement.regex.test(password);
};

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  const met = PASSWORD_REQUIREMENTS.filter(req => checkPasswordRequirement(password, req)).length;
  if (met === 5) return { score: 100, label: 'Strong', color: 'text-green-500' };
  if (met >= 4) return { score: 75, label: 'Good', color: 'text-yellow-500' };
  if (met >= 3) return { score: 50, label: 'Fair', color: 'text-orange-500' };
  return { score: 25, label: 'Weak', color: 'text-red-500' };
};

// ============ REUSABLE ICON COMPONENTS ============
const ToggleEyeIcon = ({ visible, className = "" }) => 
  visible ? <EyeOff className={className} /> : <Eye className={className} />;

const SocialIcon = ({ provider }) => {
  const icons = {
    google: <Chrome className="w-5 h-5" />,
    github: <Github className="w-5 h-5" />,
  };
  return icons[provider] || null;
};

// ============ CUSTOM HOOK: useSignupForm ============
const useSignupForm = (onSuccess) => {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const updateField = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Real-time validation on blur
    if (name === 'firstName' || name === 'lastName') {
      const error = validateName(formData[name], name === 'firstName' ? 'First' : 'Last');
      setErrors(prev => ({ ...prev, [name]: error }));
    }
    if (name === 'email') {
      const error = validateEmail(formData.email);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [formData]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Name validation
    const firstNameErr = validateName(formData.firstName, 'First');
    const lastNameErr = validateName(formData.lastName, 'Last');
    if (firstNameErr) newErrors.firstName = firstNameErr;
    if (lastNameErr) newErrors.lastName = lastNameErr;
    
    // Email validation
    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;
    
    // Password validation
    const strength = getPasswordStrength(formData.password);
    if (strength.score < 75) {
      newErrors.password = "Password must be at least 'Good' strength";
    }
    
    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
    setErrors({});
    setTouched({});
    setSubmitStatus(null);
  }, []);

  return {
    formData, errors, touched, loading, submitStatus,
    updateField, handleBlur, validateForm, setLoading, setSubmitStatus, resetForm
  };
};

// ============ MAIN COMPONENT ============
const Signup = () => {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();
  
  const {
    formData, errors, touched, loading, submitStatus,
    updateField, handleBlur, validateForm, setLoading, setSubmitStatus
  } = useSignupForm();

  const passwordStrength = useMemo(() => 
    getPasswordStrength(formData.password), [formData.password]);

  const passwordsMatch = useMemo(() => 
    formData.confirmPassword && formData.password === formData.confirmPassword, 
    [formData.password, formData.confirmPassword]);

  // Document title effect
  useEffect(() => {
    const originalTitle = document.title;
    document.title = "Sign Up | Eventra";
    return () => { document.title = originalTitle; };
  }, []);

  // Auto-clear success message after redirect
  useEffect(() => {
    if (submitStatus === 'success') {
      const timer = setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
      return () => clearTimeout(timer);
    }
  }, [submitStatus, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to show errors
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

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(response.data?.message || `Registration failed (${response.status})`);
      }

      const data = response.data;
      if (!data?.token) throw new Error("Authentication token missing");

      // Set auth session
      setAuthSession(data.token, {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role ?? "USER",
        permissions: data.permissions ?? [],
      });

      setSubmitStatus('success');
      
      // Analytics tracking (optional)
      if (window.gtag) {
        window.gtag('event', 'sign_up', { method: 'email' });
      }
      
    } catch (err) {
      console.error("Signup error:", { message: err.message, email: formData.email });
      setSubmitStatus('error');
      setErrors(prev => ({ 
        ...prev, 
        submit: err.message.includes('email') 
          ? "This email is already registered. Try logging in instead." 
          : err.message 
      }));
    } finally {
      setLoading(false);
    }
  };

  // Social login handler (placeholder)
  const handleSocialLogin = useCallback(async (provider) => {
    const POPUP_POLL_INTERVAL = 500;
    const POPUP_TIMEOUT_MS = 60_000;

    const openPopup = (url) => {
      const width = 600;
      const height = 700;
      const left = Math.max(0, Math.floor(window.screenX + (window.innerWidth - width) / 2));
      const top = Math.max(0, Math.floor(window.screenY + (window.innerHeight - height) / 2));
      return window.open(url, `_oauth_${provider}`, `width=${width},height=${height},left=${left},top=${top}`);
    };

    try {
      setLoading(true);
      setErrors(prev => ({ ...prev, submit: "" }));

      // Initiate OAuth handshake with backend which should return a redirect URL
      // The backend may return { url } or issue a 302; support both behaviours.
      let initiation;
      try {
        initiation = await apiUtils.get(`/api/auth/${provider}`, { skipAuth: true });
      } catch (networkErr) {
        throw new Error(`Could not start ${provider} OAuth: ${networkErr.message || networkErr}`);
      }

      const redirectUrl = initiation.data?.url || initiation.headers.get('location') || initiation.data?.redirect;
      if (!redirectUrl) {
        throw new Error('OAuth initiation endpoint did not return a redirect URL');
      }

      const popup = openPopup(redirectUrl);
      if (!popup) throw new Error('Unable to open authentication popup. Please allow popups and try again.');

      // Poll the popup until it redirects back to our origin (where we can safely read query params)
      const start = Date.now();

      await new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
          if (!popup || popup.closed) {
            clearInterval(interval);
            return reject(new Error('Authentication popup closed before completing sign in'));
          }

          try {
            const href = popup.location.href;
            // Only attempt to parse if the popup is same-origin (redirected back to our app)
            if (href && href.indexOf(window.location.origin) === 0) {
              const url = new URL(href);
              const error = url.searchParams.get('error');
              const code = url.searchParams.get('code');
              const token = url.searchParams.get('token');

              if (error) {
                popup.close();
                clearInterval(interval);
                return reject(new Error(error));
              }

              // If the backend returned a token directly in the redirect, use it.
              if (token) {
                popup.close();
                clearInterval(interval);
                return resolve({ token });
              }

              // If we received an auth code, attempt server-side exchange by calling the profile endpoint
              if (code) {
                // Close popup and resolve; the server should have set an HttpOnly cookie during the redirect
                popup.close();
                clearInterval(interval);
                return resolve({ code });
              }
            }
          } catch (err) {
            // Cross-origin access will throw until the popup redirects back to our origin.
            // Ignore those errors and continue polling.
          }

          if (Date.now() - start > POPUP_TIMEOUT_MS) {
            clearInterval(interval);
            try { popup.close(); } catch {}
            return reject(new Error('Authentication timed out'));
          }
        }, POPUP_POLL_INTERVAL);
      });

      // After popup completes, ask backend for the current profile which should reflect the logged-in user
      try {
        const profileRes = await apiUtils.get(API_ENDPOINTS.USERS.PROFILE);
        if (!profileRes.ok) throw new Error('Failed to fetch authenticated profile after OAuth');

        const sessionToken = profileRes.data?.token ?? profileRes.headers.get('authorization') ?? 'cookie-managed';
        const sessionUser = profileRes.data?.user ?? profileRes.data ?? null;

        if (!sessionUser) throw new Error('Profile response did not contain user information');

        // Persist session via AuthContext
        setAuthSession(sessionToken, sessionUser);
        setSubmitStatus('success');
        navigate('/dashboard', { replace: true });
      } catch (err) {
        throw new Error(err.message || 'OAuth completed but fetching profile failed');
      }
    } catch (err) {
      console.error('[Signup] Social login error:', err);
      setErrors(prev => ({ ...prev, submit: `Failed to connect with ${provider}: ${err.message}` }));
      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  }, [navigate, setAuthSession]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: prefersReducedMotion ? 0 : 0.5,
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: prefersReducedMotion ? 0 : 0.4 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8"
      aria-live="polite"
    >
      <div className="w-full max-w-5xl mx-auto">
        <motion.div 
          variants={itemVariants}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="grid md:grid-cols-2">
            
            {/* LEFT PANEL - Branding */}
            <motion.div 
              variants={itemVariants}
              className="relative p-8 md:p-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white flex flex-col justify-between"
            >
              {/* Decorative elements */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-300 rounded-full blur-3xl" />
              </div>
              
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
                
                <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                  Join thousands of developers, designers, and creators building the future of events.
                </p>
                
                {/* Feature list */}
                <ul className="space-y-4">
                  {INTRO_POINTS.map(({ icon: Icon, text }, idx) => (
                    <motion.li 
                      key={text}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: prefersReducedMotion ? 0 : idx * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-1 w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-blue-50">{text}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              {/* Testimonial */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.5 }}
                className="relative z-10 mt-8 pt-6 border-t border-white/20"
              >
                <blockquote className="text-sm text-blue-100 italic">
                  "Eventra helped me connect with 50+ collaborators for my hackathon project!"
                </blockquote>
                <cite className="block mt-2 text-xs text-blue-200 not-italic">
                  — Priya S., Full-Stack Developer
                </cite>
              </motion.div>
            </motion.div>

            {/* RIGHT PANEL - Form */}
            <motion.div variants={itemVariants} className="p-6 md:p-10">
              <div className="text-center mb-8">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 3 }}
                  whileTap={{ scale: 0.98 }}
                  className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mb-4"
                >
                  <User className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create your account
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Start your journey with Eventra today
                </p>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {['google', 'github'].map(provider => (
                  <motion.button
                    key={provider}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => handleSocialLogin(provider)}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    aria-label={`Sign up with ${provider}`}
                  >
                    <SocialIcon provider={provider} />
                    <span className="capitalize">{provider}</span>
                  </motion.button>
                ))}
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white dark:bg-gray-800 text-gray-500">
                    Or continue with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  {['firstName', 'lastName'].map((field, idx) => {
                    const label = field === 'firstName' ? 'First name' : 'Last name';
                    const error = errors[field] && touched[field] ? errors[field] : '';
                    
                    return (
                      <FormField 
                        key={field}
                        id={field}
                        label={label}
                        type="text"
                        icon={User}
                        value={formData[field]}
                        onChange={(e) => updateField(field, e.target.value)}
                        onBlur={() => handleBlur(field)}
                        error={error}
                        required
                        autoComplete={field === 'firstName' ? 'given-name' : 'family-name'}
                        initialDelay={idx * 0.1}
                      />
                    );
                  })}
                </div>

                {/* Email Field */}
                <FormField
                  id="email"
                  label="Email address"
                  type="email"
                  icon={Mail}
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  error={errors.email && touched.email ? errors.email : ''}
                  required
                  autoComplete="email"
                  hint="We'll never share your email"
                />

                {/* Password Field */}
                <PasswordField
                  id="password"
                  label="Password"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  error={errors.password && touched.password ? errors.password : ''}
                  strength={passwordStrength}
                  requirements={PASSWORD_REQUIREMENTS}
                />

                {/* Confirm Password */}
                <FormField
                  id="confirmPassword"
                  label="Confirm password"
                  type="password"
                  icon={Lock}
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  error={errors.confirmPassword && touched.confirmPassword ? errors.confirmPassword : ''}
                  success={passwordsMatch ? "Passwords match" : ""}
                  required
                  autoComplete="new-password"
                  toggleVisibility
                />

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                    I agree to the{" "}
                    <Link to="/terms" className="text-blue-600 hover:underline font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-blue-600 hover:underline font-medium">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Status Messages */}
                <AnimatePresence mode="wait">
                  {submitStatus === 'error' && errors.submit && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm"
                      role="alert"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>{errors.submit}</span>
                    </motion.div>
                  )}
                  
                  {submitStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300 text-sm"
                      role="status"
                    >
                      <Check className="w-5 h-5" />
                      <span>Account created! Redirecting...</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" 
                          stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Sign In Link */}
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                Already have an account?{" "}
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors"
                >
                  Sign in instead
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ============ REUSABLE FORM FIELD COMPONENT ============
const FormField = ({
  id, label, type = "text", icon: Icon, value, onChange, onBlur,
  error, success, hint, required, autoComplete, toggleVisibility, initialDelay = 0
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
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
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
          className={`
            w-full pl-10 pr-${toggleVisibility ? '10' : '4'} py-3 
            bg-white/70 dark:bg-gray-700/70 
            border rounded-xl 
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 
            transition-all duration-200
            ${error 
              ? 'border-red-300 dark:border-red-700 focus:ring-red-500/30' 
              : success 
                ? 'border-green-300 dark:border-green-700 focus:ring-green-500/30'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            text-gray-900 dark:text-white
          `}
          placeholder={`Enter your ${label.toLowerCase()}`}
          required={required}
        />
        
        {toggleVisibility && (
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            <ToggleEyeIcon visible={showPassword} className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Helper text */}
      {hint && !error && !success && (
        <p id={`${id}-hint`} className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1"
            role="alert"
          >
            <X className="w-3.5 h-3.5" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      
      {/* Success message */}
      <AnimatePresence>
        {success && !error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            {success}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============ PASSWORD FIELD WITH REQUIREMENTS ============
const PasswordField = ({ id, label, value, onChange, error, strength, requirements }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} <span className="text-red-500">*</span>
      </label>
      
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
        
        <input
          id={id}
          name={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete="new-password"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : `${id}-strength`}
          className={`
            w-full pl-10 pr-10 py-3 
            bg-white/70 dark:bg-gray-700/70 
            border rounded-xl 
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 
            transition-all duration-200
            ${error 
              ? 'border-red-300 dark:border-red-700 focus:ring-red-500/30' 
              : strength.score >= 75
                ? 'border-green-300 dark:border-green-700 focus:ring-green-500/30'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            text-gray-900 dark:text-white
          `}
          placeholder="Create a strong password"
          required
        />
        
        <button
          type="button"
          onClick={() => setShowPassword(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          <ToggleEyeIcon visible={showPassword} className="w-5 h-5" />
        </button>
      </div>
      
      {/* Password strength indicator */}
      {value && (
        <div id={`${id}-strength`} className="space-y-2">
          {/* Strength bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${strength.score}%` }}
                transition={{ duration: 0.3 }}
                className={`h-full rounded-full ${
                  strength.score >= 75 ? 'bg-green-500' : 
                  strength.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              />
            </div>
            <span className={`text-xs font-medium ${strength.color}`}>
              {strength.label}
            </span>
          </div>
          
          {/* Requirements checklist */}
          <ul className="grid grid-cols-2 gap-1.5 text-xs">
            {requirements.map(req => {
              const met = checkPasswordRequirement(value, req);
              return (
                <li 
                  key={req.id}
                  className={`flex items-center gap-1.5 ${
                    met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {met ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[10px]">
                      •
                    </span>
                  )}
                  <span>{req.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1"
            role="alert"
          >
            <X className="w-3.5 h-3.5" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Signup;