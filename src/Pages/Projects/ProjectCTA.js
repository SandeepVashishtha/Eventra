import React from "react";
import { motion } from "framer-motion";
import { FolderOpen, UploadCloud, Bug } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProjectCTA = () => {

    const { user } = useAuth();
  
  return (
    <section 
<<<<<<< HEAD
      className="relative py-16 px-8 m-8 rounded-3xl bg-gradient-to-tr from-sky-100 via-white to-blue-100 text-black dark:text-white dark:from-zinc-950 dark:via-slate-900 dark:to-zinc-900 border border-sky-100 dark:border-white/10 shadow-xl dark:shadow-black/40 overflow-hidden"
=======
      className="relative py-16 px-8 m-8 rounded-3xl bg-gradient-to-tr from-sky-100 via-white to-blue-100 dark:from-[#111827] dark:via-[#0f172a] dark:to-black text-black dark:text-white shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800"
>>>>>>> 481cbb0f9c46982337d082d5f25e87471f5c281a
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
          duration: 6,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Centered Content */}
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-4 text-black dark:text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Showcase Your Projects
        </motion.h2>

        <motion.p
<<<<<<< HEAD
          className="text-base md:text-lg mb-10 text-gray-700 dark:text-gray-300"
=======
          className="text-base md:text-lg mb-10 text-gray-600 dark:text-gray-300"
>>>>>>> 481cbb0f9c46982337d082d5f25e87471f5c281a
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
<<<<<<< HEAD
            className="inline-flex items-center justify-center gap-2 bg-white font-semibold text-black px-8 py-4 rounded-full shadow-lg hover:scale-105 hover:bg-gray-100 transition-transform duration-300 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
=======
            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-black dark:text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-700 transition-transform duration-300 border border-gray-200 dark:border-gray-700"
>>>>>>> 481cbb0f9c46982337d082d5f25e87471f5c281a
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
<<<<<<< HEAD
            className="inline-flex items-center justify-center gap-2 bg-blue-100 text-black dark:bg-sky-500/20 dark:text-sky-100 dark:ring-1 dark:ring-sky-300/25 dark:hover:bg-sky-500/30 font-semibold px-8 py-4 rounded-full shadow-lg transition-transform duration-300"
=======
            className="inline-flex items-center justify-center gap-2 bg-blue-100 text-black dark:bg-blue-500/20 dark:text-blue-200 dark:hover:bg-blue-500/30 dark:border dark:border-blue-500/30 font-semibold px-8 py-4 rounded-full shadow-lg transition-transform duration-300"
>>>>>>> 481cbb0f9c46982337d082d5f25e87471f5c281a
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
<<<<<<< HEAD
              className="inline-flex items-center justify-center gap-2 bg-yellow-100 text-black dark:bg-amber-300/20 dark:text-amber-100 dark:ring-1 dark:ring-amber-200/25 font-semibold px-8 py-4 rounded-full shadow-lg hover:bg-yellow-200 dark:hover:bg-amber-300/30 transition-all duration-300"
=======
              className="inline-flex items-center justify-center gap-2 bg-yellow-100 text-black dark:bg-yellow-500/20 dark:text-yellow-200 dark:border dark:border-yellow-500/30 font-semibold px-8 py-4 rounded-full shadow-lg hover:bg-yellow-200 dark:hover:bg-yellow-500/30 transition-all duration-300"
>>>>>>> 481cbb0f9c46982337d082d5f25e87471f5c281a
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
