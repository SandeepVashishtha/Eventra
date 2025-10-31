import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBarChart,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiMail,
  FiMessageSquare,
  FiMonitor,
  FiMoreHorizontal,
  FiPlus,
  FiStar,
  FiUser,
} from "react-icons/fi";
import {
  FaBug,
  FaGithub,
  FaLinkedin,
  FaDiscord,
  FaRegComment,
} from "react-icons/fa";

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
      <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${
              type === "success"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
          }`}
      >
        <p className="font-medium">{message}</p>
      </motion.div>
  );
};

//Social media links
const socialLinks = [
  {
    name: "X",
    icon: (
        <span className="w-5 h-5 flex items-center justify-center font-bold">
        X
      </span>
    ),
    href: "https://twitter.com",
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

// Star Rating Component
const StarRating = ({ rating, onRatingChange, error }) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleStarClick = (star) => {
    if (rating === star) {
      onRatingChange(0);
    } else {
      onRatingChange(star);
    }
  };

  return (
      <div className="relative mt-6">
        <motion.label
            className={`block text-sm font-medium mb-3 ${
                error
                    ? "text-red-500 dark:text-red-400"
                    : "text-gray-700 dark:text-gray-300"
            }`}
            initial={false}
            animate={{ opacity: 1 }}
        >
          Overall Rating <span className="text-red-500">*</span>
        </motion.label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  title={`Click to rate ${star} star${
                      star > 1 ? "s" : ""
                  } (click again to deselect)`}
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

const FloatingInput = ({
                         id,
                         label,
                         type = "text",
                         value,
                         onChange,
                         required = true,
                         error,
                         icon: Icon,
                       }) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;

  return (
      <div className="relative mt-6">
        <div className="relative">
          {Icon && (
              <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 z-10" />
          )}
          <input
              id={id}
              name={id}
              type={type}
              value={value}
              onChange={onChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`w-full px-4 pt-6 pb-2 border-2 rounded-xl focus:ring-4 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300 ${
                  Icon ? "pl-14" : ""
              } ${
                  error
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30"
                      : isFocused
                          ? "border-indigo-500 dark:border-indigo-400 focus:ring-indigo-100 dark:focus:ring-indigo-900/30"
                          : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
          />
          <label
              htmlFor={id}
              className={`absolute ${
                  Icon ? "left-14" : "left-4"
              } pointer-events-none transition-all duration-200 ease-out ${
                  isFocused || hasValue
                      ? "top-2 text-xs font-medium"
                      : "top-1/2 -translate-y-1/2 text-sm"
              } ${
                  error
                      ? "text-red-500 dark:text-red-400"
                      : isFocused
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-gray-500 dark:text-gray-400"
              }`}
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        </div>
        <AnimatePresence>
          {error && (
              <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 dark:text-red-400 text-xs mt-2 ml-1 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                  />
                </svg>
                {error}
              </motion.p>
          )}
        </AnimatePresence>
      </div>
  );
};

