import {
  Github,
  Twitter,
  Linkedin,
  MessageCircle,
  Code,
  Laptop,
  Brain,
  Code2,
  Plus,
  ArrowRight,
} from "lucide-react";
import React from "react";
import { motion } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { darkTheme } from "../../components/styles/theme";

const iconList = [
  { icon: <Github />, color: "#333" },
  { icon: <Twitter />, color: "#1DA1F2" },
  { icon: <Linkedin />, color: "#0A66C2" },
  { icon: <MessageCircle />, color: "#5865F2" },
  { icon: <Code />, color: "#10B981" },
  { icon: <Laptop />, color: "#F59E0B" },
  { icon: <Brain />, color: "#F43F5E" },
  { icon: <Code2 />, color: "#8B5CF6" },
];

const repeatedIcons = [...iconList, ...iconList, ...iconList];

export default function ProjectHero({ scrollToCard }) {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white dark:from-slate-950 dark:via-slate-900 dark:to-black ${darkTheme.textPrimary} border-b border-gray-100 pt-16 sm:pt-18 lg:pt-20 dark:border-slate-900`}
      data-aos="fade-down"
      data-aos-once="true"
      data-aos-duration="1000"
    >
      {/* Icon Train */}
      <div className="absolute top-0 right-5 z-0 hidden h-full flex-col items-center justify-start overflow-hidden lg:flex">
        <motion.div
          animate={{ y: ["0%", "-100%"] }}
          transition={{ repeat: Infinity, duration: prefersReducedMotion ? 0 : 18, ease: "linear" }}
          className="flex flex-col gap-4"
        >
          {repeatedIcons.map((item, idx) => (
            <motion.div
              key={idx}
              className="flex items-center justify-center rounded-full border border-transparent bg-white p-2.5 shadow-md dark:border-slate-700 dark:bg-slate-800"
              animate={{ x: [0, 7, -7, 0], rotate: [0, 15, -15, 0] }}
              transition={{
                duration: prefersReducedMotion ? 0 : 4,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                delay: idx * 0.2,
              }}
            >
              {React.cloneElement(item.icon, {
                color: item.color,
                size: 20,
              })}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center pt-6 pb-10 text-center sm:pt-6 sm:pb-12 lg:flex-row lg:items-center lg:gap-12 lg:pt-8 lg:pb-14 lg:text-left">
          {/* LEFT SECTION */}
          <div className="min-w-0 flex-1 lg:max-w-[58%]">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-transparent bg-sky-100 px-3 py-1 text-xs font-semibold tracking-wide text-sky-700 shadow-sm dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-300"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-500" />
              Open Source · Community Driven
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.8 }}
              className={`mb-3 text-4xl font-extrabold text-black sm:text-5xl lg:text-[3.4rem] xl:text-[4rem] ${darkTheme.textPrimary} leading-[1.08] tracking-tight`}
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
              transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.2 }}
              className={`text-sm text-gray-600 sm:text-base ${darkTheme.textSecondary} mx-auto mb-5 max-w-md leading-relaxed lg:mx-0`}
            >
              Explore, contribute to, and showcase innovative open-source creations from developers
              worldwide.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.35 }}
              className="flex flex-wrap justify-center gap-3 lg:justify-start"
              data-aos="zoom-in"
              data-aos-delay="400"
            >
              <motion.button
                onClick={() => (!user ? navigate("/login") : navigate("/submit-project"))}
                className="flex items-center gap-2 rounded-xl bg-pink-100 px-5 py-2.5 text-sm font-semibold text-black shadow-md transition-all duration-300 hover:bg-pink-200 hover:shadow-lg dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.span
                  variants={{ rest: { y: 0 }, hover: { y: -2 } }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex items-center"
                >
                  <Plus className="text-lg" />
                </motion.span>
                Submit Project
              </motion.button>

              <motion.button
                className="flex items-center gap-2 rounded-xl bg-yellow-100 px-5 py-2.5 text-sm font-semibold text-black shadow-md transition-all duration-300 hover:bg-yellow-200 hover:shadow-lg dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                onClick={scrollToCard}
                data-aos="zoom-in"
                data-aos-delay="550"
              >
                Explore Projects
                <motion.span whileHover={{ x: 4 }} className="flex items-center">
                  <ArrowRight className="text-base" />
                </motion.span>
              </motion.button>
            </motion.div>
          </div>

          {/* RIGHT SECTION */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.75, delay: 0.45 }}
            className="mt-8 w-full lg:mt-0 lg:max-w-[38%] lg:flex-1"
          >
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-3">
              {[
                {
                  number: "200+",
                  label: "Active Users",
                  color: "from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/20",
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
                  color: "from-pink-50 to-rose-50 dark:from-pink-900/30 dark:to-rose-900/20",
                  accent: "bg-pink-400",
                },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 18, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.5,
                    delay: 0.55 + idx * 0.12,
                    type: "spring",
                    stiffness: 140,
                  }}
                  whileHover={{ scale: 1.04 }}
                  data-aos="zoom-in"
                  data-aos-delay={700 + idx * 120}
                  className={`bg-gradient-to-br ${stat.color} flex flex-col items-center justify-center rounded-2xl border border-transparent px-3 py-4 shadow transition-all duration-300 hover:shadow-lg lg:flex-row lg:items-center lg:justify-start lg:gap-4 lg:px-5 lg:py-4 dark:border-slate-700`}
                >
                  <span
                    className={`hidden h-2.5 w-2.5 shrink-0 rounded-full lg:block ${stat.accent}`}
                  />

                  <div className="flex flex-col">
                    <span
                      className={`text-2xl font-extrabold text-black lg:text-3xl ${darkTheme.textPrimary} leading-none`}
                    >
                      {stat.number}
                    </span>

                    <span
                      className={`text-gray-500 ${darkTheme.textSecondary} mt-0.5 text-xs font-medium lg:text-sm`}
                    >
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
