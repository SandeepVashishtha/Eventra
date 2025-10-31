import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaRocket,
  FaQrcode,
  FaChartLine,
  FaUsers,
  FaLock,
  FaGlobe,
  FaArrowRight,
} from "react-icons/fa";

// Animation Variants
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

// UPDATED: Icon classNames now include dark mode variants
const features = [
  {
    icon: <FaRocket className="text-indigo-500 dark:text-indigo-400 text-2xl" />,
    title: "Smart Event Creation",
    stat: "90% faster setup",
    description: "Launch events in minutes with intelligent templates, automatic capacity management, and integrated ticketing. Full support for workshops, conferences, meetups, and specialized events.",
    cta: "Start Creating",
  },
  {
    icon: <FaQrcode className="text-indigo-500 dark:text-indigo-400 text-2xl" />,
    title: "Instant QR Check-ins",
    stat: "3 sec check-in",
    description: "Lightning-fast attendee check-ins with QR codes that work offline. Real-time attendance tracking and automated no-show management keep your events running smoothly.",
    cta: "See Demo",
  },
  {
    icon: <FaChartLine className="text-indigo-500 dark:text-indigo-400 text-2xl" />,
    title: "Live Analytics",
    stat: "15+ metrics",
    description: "Real-time dashboards showing registration trends, attendance patterns, and engagement insights. Make data-driven decisions that lead to consistently better events.",
    cta: "View Dashboard",
  },
  {
    icon: <FaUsers className="text-indigo-500 dark:text-indigo-400 text-2xl" />,
    title: "Team Collaboration",
    stat: "Unlimited members",
    description: "Invite co-organizers, assign specific roles, and coordinate effortlessly. Built-in communication tools and task management ensure seamless teamwork.",
    cta: "Add Team",
  },
  {
    icon: <FaLock className="text-indigo-500 dark:text-indigo-400 text-2xl" />,
    title: "Enterprise Security",
    stat: "Bank-level security",
    description: "SOC 2 compliant with end-to-end encryption. Advanced privacy controls and full GDPR compliance for handling sensitive attendee data with complete confidence.",
    cta: "Learn More",
  },
  {
    icon: <FaGlobe className="text-indigo-500 dark:text-indigo-400 text-2xl" />,
    title: "Global Reach",
    stat: "195 countries",
    description: "Multi-timezone coordination, 30+ languages, and international payment processing. Host events anywhere in the world and welcome attendees from everywhere.",
    cta: "Go Global",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      // UPDATED: Section background
      className="relative py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-gray-900"
      // AOS Implementation
      data-aos="fade-up"
      data-aos-duration="1000"
      data-aos-offset="200"
    >
      {/* UPDATED: Decorative blobs for dark mode */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-200 dark:bg-indigo-900/40 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-400 dark:bg-blue-900/40 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-pulse"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        {/* Heading */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="text-center mb-20"
        >
          {/* UPDATED: Text colors */}
          <motion.h2
            variants={item}
            className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight"
          >
            Features That Power Every Event
          </motion.h2>
          <motion.p
            variants={item}
            className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            From creation to check-ins, analytics, and collaboration — Eventra
            has everything you need to host seamless events worldwide.
          </motion.p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ y: -6, scale: 1.03 }}
              // AOS Implementation
              data-aos="flip-up"
              data-aos-delay={index * 100}
              // UPDATED: Card background and border
              className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              {/* Top Banner */}
              {/* UPDATED: Banner gradient, icon wrapper, and stat tag */}
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-50 dark:from-gray-700/50 to-purple-50 dark:to-gray-800/50">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 shadow-md">
                  {feature.icon}
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  {feature.stat}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* UPDATED: Text colors */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{feature.description}</p>

                {/* UPDATED: Link colors */}
                {feature.cta === "Start Creating" ? (
                  <Link
                    to="/events"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm flex items-center group"
                  >
                    {feature.cta}
                    <FaArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                ) : (
                  <a
                    href="#"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium text-sm flex items-center group"
                  >
                    {feature.cta}
                    <FaArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}