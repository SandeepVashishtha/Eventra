import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiStar, FiMessageSquare, FiUser, FiMail, FiCheckCircle } from "react-icons/fi";
import { FaGithub, FaLinkedin, FaDiscord } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi"; 
import { useNavigate } from "react-router-dom";
import "./FeedbackPage.css";

//Social media links
const socialLinks = [
  { 
    name: "X", 
    icon: <span className="w-5 h-5 flex items-center justify-center font-bold">X</span>, 
    // icon: <FaTwitter className="w-5 h-5" />, 
    href: "https://twitter.com" 
  },
  {
    name: "GitHub",
    icon: <FaGithub className="w-5 h-5" />,
    href: "https://github.com/SandeepVashishtha/Eventra",
  },
  {
    name: "LinkedIn",
    icon: <FaLinkedin className="w-5 h-5" />,
    href: "https://linkedin.com/in",
  },
  {
    name: "Discord",
    icon: <FaDiscord className="w-5 h-5" />,
    href: "https://discord.gg/",
  },
];

// Toast Component
const Toast = ({ message, type = "success", onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`fixed bottom-4 right-4 max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {type === "success" ? (
              <FiCheckCircle className="h-6 w-6 text-white" />
            ) : (
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-white">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onClose}
              className="bg-transparent inline-flex text-white hover:text-gray-200 focus:outline-none"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Star Rating Component
const StarRating = ({ rating, onRatingChange, error }) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="relative mt-6">
      <motion.label
        className={`block text-sm font-medium mb-3 ${
          error ? "text-red-500 dark:text-red-400" : "text-gray-700 dark:text-gray-300"
        }`}
        initial={false}
        animate={{ opacity: 1 }}
      >
        Overall Rating *
      </motion.label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiStar
              className={`w-8 h-8 transition-colors duration-200 ${
                star <= (hoveredRating || rating)
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          </motion.button>
        ))}
        {rating > 0 && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-3 text-sm text-gray-600 dark:text-gray-400"
          >
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </motion.span>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 dark:text-red-400 text-xs mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

// Floating Label Input Component
const FloatingInput = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  required = true,
  error,
  icon: Icon,
  placeholder,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative mt-6">
      <motion.label
        htmlFor={id}
        className={`absolute transition-all duration-300 ${ Icon ? "left-14" : "left-4"} ${
          isFocused || value
            ? "top-0 text-xs text-indigo-600 dark:text-indigo-400 font-medium"
            : "top-4 text-sm text-gray-500 dark:text-gray-400"
        } ${error ? "text-red-500 dark:text-red-400" : ""}`}
        initial={false}
        animate={{
          y: isFocused || value ? -20 : 0,
          scale: isFocused || value ? 0.85 : 1,
        }}
      >
        {label} {required && "*"}
      </motion.label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
        )}
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`w-full p-4 border rounded-lg focus:ring-2 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
          Icon ? "pl-14" : ""
          } ${
            error
              ? "border-red-500 focus:ring-red-200 dark:focus:ring-red-900/50"
              : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-200 dark:focus:ring-indigo-900/50"
          }`}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 dark:text-red-400 text-xs mt-1 ml-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

