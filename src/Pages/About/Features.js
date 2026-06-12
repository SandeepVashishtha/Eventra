import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, QrCode, TrendingUp, Users, Lock, Globe, ArrowRight } from "lucide-react";

// 🎯 Safe: Extracted common classes to avoid repetition
const ICON_CLASSES = "text-indigo-500 dark:text-indigo-400 w-6 h-6";
const CARD_BASE_CLASSES =
  "relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500 dark:focus-within:ring-indigo-400";
const HEADING_CLASSES =
  "text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight";
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
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

// 🎯 Safe: Feature data with accessibility-friendly structure
const features = [
  {
    icon: <Star className={ICON_CLASSES} aria-hidden="true" />,
    title: "Smart Event Creation",
    stat: "90% faster setup",
    description:
      "Launch events in minutes with intelligent templates, automatic capacity management, and integrated ticketing. Full support for workshops, conferences, meetups, and specialized events.",
    cta: "Start Creating",
    link: "/events",
    enabled: true,
  },
  {
    icon: <QrCode className={ICON_CLASSES} aria-hidden="true" />,
    title: "Instant QR Check-ins",
    stat: "3 sec check-in",
    description:
      "Lightning-fast attendee check-ins with QR codes that work offline. Real-time attendance tracking and automated no-show management keep your events running smoothly.",
    cta: "See Demo",
    link: "#",
    enabled: false,
  },
  {
    icon: <TrendingUp className={ICON_CLASSES} aria-hidden="true" />,
    title: "Live Analytics",
    stat: "15+ metrics",
    description:
      "Real-time dashboards showing registration trends, attendance patterns, and engagement insights. Make data-driven decisions that lead to consistently better events.",
    cta: "View Dashboard",
    link: "#",
    enabled: false,
  },
  {
    icon: <Users className={ICON_CLASSES} aria-hidden="true" />,
    title: "Team Collaboration",
    stat: "Unlimited members",
    description:
      "Invite co-organizers, assign specific roles, and coordinate effortlessly. Built-in communication tools and task management ensure seamless teamwork.",
    cta: "Add Team",
    link: "#",
    enabled: false,
  },
  {
    icon: <Lock className={ICON_CLASSES} aria-hidden="true" />,
    title: "Enterprise Security",
    stat: "Bank-level security",
    description:
      "SOC 2 compliant with end-to-end encryption. Advanced privacy controls and full GDPR compliance for handling sensitive attendee data with complete confidence.",
    cta: "Learn More",
    link: "#",
    enabled: false,
  },
  {
    icon: <Globe className={ICON_CLASSES} aria-hidden="true" />,
    title: "Global Reach",
    stat: "195 countries",
    description:
      "Multi-timezone coordination, 30+ languages, and international payment processing. Host events anywhere in the world and welcome attendees from everywhere.",
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
      className="relative bg-white py-24 dark:bg-gray-900"
      // 🎯 Safe: Keep AOS for compatibility, but add aria-label for accessibility
      data-aos="fade-up"
      data-aos-duration="1000"
      data-aos-offset="200"
      aria-labelledby="features-heading"
    >
      {/* Decorative blobs - hidden from screen readers */}
      <div
        className="absolute top-0 left-0 h-72 w-72 animate-pulse rounded-full bg-indigo-200 opacity-30 mix-blend-multiply blur-3xl filter dark:bg-indigo-900/40 dark:mix-blend-normal"
        aria-hidden="true"
      />
      <div
        className="absolute right-0 bottom-0 h-72 w-72 animate-pulse rounded-full bg-blue-400 opacity-30 mix-blend-multiply blur-3xl filter dark:bg-blue-900/40 dark:mix-blend-normal"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading Section */}
        <motion.div variants={container} {...animationProps} className="mb-20 text-center">
          <motion.h2 id="features-heading" variants={item} className={HEADING_CLASSES}>
            Features That Power Every Event
          </motion.h2>
          <motion.p variants={item} className={DESCRIPTION_CLASSES}>
            From creation to check-ins, analytics, and collaboration — Eventra has everything you
            need to host seamless events worldwide.
          </motion.p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={container}
          {...animationProps}
          className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3"
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
              <div className="flex items-center justify-between bg-gradient-to-r from-gray-100 to-white px-6 py-4 dark:from-gray-700/50 dark:to-gray-800/50">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-md dark:bg-gray-700"
                  aria-hidden="true"
                >
                  {feature.icon}
                </div>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                  {feature.stat}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {feature.title}
                </h3>
                <p className="mb-4 text-gray-600 dark:text-gray-400">{feature.description}</p>

                {/* 🎯 Safe: Unified CTA handling with accessibility */}
                {feature.enabled ? (
                  <Link
                    to={feature.link}
                    className="group flex items-center rounded text-sm font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    aria-label={`${feature.cta} - ${feature.title}`}
                  >
                    {feature.cta}
                    <ArrowRight
                      className="ml-2 h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                ) : (
                  <span
                    className="flex cursor-not-allowed items-center text-sm font-medium text-gray-400 opacity-70 dark:text-gray-500"
                    title="Coming soon"
                    role="text"
                    aria-disabled="true"
                  >
                    {feature.cta}
                    <ArrowRight className="ml-2 h-4 w-4 opacity-50" aria-hidden="true" />
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
