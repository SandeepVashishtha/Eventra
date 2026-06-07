import { BarChart, Calendar, Check, CheckCircle, ChevronDown, Mail, MessageSquare, Monitor, MoreHorizontal, Plus, Star, User, Bug } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import { toast } from "react-toastify";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { analyzeSentiment, getSentimentDisplay } from "../../utils/sentiment.js";
import { useTranslation } from "react-i18next";

// Star Rating Component
const StarRating = ({ rating, onRatingChange, error }) => {
  const { t } = useTranslation();
  useReducedMotion();
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
        className={`block text-sm font-medium mb-3 ${error
            ? "text-red-500 dark:text-red-400"
            : "text-gray-700 dark:text-gray-300"
          }`}
        initial={false}
        animate={{ opacity: 1 }}
      >
        {t("feedback.starRatingLabel")}
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
            title={`Click to rate ${star} star${star > 1 ? "s" : ""
              } (click again to deselect)`}
          >
            <Star
              className={`w-8 h-8 transition-colors duration-200 ${star <= (hoveredRating || rating)
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
            {rating === 1 && t("feedback.starRatingLabels.1")}
            {rating === 2 && t("feedback.starRatingLabels.2")}
            {rating === 3 && t("feedback.starRatingLabels.3")}
            {rating === 4 && t("feedback.starRatingLabels.4")}
            {rating === 5 && t("feedback.starRatingLabels.5")}
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
          className={`w-full px-4 pt-6 pb-2 border-2 rounded-xl focus:ring-4 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300 ${Icon ? "pl-14" : ""
            } ${error
              ? "border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30"
              : hasValue && !isFocused
                ? "border-green-400 dark:border-green-500"
                : isFocused
                  ? "border-indigo-500 dark:border-indigo-400 focus:ring-indigo-100 dark:focus:ring-indigo-900/30"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
        />
        <label
          htmlFor={id}
          className={`absolute ${Icon ? "left-14" : "left-4"
            } pointer-events-none transition-all duration-200 ease-out ${isFocused || hasValue
              ? "top-2 text-xs font-medium"
              : "top-1/2 -translate-y-1/2 text-sm"
            } ${error
              ? "text-red-500 dark:text-red-400"
              : isFocused
                ? "text-black dark:text-white"
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
  }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const hasValue = value && value.length > 0;
  const selectedOption = options.find((opt) => opt.value === value);
  const selectedLabel = selectedOption ? selectedOption.label : "";
  const selectedIcon = selectedOption ? selectedOption.icon : MessageSquare;

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

        <button
          type="button"
          id={id}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full text-left px-4 pt-6 pb-2 border-2 rounded-xl focus:ring-4 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300 ${selectedIcon ? "pl-12" : "pl-4"
            } pr-12 ${error
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
          className={`absolute left-14 pointer-events-none transition-all duration-200 ease-out ${isOpen || hasValue
              ? "top-2 text-xs font-medium"
              : "top-1/2 -translate-y-1/2 text-sm"
            } ${error
              ? "text-red-500 dark:text-red-400"
              : isOpen
                ? "text-black dark:text-white"
                : "text-gray-500 dark:text-gray-400"
            }`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <ChevronDown
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none transition-transform duration-300 ${isOpen ? "rotate-180" : ""
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
                     ${value === option.value
                      ? "bg-indigo-100 dark:bg-indigo-500"
                      : ""
                    }`}
                >
                  {option.icon && (
                    <option.icon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                  )}
                  {option.label}
                  {value === option.value && (
                    <Check className="ml-auto w-5 h-5 text-sky-300 dark:text-sky-200" />
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
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  useDocumentTitle(t("feedback.pageTitle"))
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedbackType: "",
    message: "",
    rating: 0,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);  
  const [sentimentScore, setSentimentScore] = useState(0);

  useEffect(() => {
    const handler = setTimeout(() => {
      const score = analyzeSentiment(formData.message);
      setSentimentScore(score);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [formData.message]);

  const formRef = useRef(null);
  const feedbackTypes = [
    { value: "general", label: t("feedback.feedbackTypes.general"), icon: MessageSquare },
    { value: "bug", label: t("feedback.feedbackTypes.bug"), icon: Bug },
    { value: "feature", label: t("feedback.feedbackTypes.feature"), icon: Plus },
    { value: "ui", label: t("feedback.feedbackTypes.uiux"), icon: Monitor },
    { value: "performance", label: t("feedback.feedbackTypes.performance"), icon: BarChart },
    { value: "event", label: t("feedback.feedbackTypes.event"), icon: Calendar },
    { value: "other", label: t("feedback.feedbackTypes.other"), icon: MoreHorizontal },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = t("validation.feedbackNameRequired");
    } else if (formData.name.trim().length < 3) {
      newErrors.name = t("validation.feedbackNameMinLength");
    }

    // Email validation
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = t("validation.feedbackEmailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = t("validation.feedbackEmailValid");
    }

    // Feedback type validation
    if (!formData.feedbackType || formData.feedbackType === "") {
      newErrors.feedbackType = t("validation.feedbackTypeRequired");
    }

    // Message validation
    if (!formData.message || !formData.message.trim()) {
      newErrors.message = t("validation.feedbackMessageRequired");
    } else if (formData.message.trim().length < 20) {
      newErrors.message = t("validation.feedbackMessageMinLength");
    }

    // Rating validation
    if (!formData.rating || formData.rating === 0) {
      newErrors.rating = t("validation.feedbackRatingRequired");
    }

    setErrors(newErrors);


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
      toast.error(t("feedback.toastValidationError"));
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Store feedback in component state instead of localStorage


      toast.success(t("feedback.toastSuccess"));

      setFormData({
        name: "",
        email: "",
        feedbackType: "",
        message: "",
        rating: 0,
      });
      setSentimentScore(0);
      setErrors({});
      setIsSubmitting(false);
    } catch {
      toast.error(t("feedback.toastError"));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pastel-grid-bg min-h-screen bg-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-6xl w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
          className="bg-card-bg shadow-2xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
        >
          {/* FIXED FLEX LAYOUT */}
          <div className="md:flex">

            {/* LEFT SECTION */}
            <div className="md:w-2/5 bg-slate-900 text-white p-12 flex flex-col justify-between">
              <div>
                <h2
                  className="text-4xl font-extrabold mb-6 tracking-wide"
                  style={{ fontFamily: '"Anton", sans-serif' }}
                >
                  {t("feedback.heroHeading")}
                </h2>

                <p className="mb-8 text-lg opacity-90 leading-relaxed">
                  {t("feedback.heroDescription")}
                </p>

                <div className="space-y-6">

                  {/* CARD 1 */}
                  <div className="flex items-center p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition duration-300">
                    <div className="bg-white/20 p-3 rounded-full mr-5 flex items-center justify-center">
                      <MessageSquare className="w-7 h-7 text-white" />
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        {t("feedback.infoQuickResponseTitle")}
                      </p>

                      <p className="text-sm opacity-80">
                        {t("feedback.infoQuickResponseDescription")}
                      </p>
                    </div>
                  </div>

                  {/* CARD 2 */}
                  <div className="flex items-center p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition duration-300">
                    <div className="bg-white/20 p-3 rounded-full mr-5 flex items-center justify-center">
                      <Star className="w-7 h-7 text-white" />
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        {t("feedback.infoAnonymousTitle")}
                      </p>

                      <p className="text-sm opacity-80">
                        {t("feedback.infoAnonymousDescription")}
                      </p>
                    </div>
                  </div>

                  {/* CARD 3 */}
                  <div className="flex items-center p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition duration-300">
                    <div className="bg-white/20 p-3 rounded-full mr-5 flex items-center justify-center">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>

                    <div>
                      <p className="font-semibold text-white">
                        {t("feedback.infoActionTakenTitle")}
                      </p>

                      <p className="text-sm opacity-80">
                        {t("feedback.infoActionTakenDescription")}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="md:w-3/5 p-10">
              <div className="text-center mb-8">
                <h2
                  className="text-3xl font-extrabold text-gray-900 dark:text-gray-100"
                  style={{ fontFamily: '"Anton", sans-serif' }}
                >
                  {t("feedback.formHeading")}
                </h2>

                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {t("feedback.formSubtitle")}
                </p>
              </div>

              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="space-y-6"
              >

                <FloatingInput
                  id="name"
                  label={t("feedback.formName")}
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  icon={User}
                  required={true}
                />

                <FloatingInput
                  id="email"
                  label={t("feedback.formEmail")}
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  icon={Mail}
                  required={true}
                />

                <CustomFloatingSelect
                  id="feedbackType"
                  label={t("feedback.formFeedbackType")}
                  value={formData.feedbackType}
                  onChange={handleSelectChange}
                  options={feedbackTypes}
                  error={errors.feedbackType}
                  required={true}
                />

                {/* MESSAGE */}
                <div className="relative mt-6">
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 text-gray-400 dark:text-gray-500 w-5 h-5 z-10" />

                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      maxLength={500}
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full px-4 pl-14 pt-6 pb-2 border-2 rounded-xl focus:ring-4 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-300 resize-none ${errors.message
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30"
                          : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30"
                        }`}
                    />

                    <label
                      htmlFor="message"
                      className={`absolute left-14 pointer-events-none transition-all duration-200 ease-out ${formData.message
                          ? "top-2 text-xs font-medium"
                          : "top-4 text-sm"
                        } ${errors.message
                          ? "text-red-500"
                          : formData.message
                            ? "text-black dark:text-white"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                    >
                      {t("feedback.formMessage")}
                    </label>
                  </div>

                  {/* Character Counter & Animated Bar Meter */}
                  {(() => {
                    const messageLength = formData.message ? formData.message.length : 0;
                    const MAX_MESSAGE_LENGTH = 500;
                    const progressPercent = Math.min((messageLength / MAX_MESSAGE_LENGTH) * 100, 100);
                    
                    return (
                      <div className="mt-2.5 space-y-1.5">
                        {/* Animated Bar Meter */}
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full transition-all duration-300 ${
                              messageLength === 0
                                ? "bg-gray-300 dark:bg-gray-700"
                                : messageLength < 20
                                ? "bg-yellow-500 dark:bg-yellow-400"
                                : messageLength >= 400
                                ? "bg-amber-500 dark:bg-amber-400"
                                : "bg-green-500 dark:bg-green-400"
                            }`}
                            style={{ width: `${progressPercent}%` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                          />
                        </div>

                        <div className="flex justify-between items-start gap-3 text-xs">
                          {/* Warning/Helper Message */}
                          <span
                            className={`font-medium transition-colors duration-300 flex-1 leading-relaxed ${
                              messageLength === 0
                                ? "text-gray-500 dark:text-gray-400"
                                : messageLength < 20
                                ? "text-yellow-600 dark:text-yellow-400"
                                : messageLength >= 400
                                ? messageLength === MAX_MESSAGE_LENGTH
                                  ? "text-red-500 dark:text-red-400 font-semibold animate-pulse"
                                  : "text-amber-600 dark:text-amber-400"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          >
                            {messageLength === 0 && t("feedback.charCountMin")}
                            {messageLength > 0 && messageLength < 20 && t("feedback.charCountRemaining", { count: 20 - messageLength })}
                            {messageLength >= 20 && messageLength < 400 && t("feedback.charCountExcellent")}
                            {messageLength >= 400 && messageLength < MAX_MESSAGE_LENGTH && t("feedback.charCountApproaching")}
                            {messageLength === MAX_MESSAGE_LENGTH && t("feedback.charCountLimit")}
                          </span>

                          {/* Character Counter */}
                          <span className={`font-mono shrink-0 text-gray-500 dark:text-gray-400 ${messageLength === MAX_MESSAGE_LENGTH ? "text-red-500 dark:text-red-400 font-bold" : ""}`}>
                            {messageLength} / {MAX_MESSAGE_LENGTH}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {errors.message && (
                    <p className="text-red-500 text-xs mt-2 ml-1">
                      {errors.message}
                    </p>
                  )}

                  {/* Live Sentiment Indicator */}
                  {formData.message && formData.message.trim().length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-3.5 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between transition-colors duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <motion.span
                          className="text-3xl inline-block"
                          animate={prefersReducedMotion ? {} : {
                            rotate: sentimentScore > 1.5 ? [0, 10, -10, 10, 0] : 0,
                            scale: sentimentScore < -1.5 ? [1, 1.05, 0.95, 1] : 1
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: sentimentScore > 1.5 || sentimentScore < -1.5 ? Infinity : 0,
                            repeatType: "reverse"
                          }}
                        >
                          {getSentimentDisplay(sentimentScore).emoji}
                        </motion.span>
                        <div>
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {t("feedback.sentimentLabel", { sentiment: getSentimentDisplay(sentimentScore).label })}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {t("feedback.sentimentSubtitle")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full text-gray-600 dark:text-gray-300">
                          {sentimentScore > 0 ? `+${sentimentScore}` : sentimentScore}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* STAR RATING */}
                <StarRating
                  rating={formData.rating}
                  onRatingChange={handleRatingChange}
                  error={errors.rating}
                />

                {/* SUBMIT BUTTON */}
                <div className="mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-75 transition-all duration-300"
                  >
                    {isSubmitting && (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isSubmitting ? t("feedback.formSubmitting") : t("feedback.formSubmit")}
                  </motion.button>
                </div>

              </form>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FeedbackPage;
