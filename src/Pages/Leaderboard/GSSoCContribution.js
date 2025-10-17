import React from "react";
import { motion } from "framer-motion";
import {
  Lightbulb,
  Code2,
  GitBranch,
  BookOpen,
  Users,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const GSSoCContribution = () => {
  const navigate = useNavigate();

  return (
    <div className="w-[95%] mx-auto my-10 bg-white dark:bg-black">
      {/* Top Section with 4 Cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        // UPDATED: Section background and border
        className="p-10 rounded-3xl shadow-lg bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700"
      >
        {/* Header */}
        {/* UPDATED: Text colors */}
        <h2 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 text-center">
          🌟 About GSSoC
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed text-center mb-12">
          GirlScript Summer of Code (GSSoC) empowers students & first-time
          contributors to learn, collaborate, and grow with real-world
          open-source projects. A perfect place to begin your open-source
          journey.
        </p>

        {/* Guidelines Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            // UPDATED: Card background and border
            className="p-6 bg-white dark:bg-gray-700/50 rounded-2xl shadow-md border dark:border-gray-700 flex flex-col items-center text-center"
          >
            <Lightbulb className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
              Explore Issues
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Begin with{" "}
              <span className="font-medium">beginner-friendly tasks</span> to
              get familiar with the project.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white dark:bg-gray-700/50 rounded-2xl shadow-md border dark:border-gray-700 flex flex-col items-center text-center"
          >
            <Code2 className="w-10 h-10 text-green-500 mb-3" />
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
              Clean Contributions
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Keep your PRs{" "}
              <span className="font-medium">
                neat, tested, and well-documented
              </span>
              .
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white dark:bg-gray-700/50 rounded-2xl shadow-md border dark:border-gray-700 flex flex-col items-center text-center"
          >
            <GitBranch className="w-10 h-10 text-purple-500 mb-3" />
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
              Collaborate Actively
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Discuss ideas, review code, and learn by working with other
              contributors.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white dark:bg-gray-700/50 rounded-2xl shadow-md border dark:border-gray-700 flex flex-col items-center text-center"
          >
            <BookOpen className="w-10 h-10 text-blue-500 mb-3" />
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
              Follow Docs
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Always read the <span className="font-medium">project docs</span>{" "}
              before contributing.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Section with 2 Wide Cards */}
      <div className="mt-12 grid md:grid-cols-2 gap-8">
        {/* Card 5 */}
        <div
          // UPDATED: Card background, border, and text
          className="p-8 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 shadow-md border dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-300"
        >
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400">
              Getting Started
            </h3>
          </div>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li>Sign up on the GSSoC platform</li>
            <li>Choose a project that excites you</li>
            <li>Engage with mentors and contributors</li>
            <li>Kickstart with beginner issues</li>
          </ul>
        </div>

        {/* Card 6 */}
        <div
          // UPDATED: Card background, border, and text
          className="p-8 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 shadow-md border dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 transition-colors duration-300"
        >
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xl font-semibold text-purple-700 dark:text-purple-400">
              Best Practices
            </h3>
          </div>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
            <li>Be respectful & inclusive in discussions</li>
            <li>Follow contribution standards</li>
            <li>Test your code before pushing</li>
            <li>Seek help when needed, collaborate openly</li>
          </ul>
        </div>
      </div>

      {/* Buttons Section */}
      <div className="mt-12 flex justify-center gap-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="px-8 py-3 rounded-full font-semibold text-white 
                     bg-gradient-to-r from-indigo-600 to-purple-600 
                     shadow-lg hover:from-indigo-700 hover:to-purple-700 
                     transition-all duration-300"
          onClick={() => navigate("/contributorguide")}
        >
          Contributor’s Guide
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          className="px-8 py-3 rounded-full font-semibold text-white 
             bg-gradient-to-r from-pink-500 to-orange-500 
             shadow-lg hover:from-pink-600 hover:to-orange-600 
             transition-all duration-300"
          onClick={() =>
            window.open(
              "https://github.com/SandeepVashishtha/Eventra",
              "_blank"
            )
          }
        >
          Start Contributing
        </motion.button>
      </div>
    </div>
  );
};

export default GSSoCContribution;
