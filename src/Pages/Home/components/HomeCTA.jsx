import { motion } from "framer-motion";
import { ArrowRight, Rocket, Sparkles } from "lucide-react";

export default function CTASection() {
  return (
    <div className="bg-gradient-to-t from-indigo-50 via-indigo-100 to-white dark:from-gray-900 dark:via-indigo-900/20 dark:to-black py-12 px-6 lg:px-16">
      {/* Main CTA Section */}
      <section className="relative py-16 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 rounded-3xl overflow-hidden shadow-xl">
        {/* ------------------------------
            Large breathing & rotating background circle (top-left)
        ------------------------------ */}
        <motion.div
          className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-white/10 rounded-full"
          animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ------------------------------
            Large breathing & rotating background circle (bottom-right)
        ------------------------------ */}
        <motion.div
          className="absolute bottom-[-120px] right-[-80px] w-72 h-72 bg-white/20 rounded-full"
          animate={{ rotate: [0, -360], scale: [1, 1.05, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ------------------------------
            New small breathing circle (top-right)
        ------------------------------ */}
        <motion.div
          className="absolute top-[-60px] right-[-60px] w-36 h-36 bg-white/10 rounded-full"
          animate={{ rotate: [0, 360], scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ------------------------------
            New small breathing circle (bottom-left)
        ------------------------------ */}
        <motion.div
          className="absolute bottom-[-60px] left-[-60px] w-28 h-28 bg-white/15 rounded-full"
          animate={{ rotate: [0, -360], scale: [1, 1.05, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ------------------------------
            CTA Content Wrapper
        ------------------------------ */}
        <div className="relative max-w-7xl mx-auto text-center px-6">
          {/* ------------------------------
              Tag-style subheading
              Shows event tagline with icon
          ------------------------------ */}
          <motion.div className="inline-flex items-center gap-2 border border-white/30 rounded-full px-4 py-1 justify-center mx-auto mb-6">
            <Sparkles className="w-5 h-5 text-white/90" />
            <span className="text-white/90 text-sm">
              Innovate Ideas, Build Projects, Join Events
            </span>
          </motion.div>

          {/* ------------------------------
              Main heading
              Large title for the CTA
          ------------------------------ */}
          <motion.h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Ignite Ideas, Connect Innovators
          </motion.h2>

          {/* ------------------------------
              Description paragraph
              Explains the CTA in more detail
          ------------------------------ */}
          <motion.p className="text-white/70 max-w-2xl mx-auto text-xm mb-10">
            Participate in hackathons, showcase your projects, and collaborate
            with creators around the world. Eventra makes it effortless, fun,
            and inspiring.
          </motion.p>

          {/* ------------------------------
              Buttons container
              Side by side buttons for Explore & Host Event
          ------------------------------ */}
          <motion.div className="flex flex-col sm:flex-row justify-center gap-6 mb-10">
            {/* --------------------------
                Explore Events Button
                Uses ArrowRight icon
            -------------------------- */}
            <a
              href="#hackathons"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transition-all duration-300 ease-out"
            >
              Explore Hackathons
              <ArrowRight className="w-5 h-5" />
            </a>

            {/* --------------------------
                Host Your Event Button
                Uses Rocket icon
            -------------------------- */}
            <a
              href="about"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transition-all duration-300 ease-out"
            >
              Know us better
              <Rocket className="w-5 h-5" />
            </a>
          </motion.div>

          {/* ------------------------------
              Last line
              Encouraging text below buttons
          ------------------------------ */}
          <motion.p className="text-white/80 text-sm">
            Connect, create, and grow with your community today.
          </motion.p>
        </div>
      </section>
    </div>
  );
}
