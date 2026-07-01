import { apiUtils, API_ENDPOINTS } from "../../config/api";
import { Star, MessageSquare } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, FileText, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import SEOHead from "../../components/SEOHead";
import { useTranslation } from "react-i18next";

import useReducedMotion from "../../hooks/useReducedMotion.js";
const FloatingField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  required = true,
  error,
  icon: Icon,
  as = "input",
  rows = 4,
  autoComplete,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isTextArea = as === "textarea";
  const hasValue = Boolean(value?.trim());
  const isActive = isFocused || hasValue;
  const FieldElement = isTextArea ? "textarea" : "input";

  return (
    <div className="space-y-1">
      <div
        className={`relative rounded-xl border bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm transition-all duration-200 ${error
            ? "border-red-400 bg-red-50/40 dark:border-red-500 dark:bg-red-950/20"
            : hasValue && !isFocused
              ? "border-green-400 dark:border-green-500"
              : isActive
                ? "border-indigo-500 dark:border-indigo-400 shadow-[0_0_0_4px_rgba(99,102,241,0.16)] dark:shadow-[0_0_0_4px_rgba(99,102,241,0.22)]"
                : "border-slate-200/90 dark:border-slate-700/90 hover:border-indigo-300 dark:hover:border-indigo-500/70"
          }`}
      >
        {Icon && (
          <Icon
            className={`pointer-events-none absolute left-4 h-5 w-5 text-slate-400 transition-colors duration-300 ${isTextArea ? "top-5" : "top-1/2 -translate-y-1/2"
              } ${error
                ? "text-red-500 dark:text-red-400"
                : isActive
                  ? "text-indigo-500 dark:text-indigo-300"
                  : ""
              }`}
          />
        )}
        <label
          htmlFor={id}
          className={`pointer-events-none absolute z-10 origin-left transition-all duration-300 ${isActive
              ? "left-3 -top-2 rounded-md bg-white/95 px-2 text-xs font-semibold text-indigo-600 dark:bg-gray-900/95 dark:text-indigo-300"
              : isTextArea
                ? "left-11 top-5 text-sm text-slate-500 dark:text-slate-400"
                : "left-11 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400"
            } ${error ? "text-red-500 dark:text-red-400" : ""}`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <FieldElement
          id={id}
          name={id}
          type={isTextArea ? undefined : type}
          rows={isTextArea ? rows : undefined}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-required={required}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`block w-full appearance-none border-0 bg-transparent text-slate-900 outline-none shadow-none ring-0 transition-colors duration-200 placeholder-transparent focus:border-0 focus:outline-none focus:ring-0 dark:text-slate-100 ${isTextArea
              ? "min-h-[152px] resize-y pl-11 pr-4 pt-7 pb-4 leading-relaxed"
              : "h-14 pl-11 pr-4 pt-5 pb-2"
            }`}
        />
      </div>
      {error && (
        <motion.p
          id={`${id}-error`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="ml-1 mt-1 flex items-center gap-1.5 text-sm text-red-500 dark:text-red-400"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </motion.p>
      )}
    </div>
  );
};

