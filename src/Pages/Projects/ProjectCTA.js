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
      className="relative py-16 px-8 m-8 rounded-3xl bg-gradient-to-tr from-sky-100 via-white to-blue-100 dark:from-[#111827] dark:via-[#0f172a] dark:to-black text-black dark:text-white shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800"
      // AOS Implementation
      data-aos="zoom-in-up"
      data-aos-duration="1000"
    >
      {/* Diagonal Shimmer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
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
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
        >
          Showcase Your Projects
        </motion.h2>

        <motion.p
          className="text-base md:text-lg mb-10 text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.8 }}
        >
          "Share your innovative projects, collaborate with peers, and get
          recognized."
        </motion.p>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <motion.a
            href="/projects"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 dark:bg-blue-600 text-white dark:text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:scale-105 hover:bg-blue-700 dark:hover:bg-blue-700 transition-transform duration-300 border border-blue-600 dark:border-blue-600"
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
            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold px-8 py-4 rounded-lg shadow-lg transition-transform duration-300"
            data-aos="zoom-in"
            data-aos-delay="400"
          >
            <UploadCloud size={20} /> Submit Project
          </Link>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="https://github.com/SandeepVashishtha/Eventra/issues"
              target="_blank" rel="noopener noreferrer"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-800 font-semibold px-8 py-4 rounded-lg shadow-lg transition-all duration-300"
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
