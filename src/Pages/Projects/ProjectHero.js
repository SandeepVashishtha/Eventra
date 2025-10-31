import React from "react";
import { motion } from "framer-motion";
import {
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaDiscord,
  FaCode,
  FaLaptopCode,
  FaBrain,
} from "react-icons/fa";
import { SiHackaday } from "react-icons/si";
import { HiPlus, HiArrowRight } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const floatingShapes = [
  { size: 40, x: 50, y: 200, color: "#6366f1", delay: 0 },
  { size: 60, x: 300, y: 500, color: "#4338ca", delay: 1 },
  { size: 30, x: 700, y: 350, color: "#4f46e5", delay: 0.5 },
  { size: 50, x: 1100, y: 600, color: "#8b5cf6", delay: 1.5 },
  { size: 50, x: 1100, y: 1000, color: "#8b5cf6", delay: 1.5 },
  // New top-right circle
  { size: 80, x: 1000, y: 100, color: "#a78bfa", delay: 0.8 },
];

const iconList = [
  { icon: <FaGithub />, color: "#333" },
  { icon: <FaTwitter />, color: "#1DA1F2" },
  { icon: <FaLinkedin />, color: "#0A66C2" },
  { icon: <FaDiscord />, color: "#5865F2" },
  { icon: <FaCode />, color: "#10B981" },
  { icon: <FaLaptopCode />, color: "#F59E0B" },
  { icon: <FaBrain />, color: "#F43F5E" },
  { icon: <SiHackaday />, color: "#8B5CF6" },
];

const repeatedIcons = [...iconList, ...iconList, ...iconList];

export default function ProjectHero({ setShowSubmissionModal, scrollToCard }) {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  return (
    // UPDATED: Main background gradient
    <div 
      className="relative min-h-screen py-24 overflow-hidden bg-gradient-to-l from-indigo-200 to-white dark:from-indigo-950 dark:to-black"
      // AOS Implementation
      data-aos="fade-down"
      data-aos-once="true"
      data-aos-duration="1000"
    >
      {/* Floating Shapes */}
      {floatingShapes.map((shape, idx) => (
        <motion.div
          key={idx}
          initial={{ y: 800, x: shape.x, opacity: 0 }}
          animate={{
            y: [shape.y, shape.y - 30, shape.y],
            opacity: [0, 1, 0.5],
            rotate: [0, 15, -15, 0],
            scale: [0.8, 1.1, 0.9, 1],
          }}
          transition={{ duration: 8, delay: shape.delay, repeat: Infinity }}
          className="absolute rounded-full"
          style={{
            width: shape.size,
            height: shape.size,
            backgroundColor: shape.color,
          }}
        />
      ))}

      {/* Continuous Zigzag Icon Train */}
      <div
        className="absolute right-8 top-0 h-full flex flex-col items-center justify-start overflow-hidden z-0
                hidden lg:flex"
      >
        {" "}
        {/* hide on small screens, show on large screens */}
        <motion.div
          animate={{ y: ["0%", "-100%"] }}
          transition={{
            repeat: Infinity,
            duration: 18,
            ease: "linear",
          }}
          className="flex flex-col gap-6"
        >
          {repeatedIcons.map((item, idx) => (
            <motion.div
              key={idx}
              // UPDATED: Icon wrapper background
              className="rounded-full p-3 shadow-lg flex items-center justify-center bg-white dark:bg-gray-800"
              animate={{
                x: [0, 8, -8, 0],
                rotate: [0, 15, -15, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                delay: idx * 0.2,
              }}
            >
              {React.cloneElement(item.icon, { color: item.color, size: 24 })}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          // UPDATED: Title text color and gradient
          className="text-4xl sm:text-6xl font-extrabold mb-6 mt-6 bg-gradient-to-r from-indigo-600 dark:from-indigo-400 to-purple-600 dark:to-purple-400 text-transparent bg-clip-text leading-tight"
        >
          Discover{" "}
          <span className="text-gray-900 dark:text-gray-100">
            Amazing Projects
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          // UPDATED: Subtitle text color
          className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12"
        >
          "Explore, contribute to, and showcase innovative open-source creations
          from developers worldwide."
        </motion.p>

        {/* Buttons */}
        <div className="flex justify-center gap-6 mb-16">
          {/* Submit Project Button */}
          <motion.button
            onClick={() => {
              if (!user) {
                navigate("/login");
              } else {
                navigate("/submit-project");
              }
            }}
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-7 py-3 rounded-2xl font-semibold flex items-center gap-3 shadow-2xl hover:shadow-3xl transition-all duration-300"
            whileTap={{ scale: 0.95 }}
            whileHover="hover"
            initial="rest"
            data-aos="zoom-in"
            data-aos-delay="400"
          >
            <motion.span
              variants={{
                rest: { y: 0, scale: 1 },
                hover: { y: -3, scale: 1.2 },
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex items-center"
            >
              <HiPlus className="text-xl" />
            </motion.span>
            Submit Project
          </motion.button>
          {/* Explore Projects Button */}
          <motion.button
          className="bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-md hover:shadow-xl hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all duration-300"
          whileTap={{ scale: 0.95}}
          onClick={scrollToCard}
          data-aos="zoom-in"
          data-aos-delay="600"
          >
            Explore Projects
            <motion.span
              whileHover={{ x: 5, scale: 1.2 }}
              className="flex items-center"
            >
              <HiArrowRight className="text-lg" />
            </motion.span>
          </motion.button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            { number: "200+", label: "Active Users" },
            { number: "4890+", label: "Projects Hosted" },
            { number: "120+", label: "Contributors" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: idx * 0.2,
                type: "spring",
                stiffness: 120,
              }}
              whileHover={{ scale: 1.05 }}
              // AOS Implementation on individual stats
              data-aos="zoom-in"
              data-aos-delay={700 + idx * 150}
              // UPDATED: Stat card background
              className="bg-gradient-to-r from-indigo-50 to-white dark:from-gray-800 dark:to-gray-700 shadow-md hover:shadow-xl rounded-3xl p-6 flex flex-col items-center justify-center transition-all duration-300"
            >
              {/* UPDATED: Text colors */}
              <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {stat.number}
              </span>
              <span className="text-gray-700 dark:text-gray-300 mt-1 text-sm sm:text-base">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}