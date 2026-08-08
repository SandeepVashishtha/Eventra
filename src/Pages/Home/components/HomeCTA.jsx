/* Hallmark · pre-emit critique: P5 H5 E5 S4 R5 V4 */
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <div className="relative bg-bg py-16 sm:py-24 px-6 border-t border-border overflow-hidden">
      {/* Main CTA Section - Clean border container with no background orbs */}
      <section className="relative max-w-5xl mx-auto py-16 px-6 sm:px-12 rounded-2xl border border-border bg-card-bg shadow-premium-lg">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Tag-style subheading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="inline-flex items-center gap-2 border border-border bg-bg-secondary rounded-md px-4 py-1.5 justify-center mx-auto mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" aria-hidden="true" />
            <div className="text-text-light text-xs font-bold tracking-wider uppercase">
              Innovate Ideas, Build Projects, Join Events
            </div>
          </motion.div>

          {/* Main heading with Oxanium display font */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{ fontFamily: "'Oxanium', sans-serif" }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text mb-6 tracking-tight leading-tight"
          >
            Ignite Ideas, <span className="text-primary">Connect Innovators</span>
          </motion.h2>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-light max-w-xl mx-auto text-base sm:text-lg mb-10 leading-relaxed font-normal"
          >
            Participate in hackathons, showcase your projects, and collaborate with creators
            around the world. Eventra makes it effortless, fun, and inspiring.
          </motion.div>

          {/* Buttons container */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8"
          >
            <Link
              to="/hackathons"
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 w-full sm:w-auto rounded-lg bg-text text-bg hover:opacity-90 font-bold transition-all duration-200"
            >
              <Users className="w-5 h-5" aria-hidden="true" />
              Explore Hackathons
              <ArrowRight
                className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>

            <Link
              to="/about"
              className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 w-full sm:w-auto rounded-lg border border-border bg-card-bg hover:bg-bg-secondary text-text font-bold transition-all duration-200"
            >
              Know us better
              <Sparkles
                className="w-5 h-5 text-text-light transition-transform duration-200 group-hover:rotate-12"
                aria-hidden="true"
              />
            </Link>
          </motion.div>

          {/* Footer text */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-text-light/60 text-xs sm:text-sm font-medium"
          >
            Connect, create, and grow with your community today.
          </motion.div>
        </div>
      </section>
    </div>
  );
}
