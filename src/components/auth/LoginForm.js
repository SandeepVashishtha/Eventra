import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { toast } from "react-toastify";
import { showAuthToast } from "../../utils/toast";
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import useReducedMotion from '../../hooks/useReducedMotion';

const LoginForm = () => {
  const prefersReducedMotion = useReducedMotion();
  const [formData, setFormData] = useState({ usernameOrEmail: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from;
  const redirectPath =
    typeof from === "string"
      ? from
      : from?.pathname
        ? `${from.pathname}${from.search || ""}${from.hash || ""}`
        : "/dashboard";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = "Email or username is required";
    } else if (
      formData.usernameOrEmail.includes("@") &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.usernameOrEmail)
    ) {
      newErrors.usernameOrEmail = "Invalid email format";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const ok = await login(formData.usernameOrEmail, formData.password);
      if (ok) {
        showAuthToast("Login successful! Redirecting...", () =>
          navigate(redirectPath, { replace: true })
        );
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error("Login error:", err);
      }
      setError({ general: err.message || "Invalid email or password" });
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center space-y-4 mb-8">
        {/* Animated glowing icon */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 8 }}
          whileTap={{ scale: 0.92 }}
          className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-indigo-500/10 shadow-[0_0_25px_rgba(59,130,246,0.35)] border border-blue-500/30 hover:shadow-[0_0_35px_rgba(59,130,246,0.6)] transition-all duration-300"
        >
          <LogIn className="w-8 h-8 text-blue-400" />
        </motion.div>

        {/* Gradient headline */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-indigo-300 hover:from-blue-200 hover:via-purple-200 hover:to-pink-200 transition-all duration-500 cursor-default"
          style={{ fontFamily: '"Anton", sans-serif', letterSpacing: '1px' }}
        >
          Welcome Back
        </motion.h1>

        {/* Subtitle with animated underline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-slate-400 hover:text-slate-200 transition-colors duration-300"
        >
          Sign in to your <span className="text-blue-400 font-semibold">Eventra</span> account
        </motion.p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="usernameOrEmail" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Email or username <span className='ml-1 text-red-400'>*</span>
          </label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-all duration-300 pointer-events-none" />
            <input
              id="usernameOrEmail"
              name="usernameOrEmail"
              type="text"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="john@example.com / yourname@email.com / eventra.team@gmail.com"
              className="w-full pl-10 pr-4 py-3 bg-[#0f172a]/60 border border-slate-700/50 rounded-xl placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/70 hover:border-slate-600 hover:bg-[#0f172a]/80 transition-all duration-300 text-white text-sm shadow-inner"
            />
          </div>
          {error.usernameOrEmail && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <span>⚠</span> {error.usernameOrEmail}
            </motion.p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Password <span className='ml-1 text-red-400'>*</span>
          </label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-all duration-300 pointer-events-none" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Create a secure password"
              className="w-full pl-10 pr-10 py-3 bg-[#0f172a]/60 border border-slate-700/50 rounded-xl placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/70 hover:border-slate-600 hover:bg-[#0f172a]/80 transition-all duration-300 text-white text-sm shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-all duration-200"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {error.password && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <span>⚠</span> {error.password}
            </motion.p>
          )}
          <div className="flex justify-end pt-1">
            <Link
              to="/password-reset"
              className="text-xs text-slate-400 hover:text-blue-400 transition-colors duration-200 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {error.general && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
            {error.general}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(59,130,246,0.6)' }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading}
          className="relative w-full overflow-hidden flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-[#0f172a] bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-300 hover:to-indigo-300 shadow-[0_0_20px_rgba(59,130,246,0.4)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f172a] focus:ring-blue-500 transition-all duration-300 group"
        >
          {/* Shimmer overlay */}
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
          {loading ? (
            <div className="flex items-center gap-2 relative z-10">
              <div className="w-4 h-4 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin"></div>
              <span>Signing In...</span>
            </div>
          ) : (
            <span className="relative z-10 flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Sign In
            </span>
          )}
        </motion.button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-slate-700"></div>
        <span className="text-xs text-slate-600 uppercase tracking-widest">or</span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-slate-700"></div>
      </div>

      <p className="text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-300 hover:to-purple-300 transition-all duration-300 hover:underline"
        >
          Create one here →
        </Link>
      </p>

      <p className="text-[11px] text-center text-slate-600 mt-4 leading-relaxed">
        By signing in, you agree to our{' '}
        <Link to="/terms" className="text-slate-500 hover:text-blue-400 underline transition-colors duration-200">Terms of Service</Link>{' '}
        and{' '}
        <Link to="/privacy" className="text-slate-500 hover:text-blue-400 underline transition-colors duration-200">Privacy Policy</Link>
      </p>
    </div>
  );
};

export default LoginForm;
