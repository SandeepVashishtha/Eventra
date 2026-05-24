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
  { size: 26, left: "3%",  top: "10%", color: "#dbeafe", delay: 0 },
  { size: 38, left: "7%",  top: "60%", color: "#bfdbfe", delay: 1 },
  { size: 18, left: "15%", top: "82%", color: "#dcfce7", delay: 0.5 },
  { size: 30, left: "20%", top: "28%", color: "#c7d2fe", delay: 0.2 },
  { size: 22, left: "36%", top: "8%",  color: "#bbf7d0", delay: 0.7 },
  { size: 16, left: "50%", top: "90%", color: "#bae6fd", delay: 1.2 },
  { size: 44, left: "60%", top: "6%",  color: "#fed7aa", delay: 0.8 },
  { size: 20, left: "70%", top: "78%", color: "#fde68a", delay: 1.1 },
  { size: 28, left: "80%", top: "42%", color: "#fde68a", delay: 1.5 },
  { size: 22, left: "86%", top: "85%", color: "#fbcfe8", delay: 0.4 },
  { size: 32, left: "90%", top: "18%", color: "#fecdd3", delay: 1.3 },
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
  const { user } = useAuth();
 
  return (
    <div
      className="relative overflow-hidden bg-gradient-to-l from-sky-50 via-white to-white dark:from-indigo-950 dark:to-black pt-16 sm:pt-18 lg:pt-20"
      data-aos="fade-down"
      data-aos-once="true"
      data-aos-duration="1000"
    >
      {/* Floating Shapes */}
      {floatingShapes.map((shape, idx) => (
        <motion.div
          key={idx}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: shape.size,
            height: shape.size,
            left: shape.left,
            top: shape.top,
            backgroundColor: shape.color,
          }}
          animate={{
            y: [0, -16, 0],
            opacity: [0.35, 0.65, 0.4],
            rotate: [0, 12, -12, 0],
            scale: [0.9, 1.08, 0.95, 1],
          }}
          transition={{
            duration: 5.8,
            delay: shape.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
 
      {/* Icon Train */}
      <div className="absolute right-5 top-0 h-full flex-col items-center justify-start overflow-hidden z-0 hidden lg:flex">
        <motion.div
          animate={{ y: ["0%", "-100%"] }}
          transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
          className="flex flex-col gap-4"
        >
          {repeatedIcons.map((item, idx) => (
            <motion.div
              key={idx}
              className="rounded-full p-2.5 shadow-md flex items-center justify-center bg-white dark:bg-gray-800"
              animate={{ x: [0, 7, -7, 0], rotate: [0, 15, -15, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                delay: idx * 0.2,
              }}
            >
              {React.cloneElement(item.icon, { color: item.color, size: 20 })}
            </motion.div>
          ))}
        </motion.div>
      </div>
 
      {/* ── MAIN CONTENT WRAPPER ── */}
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
 
        {/* ── DESKTOP: two-column | MOBILE: single-column stack ── */}
        <div
          className="
            flex flex-col items-center text-center
            lg:flex-row lg:items-center lg:text-left lg:gap-12
            pt-6 pb-10 sm:pt-6 sm:pb-12 lg:pt-8 lg:pb-14
          "
        >
 
          {/* ── LEFT COLUMN: Badge + Heading + Description + Buttons ── */}
          <div className="flex-1 min-w-0 lg:max-w-[58%]">
 
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold
                         tracking-wide bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300
                         mb-3 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              Open Source · Community Driven
            </motion.div>
 
            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-5xl lg:text-[3.4rem] xl:text-[4rem] font-extrabold mb-3
                         text-black dark:text-white leading-[1.08] tracking-tight"
              style={{ fontFamily: '"Anton", sans-serif' }}
            >
              Discover{" "}
              <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-pink-500 bg-clip-text text-transparent">
                Amazing
              </span>
              <br className="hidden sm:block" />
              Projects
            </motion.h1>
 
            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-5
                         max-w-md mx-auto lg:mx-0 leading-relaxed"
            >
              Explore, contribute to, and showcase innovative open-source
              creations from developers worldwide.
            </motion.p>
 
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-wrap justify-center lg:justify-start gap-3"
              data-aos="zoom-in"
              data-aos-delay="400"
            >
              <motion.button
                onClick={() =>
                  !user ? navigate("/login") : navigate("/submit-project")
                }
                className="bg-pink-100 text-black px-5 py-2.5 rounded-xl font-semibold
                           flex items-center gap-2 shadow-md hover:bg-pink-200
                           hover:shadow-lg transition-all duration-300 text-sm"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.span
                  variants={{ rest: { y: 0 }, hover: { y: -2 } }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex items-center"
                >
                  <HiPlus className="text-lg" />
                </motion.span>
                Submit Project
              </motion.button>
 
              <motion.button
                className="bg-yellow-100 text-black px-5 py-2.5 rounded-xl font-semibold
                           flex items-center gap-2 shadow-md hover:bg-yellow-200
                           hover:shadow-lg transition-all duration-300 text-sm"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                onClick={scrollToCard}
                data-aos="zoom-in"
                data-aos-delay="550"
              >
                Explore Projects
                <motion.span whileHover={{ x: 4 }} className="flex items-center">
                  <HiArrowRight className="text-base" />
                </motion.span>
              </motion.button>
            </motion.div>
          </div>
 
          {/* ── RIGHT COLUMN: Stats ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.45 }}
            className="w-full mt-8 lg:mt-0 lg:flex-1 lg:max-w-[38%]"
          >
            {/* Mobile: 3-col grid | Desktop: vertical stack */}
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-3">
              {[
                {
                  number: "200+",
                  label: "Active Users",
                  color:
                    "from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/20",
                  accent: "bg-sky-400",
                },
                {
                  number: "4890+",
                  label: "Projects Hosted",
                  color:
                    "from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/20",
                  accent: "bg-indigo-400",
                },
                {
                  number: "120+",
                  label: "Contributors",
                  color:
                    "from-pink-50 to-rose-50 dark:from-pink-900/30 dark:to-rose-900/20",
                  accent: "bg-pink-400",
                },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 18, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.55 + idx * 0.12,
                    type: "spring",
                    stiffness: 140,
                  }}
                  whileHover={{ scale: 1.04 }}
                  data-aos="zoom-in"
                  data-aos-delay={700 + idx * 120}
                  className={`
                    bg-gradient-to-br ${stat.color}
                    shadow hover:shadow-lg rounded-2xl
                    flex flex-col items-center justify-center py-4 px-3
                    lg:flex-row lg:items-center lg:justify-start lg:gap-4 lg:px-5 lg:py-4
                    transition-all duration-300
                  `}
                >
                  {/* Colored accent dot — desktop only */}
                  <span
                    className={`hidden lg:block w-2.5 h-2.5 rounded-full shrink-0 ${stat.accent}`}
                  />
 
                  <div className="flex flex-col">
                    <span className="text-2xl lg:text-3xl font-extrabold text-black dark:text-white leading-none">
                      {stat.number}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs lg:text-sm font-medium mt-0.5">
                      {stat.label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}