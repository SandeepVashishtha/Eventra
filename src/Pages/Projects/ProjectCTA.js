import { motion } from "framer-motion";
import { FolderOpen, UploadCloud, Bug } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import useReducedMotion from "../../hooks/useReducedMotion.js";
const ProjectCTA = () => {
  const prefersReducedMotion = useReducedMotion();

  const { user } = useAuth();

  return (
    <section
      className="relative m-8 overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-tr from-sky-100 via-white to-blue-100 px-8 py-16 text-black shadow-xl dark:border-gray-800 dark:from-[#111827] dark:via-[#0f172a] dark:to-black dark:text-white"
      // AOS Implementation
      data-aos="zoom-in-up"
      data-aos-duration="1000"
    >
      {/* Diagonal Shimmer */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.05) 100%)",
        }}
        animate={{ x: ["-100%", "100%"], y: ["-100%", "100%"] }}
        transition={{
          duration: prefersReducedMotion ? 0 : 6,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Centered Content */}
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.h2
          className="mb-4 text-4xl font-bold md:text-5xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
        >
          Showcase Your Projects
        </motion.h2>

        <motion.p
          className="mb-10 text-base text-gray-600 md:text-lg dark:text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.8 }}
        >
          &quot;Share your innovative projects, collaborate with peers, and get recognized.&quot;
        </motion.p>

        {/* Buttons */}
        <div className="flex flex-col justify-center gap-4 md:flex-row">
          <motion.a
            href="/projects"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-blue-700 dark:border-blue-600 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-aos="zoom-in"
            data-aos-delay="200"
          >
            <FolderOpen size={20} /> Explore Projects
          </motion.a>

          <Link
            to={user ? "/submit-project" : "/login"}
            // UPDATED: The secondary button needs a subtle dark mode style
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-8 py-4 font-semibold text-slate-700 shadow-lg transition-transform duration-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-800"
            data-aos="zoom-in"
            data-aos-delay="400"
          >
            <UploadCloud size={20} /> Submit Project
          </Link>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="https://github.com/SandeepVashishtha/Eventra/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-8 py-4 font-semibold text-slate-700 shadow-lg transition-all duration-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-800"
              data-aos="zoom-in"
              data-aos-delay="600"
            >
              <Bug size={20} /> Browse Issues
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProjectCTA;
