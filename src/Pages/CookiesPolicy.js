import { Cookie, ShieldCheck, Settings, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";

export const CookiesPolicy = () => {
  useDocumentTitle("Eventra | Cookies Policy");
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
      icon: <Cookie className="text-amber-500 text-3xl" />,
      title: "What Are Cookies?",
      content:
        "Cookies are small text files stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site. At Eventra, we use cookies to enhance your experience, remember your preferences, and understand how you interact with our platform.",
    },
    {
      icon: <ShieldCheck className="text-emerald-500 text-3xl" />,
      title: "How We Use Cookies",
      content:
        "We use cookies for several reasons. Essential cookies are required for the platform to function correctly, such as keeping you logged in securely. Performance cookies help us understand how visitors interact with our website by collecting anonymous information. Functionality cookies allow the website to remember choices you make (like your language or region).",
    },
    {
      icon: <Settings className="text-slate-500 text-3xl" />,
      title: "Managing Your Cookies",
      content:
        "You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in your web browser controls. If you choose to reject cookies, you may still use our website, though your access to some functionality and areas of our website may be restricted.",
    },
    {
      icon: <Globe className="text-sky-500 text-3xl" />,
      title: "Third-Party Cookies",
      content:
        "In some special cases, we also use cookies provided by trusted third parties. This includes analytics providers (like Google Analytics) to help us understand site usage and improve our platform, as well as necessary integrations for event ticketing, payments, and social media sharing features.",
    },
  ];

  return (
    <div className="min-h-screen bg-bg text-text py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header Section */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={controls}
          className="text-center"
        >
          <motion.h1
            variants={item}
            className="text-4xl font-extrabold text-text sm:text-5xl mb-4"
            style={{ fontFamily: '\"Anton\", sans-serif' }}
          >
            Cookies Policy
          </motion.h1>
          <motion.p variants={item} className="text-xl text-text-light">
            Understand how we use cookies to improve your Eventra experience.
          </motion.p>
        </motion.div>

        {/* Intro Section */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={controls}
          className="bg-card-bg/80 backdrop-blur-lg rounded-2xl border border-border p-8 shadow-md"
        >
          <p className="text-lg text-text">
            At <span className="font-bold text-text">Eventra</span>, we believe in being clear and open about how we collect and use data related to you.
          </p>
          <p className="mt-4 text-text-light">
            This Cookies Policy explains what cookies are, how we use them, the types of cookies we use, and your choices regarding cookies.
          </p>
        </motion.div>

        {/* Policy Sections */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
        >
          {policySections.map((section, index) => (
            <motion.div
              key={index}
              variants={item}
              className="bg-card-bg/80 backdrop-blur-lg rounded-2xl border border-border shadow-md overflow-hidden group hover:border-primary transition-colors duration-300"
            >
              <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              <div className="relative z-10">
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full flex items-center justify-between p-8 text-left hover:bg-bg transition-colors duration-200 rounded-t-2xl"
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-bg rounded-xl text-black dark:text-white text-2xl mr-4">
                      {section.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-text">{section.title}</h2>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {openSections[index] ? (
                      <ChevronUp className="text-black dark:text-white text-lg" />
                    ) : (
                      <ChevronDown className="text-black dark:text-white text-lg" />
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
                  <div className="px-8 pb-8 w-full block clear-both">
                    <p className="text-text-light text-base md:text-lg leading-relaxed antialiased">
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
          className="bg-card-bg rounded-2xl border border-border p-8 shadow-md"
        >
          <h3 className="text-2xl font-bold text-text mb-4">Updates to This Policy</h3>
          <p className="text-text-light mb-4">
            We may update this Cookies Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this page regularly to stay informed about our use of cookies and related technologies.
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
          className="bg-card-bg rounded-2xl p-8 text-center relative overflow-hidden shadow-md border border-border"
        >
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-text mb-4">Still Have Questions?</h3>
            <p className="text-text-light mb-6">
              If you have any questions about our use of cookies or other technologies, please contact us.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 rounded-xl font-medium text-white bg-primary hover:opacity-90 transition-colors duration-300"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CookiesPolicy;
