import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <div className="bg-white dark:bg-black py-8 sm:py-12 px-4 sm:px-6 lg:px-16">
      {/* Main CTA Section */}
      <section className="relative py-16 bg-gray-50 dark:bg-slate-900/50 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm">
        {/* CTA Content Wrapper */}
        <div className="relative z-[50] max-w-7xl mx-auto text-center px-6">
          {/* Tag-style subheading */}
          <motion.div className="inline-flex items-center gap-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 rounded-lg px-4 py-1.5 justify-center mx-auto mb-6 shadow-sm">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
              Innovate Ideas, Build Projects, Join Events
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Ignite Ideas, Connect Innovators
          </motion.h2>

          {/* Description paragraph */}
          <motion.p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-base mb-10">
            Participate in hackathons, showcase your projects, and collaborate
            with creators around the world. Eventra makes it effortless, fun,
            and inspiring.
          </motion.p>

          {/* Buttons container */}
          <motion.div className="flex flex-col sm:flex-row justify-center gap-6 mb-10">
            {/* --------------------------
                Explore Events Button
                Uses ArrowRight icon
            -------------------------- */}
            <Link
              to="/hackathons"
              className="inline-flex items-center gap-2 z-[50] bg-blue-100 dark:bg-blue-900 text-black dark:text-white px-8 py-3 rounded-full font-semibold shadow-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800 hover:scale-105 transition-all duration-300 ease-out"
            >
              Explore Hackathons
              <ArrowRight className="w-5 h-5" />
            </Link>

            {/* --------------------------
                Host Your Event Button
              Uses Sparkles icon
            -------------------------- */}
            <Link
              to="/about"
              className="inline-flex items-center z-[50] gap-2 bg-yellow-100 dark:bg-yellow-900 text-black dark:text-white px-8 py-3 rounded-full font-semibold shadow-lg border border-yellow-200 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-800 hover:scale-105 transition-all duration-300 ease-out"
            >
              Know us better
              <Sparkles className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Last line */}
          <motion.p className="text-gray-500 dark:text-gray-400 text-sm">
            Connect, create, and grow with your community today.
          </motion.p>
        </div>
      </section>
    </div>
  );
}