// Floating Label Select Component
const FloatingSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  required = true,
  error,
  icon: Icon,
  placeholder,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative mt-6">
      <motion.label
        htmlFor={id}
        className={`absolute transition-all duration-300 ${
          Icon ? "left-14" : "left-4"
        } ${
          isFocused || value
            ? "top-0 text-xs text-indigo-600 dark:text-indigo-400 font-medium"
            : "top-4 text-sm text-gray-500 dark:text-gray-400"
        } ${error ? "text-red-500 dark:text-red-400" : ""}`}
        initial={false}
        animate={{
          y: isFocused || value ? -20 : 0,
          scale: isFocused || value ? 0.85 : 1,
        }}
      >
        {label} {required && "*"}
      </motion.label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
        )}
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full p-4 border rounded-lg focus:ring-2 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none ${
          Icon ? "pl-14" : ""
          } ${
            error
              ? "border-red-500 focus:ring-red-200 dark:focus:ring-red-900/50"
              : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-200 dark:focus:ring-indigo-900/50"
          }`}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* ✅ ADD THIS ICON FOR THE DROPDOWN ARROW */}
        <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 dark:text-red-400 text-xs mt-1 ml-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

// Feedback Page Component
const FeedbackPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedbackType: "",
    message: "",
    rating: 0,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const formRef = useRef(null);

  const feedbackTypes = [
    { value: "general", label: "General Feedback" },
    { value: "bug", label: "Bug Report" },
    { value: "feature", label: "Feature Request" },
    { value: "ui", label: "UI/UX Feedback" },
    { value: "performance", label: "Performance Issue" },
    { value: "event", label: "Event Feedback" },
    { value: "other", label: "Other" },
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validateForm = () => {
    const newErrors = {};

    // Name is optional, but if provided, it should not be empty
    if (formData.name.trim() && formData.name.trim().length < 2) {
      newErrors.name = "Name should be at least 2 characters";
    }

    // Email is optional, but if provided, it should be valid
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    // feedbackType and rating are optional; only message is required
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message should be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleRatingChange = (rating) => {
    setFormData((prev) => ({
      ...prev,
      rating,
    }));

    // Clear rating error when user selects a rating
    if (errors.rating) {
      setErrors((prev) => ({
        ...prev,
        rating: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Shake animation for invalid form
      formRef.current.classList.add("animate-shake");
      setTimeout(() => {
        formRef.current.classList.remove("animate-shake");
      }, 500);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Save locally in localStorage
      try {
        const existing = JSON.parse(localStorage.getItem("eventra_feedback") || "[]");
        const payload = {
          name: formData.name?.trim() || null,
          email: formData.email?.trim() || null,
          message: formData.message?.trim(),
          feedbackType: formData.feedbackType || null,
          rating: formData.rating || null,
          submittedAt: new Date().toISOString(),
        };
        existing.push(payload);
        localStorage.setItem("eventra_feedback", JSON.stringify(existing));
      } catch {}

      // Show success toast (might not be visible due to redirect)
      setToast({
        message:
          "Thank you for your feedback! We appreciate your input and will review it carefully.",
        type: "success",
      });

      // Reset form and redirect to homepage
      setFormData({
        name: "",
        email: "",
        feedbackType: "",
        message: "",
        rating: 0,
      });

      navigate("/");
    } catch (error) {
      setToast({
        message: "There was an error submitting your feedback. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);

      // Auto-close toast after 5 seconds
      setTimeout(() => {
        setToast(null);
      }, 5000);
    }
  };

  return (
    // UPDATED: Main page background
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-4xl w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          // UPDATED: Card background and border
          className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
        >
          <div className="md:flex">
            <div className="md:w-2/5 bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-10 flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-4">Share Your Feedback</h2>
                <p className="mb-6 opacity-90">
                  Your feedback helps us improve Eventra and create better experiences for our community. We value your input!
                </p>

                <div className="space-y-4 mt-16">
                  <div className="flex items-center">
                    <div className="bg-white bg-opacity-20 p-2 rounded-full mr-4">
                      <FiMessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">Quick Response</p>
                      <p className="text-sm opacity-80">
                        We review all feedback within 24 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="bg-white bg-opacity-20 p-2 rounded-full mr-4">
                      <FiStar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">Anonymous Option</p>
                      <p className="text-sm opacity-80">
                        Share feedback anonymously if preferred
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="bg-white bg-opacity-20 p-2 rounded-full mr-4">
                      <FiCheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">Action Taken</p>
                      <p className="text-sm opacity-80">
                        We implement improvements based on feedback
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              </div>

            <div className="md:w-3/5 p-10">
              <div className="text-center mb-8">
                {/* UPDATED: Text colors */}
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                  We'd Love to Hear From You
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Help us make Eventra better for everyone
                </p>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <FloatingInput
                  id="name"
                  label="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  icon={FiUser}
                  required={false}
                  placeholder="Enter your name"
                />

                <FloatingInput
                  id="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  icon={FiMail}
                  required={false}
                  placeholder="your@email.com"
                />

                <FloatingSelect
                  id="feedbackType"
                  label="Feedback Type"
                  value={formData.feedbackType}
                  onChange={handleChange}
                  options={feedbackTypes}
                  error={errors.feedbackType}
                  icon={FiMessageSquare}
                  placeholder="Select a feedback type"
                />

                {/* Textarea with floating label animation */}
                <div className="relative mt-6">
                  <FiMessageSquare className="absolute left-4 top-4 text-gray-400 dark:text-gray-500 w-5 h-5 z-10" />
                  <motion.label
                    htmlFor="message"
                    className={`absolute left-14 transition-all duration-300 ${
                      isFocused || formData.message
                        ? "top-0 text-xs text-indigo-600 dark:text-indigo-400 font-medium"
                        : "top-4 text-sm text-gray-500 dark:text-gray-400"
                    } ${errors.message ? "text-red-500 dark:text-red-400" : ""}`}
                    initial={false}
                    animate={{
                      y: isFocused || formData.message ? -20 : 0,
                      scale: isFocused || formData.message ? 0.85 : 1,
                    }}
                  >
                    Your Message *
                  </motion.label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`w-full p-4 pl-14 border rounded-lg focus:ring-2 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      errors.message
                        ? "border-red-500 focus:ring-red-200 dark:focus:ring-red-900/50"
                        : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-200 dark:focus:ring-indigo-900/50"
                    }`}
                  ></textarea>
                  {errors.message && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 dark:text-red-400 text-xs mt-1 ml-1"
                    >
                      {errors.message}
                    </motion.p>
                  )}
                </div>

                <StarRating
                  rating={formData.rating}
                  onRatingChange={handleRatingChange}
                  error={errors.rating}
                />

                <div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
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
                      </svg>
                    ) : null}
                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                  </motion.button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        .animate-shake {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </div>
  );
};

export default FeedbackPage;
