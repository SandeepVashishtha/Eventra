import { motion } from "framer-motion";
import { HelpCircle, LifeBuoy, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function FAQCTA() {
  // Variants for breathing animation
  const breathe = {
    animate: {
      scale: [1, 1.15, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
    },
  };

  // Small background blobs config
  const blobs = Array.from({ length: 8 }, (_, i) => ({
    color: [
      "from-purple-400/30 via-pink-400/20 to-indigo-500/10",
      "from-teal-400/30 via-cyan-400/20 to-blue-500/10",
      "from-pink-400/25 via-purple-400/15 to-indigo-400/10",
    ][i % 3],
    top: `${Math.random() * 80}%`,
    left: `${Math.random() * 90}%`,
    size: Math.random() * 32 + 16, // 16-48px
    blur: Math.random() * 40 + 20, // 20-60px
  }));

  return (
    <section className="relative bg-gradient-to-tr from-[#0C0C1F] via-[#1A1F36] to-[#0B1E2E] py-16 px-8 sm:px-12 lg:px-20 overflow-hidden m-8 rounded-3xl">
      {/* Main blobs */}
      <motion.div
        className="absolute top-10 left-[-40px] w-36 h-36 rounded-full blur-3xl bg-gradient-to-tr from-purple-500 via-pink-500/50 to-indigo-500/20"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 360] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-[-40px] w-44 h-44 rounded-full blur-3xl bg-gradient-to-br from-teal-400/70 via-cyan-400/60 to-blue-500/10"
        animate={{ scale: [1, 1.08, 1], rotate: [0, -360] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/3 w-28 h-28 rounded-full blur-xl bg-gradient-to-tr from-pink-400/50 via-purple-400/20 to-indigo-500/10"
        animate={{ scale: [0.9, 1.05, 0.9] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Small breathing blobs */}
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-[${blob.blur}px] bg-gradient-to-tr ${blob.color}`}
          style={{
            width: `${blob.size}px`,
            height: `${blob.size}px`,
            top: blob.top,
            left: blob.left,
          }}
          variants={breathe}
          animate="animate"
        />
      ))}

      <div className="relative max-w-6xl mx-auto text-center m-4">
        {/* Tag */}
        <motion.div
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-1 mb-8 justify-center mx-auto border border-white/20"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <HelpCircle className="w-5 h-5 text-white/90" />
          <span className="text-white/90 text-sm tracking-wider font-medium">
            Got Questions? We’ve Got Answers!
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h2
          className="text-4xl sm:text-5xl font-extrabold text-white mb-12 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Everything You Need to Know
        </motion.h2>

        {/* Glass cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Card 1 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-4 shadow-md hover:shadow-lg hover:bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-indigo-500/10 transition-all duration-300"
          >
            <LifeBuoy className="w-10 h-10 text-purple-400" />
            <h3 className="text-white font-semibold text-lg text-center">
              <Link
                to="/faq"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Browse FAQs
              </Link>
            </h3>
            <p className="text-white/70 text-sm text-center">
              Quickly find answers to common questions about our platform.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-4 shadow-md hover:shadow-lg hover:bg-gradient-to-br from-teal-400/20 via-cyan-400/20 to-blue-500/10 transition-all duration-300"
          >
            <MessageCircle className="w-10 h-10 text-teal-400" />
            <h3 className="text-white font-semibold text-lg text-center">
              <Link to="/contact">Contact Support</Link>
            </h3>
            <p className="text-white/70 text-sm text-center">
              Reach out to our team for personalized assistance.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-4 shadow-md hover:shadow-lg hover:bg-gradient-to-br from-pink-400/20 via-purple-400/20 to-indigo-500/10 transition-all duration-300"
          >
            <HelpCircle className="w-10 h-10 text-pink-400" />
            <h3 className="text-white font-semibold text-lg text-center">
              <Link to="/feedback">Give Feedback</Link>
            </h3>
            <p className="text-white/70 text-sm text-center">
              Help us improve by sharing your thoughts and suggestions.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
