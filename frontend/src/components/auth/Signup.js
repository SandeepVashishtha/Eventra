import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS, apiUtils } from '../../config/api';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'USER' // Default to USER role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState("");
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: ''
  });
  
  const navigate = useNavigate();

  const validateEmail = (email) => {
    // simple regex for email validation
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = [];
    
    if (password.length >= 8) score += 1;
    else feedback.push('at least 8 characters');
    
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('one lowercase letter');
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('one uppercase letter');
    
    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('one number');
    
    if (/[@$!%*?&]/.test(password)) score += 1;
    else feedback.push('one special character (@$!%*?&)');
    
    return { score, feedback: feedback.length > 0 ? `Needs: ${feedback.join(', ')}` : 'Strong password!' };
  };

  const handleChange = (e) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    setFormData(newFormData);
    
    // Check password strength in real-time
    if (e.target.name === 'password') {
      const strength = checkPasswordStrength(e.target.value);
      setPasswordStrength(strength);
    }

    if (e.target.name === "email") {
      if (!validateEmail(e.target.value)) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
    }
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      setEmailError('Invalid email format');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiUtils.post(API_ENDPOINTS.AUTH.REGISTER, formData);
      const data = await response.json();

      if (response.ok) {
        setSuccess('Account created successfully! Please login to continue.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Handle validation errors
        if (data.validationErrors && data.validationErrors.length > 0) {
          const errorMessages = data.validationErrors.map(err => err.message).join(', ');
          setError(errorMessages);
        } else {
          setError(data.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"
      ></motion.div>
      <div className="relative w-full max-w-md">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6 bg-white border border-gray-200 p-8 rounded-lg shadow-lg backdrop-blur-xl"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 200 }}
            className="space-y-2 text-center"
          >
            <h1 className="text-2xl font-semibold text-gray-900">
              Create Your Account
            </h1>
            <p className="text-sm text-gray-600">
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
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First name</label>
                <motion.input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Enter your first name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last name</label>
                <motion.input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Enter your last name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="space-y-2"
            >
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <motion.input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter your email address"
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${emailError ? "border-red-500" : "border-gray-300"}`}
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <AnimatePresence>
                {emailError && (
                  <motion.p 
                    className="text-xs text-red-600 mt-1"
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

            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="space-y-2"
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <motion.input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                minLength="8"
                placeholder="Password: 8+ chars with uppercase, lowercase, number, and special character"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <AnimatePresence>
                {formData.password && (
                  <motion.div 
                    className="mt-1"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Password strength:</span>
                      <span className={passwordStrength.score >= 4 ? "text-green-600 font-medium" : "text-yellow-600"}>{passwordStrength.score}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <motion.div
                        className={`h-1.5 rounded-full ${
                          passwordStrength.score === 0
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
                        animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <motion.p
                      className={`text-xs mt-1 ${passwordStrength.score >= 4 ? "text-green-600" : "text-yellow-600"}`}
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

            <AnimatePresence>
              {error && (
                <motion.div 
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"
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
                  className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm"
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
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in here</Link>
            </p>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.4 }}
            className="text-xs text-center text-gray-500"
          >
            By clicking on sign up, you agree to our{' '}
            <a href="#" className="hover:underline text-blue-600">Terms of Service</a>{' '}and{' '}
            <a href="#" className="hover:underline text-blue-600">Privacy Policy</a>
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
