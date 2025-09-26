import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaRocket,
  FaQrcode,
  FaChartLine,
  FaUsers,
  FaLock,
  FaGlobe,
  FaBookOpen,
  FaUserFriends,
  FaChartBar,
  FaGlobeAmericas,
  FaCalendarAlt,
  FaArrowRight,
  FaGraduationCap,
  FaBriefcase,
  FaBuilding,
  FaBullseye,
  FaStar,
} from "react-icons/fa";
import ModernAbout from "./ModernAbout";
import MissionVision from "./MissionVision";
import Features from "./Features";
import AboutCTA from "./AboutCTA ";

const AboutPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <FaRocket className="text-indigo-600 text-3xl mb-4" />,
      title: "Smart Event Creation",
      stat: "90% faster setup",
      description:
        "Launch events in minutes with intelligent templates, automatic capacity management, and integrated ticketing. Full support for workshops, conferences, meetups, and specialized events.",
      cta: "Start Creating",
    },
    {
      icon: <FaQrcode className="text-indigo-600 text-3xl mb-4" />,
      title: "Instant QR Check-ins",
      stat: "3 sec check-in",
      description:
        "Lightning-fast attendee check-ins with QR codes that work offline. Real-time attendance tracking and automated no-show management keep your events running smoothly.",
      cta: "See Demo",
    },
    {
      icon: <FaChartLine className="text-indigo-600 text-3xl mb-4" />,
      title: "Live Analytics",
      stat: "15+ metrics",
      description:
        "Real-time dashboards showing registration trends, attendance patterns, and engagement insights. Make data-driven decisions that lead to consistently better events.",
      cta: "View Dashboard",
    },
    {
      icon: <FaUsers className="text-indigo-600 text-3xl mb-4" />,
      title: "Team Collaboration",
      stat: "Unlimited members",
      description:
        "Invite co-organizers, assign specific roles, and coordinate effortlessly. Built-in communication tools and task management ensure seamless teamwork.",
      cta: "Add Team",
    },
    {
      icon: <FaLock className="text-indigo-600 text-3xl mb-4" />,
      title: "Enterprise Security",
      stat: "Bank-level security",
      description:
        "SOC 2 compliant with end-to-end encryption. Advanced privacy controls and full GDPR compliance for handling sensitive attendee data with complete confidence.",
      cta: "Learn More",
    },
    {
      icon: <FaGlobe className="text-indigo-600 text-3xl mb-4" />,
      title: "Global Reach",
      stat: "195 countries",
      description:
        "Multi-timezone coordination, 30+ languages, and international payment processing. Host events anywhere in the world and welcome attendees from everywhere.",
      cta: "Go Global",
    },
  ];

  const targetUsers = [
    {
      icon: <FaUsers className="text-indigo-500 text-3xl mb-4" />,
      title: "Communities & Nonprofits",
      description:
        "Local groups, hobby clubs, and nonprofit organizations looking to engage their members and expand their reach through well-organized events.",
    },
    {
      icon: <FaGraduationCap className="text-indigo-500 text-3xl mb-4" />,
      title: "Educational Institutions",
      description:
        "Colleges, universities, and schools managing everything from orientation sessions and academic conferences to cultural festivals.",
    },
    {
      icon: <FaBriefcase className="text-indigo-500 text-3xl mb-4" />,
      title: "Professional Organizations",
      description:
        "Industry associations, startup communities, and professional networks hosting conferences, networking events, and skill-building workshops.",
    },
    {
      icon: <FaBuilding className="text-indigo-500 text-3xl mb-4" />,
      title: "Corporate Teams",
      description:
        "Companies organizing internal events, team building activities, product launches, and client appreciation gatherings.",
    },
  ];

  const whyChoose = [
    {
      icon: <FaBookOpen className="text-indigo-600 text-3xl mb-4" />,
      title: "Open Source Transparency",
      description:
        "Our code is open for inspection, contribution, and customization. No hidden algorithms or locked-in proprietary systems.",
    },
    {
      icon: <FaUserFriends className="text-indigo-600 text-3xl mb-4" />,
      title: "Community-Driven Development",
      description:
        "Built by event organizers, for event organizers. Every feature is designed based on real-world needs and feedback from active users.",
    },
    {
      icon: <FaChartBar className="text-indigo-600 text-3xl mb-4" />,
      title: "Scalable & Flexible",
      description:
        "Whether you're planning a 20-person workshop or a 5,000-attendee conference, Eventra adapts to your needs without breaking your budget.",
    },
    {
      icon: <FaGlobeAmericas className="text-indigo-600 text-3xl mb-4" />,
      title: "Global Yet Local",
      description:
        "International capabilities with deep understanding of local event management challenges and cultural considerations.",
    },
  ];

  const controls = useAnimation();

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

  const buttonItem = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.3,
      },
    },
  };

  useEffect(() => {
    controls.start("show");
  }, [controls]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <>
      <ModernAbout />
      <MissionVision />
      <Features />

      {/* Why Choose Eventra Section */}
      {/* UPDATED: Section background */}
      <section className="flex flex-col min-h-screen py-20 bg-gray-50 dark:bg-gray-900 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <motion.div
            variants={container}
            initial="hidden"
            animate={controls}
            className="text-center mb-16"
          >
            {/* UPDATED: Text colors */}
            <motion.h2
              variants={item}
              className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-4xl"
            >
              Why Choose Eventra
            </motion.h2>
            <motion.p
              variants={item}
              className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              Built with transparency, scalability, and community at our core
            </motion.p>
          </motion.div>

          {/* Alternating Cards */}
          <div className="space-y-12">
            {whyChoose.map((feature, index) => (
              <motion.div
                key={index}
                variants={item}
                whileHover={{
                  scale: 1.03,
                  y: -6,
                  boxShadow:
                    "0 12px 30px rgba(99,102,241,0.15), 0 8px 16px rgba(99,102,241,0.1)",
                }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                // UPDATED: Card background and border
                className={`flex flex-col md:flex-row items-center gap-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 p-10 shadow-md hover:shadow-2xl relative overflow-hidden group ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* UPDATED: Gradient glow background */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-purple-50 dark:from-indigo-900/40 dark:via-purple-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* UPDATED: Icon wrapper background and text color */}
                <div className="relative z-10 flex-shrink-0 w-20 h-20 flex items-center justify-center rounded-2xl bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 text-4xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* UPDATED: Text colors */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                    {feature.description}
                  </p>

                  {/* UPDATED: Link colors */}
                  <a
                    href="#"
                    className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 group-hover:underline transition-all"
                  >
                    Learn More
                    <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-200">
                      →
                    </span>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 💡 NOTE: This CTA Section is already dark by design and works well in both modes. No changes are needed. */}
      <AboutCTA></AboutCTA>
    </>
  );
};

export default AboutPage;
