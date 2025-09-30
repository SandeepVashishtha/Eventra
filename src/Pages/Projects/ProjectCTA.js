import React from "react";
import { motion } from "framer-motion";
import { FolderOpen, UploadCloud, Bug } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProjectCTA = () => {

    const { user, token } = useAuth();
  
  return (
    <section className="relative py-16 px-8 m-8 rounded-3xl bg-gradient-to-tr from-cyan-800 via-blue-900 to-indigo-900 text-white shadow-xl overflow-hidden">
      {/* Diagonal Shimmer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.05) 100%)",
        }}
        animate={{ x: ["-100%", "100%"], y: ["-100%", "100%"] }}
        transition={{
          duration: 6,
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
          transition={{ duration: 0.6 }}
        >
          Showcase Your Projects
        </motion.h2>

        <motion.p
          className="text-base md:text-lg mb-10 text-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          "Share your innovative projects, collaborate with peers, and get
          recognized."
        </motion.p>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <motion.a
            href="/projects"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-800 to-blue-600 font-semibold px-8 py-4 rounded-full shadow-lg hover:scale-105 hover:shadow-blue-400/50 transition-transform duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FolderOpen size={20} /> Explore Projects
          </motion.a>

          <Link
             to={user ? "/submit-project" : "/login"}
            // UPDATED: The secondary button needs a subtle dark mode style
            className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 dark:bg-gray-800 dark:text-blue-300 dark:hover:bg-gray-700 font-semibold px-8 py-4 rounded-full shadow-lg transition-transform duration-300"
          >
            <UploadCloud size={20} /> Submit Project
          </Link>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="https://github.com/SandeepVashishtha/Eventra/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-blue-400/50 transition-all duration-300"
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