const ContactUsInner = () => {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = t("validation.nameRequired");
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t("validation.nameMinLength");
    } else if (!/^[A-Za-z\s]+$/.test(formData.name)) {
      newErrors.name = t("validation.nameLettersOnly");
    }

    // Email validation (unchanged)
    if (!formData.email.trim()) {
      newErrors.email = t("validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("validation.emailValid");
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = t("validation.subjectRequired");
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = t("validation.subjectMinLength");
    } else if (!/[a-zA-Z]{2,}/.test(formData.subject)) {
      newErrors.subject = t("validation.subjectMeaningful");
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = t("validation.messageRequired");
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t("validation.messageMinLength");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Shake animation for invalid form
      if (formRef.current) {
        formRef.current.classList.add("animate-shake");
        setTimeout(() => {
          if (formRef.current) {
            formRef.current.classList.remove("animate-shake");
          }
        }, 500);
      }
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    try {
  await apiUtils.post(API_ENDPOINTS.CONTACT, {
    name: formData.name,
    email: formData.email,
    subject: formData.subject,
    message: formData.message,
  });
  toast.success(t("contactUs.toastSuccess"));

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch {
      toast.error(t("contactUs.toastError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pastel-grid-bg min-h-screen bg-white bg-linear-to-r from-slate-900 to-black hover:from-black hover:to-slate-800 shadow-xl shadow-black/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-4xl w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
          // AOS Implementation on main card
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-once="true"
          // UPDATED: Card background and border
          className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
        >
          <div className="md:flex gap-0">
            <div
              className="md:w-3/5 lg:w-2/5 bg-linear-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-12 flex flex-col justify-between rounded-3xl shadow-xl backdrop-blur-lg"
              data-aos="fade-right"
              data-aos-duration="1000"
              data-aos-anchor=".ContactUs"
            >
              <div>
                <h2
                  className="text-4xl font-extrabold mb-6 tracking-wide"
                  style={{ fontFamily: '"Anton", sans-serif' }}
                >
                  {t("contactUs.heroHeading")}
                </h2>
                <p className="mb-8 text-lg text-slate-100/95 leading-relaxed">
                  {t("contactUs.heroDescription")}
                </p>

                <div className="space-y-6">
                  {/* Email */}
                  <div
                    className="flex items-start gap-4 p-4 bg-white/12 rounded-2xl border border-white/15 shadow-lg shadow-slate-950/20 transition duration-300 ease-in-out hover:bg-white/18 sm:items-center"
                    data-aos="zoom-in"
                    data-aos-delay="200"
                  >
                    <div className="flex items-center justify-center rounded-full bg-white/20 p-3 shrink-0">
                      <svg
                        className="w-7 h-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        ></path>
                      </svg>
                    </div>
                    <div className="min-w-0 overflow-hidden break-words max-w-full">
                      <p className="font-semibold text-white">{t("contactUs.infoEmailTitle")}</p>
                      <p className="text-sm font-medium text-slate-100/90 break-all max-w-full leading-snug">
                        {t("contactUs.infoEmailValue")}
                      </p>
                    </div>
                  </div>

                  {/* Quick Response */}
                  <div
                    className="flex items-start gap-4 p-4 bg-white/12 rounded-2xl border border-white/15 shadow-lg shadow-slate-950/20 transition duration-300 ease-in-out hover:bg-white/18 sm:items-center"
                    data-aos="zoom-in"
                    data-aos-delay="300"
                  >
                    <div className="flex items-center justify-center rounded-full bg-white/20 p-3 shrink-0">
                      <MessageSquare className="w-7 h-7 text-white" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 overflow-hidden max-w-full">
                      <p className="font-semibold text-white">{t("contactUs.infoQuickResponseTitle")}</p>
                      <p className="text-sm text-slate-100/90 leading-snug">
                        {t("contactUs.infoQuickResponseDescription")}
                      </p>
                    </div>
                  </div>

                  {/* Multiple Channels */}
                  <div
                    className="flex items-start gap-4 p-4 bg-white/12 rounded-2xl border border-white/15 shadow-lg shadow-slate-950/20 transition duration-300 ease-in-out hover:bg-white/18 sm:items-center"
                    data-aos="zoom-in"
                    data-aos-delay="400"
                  >
                    <div className="flex items-center justify-center rounded-full bg-white/20 p-3 shrink-0">
                      <Star className="w-7 h-7 text-white" />
                    </div>
                    <div className="min-w-0 overflow-hidden max-w-full">
                      <p className="font-semibold text-white">
                        {t("contactUs.infoMultipleChannelsTitle")}
                      </p>
                      <p className="text-sm text-slate-100/90 leading-snug">
                        {t("contactUs.infoMultipleChannelsDescription")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="md:w-3/5 p-6 sm:p-8 lg:p-10"
              // AOS Implementation for form
              data-aos="fade-left"
              data-aos-duration="1000"
              data-aos-anchor=".ContactUs"
            >
              <div className="mx-auto mb-8 max-w-md text-center">
                <h2
                  className="text-3xl font-extrabold text-gray-900 dark:text-gray-100"
                  style={{ fontFamily: '"Anton", sans-serif' }}
                >
                  {t("contactUs.formHeading")}
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {t("contactUs.formSubtitle")}
                </p>
              </div>

              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="space-y-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-800/25 sm:p-6"
              >
                <div className="space-y-5">
                  <FloatingField
                    id="name"
                    label={t("contactUs.formName")}
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    icon={User}
                    autoComplete="name"
                  />

                  <FloatingField
                    id="email"
                    label={t("contactUs.formEmail")}
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    icon={Mail}
                    autoComplete="email"
                  />
                </div>

                <FloatingField
                  id="subject"
                  label={t("contactUs.formSubject")}
                  value={formData.subject}
                  onChange={handleChange}
                  error={errors.subject}
                  icon={FileText}
                  autoComplete="off"
                />

                <FloatingField
                  id="message"
                  label={t("contactUs.formMessage")}
                  as="textarea"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  error={errors.message}
                  icon={MessageSquare}
                  autoComplete="off"
                />

                <div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full overflow-hidden rounded-xl border border-slate-300/25 bg-linear-to-r from-slate-800 via-slate-900 to-indigo-900 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/35 transition-all duration-300 hover:from-slate-700 hover:via-slate-800 hover:to-indigo-800 hover:shadow-slate-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-80 dark:border-slate-600/40 dark:focus-visible:ring-offset-gray-900"
                  >
                    {isSubmitting ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white mx-auto"
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
                    {isSubmitting ? t("contactUs.formSending") : t("contactUs.formSendMessage")}
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

const ContactUs = () => {
  const { t } = useTranslation();
  return (
    <>
      <SEOHead
        title={t("contactUs.pageTitle")}
        description={t("contactUs.pageDescription")}
        url={typeof window !== "undefined" ? window.location.href : ""}
      />
      <ContactUsInner />
    </>
  );
};

export default ContactUs;
