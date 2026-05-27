import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiBriefcase, FiAward, FiMessageSquare, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { toast } from "react-toastify";
import { API_ENDPOINTS, apiUtils } from "../config/api";
import { useAuth } from "../context/AuthContext";

import {
  isAlreadyRegistered,
  saveRegistration,
} from "../utils/registerUtils";
import FieldError from "../components/common/FieldError";

const getRegistrationErrorMessage = (error) => {
  const message =
    error?.data?.message ||
    error?.data?.error ||
    error?.message ||
    "";

  if (
    error?.status === 409 ||
    /duplicate|already registered|conflict/i.test(message)
  ) {
    return "This email is already registered for this event.";
  }

  return message || "Something went wrong. Please try again.";
};

const RegistrationPage = () => {
  useDocumentTitle("Eventra | Registration");
  const navigate = useNavigate();
  const { id: eventId = "general" } = useParams();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    designation: "",
    additionalInfo: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Full name check
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Name must be at least 3 characters";
    }

    // Email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone check
    const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, submit: "" }));

    try {
      // Show a fast pre-check hint using the local cache, but always proceed
      // to the API call so the server remains the authoritative duplicate guard.
      if (isAlreadyRegistered(eventId, formData.email)) {
        setErrors((prev) => ({
          ...prev,
          submit: "You have already registered with this email address.",
        }));
        // Do not return here -- fall through to the API call so the server can
        // confirm. The server's 409 will be caught below if it rejects.
      }

      await apiUtils.post(
        API_ENDPOINTS.EVENTS.REGISTER(eventId),
        formData,
        // Pass the in-memory token explicitly so this protected write does not
        // depend on a stale or missing sessionStorage read.
        token
      );

      saveRegistration(eventId, formData.email);
      setSubmitSuccess(true);
      setErrors((prev) => ({ ...prev, submit: "" }));
      toast.success("Registration successful!");
    } catch (error) {
      const registrationErrorMessage = getRegistrationErrorMessage(error);

      setErrors((prev) => ({
        ...prev,
        submit: registrationErrorMessage,
      }));

      if (/already registered|duplicate|conflict/i.test(registrationErrorMessage)) {
        toast.error(registrationErrorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleCancel = () => {
    // Navigate back to the previous page
    navigate(-1);
  };

  if (submitSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gradient-to-br from-indigo-50/30 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="max-w-md w-full text-center p-8 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-500/30 dark:border-emerald-500/20 shadow-2xl rounded-3xl"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full">
              <FiCheckCircle className="text-5xl" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">Registration Successful!</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            Thank you for registering, <span className="font-semibold">{formData.fullName}</span>. Your spot has been confirmed. Check your dashboard for event details and updates.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-105"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate("/")}
              className="py-3 px-6 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold rounded-2xl transition-colors duration-300"
            >
              Back to Home
            </button>
            <button
              onClick={() => window.print()}
              className="print-hide flex items-center justify-center gap-2 py-3 px-6 border border-gray-300 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-300"
              aria-label="Print or save as PDF"
            >
              🖨️ Print / Save as PDF
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300 overflow-y-auto flex items-start sm:items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl rounded-3xl p-4 sm:p-6 md:p-10 relative overflow-hidden my-4"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
            Register for this Event
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm sm:text-base">
            Secure your spot now! Fields marked with an asterisk (<span className="text-rose-500 font-bold">*</span>) are mandatory.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Global API Submission Error Feedback Banner */}
            <AnimatePresence>
              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-2xl text-sm"
                >
                  <FiAlertCircle className="text-xl flex-shrink-0" />
                  <span>{errors.submit}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <FiUser className="text-indigo-500 dark:text-indigo-400" />
                <span>Full Name</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full bg-white/80 dark:bg-slate-950/80 border ${
                    errors.fullName ? "border-rose-500 ring-rose-500/20" : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400"
                  } p-3.5 rounded-2xl text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10 transition-all duration-300`}
                  required
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
              </div>
              <FieldError id="fullName-error" message={errors.fullName} />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <FiMail className="text-indigo-500 dark:text-indigo-400" />
                <span>Email Address</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full bg-white/80 dark:bg-slate-950/80 border ${
                  errors.email ? "border-rose-500 ring-rose-500/20" : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400"
                } p-3.5 rounded-2xl text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10 transition-all duration-300`}
                required
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              <FieldError id="email-error" message={errors.email} />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <FiPhone className="text-indigo-500 dark:text-indigo-400" />
                <span>Phone Number</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full bg-white/80 dark:bg-slate-950/80 border ${
                  errors.phone ? "border-rose-500 ring-rose-500/20" : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400"
                } p-3.5 rounded-2xl text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10 transition-all duration-300`}
                required
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
              <FieldError id="phone-error" message={errors.phone} />
            </div>

            {/* Organization */}
            <div>
              <label htmlFor="organization" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <FiBriefcase className="text-indigo-500 dark:text-indigo-400" />
                <span>Organization <span className="text-xs text-slate-400 font-normal">(Optional)</span></span>
              </label>
              <input
                id="organization"
                name="organization"
                type="text"
                placeholder="Your company or institution"
                value={formData.organization}
                onChange={handleChange}
                className="w-full bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400 p-3.5 rounded-2xl text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10 transition-all duration-300"
              />
            </div>

            {/* Designation */}
            <div>
              <label htmlFor="designation" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <FiAward className="text-indigo-500 dark:text-indigo-400" />
                <span>Designation <span className="text-xs text-slate-400 font-normal">(Optional)</span></span>
              </label>
              <input
                id="designation"
                name="designation"
                type="text"
                placeholder="Your job title or role"
                value={formData.designation}
                onChange={handleChange}
                className="w-full bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400 p-3.5 rounded-2xl text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10 transition-all duration-300"
              />
            </div>

            {/* Additional Info */}
            <div>
              <label htmlFor="additionalInfo" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <FiMessageSquare className="text-indigo-500 dark:text-indigo-400" />
                <span>Additional Information <span className="text-xs text-slate-400 font-normal">(Optional)</span></span>
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                placeholder="Any special requirements or questions?"
                value={formData.additionalInfo}
                onChange={handleChange}
                className="w-full bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400 p-3.5 rounded-2xl text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/10 transition-all duration-300 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-3.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Complete Registration"
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistrationPage;
