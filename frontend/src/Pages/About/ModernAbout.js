import { motion } from "framer-motion";

// Framer Motion Variants
const container = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.2, duration: 0.6, ease: "easeOut" },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const cardItem = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function ModernAbout() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden py-32">
      {/* Animated Background Blobs */}
      <motion.div
        className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-100 rounded-full filter blur-3xl opacity-40"
        animate={{ scale: [1, 1.3, 1], rotate: [0, 45, 0] }}
        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-1/3 w-96 h-96 bg-pink-100 rounded-full filter blur-3xl opacity-30"
        animate={{ scale: [1, 1.2, 1], rotate: [0, -45, 0] }}
        transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
      />

      {/* Floating Orbs */}
      <motion.div
        className="absolute top-1/3 left-10 w-40 h-40 bg-purple-200 rounded-full filter blur-2xl opacity-20"
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-32 h-32 bg-blue-200 rounded-full filter blur-2xl opacity-25"
        animate={{ y: [0, 25, 0], x: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
      />

      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 via-transparent to-pink-50 opacity-60 animate-pulse" />

      {/* Soft Grid Pattern */}
      {/* Soft Grid Pattern with Fade */}
      <div className="absolute inset-0">
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.15)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Fade Overlay (top visible → bottom transparent) */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/30 via-white/70 to-white" />
      </div>

      {/* Main Content */}
      <div className="max-w-4xl text-center px-4 sm:px-6 lg:px-8 z-10">
        <motion.h1
          variants={item}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6"
        >
          About <span className="text-indigo-600">Us</span>
        </motion.h1>

        <motion.p
          variants={item}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-base sm:text-lg text-gray-600 mb-16"
        >
          Eventra is a comprehensive open-source platform that empowers
          communities, colleges, and organizations worldwide to create, manage,
          and track events effortlessly. Transform the way you plan, execute,
          and experience events with ease.
        </motion.p>

        {/* Modern Highlight Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          <motion.div
            variants={cardItem}
            className="bg-white rounded-2xl shadow-lg shadow-blue-100 p-6 hover:scale-105 transition-transform duration-500"
          >
            <h3 className="text-indigo-600 text-2xl font-bold mb-2">100+</h3>
            <p className="text-gray-600 text-sm">Events Managed</p>
          </motion.div>

          <motion.div
            variants={cardItem}
            className="bg-white rounded-2xl shadow-lg shadow-blue-100 p-6 hover:scale-105 transition-transform duration-500"
          >
            <h3 className="text-indigo-600 text-2xl font-bold mb-2">500+</h3>
            <p className="text-gray-600 text-sm">Active Users</p>
          </motion.div>

          <motion.div
            variants={cardItem}
            className="bg-white rounded-2xl shadow-lg shadow-blue-100 p-6 hover:scale-105 transition-transform duration-500"
          >
            <h3 className="text-indigo-600 text-2xl font-bold mb-2">Global</h3>
            <p className="text-gray-600 text-sm">Community Reach</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
