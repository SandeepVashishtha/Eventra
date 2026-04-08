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
  { size: 34, x: 50, y: 200, color: "#dbeafe", delay: 0 },
  { size: 48, x: 300, y: 500, color: "#bfdbfe", delay: 1 },
  { size: 24, x: 700, y: 350, color: "#dcfce7", delay: 0.5 },
  { size: 38, x: 1100, y: 600, color: "#fde68a", delay: 1.5 },
  { size: 40, x: 1100, y: 1000, color: "#fecdd3", delay: 1.5 },
  { size: 64, x: 1000, y: 100, color: "#fed7aa", delay: 0.8 },
  { size: 28, x: 150, y: 80, color: "#c7d2fe", delay: 0.2 },
  { size: 30, x: 520, y: 160, color: "#bbf7d0", delay: 0.7 },
  { size: 22, x: 880, y: 260, color: "#fde68a", delay: 1.1 },
  { size: 26, x: 220, y: 760, color: "#fbcfe8", delay: 0.4 },
  { size: 24, x: 620, y: 860, color: "#bae6fd", delay: 1.2 },
  { size: 20, x: 980, y: 720, color: "#fed7aa", delay: 1.4 },
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
      className="relative min-h-screen py-24 overflow-hidden bg-gradient-to-l from-sky-50 via-white to-white dark:from-indigo-950 dark:to-black"
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
            opacity: [0.35, 0.7, 0.45],
            rotate: [0, 15, -15, 0],
            scale: [0.8, 1.1, 0.9, 1],
          }}
          transition={{ duration: 5.8, delay: shape.delay, repeat: Infinity }}
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
          className="text-4xl sm:text-6xl font-extrabold mb-6 mt-6 text-black leading-tight"
          style={{ fontFamily: '"Anton", sans-serif' }}
        >
          Discover Amazing Projects
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          // UPDATED: Subtitle text color
          className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12"
        >
          Explore, contribute to, and showcase innovative open-source creations
          from developers worldwide.
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
            className="bg-pink-100 text-black px-7 py-3 rounded-2xl font-semibold flex items-center gap-3 shadow-md hover:bg-pink-200 hover:shadow-lg transition-all duration-300"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
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
          className="bg-yellow-100 text-black px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-md hover:bg-yellow-200 hover:shadow-lg transition-all duration-300"
          whileTap={{ scale: 0.95}}
          whileHover={{ scale: 1.05 }}
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
              className="bg-gradient-to-br from-sky-50 via-white to-white dark:bg-gray-800 shadow-md hover:shadow-xl rounded-3xl p-6 flex flex-col items-center justify-center transition-all duration-300"
            >
              {/* UPDATED: Text colors */}
              <span className="text-3xl font-extrabold text-black dark:text-white">
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