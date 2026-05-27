import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { User, AtSign, Lock, Eye, EyeOff, Zap } from 'lucide-react';

const assessStrength = (password) => {
  if (!password) return { criteriaMet: 0 };
  let criteriaMet = 0;
  if (password.length >= 8) criteriaMet++;
  if (/[A-Z]/.test(password)) criteriaMet++;
  if (/[a-z]/.test(password)) criteriaMet++;
  if (/\d/.test(password)) criteriaMet++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) criteriaMet++;
  return { criteriaMet };
};

const SignupForm = () => {
  const prefersReducedMotion = useReducedMotion();
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
          setError("");
        }
      }
    }

    if (e.target.name === "email") {
      setEmailError(validateEmail(e.target.value) ? "" : "Invalid email");
    }

    if (e.target.name === "firstName") {
      if (!e.target.value.trim()) setFirstNameError("First name is required");
      else if (e.target.value.length < 2) setFirstNameError("At least 2 characters");
      else if (e.target.value.length > 50) setFirstNameError("Less than 50 characters");
      else setFirstNameError("");
    }

    if (e.target.name === "lastName") {
      if (!e.target.value.trim()) setLastNameError("Last name is required");
      else if (e.target.value.length < 2) setLastNameError("At least 2 characters");
      else if (e.target.value.length > 50) setLastNameError("Less than 50 characters");
      else setLastNameError("");
    }

    if (error && e.target.name !== "password" && e.target.name !== "confirmPassword") {
      setError("");
    }
  };

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

    if (!formData.firstName.trim()) { setError("First name is required"); return; }
    if (formData.firstName.trim().length < 2) { setError("First name must be at least 2 characters"); return; }
    if (!formData.lastName.trim()) { setError("Last name is required"); return; }
    if (formData.lastName.trim().length < 2) { setError("Last name must be at least 2 characters"); return; }
    if (!formData.email.trim()) { setError("Email is required"); return; }
    if (!validateEmail(formData.email)) { setEmailError("Invalid email format"); return; }
    if (!formData.password.trim()) { setError("Password is required"); return; }
    if (formData.password.length < 8) { setError("Password must be at least 8 characters long"); return; }
    if (!formData.confirmPassword.trim()) { setError("Confirm password is required"); return; }
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match"); return; }

    const { criteriaMet } = assessStrength(formData.password);
    if (criteriaMet < 5) {
      setError("Password doesn't meet the security criteria (must meet all 5 requirements).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiUtils.post(API_ENDPOINTS.AUTH.REGISTER, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      const data = response.data || {};

      const sessionToken = data?.token;
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

      if (!sessionToken) throw new Error("Token missing from signup response");

      setAuthSession(sessionToken, sessionUser);
      setSuccess("Account created successfully! Redirecting to dashboard...");
      setTimeout(() => navigate("/dashboard", { replace: true }), 1200);
    } catch (err) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center space-y-3 mb-6">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-100 to-yellow-100 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(254,240,138,0.3)]"
        >
          <Zap className="w-7 h-7 text-blue-600" />
        </motion.div>
        <h1 className="text-2xl font-bold text-white">
          Create Your Account
        </h1>
        <p className="text-sm text-slate-400">
          Join Eventra and start building amazing events
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="firstName" className="block text-xs font-medium text-slate-300">
              First name <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 pointer-events-none" />
              <input
                id="firstName" name="firstName" type="text"
                value={formData.firstName} onChange={handleChange}
                placeholder="First name"
                className="w-full pl-9 pr-3 py-2.5 bg-[#0f172a]/50 border border-slate-700/50 rounded-lg text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-white"
                required
              />
            </div>
            {firstNameError && <p className="text-red-400 text-[10px] mt-1">{firstNameError}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="lastName" className="block text-xs font-medium text-slate-300">
              Last name <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 pointer-events-none" />
              <input
                id="lastName" name="lastName" type="text"
                value={formData.lastName} onChange={handleChange}
                placeholder="Last name"
                className="w-full pl-9 pr-3 py-2.5 bg-[#0f172a]/50 border border-slate-700/50 rounded-lg text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-white"
                required
              />
            </div>
            {lastNameError && <p className="text-red-400 text-[10px] mt-1">{lastNameError}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-medium text-slate-300">
            Email address <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 pointer-events-none" />
            <input
              id="email" name="email" type="email"
              value={formData.email} onChange={handleChange}
              placeholder="Enter your email address"
              className="w-full pl-9 pr-3 py-2.5 bg-[#0f172a]/50 border border-slate-700/50 rounded-lg text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-white"
              required
            />
          </div>
          {emailError && <p className="text-red-400 text-[10px] mt-1">{emailError}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-medium text-slate-300">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 pointer-events-none" />
            <input
              id="password" name="password" type={showPassword ? "text" : "password"}
              value={formData.password} onChange={handleChange}
              placeholder="Enter your password"
              className={`w-full pl-9 pr-9 py-2.5 bg-[#0f172a]/50 border rounded-lg text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-white ${
                formData.password && formData.confirmPassword
                  ? passwordMatchMessage ? "border-green-500" : "border-red-400"
                  : "border-slate-700/50 focus:border-blue-500"
              }`}
              required
            />
            <button
              type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {formData.password && <PasswordStrengthIndicator password={formData.password} />}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-300">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 pointer-events-none" />
            <input
              id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword} onChange={handleChange}
              placeholder="Confirm your password"
              className={`w-full pl-9 pr-9 py-2.5 bg-[#0f172a]/50 border rounded-lg text-sm placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 text-white ${
                formData.confirmPassword
                  ? passwordMatchMessage ? "border-green-500" : "border-red-400"
                  : "border-slate-700/50 focus:border-blue-500"
              }`}
              required
            />
            <button
              type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordMatchMessage && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-[10px] mt-1 text-green-400">
              {passwordMatchMessage}
            </motion.p>
          )}
        </div>

        {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-lg">{error}</div>}
        {success && <div className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 p-2 rounded-lg">{success}</div>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-[0_0_15px_rgba(147,197,253,0.3)] text-sm font-bold text-[#0f172a] bg-blue-300 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f172a] focus:ring-blue-500 transition-all duration-300 mt-2"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin"></div>
              Creating Account...
            </div>
          ) : "Create Account"}
        </motion.button>
      </form>

      <p className="text-[10px] text-center text-slate-500 mt-4 leading-relaxed">
        By clicking on sign up, you agree to our{" "}
        <Link to="/terms" className="hover:text-slate-300 underline transition-colors">Terms of Service</Link>{" "}
        and{" "}
        <Link to="/privacy" className="hover:text-slate-300 underline transition-colors">Privacy Policy</Link>
      </p>

      <p className="text-center text-xs text-slate-400 mt-3">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-400 hover:text-blue-300 hover:underline font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignupForm;
