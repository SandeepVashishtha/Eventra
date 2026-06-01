import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaStar,
  FaQrcode,
  FaChartLine,
  FaUsers,
  FaLock,
  FaGlobe,
  FaArrowRight,
} from "react-icons/fa";

// 🎯 Safe: Extracted common classes to avoid repetition
const ICON_CLASSES = "text-indigo-500 dark:text-indigo-400 text-2xl";
const CARD_BASE_CLASSES = "relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500 dark:focus-within:ring-indigo-400";
const HEADING_CLASSES = "text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight";
const DESCRIPTION_CLASSES = "mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto";

// 🎯 Safe: Animation variants (unchanged logic, just organized)
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.7, ease: "easeOut" } 
  },
};

// 🎯 Safe: Feature data with accessibility-friendly structure
const features = [
  {
    icon: <FaStar className={ICON_CLASSES} aria-hidden="true" />,
    title: "Smart Event Creation",
    stat: "90% faster setup",
    description: "Launch events in minutes with intelligent templates, automatic capacity management, and integrated ticketing. Full support for workshops, conferences, meetups, and specialized events.",
    cta: "Start Creating",
    link: "/events",
    enabled: true,
  },
  {
    icon: <FaQrcode className={ICON_CLASSES} aria-hidden="true" />,
    title: "Instant QR Check-ins",
    stat: "3 sec check-in",
    description: "Lightning-fast attendee check-ins with QR codes that work offline. Real-time attendance tracking and automated no-show management keep your events running smoothly.",
    cta: "See Demo",
    link: "#",
    enabled: false,
  },
  {
    icon: <FaChartLine className={ICON_CLASSES} aria-hidden="true" />,
    title: "Live Analytics",
    stat: "15+ metrics",
    description: "Real-time dashboards showing registration trends, attendance patterns, and engagement insights. Make data-driven decisions that lead to consistently better events.",
    cta: "View Dashboard",
    link: "#",
    enabled: false,
  },
  {
    icon: <FaUsers className={ICON_CLASSES} aria-hidden="true" />,
    title: "Team Collaboration",
    stat: "Unlimited members",
    description: "Invite co-organizers, assign specific roles, and coordinate effortlessly. Built-in communication tools and task management ensure seamless teamwork.",
    cta: "Add Team",
    link: "#",
    enabled: false,
  },
  {
    icon: <FaLock className={ICON_CLASSES} aria-hidden="true" />,
    title: "Enterprise Security",
    stat: "Bank-level security",
    description: "SOC 2 compliant with end-to-end encryption. Advanced privacy controls and full GDPR compliance for handling sensitive attendee data with complete confidence.",
    cta: "Learn More",
    link: "#",
    enabled: false,
  },
  {
    icon: <FaGlobe className={ICON_CLASSES} aria-hidden="true" />,
    title: "Global Reach",
    stat: "195 countries",
    description: "Multi-timezone coordination, 30+ languages, and international payment processing. Host events anywhere in the world and welcome attendees from everywhere.",
    cta: "Go Global",
    link: "#",
    enabled: false,
  },
];

export default function Features() {
  // 🎯 Safe: Respect user's motion preferences
  const shouldReduceMotion = useReducedMotion();
  
  const animationProps = shouldReduceMotion 
    ? { initial: false, animate: "visible" } 
    : { initial: "hidden", animate: "visible" };

  return (
    <section
      id="features"
      className="relative py-24 bg-white dark:bg-gray-900"
      // 🎯 Safe: Keep AOS for compatibility, but add aria-label for accessibility
      data-aos="fade-up"
      data-aos-duration="1000"
      data-aos-offset="200"
      aria-labelledby="features-heading"
    >
      {/* Decorative blobs - hidden from screen readers */}
      <div 
        className="absolute top-0 left-0 w-72 h-72 bg-indigo-200 dark:bg-indigo-900/40 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-pulse"
        aria-hidden="true"
      />
      <div 
        className="absolute bottom-0 right-0 w-72 h-72 bg-blue-400 dark:bg-blue-900/40 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-pulse"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        {/* Heading Section */}
        <motion.div
          variants={container}
          {...animationProps}
          className="text-center mb-20"
        >
          <motion.h2
            id="features-heading"
            variants={item}
            className={HEADING_CLASSES}
          >
            Features That Power Every Event
          </motion.h2>
          <motion.p
            variants={item}
            className={DESCRIPTION_CLASSES}
          >
            From creation to check-ins, analytics, and collaboration — Eventra
            has everything you need to host seamless events worldwide.
          </motion.p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={container}
          {...animationProps}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
          role="list"
        >
          {features.map((feature, index) => (
            <motion.article
              key={index}
              variants={item}
              whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.03 }}
              data-aos="flip-up"
              data-aos-delay={index * 100}
              className={CARD_BASE_CLASSES}
              role="listitem"
            >
              {/* Top Banner */}
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-100 dark:from-gray-700/50 to-white dark:to-gray-800/50">
                <div 
                  className="w-12 h-12 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 shadow-md"
                  aria-hidden="true"
                >
                  {feature.icon}
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  {feature.stat}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {feature.description}
                </p>

                {/* 🎯 Safe: Unified CTA handling with accessibility */}
                {feature.enabled ? (
                  <Link
                    to={feature.link}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                    aria-label={`${feature.cta} - ${feature.title}`}
                  >
                    {feature.cta}
                    <FaArrowRight 
                      className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" 
                      aria-hidden="true"
                    />
                  </Link>
                ) : (
                  <span
                    className="text-gray-400 dark:text-gray-500 font-medium text-sm flex items-center cursor-not-allowed opacity-70"
                    title="Coming soon"
                    role="text"
                    aria-disabled="true"
                  >
                    {feature.cta}
                    <FaArrowRight 
                      className="ml-2 w-4 h-4 opacity-50" 
                      aria-hidden="true"
                    />
                  </span>
                )}
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}