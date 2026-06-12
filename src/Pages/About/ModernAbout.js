import { motion, useInView } from "framer-motion";
import { useEffect, useState, useRef } from "react";

import useDocumentTitle from "../../hooks/useDocumentTitle";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import CountUpLib from "react-countup";
import ErrorBoundary from "../../components/common/ErrorBoundary";

const CountUp = CountUpLib.default;

// Framer Motion Variants
const container = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.15, duration: 0.6, ease: "easeOut" },
  },
};

const cardItem = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};
const stats = [
  { value: "100+", label: "Events Managed" },
  { value: "500+", label: "Active Users" },
  { value: "Global", label: "Community Reach" },
];

const values = [
  { title: "Open Source", desc: "Free for everyone, forever" },
  { title: "Community First", desc: "Built by and for communities" },
  { title: "Innovation", desc: "Always improving" },
  { title: "Accessibility", desc: "Easy for everyone to use" },
];

export default function ModernAbout() {
  useDocumentTitle("Eventra | About");
  const prefersReducedMotion = useReducedMotion();

  const anim = (variants) => ({
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true },
    variants: prefersReducedMotion ? { hidden: {}, visible: {} } : variants,
  });

  return (
    <>
      <section className="relative flex min-h-[82vh] items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-20 dark:from-gray-900 dark:via-black dark:to-gray-900">
        <motion.div
          aria-hidden="true"
          className="absolute top-0 left-1/4 h-48 w-48 rounded-full bg-indigo-100 opacity-40 blur-3xl will-change-transform sm:h-72 sm:w-72 dark:bg-indigo-900/50"
          animate={prefersReducedMotion ? {} : { scale: [1, 1.3, 1], rotate: [0, 45, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute right-1/3 bottom-0 h-64 w-64 rounded-full bg-pink-100 opacity-30 blur-3xl will-change-transform sm:h-96 sm:w-96 dark:bg-pink-900/50"
          animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1], rotate: [0, -45, 0] }}
          transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute top-1/3 left-4 h-28 w-28 rounded-full bg-purple-200 opacity-20 blur-2xl will-change-transform sm:left-10 sm:h-40 sm:w-40 dark:bg-purple-800/40"
          animate={prefersReducedMotion ? {} : { y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute right-4 bottom-20 h-24 w-24 rounded-full bg-yellow-200 opacity-25 blur-2xl will-change-transform sm:right-10 sm:h-32 sm:w-32 dark:bg-yellow-800/40"
          animate={prefersReducedMotion ? {} : { y: [0, 25, 0], x: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(147,197,253,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(250,204,21,0.2)_1px,transparent_1px),linear-gradient(45deg,rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(-45deg,rgba(250,204,21,0.08)_1px,transparent_1px)] bg-[size:40px_40px,40px_40px,80px_80px,80px_80px] dark:hidden"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/30 to-white dark:from-transparent dark:to-gray-950"
        />

        <div className="z-10 my-16 w-full max-w-4xl text-center md:my-24">
          <motion.p
            variants={staggerItem}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-4 text-xs tracking-widest text-gray-400 uppercase dark:text-gray-500"
          >
            Open-source, community-driven, free forever
          </motion.p>

          <motion.h1
            variants={staggerItem}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-6 text-4xl font-extrabold text-black sm:text-6xl md:text-7xl dark:text-white"
            style={{ fontFamily: '"Anton", sans-serif' }}
          >
            About Us
          </motion.h1>

          <motion.p
            variants={staggerItem}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16 text-base text-black sm:text-lg dark:text-gray-300"
          >
            Eventra is a comprehensive open-source platform that empowers communities, colleges, and
            organizations worldwide to create, manage, and track events effortlessly. Transform the
            way you plan, execute, and experience events with ease.
          </motion.p>

          <ErrorBoundary level="section" label="Statistics">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-3"
            >
              {stats.map((s) => (
                <motion.div
                  key={s.label}
                  variants={scaleIn}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="cursor-default rounded-2xl bg-white/60 p-4 shadow-lg shadow-blue-100 backdrop-blur-sm sm:p-5 dark:bg-gray-800/60 dark:shadow-indigo-900/50"
                >
                  <h3 className="mb-1 text-xl font-bold text-black sm:text-2xl dark:text-white">
                    {s.value.includes("+") ? (
                      <CountUp
                        start={0}
                        end={parseInt(s.value, 10)}
                        duration={3}
                        suffix="+"
                        enableScrollSpy
                        scrollSpyOnce
                      />
                    ) : (
                      s.value
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </ErrorBoundary>
        </div>
      </section>

      <MissionSection anim={anim} prefersReducedMotion={prefersReducedMotion} />
    </>
  );
}

function MissionSection({ anim, prefersReducedMotion }) {
  const containerRef = useRef(null);
  const isContainerInView = useInView(containerRef, { once: false, amount: 0.2 });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(isContainerInView);
  }, [isContainerInView]);

  return (
    <section className="border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="mb-2 text-xs tracking-widest text-gray-400 uppercase dark:text-gray-500">
              Why we exist
            </p>
            <h2
              className="mb-5 text-3xl font-extrabold text-black sm:text-4xl dark:text-white"
              style={{ fontFamily: '"Anton", sans-serif' }}
            >
              Our Mission & Vision
            </h2>
            <p className="mb-5 text-sm leading-relaxed text-gray-500 sm:text-base dark:text-gray-400">
              We started Eventra because we were tired of watching college clubs and communities
              struggle with tools that were either too expensive or too complicated. There had to be
              something better.
            </p>
            <p className="text-sm leading-relaxed text-gray-500 sm:text-base dark:text-gray-400">
              We want a world where any club, any community, any group of people with an idea can
              run an event without needing a budget or a technical team behind them. That is what we
              are building toward.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {values.map((v) => (
              <motion.div
                key={v.title}
                variants={staggerItem}
                whileHover={prefersReducedMotion ? {} : { y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="cursor-default rounded-2xl border border-slate-100 bg-gradient-to-b from-white via-white to-slate-50 p-5 shadow-xl shadow-slate-100/70 transition-transform duration-300 dark:border-gray-700 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 dark:shadow-none"
              >
                <h4 className="mb-2 text-sm font-bold text-black dark:text-white">{v.title}</h4>
                <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div ref={containerRef} className="mt-12 grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
          <motion.div
            variants={cardItem}
            className="rounded-2xl border border-slate-100 bg-gradient-to-b from-white via-white to-slate-50 p-6 shadow-xl shadow-slate-100/70 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] dark:border-gray-800 dark:from-gray-800 dark:to-gray-900 dark:shadow-none"
            {...anim(scaleIn)}
          >
            <h3 className="mb-2 text-2xl font-bold text-black sm:text-3xl dark:text-white">
              {isOpen ? <CountUp start={0} end={500} duration={3} suffix="+" /> : "0+"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
          </motion.div>

          <motion.div
            variants={cardItem}
            className="rounded-2xl border border-slate-100 bg-gradient-to-b from-white via-white to-slate-50 p-6 shadow-xl shadow-slate-100/70 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] dark:border-gray-800 dark:from-gray-800 dark:to-gray-900 dark:shadow-none"
            {...anim(scaleIn)}
          >
            <h3 className="mb-2 text-2xl font-bold text-black sm:text-3xl dark:text-white">
              Global
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Community Reach</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
