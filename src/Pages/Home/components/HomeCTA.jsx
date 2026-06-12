import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <div className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-950 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200/50 dark:border-slate-800/80 overflow-hidden">
      {/* Main CTA Section */}
      <section className="relative max-w-6xl mx-auto py-16 sm:py-20 px-6 sm:px-12 rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-indigo-500/5">
        {/* Soft Background Orbs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-pink-500/10 dark:bg-pink-500/5 blur-3xl pointer-events-none" />

        {/* CTA Content Wrapper */}
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Tag-style subheading */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl px-4 py-1.5 justify-center mx-auto mb-6 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-semibold">
              Innovate Ideas, Build Projects, Join Events
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight"
          >
            Ignite Ideas,{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              Connect Innovators
            </span>
          </motion.h2>

          {/* Description paragraph */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg mb-10 leading-relaxed"
          >
            Participate in hackathons, showcase your projects, and collaborate
            with creators around the world. Eventra makes it effortless, fun,
            and inspiring.
          </motion.p>

          {/* Buttons container */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-10"
          >
            <Link
              to="/hackathons"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all duration-300 ease-out"
            >
              <Users className="w-5 h-5" />
              Explore Hackathons
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-800 shadow-md hover:scale-[1.02] transition-all duration-300 ease-out"
            >
              Know us better
              <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            </Link>
          </motion.div>

          {/* Last line */}
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-slate-500 dark:text-slate-500 text-xs sm:text-sm font-medium"
          >
            Connect, create, and grow with your community today.
          </motion.p>
        </div>
      </section>
    </div>
  );
}
