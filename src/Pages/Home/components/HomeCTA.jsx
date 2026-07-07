import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <div className="relative bg-bg py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-border overflow-hidden transition-colors duration-300">
      {/* Main CTA Section */}
      <section className="relative max-w-6xl mx-auto py-16 sm:py-20 px-6 sm:px-12 rounded-3xl overflow-hidden border border-border shadow-premium-lg">
        {/* Dynamic theme background */}
        <div className="absolute inset-0 bg-card-bg -z-10 transition-colors duration-300" />

        {/* Soft Background Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

        {/* CTA Content Wrapper */}
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Tag-style subheading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="inline-flex items-center gap-2 border border-primary/20 bg-primary/10 rounded-lg px-4 py-1.5 justify-center mx-auto mb-6 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-primary" aria-hidden="true" />
            <div className="text-primary text-xs sm:text-sm font-bold tracking-wide uppercase">
              Innovate Ideas, Build Projects, Join Events
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-text mb-6 tracking-tight leading-[1.1] drop-shadow-sm"
          >
            <span className="inline-block text-text">Ignite Ideas, </span>
            <span className="inline-block bg-clip-text text-transparent bg-linear-to-r from-primary to-pink-500">
              Connect Innovators
            </span>
          </motion.h2>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-light max-w-2xl mx-auto text-base sm:text-lg mb-10 leading-relaxed font-medium"
          >
            <div className="text-text-light/90">
              Participate in hackathons, showcase your projects, and collaborate with creators
              around the world. Eventra makes it effortless, fun, and inspiring.
            </div>
          </motion.div>

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
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-xl bg-primary hover:opacity-90 text-white font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out"
            >
              <Users className="w-5 h-5" aria-hidden="true" />
              Explore Hackathons
              <ArrowRight
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>

            <Link
              to="/about"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto rounded-xl bg-card-bg hover:opacity-90 text-text font-bold border border-border shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out"
            >
              Know us better
              <Sparkles
                className="w-5 h-5 text-primary transition-transform duration-300 group-hover:rotate-12"
                aria-hidden="true"
              />
            </Link>
          </motion.div>

          {/* Footer text - FIXED: Changed motion.p to motion.div */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-semibold"
          >
            <div className="text-slate-500 dark:text-slate-500">
              Connect, create, and grow with your community today.
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
