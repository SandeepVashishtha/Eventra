import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, UserPlus, X, Rocket } from "lucide-react";

import useReducedMotion from "../../hooks/useReducedMotion.js";
const HackathonCTA = () => {
  const prefersReducedMotion = useReducedMotion();
  const [showModal, setShowModal] = useState(false);

  // Floating orbs
  const orbs = [
    { size: 180, top: "-10%", left: "-8%", color: "bg-blue-300/40 dark:bg-blue-600/20", delay: 0 },
    {
      size: 140,
      top: "60%",
      left: "75%",
      color: "bg-violet-300/40 dark:bg-violet-600/20",
      delay: 1.5,
    },
    {
      size: 100,
      top: "30%",
      left: "50%",
      color: "bg-indigo-200/50 dark:bg-indigo-500/10",
      delay: 3,
    },
    { size: 80, top: "80%", left: "20%", color: "bg-cyan-300/40 dark:bg-cyan-500/10", delay: 2 },
  ];

  return (
    <>
      <section
        className="relative mx-6 my-10 overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50 px-6 py-16 text-center shadow-[0_8px_30px_rgba(99,102,241,0.08)] transition-colors duration-300 sm:mx-8 sm:px-12 sm:py-20 dark:border-white/10 dark:from-slate-950 dark:via-indigo-950/80 dark:to-slate-950 dark:shadow-[0_0_80px_rgba(99,102,241,0.15)]"
        data-aos="zoom-in"
        data-aos-duration="1000"
      >
        {/* Animated mesh blobs */}
        {orbs.map((orb, idx) => (
          <motion.div
            key={idx}
            className={`absolute rounded-full ${orb.color} pointer-events-none blur-2xl dark:blur-3xl`}
            style={{ width: orb.size, height: orb.size, top: orb.top, left: orb.left }}
            animate={{ y: [0, -20, 0], x: [0, 12, 0], scale: [1, 1.1, 1] }}
            transition={{
              duration: prefersReducedMotion ? 0 : 8 + idx * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: orb.delay,
            }}
          />
        ))}

        {/* Subtle grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-2xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold tracking-widest text-indigo-600 uppercase shadow-sm backdrop-blur-sm dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300 dark:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
          >
            <Rocket className="h-3 w-3" />
            Build · Compete · Win
          </motion.div>

          <motion.h2
            className="mb-4 text-3xl leading-tight font-extrabold text-slate-900 sm:text-5xl dark:text-white"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.1 }}
          >
            Join Our{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400">
              Hackathon Community
            </span>
          </motion.h2>

          <motion.p
            className="mb-10 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.7, delay: 0.2 }}
          >
            Participate in exciting hackathons, showcase your skills, and connect with innovators
            around the world.
          </motion.p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <motion.a
              href="/hackathons"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-8 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl dark:shadow-[0_0_24px_rgba(99,102,241,0.4)] dark:hover:shadow-[0_0_36px_rgba(99,102,241,0.6)]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Hackathons <ArrowRight className="h-5 w-5" />
            </motion.a>

            <motion.button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-8 py-3.5 font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-indigo-300 hover:bg-white dark:border-white/20 dark:bg-white/5 dark:text-slate-200 dark:shadow-none dark:hover:border-indigo-400/50 dark:hover:bg-white/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <UserPlus className="h-5 w-5 text-indigo-600 dark:text-slate-200" /> Register
            </motion.button>
          </div>
        </div>
      </section>

      {/* ── Modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm dark:bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="relative w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_0_60px_rgba(99,102,241,0.2)]"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 rounded-full bg-slate-100 p-1.5 transition-colors hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20"
              >
                <X className="h-4 w-4 text-slate-500 dark:text-slate-300" />
              </button>

              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 shadow-[0_8px_16px_rgba(99,102,241,0.25)] dark:shadow-[0_0_24px_rgba(99,102,241,0.4)]">
                <UserPlus className="h-6 w-6 text-white" />
              </div>

              <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                Register for Hackathon
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                To register, please select a hackathon from the cards displayed above and click the{" "}
                <strong className="text-indigo-600 dark:text-indigo-300">Register</strong> button on
                the card.
              </p>

              <button
                className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg dark:shadow-none dark:hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                onClick={() => setShowModal(false)}
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HackathonCTA;
