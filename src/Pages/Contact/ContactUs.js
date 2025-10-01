import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaLinkedin, FaDiscord } from "react-icons/fa";
import { User, Mail, Phone, FileText, MessageSquare } from "lucide-react";


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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
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
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative mt-6">
      {Icon && (
        <Icon className="absolute left-3 top-4 text-gray-400 w-5 h-5 pointer-events-none" />
      )}
      <motion.label
        htmlFor={id}
        className={`absolute transition-all duration-300 ${
          isFocused || value
            ? "top-0 text-xs text-indigo-600 dark:text-indigo-400 font-medium"
            : "top-4 text-sm text-gray-500 dark:text-gray-400"
        } ${error ? "text-red-500 dark:text-red-400" : ""}`}
        initial={false}
        animate={{
          y: isFocused || value ? -20 : 0,
          scale: isFocused || value ? 0.85 : 1,
          left: isFocused || value ? "0.75rem" : "2.5rem", 
          transformOrigin: "left",
        }}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </motion.label>

      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full py-3 pl-10 pr-4 border rounded-lg focus:ring-2 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
          error
            ? "border-red-500 focus:ring-red-200"
            : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-200 dark:focus:ring-indigo-900/50"
        }`}
      />
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


// Contact Us Page Component

const socialLinks = [
  {
    name: "GitHub",
    icon: <FaGithub className="w-5 h-5" />,
    href: "https://github.com/SandeepVashishtha/Eventra",
  },
  {
    name: "LinkedIn",
    icon: <FaLinkedin className="w-5 h-5" />,
    href: "https://www.linkedin.com/in/sandeepvashishtha/",
  },
];

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const formRef = useRef(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

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
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success toast
      setToast({
        message:
          "Your message has been sent successfully! We'll get back to you soon.",
        type: "success",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setToast({
        message: "There was an error sending your message. Please try again.",
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
  const [isFocused, setIsFocused] = useState(false);
  return (
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
                <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
                <p className="mb-6 opacity-90">
                  Have questions about our events platform? We're here to help
                  and would love to hear from you.
                </p>

                <div className="space-y-4 mt-10">
                  <div className="flex items-center">
                    <div className="bg-white bg-opacity-20 p-2 rounded-full mr-4">
                      <svg
                        className="w-6 h-6"
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
                    <div>
                      <p className="font-medium">Email Us</p>
                      <p className="text-sm opacity-80">
                        sandeepvashishtha@outlook.in
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="font-medium mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  {socialLinks.map(({ name, icon, href }) => (
                    <motion.a
                      key={name}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -3 }}
                      className="bg-white bg-opacity-20 p-2 rounded-full"
                    >
                      <span className="sr-only">{name}</span>
                      {icon}
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:w-3/5 p-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                  Send us a Message
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  We typically respond within 24 hours
                </p>
              </div>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <FloatingInput
                  id="name"
                  label="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  icon={User}
                />

                <FloatingInput
                  id="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  icon={Mail}
                />        

                <FloatingInput
                  id="subject"
                  label="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  error={errors.subject}
                  icon={FileText}
                />

                <div className="relative mt-6">
                  <MessageSquare className="absolute left-3 top-4 text-gray-400 w-5 h-5 pointer-events-none" />
                  <motion.label
                    htmlFor="message"
                    className={`absolute left-10 transition-all duration-300 ${
                      isFocused || formData.message
                        ? "top-0 text-xs text-indigo-600 dark:text-indigo-400 font-medium"
                        : "top-4 text-sm text-gray-500 dark:text-gray-400"
                    } ${errors.message ? "text-red-500 dark:text-red-400" : ""}`}
                    initial={false}
                    animate={{
                      y: isFocused || formData.message ? -20 : 0,
                      scale: isFocused || formData.message ? 0.85 : 1,
                      left: isFocused || formData.message ? "0.75rem" : "2.5rem", 
                      transformOrigin: "left",
                    }}
                  >
                    Your Message <span className="text-red-500">*</span>
                  </motion.label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`w-full py-3 pl-10 pr-4 border rounded-lg focus:ring-2 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                      errors.message
                        ? "border-red-500 focus:ring-red-200"
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
                    {isSubmitting ? "Sending..." : "Send Message"}
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

export default ContactUs;