// Custom Floating Label Select Component
const CustomFloatingSelect = ({
                                id,
                                label,
                                value,
                                onChange,
                                options,
                                required = true,
                                error,
                                icon: Icon,
                              }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const hasValue = value && value.length > 0;
  const selectedOption = options.find((opt) => opt.value === value);
  const selectedLabel = selectedOption ? selectedOption.label : "";
  const selectedIcon = selectedOption ? selectedOption.icon : FiMessageSquare;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleSelect = (optionValue) => {
    const selectedOption = options.find((opt) => opt.value === optionValue);
    onChange(id, {
      value: optionValue,
      label: selectedOption.label,
      icon: selectedOption.icon,
    });
    setIsOpen(false);
  };

  return (
      <div className="relative mt-6" ref={dropdownRef}>
        <div className="relative">
          {selectedIcon && (
              <selectedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 z-10" />
          )}

          <button
              type="button"
              id={id}
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full text-left px-4 pt-6 pb-2 border-2 rounded-xl focus:ring-4 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300 ${
                  selectedIcon ? "pl-12" : "pl-4"
              } pr-12 ${
                  error
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30"
                      : isOpen
                          ? "border-indigo-500 dark:border-indigo-400 focus:ring-indigo-100 dark:focus:ring-indigo-900/30"
                          : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
          >
            {selectedIcon &&
                React.createElement(selectedIcon, {
                  className:
                      "absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 z-10",
                })}
            {selectedLabel || "\u00A0"}
          </button>

          <label
              htmlFor={id}
              className={`absolute left-14 pointer-events-none transition-all duration-200 ease-out ${
                  isOpen || hasValue
                      ? "top-2 text-xs font-medium"
                      : "top-1/2 -translate-y-1/2 text-sm"
              } ${
                  error
                      ? "text-red-500 dark:text-red-400"
                      : isOpen
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-gray-500 dark:text-gray-400"
              }`}
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>

          <FiChevronDown
              className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
              }`}
          />

          <AnimatePresence>
            {isOpen && (
                <motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-30 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto
                 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400
                 outline outline-2 outline-offset-2 outline-indigo-500 dark:outline-indigo-400"
                >
                  {options.map((option) => (
                      <li
                          key={option.value}
                          onClick={() => handleSelect(option.value)}
                          className={`px-4 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 flex items-center
                     ${
                              value === option.value
                                  ? "bg-indigo-100 dark:bg-indigo-500"
                                  : ""
                          }`}
                      >
                        {option.icon && (
                            <option.icon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                        )}
                        {option.label}
                        {value === option.value && (
                            <FiCheck className="ml-auto w-5 h-5 text-indigo-500 dark:text-indigo-200" />
                        )}
                      </li>
                  ))}
                </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {error && (
              <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 dark:text-red-400 text-xs mt-2 ml-1 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                  />
                </svg>
                {error}
              </motion.p>
          )}
        </AnimatePresence>
      </div>
  );
};

// Feedback Page Component
const FeedbackPage = () => {
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
  const [submittedFeedback, setSubmittedFeedback] = useState([]);
  const formRef = useRef(null);

  const feedbackTypes = [
    { value: "general", label: "General Feedback", icon: FaRegComment },
    { value: "bug", label: "Bug Report", icon: FaBug },
    { value: "feature", label: "Feature Request", icon: FiPlus },
    { value: "ui", label: "UI/UX Feedback", icon: FiMonitor },
    { value: "performance", label: "Performance Issue", icon: FiBarChart },
    { value: "event", label: "Event Feedback", icon: FiCalendar },
    { value: "other", label: "Other", icon: FiMoreHorizontal },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    // Email validation
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Feedback type validation
    if (!formData.feedbackType || formData.feedbackType === "") {
      newErrors.feedbackType = "Please select a feedback type";
    }

    // Message validation
    if (!formData.message || !formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    // Rating validation
    if (!formData.rating || formData.rating === 0) {
      newErrors.rating = "Please provide a rating";
    }

    setErrors(newErrors);

    // Log for debugging
    if (Object.keys(newErrors).length > 0) {
      console.log("Validation errors:", newErrors);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name, { value, label, icon }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      [`${name}Label`]: label,
      [`${name}Icon`]: icon,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRatingChange = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors((prev) => ({ ...prev, rating: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Force validation
    const isValid = validateForm();

    if (!isValid) {
      // Shake animation for invalid form
      if (formRef.current) {
        formRef.current.classList.add("animate-shake");
        setTimeout(() => {
          formRef.current?.classList.remove("animate-shake");
        }, 500);
      }

      // Show error toast
      showToast("Please fill in all required fields correctly", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Store feedback in component state instead of localStorage
      const payload = {
        name: formData.name?.trim(),
        email: formData.email?.trim(),
        message: formData.message?.trim(),
        feedbackType: formData.feedbackType,
        rating: formData.rating,
        submittedAt: new Date().toISOString(),
      };

      // Add to state
      setSubmittedFeedback((prev) => [...prev, payload]);

      // Log submission (for debugging)
      console.log("Feedback submitted:", payload);
      console.log("All feedback:", [...submittedFeedback, payload]);

      showToast(
          "Thank you for your feedback! We've received your submission and will review it shortly",
          "success"
      );

      setFormData({
        name: "",
        email: "",
        feedbackType: "",
        message: "",
        rating: 0,
      });
      setErrors({});
      setIsSubmitting(false);
    } catch (error) {
      showToast(
          "There was an error submitting your feedback. Please try again.",
          "error"
      );
      setIsSubmitting(false);
    }
  };

  return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <AnimatePresence>
          {toast && (
              <Toast
                  message={toast.message}
                  type={toast.type}
                  onClose={() => setToast(null)}
              />
          )}
        </AnimatePresence>

        <div className="max-w-4xl w-full mx-auto">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
          >
            <div className="md:flex">
              <div className="md:w-3/5 lg:w-2/5 bg-gradient-to-br from-indigo-700 to-purple-600 text-white p-12 flex flex-col justify-between rounded-3xl shadow-xl backdrop-blur-lg">
                <div>
                  <h2 className="text-4xl font-extrabold mb-6 tracking-wide">
                    Share Your Feedback
                  </h2>
                  <p className="mb-8 text-lg opacity-90 leading-relaxed">
                    Your feedback helps us improve Eventra and create better
                    experiences for our community. We value your input!
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-center p-4 bg-white bg-opacity-10 rounded-2xl hover:bg-white hover:bg-opacity-20 transition duration-300 ease-in-out">
                      <div className="bg-white bg-opacity-20 p-3 rounded-full mr-5 flex items-center justify-center">
                        <FiMessageSquare className="w-7 h-7 text-white" />
                      </div>
                      <div className="overflow-hidden max-w-full">
                        <p className="font-semibold text-white">Quick Response</p>
                        <p className="text-sm opacity-80">
                          We review all feedback within 24 hours
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-white bg-opacity-10 rounded-2xl hover:bg-white hover:bg-opacity-20 transition duration-300 ease-in-out">
                      <div className="bg-white bg-opacity-20 p-3 rounded-full mr-5 flex items-center justify-center">
                        <FiStar className="w-7 h-7 text-white" />
                      </div>
                      <div className="overflow-hidden max-w-full">
                        <p className="font-semibold text-white">
                          Anonymous Option
                        </p>
                        <p className="text-sm opacity-80">
                          Share feedback anonymously if preferred
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center p-4 bg-white bg-opacity-10 rounded-2xl hover:bg-white hover:bg-opacity-20 transition duration-300 ease-in-out">
                      <div className="bg-white bg-opacity-20 p-3 rounded-full mr-5 flex items-center justify-center">
                        <FiCheckCircle className="w-7 h-7 text-white" />
                      </div>
                      <div className="overflow-hidden max-w-full">
                        <p className="font-semibold text-white">Action Taken</p>
                        <p className="text-sm opacity-80">
                          We implement improvements based on feedback
                        </p>
                      </div>
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

                <CustomFloatingSelect
                  id="feedbackType"
                  label="Feedback Type"
                  value={formData.feedbackType}
                  onChange={handleSelectChange}
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

                  <FloatingInput
                      id="name"
                      label="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      icon={FiUser}
                      required={true}
                  />
                  <FloatingInput
                      id="email"
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      icon={FiMail}
                      required={true}
                  />
                  <CustomFloatingSelect
                      id="feedbackType"
                      label="Feedback Type"
                      value={formData.feedbackType}
                      onChange={handleSelectChange}
                      options={feedbackTypes}
                      error={errors.feedbackType}
                      icon={FiMessageSquare}
                      required={true}
                  />
                  <div className="relative mt-6">
                    <div className="relative">
                      <FiMessageSquare className="absolute left-4 top-4 text-gray-400 dark:text-gray-500 w-5 h-5 z-10" />
                      <textarea
                          id="message"
                          name="message"
                          rows="4"
                          value={formData.message}
                          onChange={handleChange}
                          className={`w-full px-4 pl-14 pt-6 pb-2 border-2 rounded-xl focus:ring-4 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300 resize-none ${
                              errors.message
                                  ? "border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30"
                                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-100 dark:focus:ring-indigo-900/30"
                          }`}
                      ></textarea>
                      <label
                          htmlFor="message"
                          className={`absolute left-14 pointer-events-none transition-all duration-200 ease-out ${
                              formData.message
                                  ? "top-2 text-xs font-medium"
                                  : "top-4 text-sm"
                          } ${
                              errors.message
                                  ? "text-red-500 dark:text-red-400"
                                  : formData.message
                                      ? "text-indigo-600 dark:text-indigo-400"
                                      : "text-gray-500 dark:text-gray-400"
                          }`}
                      >
                        Your Message <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <AnimatePresence>
                      {errors.message && (
                          <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="text-red-500 dark:text-red-400 text-xs mt-2 ml-1 flex items-center gap-1"
                          >
                            <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                              <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                              />
                            </svg>
                            {errors.message}
                          </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <StarRating
                      rating={formData.rating}
                      onRatingChange={handleRatingChange}
                      error={errors.rating}
                  />

                  <div className="mt-6">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 transition-all duration-300"
                    >
                      {isSubmitting && (
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
                      )}
                      {isSubmitting ? "Submitting..." : "Submit Feedback"}
                    </motion.button>
                  </div>
                </form>
            </div>
          </motion.div>
        </div>

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