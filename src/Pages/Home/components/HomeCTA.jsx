import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <div className="relative overflow-hidden border-t border-slate-200 bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8 dark:border-slate-800 dark:bg-slate-950">
      {/* Main CTA Section */}
      <section className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-slate-200 px-6 py-16 shadow-2xl shadow-indigo-500/10 sm:px-12 sm:py-20 dark:border-slate-700 dark:shadow-black/50">
        {/* Increased background opacity to keep text readable */}
        <div className="absolute inset-0 -z-10 bg-white/90 backdrop-blur-md dark:bg-slate-900/95" />

        {/* Soft Background Orbs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-500/15" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl dark:bg-pink-500/15" />

        {/* CTA Content Wrapper */}
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          {/* Tag-style subheading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="mx-auto mb-6 inline-flex items-center justify-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 shadow-sm dark:border-indigo-500/50 dark:bg-indigo-950/80"
          >
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            <div className="text-xs font-bold tracking-wide text-indigo-800 uppercase sm:text-sm dark:text-indigo-200">
              Innovate Ideas, Build Projects, Join Events
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-4xl leading-[1.1] font-black tracking-tight text-slate-900 drop-shadow-sm sm:text-5xl lg:text-6xl dark:text-white"
          >
            <div className="inline-block text-black dark:text-white">Ignite Ideas, </div>
            <div className="inline-block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              Connect Innovators
            </div>
          </motion.h2>

          {/* Lightened description color in dark mode for readability */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mb-10 max-w-2xl text-base leading-relaxed font-medium text-slate-700 sm:text-lg dark:text-slate-200"
          >
            <div className="text-slate-600 dark:text-slate-400">
              Participate in hackathons, showcase your projects, and collaborate with creators
              around the world. Eventra makes it effortless, fun, and inspiring.
            </div>
          </motion.p>

          {/* Buttons container */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mb-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
          >
            {/* Added 'group' class to enable arrow hover animation */}
            <Link
              to="/hackathons"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 font-bold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-indigo-700 hover:shadow-indigo-500/40 active:scale-[0.98] sm:w-auto dark:bg-indigo-600 dark:hover:bg-indigo-500"
            >
              <Users className="h-5 w-5" aria-hidden="true" />
              Explore Hackathons
              <ArrowRight
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>

            {/* Brightened secondary button text and border in dark mode */}
            <Link
              to="/about"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 font-bold text-slate-900 shadow-md transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-slate-50 hover:shadow-lg active:scale-[0.98] sm:w-auto dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              Know us better
              <Sparkles
                className="h-5 w-5 text-indigo-500 transition-transform duration-300 group-hover:rotate-12 dark:text-indigo-400"
                aria-hidden="true"
              />
            </Link>
          </motion.div>

          {/* Slightly brightened footer text in dark mode */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-xs font-semibold text-slate-600 sm:text-sm dark:text-slate-300"
          >
            <div className="text-slate-500 dark:text-slate-500">
              Connect, create, and grow with your community today.
            </div>
          </motion.p>
        </div>
      </section>
    </div>
  );
}
