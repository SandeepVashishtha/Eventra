import {
  Lock,
  ShieldCheck,
  Database,
  Globe,
  Mail,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";

export const Privacy = () => {
  useDocumentTitle("Eventra | Privacy Policy");
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
      icon: <Database className="text-3xl text-sky-300" />,
      title: "Information We Collect",
      content:
        "We may collect personal details such as your name, email address, organization details, event information, payment details, and any other information you provide through our platform. As part of our event management services, we may also collect attendee information, ticketing data, and event analytics on behalf of event organizers.",
    },
    {
      icon: <ShieldCheck className="text-3xl text-emerald-300" />,
      title: "How We Use Your Information",
      content:
        "The data we collect is used to provide and manage our event management services, process event registrations and ticket purchases, enable event check-ins with QR code technology, generate analytics and reports for event organizers, improve your experience on the platform, provide support and respond to your queries, and send important updates or notifications about events.",
    },
    {
      icon: <Lock className="text-3xl text-amber-300" />,
      title: "Data Protection",
      content:
        "We implement enterprise-grade security measures to protect your data, including end-to-end encryption and SOC 2 compliant practices. However, no digital platform can guarantee 100% security. As an open-source platform, our codebase is transparent and available for security review by the community.",
    },
    {
      icon: <Shield className="text-3xl text-rose-300" />,
      title: "Third-Party Sharing",
      content:
        "We do not share your personal information with third parties without your explicit consent, except as required to provide our services (e.g., payment processors) or as required by law. Event organizers may have access to attendee information for their events, but we require them to comply with applicable privacy laws.",
    },
    {
      icon: <Globe className="text-3xl text-teal-300" />,
      title: "International Data Transfers",
      content:
        "As a global platform serving users in 195+ countries, your information may be processed outside of your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this privacy policy.",
    },
    {
      icon: <Mail className="text-3xl text-violet-300" />,
      title: "Your Rights & Consent",
      content:
        "You have the right to access, correct, or delete your personal information. You can also object to processing of your personal data, ask us to restrict processing, or request portability of your personal data. By using our website and services, you consent to our Privacy Policy.",
    },
  ];

  return (
    <div className="bg-bg text-text min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-16">
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
            className="text-text mb-4 text-4xl font-extrabold sm:text-5xl"
            style={{ fontFamily: '"Anton", sans-serif' }}
          >
            Privacy Policy
          </motion.h1>
          <motion.p variants={item} className="text-text-light text-xl">
            Your privacy is important to us. Learn how we protect your data and your rights.
          </motion.p>
        </motion.div>
        {/* Intro Section */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={controls}
          className="bg-card-bg/80 border-border rounded-2xl border p-8 shadow-md backdrop-blur-lg"
        >
          <p className="text-text text-lg">
            At <span className="text-text font-bold">Eventra</span>, we are committed to protecting
            your personal information and your right to privacy. As an open-source event management
            platform, we value transparency in how we handle your data.
          </p>
          <p className="text-text-light mt-4">
            This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you use our event management platform and services.
          </p>
        </motion.div>
        {/* Policy Sections */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-1 items-start gap-8 md:grid-cols-2"
        >
          {policySections.map((section, index) => (
            <motion.div
              key={index}
              variants={item}
              className="bg-card-bg/80 border-border group hover:border-primary overflow-hidden rounded-2xl border shadow-md backdrop-blur-lg transition-colors duration-300"
            >
              <div className="from-primary/10 via-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

              <div className="relative z-10">
                <button
                  onClick={() => toggleSection(index)}
                  className="hover:bg-bg flex w-full items-center justify-between rounded-t-2xl p-8 text-left transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <div className="bg-bg mr-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl text-black dark:text-white">
                      {section.icon}
                    </div>
                    <h2 className="text-text text-2xl font-bold">{section.title}</h2>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {openSections[index] ? (
                      <ChevronUp className="text-lg text-black dark:text-white" />
                    ) : (
                      <ChevronDown className="text-lg text-black dark:text-white" />
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
                  {/* Added a structural wrapper div here to guarantee clear layout calculations */}
                  <div className="clear-both block w-full px-8 pb-8">
                    <p className="text-text-light text-base leading-relaxed antialiased md:text-lg">
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
          className="bg-card-bg border-border rounded-2xl border p-8 shadow-md"
        >
          <h3 className="text-text mb-4 text-2xl font-bold">Policy Updates</h3>
          <p className="text-text-light mb-4">
            We may update our privacy practices. Changes will be posted on this page with a revised
            date. For significant changes, we will notify you through email or a prominent notice on
            our website.
          </p>
          <p className="text-text-light">
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
          className="bg-card-bg border-border relative overflow-hidden rounded-2xl border p-8 text-center shadow-md"
        >
          <div className="relative z-10">
            <h3 className="text-text mb-4 text-2xl font-bold">Have Questions?</h3>
            <p className="text-text-light mb-6">
              If you have any questions or concerns about this policy, we&apos;re here to help.
            </p>
            <Link
              to="/contact"
              className="bg-primary inline-flex items-center rounded-xl px-6 py-3 font-medium text-white transition-colors duration-300 hover:opacity-90"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
