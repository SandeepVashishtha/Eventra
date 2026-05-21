import { motion } from "framer-motion";
import React from "react";
import {
  FaBrain,
  FaCode,
  FaDiscord,
  FaGithub,
  FaLaptopCode,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";
import { HiArrowRight, HiPlus } from "react-icons/hi";
import { SiHackaday } from "react-icons/si";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import CountUp from "react-countup";
// ADDED: Import the newly created EventCountdown component
import EventCountdown from "./EventCountdown";

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
  const { user } = useAuth();

  return (
    <div
      className="relative py-24 overflow-hidden bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white dark:bg-slate-950 text-slate-900 dark:text-gray-100 border-b border-gray-200 dark:border-slate-900"
      data-aos="fade-down"
      data-aos-once="true"
      data-aos-duration="1000"
    >
      {/* Continuous Zigzag Icon Train — kept as a tasteful decorative element */}
      <div
        className="absolute right-8 top-0 h-full flex-col items-center justify-start overflow-hidden z-0
                hidden lg:flex"
      >
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
              className="rounded-full p-3 shadow-sm flex items-center justify-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800"
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
      <div className="relative px-4 min-h-[75vh] flex flex-col items-center justify-center text-center z-10">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl sm:text-6xl font-extrabold mb-6 mt-6 text-gray-900 dark:text-white leading-tight"
          style={{ fontFamily: '"Big Shoulders Display", sans-seri' }}
        >
          Discover <span className="text-blue-600 dark:text-blue-500">Projects</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
 feature/event-countdown-timer
          // UPDATED: Subtitle text color
          className="text-base sm:text-lg text-white dark:white max-w-2xl mx-auto mb-6"
className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12"
master
        >
          Explore, contribute to, and showcase innovative open-source creations
          from developers worldwide.
        </motion.p>

        {/* ADDED: Event Countdown Component integrated smoothly with animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-8"
        >
          <EventCountdown eventDate="2026-10-31T23:59:59" />
        </motion.div>

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
            className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-lg font-semibold flex items-center gap-3 shadow-sm transition-all duration-200"
            whileTap={{ scale: 0.97 }}
            data-aos="zoom-in"
            data-aos-delay="400"
          >
            <HiPlus className="text-xl" />
            Submit Project
          </motion.button>

          {/* Explore Projects Button */}
          <motion.button
            className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-sm transition-all duration-200"
            whileTap={{ scale: 0.97 }}
            onClick={scrollToCard}
            data-aos="zoom-in"
            data-aos-delay="600"
          >
            Explore Projects
            <HiArrowRight className="text-lg" />
          </motion.button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            { number: 200, suffix: "+", label: "Active Users" },
            { number: 4890, suffix: "+", label: "Projects Hosted" },
            { number: 120, suffix: "+", label: "Contributors" },
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
              whileHover={{ scale: 1.02 }}
              data-aos="zoom-in"
              data-aos-delay={700 + idx * 150}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm rounded-lg p-6 flex flex-col items-center justify-center transition-all duration-200"
            >
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                <CountUp
                  start={0}
                  end={stat.number}
                  duration={2.5}
                  suffix={stat.suffix}
                  enableScrollSpy
                  scrollSpyOnce
                />
              </span>
              <span className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}