import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <div className="bg-white dark:bg-black py-12 px-6 lg:px-16 ">
      {/* Main CTA Section */}
      <section className="relative py-16 bg-gray-50 dark:bg-slate-900/50 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm">
        {/* CTA Content Wrapper */}
        <div className="relative z-[50] max-w-7xl mx-auto text-center px-6">
          {/* Tag-style subheading */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 rounded-full px-5 py-2 justify-center mx-auto mb-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
              Innovate Ideas, Build Projects, Join Events
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-300 dark:to-white mb-6"
          >
            Ignite Ideas, Connect Innovators
          </motion.h2>

          {/* Description paragraph */}
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg mb-10 leading-relaxed"
          >
            Participate in hackathons, showcase your projects, and collaborate
            with creators around the world. Eventra makes it effortless, fun,
            and inspiring.
          </motion.p>

          {/* Buttons container */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-6 mb-12"
          >
            {/* --------------------------
                Explore Events Button
                Uses ArrowRight icon
            -------------------------- */}
            <Link
              to="/hackathons"
              className="inline-flex items-center justify-center gap-2 z-[50] bg-blue-600 dark:bg-blue-500 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 dark:hover:bg-blue-400 hover:scale-105 hover:shadow-blue-500/50 transition-all duration-300 ease-out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <path d="M20 8v6" />
                <path d="M23 11h-6" />
              </svg>
              Explore Hackathons
              <ArrowRight className="w-5 h-5 ml-1" />
            </Link>

            {/* --------------------------
                Host Your Event Button
              Uses Sparkles icon
            -------------------------- */}
            <Link
              to="/about"
              className="inline-flex items-center justify-center z-[50] gap-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-8 py-3.5 rounded-full font-semibold shadow-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 hover:scale-105 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 ease-out"
            >
              Know us better
              <Sparkles className="w-5 h-5 text-blue-500" />
            </Link>
          </motion.div>

          {/* Last line */}
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-gray-500 dark:text-gray-500 text-sm font-medium"
          >
            Connect, create, and grow with your community today.
          </motion.p>
        </div>
      </section>
    </div>
  );
}
