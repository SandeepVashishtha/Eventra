import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
  return (
    <div className="bg-white dark:bg-black py-12 px-6 lg:px-16">
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
          <motion.h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
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
            {/* Explore Events Button */}
            <a
              href="#hackathons"
              className="inline-flex items-center gap-2 z-[50] bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-lg font-semibold shadow-sm transition-all duration-200 ease-out"
            >
              Explore Hackathons
              <ArrowRight className="w-5 h-5" />
            </a>

            {/* Host Your Event Button */}
            <a
              href="about"
              className="inline-flex items-center z-[50] gap-2 bg-transparent border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 px-8 py-3.5 rounded-lg font-semibold shadow-sm transition-all duration-200 ease-out"
            >
              Know us better
              <Sparkles className="w-5 h-5" />
            </a>
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
