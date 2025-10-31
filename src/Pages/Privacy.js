import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaLock,
  FaUserShield,
  FaDatabase,
  FaGlobe,
  FaEnvelope,
  FaShieldAlt,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

export const Privacy = () => {
  const controls = useAnimation();
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  useEffect(() => {
    controls.start("show");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [controls]);

  const policySections = [
    {
      icon: <FaDatabase className="text-indigo-600 text-3xl" />,
      title: "Information We Collect",
      content:
        "We may collect personal details such as your name, email address, organization details, event information, payment details, and any other information you provide through our platform. As part of our event management services, we may also collect attendee information, ticketing data, and event analytics on behalf of event organizers.",
    },
    {
      icon: <FaUserShield className="text-indigo-600 text-3xl" />,
      title: "How We Use Your Information",
      content:
        "The data we collect is used to provide and manage our event management services, process event registrations and ticket purchases, enable event check-ins with QR code technology, generate analytics and reports for event organizers, improve your experience on the platform, provide support and respond to your queries, and send important updates or notifications about events.",
    },
    {
      icon: <FaLock className="text-indigo-600 text-3xl" />,
      title: "Data Protection",
      content:
        "We implement enterprise-grade security measures to protect your data, including end-to-end encryption and SOC 2 compliant practices. However, no digital platform can guarantee 100% security. As an open-source platform, our codebase is transparent and available for security review by the community.",
    },
    {
      icon: <FaShieldAlt className="text-indigo-600 text-3xl" />,
      title: "Third-Party Sharing",
      content:
        "We do not share your personal information with third parties without your explicit consent, except as required to provide our services (e.g., payment processors) or as required by law. Event organizers may have access to attendee information for their events, but we require them to comply with applicable privacy laws.",
    },
    {
      icon: <FaGlobe className="text-indigo-600 text-3xl" />,
      title: "International Data Transfers",
      content:
        "As a global platform serving users in 195+ countries, your information may be processed outside of your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.",
    },
    {
      icon: <FaEnvelope className="text-indigo-600 text-3xl" />,
      title: "Your Rights & Consent",
      content:
        "You have the right to access, correct, or delete your personal information. You can also object to processing of your personal data, ask us to restrict processing, or request portability of your personal data. By using our website and services, you consent to our Privacy Policy.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {" "}
        {/* Increased horizontal width */}
        {/* Header Section */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={controls}
          className="text-center"
        >
          <motion.h1
            variants={item}
            className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-5xl mb-4"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            variants={item}
            className="text-xl text-gray-600 dark:text-gray-400"
          >
            Your privacy is important to us. Learn how we protect your data and
            your rights.
          </motion.p>
        </motion.div>
        {/* Intro Section */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={controls}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-md"
        >
          <p className="text-lg text-gray-800 dark:text-gray-200">
            At{" "}
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              Eventra
            </span>
            , we are committed to protecting your personal information and your
            right to privacy. As an open-source event management platform, we
            value transparency in how we handle your data.
          </p>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you use our event management
            platform and services.
          </p>
        </motion.div>
        {/* Policy Sections */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {policySections.map((section, index) => (
            <motion.div
              key={index}
              variants={item}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden group hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-purple-50 dark:from-indigo-900/40 dark:via-purple-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full flex items-center justify-between p-8 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 rounded-t-2xl"
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-gray-700 rounded-xl text-indigo-600 dark:text-indigo-400 text-2xl mr-4">
                      {section.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {section.title}
                    </h2>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {openSections[index] ? (
                      <FaChevronUp className="text-indigo-600 dark:text-indigo-400 text-lg" />
                    ) : (
                      <FaChevronDown className="text-indigo-600 dark:text-indigo-400 text-lg" />
                    )}
                  </div>
                </button>

                <motion.div
                  initial={false}
                  animate={{
                    height: openSections[index] ? "auto" : 0,
                    opacity: openSections[index] ? 1 : 0,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                  }}
                  className="overflow-hidden"
                >
                  <div className="px-8 pb-8">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        {/* Additional Info Section */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={controls}
          className="bg-indigo-50 dark:bg-gray-800 rounded-2xl border border-indigo-100 dark:border-gray-700 p-8 shadow-md"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Policy Updates
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            We may update our privacy practices. Changes will be posted on this
            page with a revised date. For significant changes, we will notify
            you through email or a prominent notice on our website.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Last updated:</strong>{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </motion.div>
        {/* Contact Section */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={controls}
          className="bg-gray-900 rounded-2xl p-8 text-center relative overflow-hidden shadow-md"
        >
          <div className="absolute inset-0">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-4">
              Have Questions?
            </h3>
            <p className="text-indigo-200 mb-6">
              If you have any questions or concerns about this policy, we're
              here to help.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
