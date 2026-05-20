
import { motion, useInView } from "framer-motion";
import { useEffect, useState, useRef } from "react";

import useDocumentTitle from "../../hooks/useDocumentTitle";
import CountUp from "react-countup";

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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const anim = (variants) => ({
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true },
    variants: prefersReducedMotion ? { hidden: {}, visible: {} } : variants,
  });

  return (
    <>
      <section className="relative min-h-[82vh] flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-900 overflow-hidden py-20 px-4">
        <motion.div 
          aria-hidden="true" 
          className="absolute top-0 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-indigo-100 dark:bg-indigo-900/50 rounded-full blur-3xl opacity-40 will-change-transform" 
          animate={prefersReducedMotion ? {} : { scale: [1, 1.3, 1], rotate: [0, 45, 0] }} 
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }} 
        />
        <motion.div 
          aria-hidden="true" 
          className="absolute bottom-0 right-1/3 w-64 sm:w-96 h-64 sm:h-96 bg-pink-100 dark:bg-pink-900/50 rounded-full blur-3xl opacity-30 will-change-transform" 
          animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1], rotate: [0, -45, 0] }} 
          transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }} 
        />
        <motion.div 
          aria-hidden="true" 
          className="absolute top-1/3 left-4 sm:left-10 w-28 sm:w-40 h-28 sm:h-40 bg-purple-200 dark:bg-purple-800/40 rounded-full blur-2xl opacity-20 will-change-transform" 
          animate={prefersReducedMotion ? {} : { y: [0, -30, 0], x: [0, 20, 0] }} 
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }} 
        />
        <motion.div 
          aria-hidden="true" 
          className="absolute bottom-20 right-4 sm:right-10 w-24 sm:w-32 h-24 sm:h-32 bg-yellow-200 dark:bg-yellow-800/40 rounded-full blur-2xl opacity-25 will-change-transform" 
          animate={prefersReducedMotion ? {} : { y: [0, 25, 0], x: [0, -15, 0] }} 
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }} 
        />
        <div aria-hidden="true" className="absolute inset-0 dark:hidden bg-[linear-gradient(to_right,rgba(147,197,253,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(250,204,21,0.2)_1px,transparent_1px),linear-gradient(45deg,rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(-45deg,rgba(250,204,21,0.08)_1px,transparent_1px)] bg-[size:40px_40px,40px_40px,80px_80px,80px_80px]" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/30 to-white dark:from-transparent dark:to-gray-950" />

        <div className="max-w-4xl md:my-24 my-16 w-full text-center z-10">
          <motion.p
            variants={staggerItem}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4"
          >
            Open-source, community-driven, free forever
          </motion.p>

          <motion.h1
            variants={staggerItem}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-black dark:text-white mb-6"
            style={{ fontFamily: '"Anton", sans-serif' }}
          >
            About Us
          </motion.h1>

          <motion.p
            variants={staggerItem}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-base sm:text-lg text-black dark:text-gray-300 mb-16"
          >
            Eventra is a comprehensive open-source platform that empowers
            communities, colleges, and organizations worldwide to create, manage,
            and track events effortlessly. Transform the way you plan, execute,
            and experience events with ease.
          </motion.p>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {stats.map((s) => (
              <motion.div 
                key={s.label} 
                variants={scaleIn} 
                whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -4 }} 
                transition={{ type: "spring", stiffness: 300, damping: 20 }} 
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100 dark:shadow-indigo-900/50 p-4 sm:p-5 cursor-default"
              >
                <h3 className="text-black dark:text-white text-xl sm:text-2xl font-bold mb-1">
                  {s.value.includes("+") ? (
                    <CountUp start={0} end={parseInt(s.value)} duration={3} suffix="+" enableScrollSpy scrollSpyOnce />
                  ) : (
                    s.value
                  )}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
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
    <section className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Why we exist</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black dark:text-white mb-5" style={{ fontFamily: '"Anton", sans-serif' }}>
              Our Mission & Vision
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed mb-5">
              We started Eventra because we were tired of watching college clubs and
              communities struggle with tools that were either too expensive or too complicated.
              There had to be something better.
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
              We want a world where any club, any community, any group of people with an
              idea can run an event without needing a budget or a technical team behind them.
              That is what we are building toward.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {values.map((v) => (
              <motion.div 
                key={v.title} 
                variants={staggerItem} 
                whileHover={prefersReducedMotion ? {} : { y: -4, scale: 1.02 }} 
                transition={{ type: "spring", stiffness: 300, damping: 20 }} 
                className="rounded-2xl border p-5 cursor-default bg-gradient-to-b from-white via-white to-slate-50 border-slate-100 shadow-xl shadow-slate-100/70 dark:bg-gray-800/50 transition-transform duration-300"
              >
                <h4 className="font-bold text-sm text-black dark:text-white mb-2">{v.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 w-full">
          <motion.div
            variants={cardItem}
            className="bg-gradient-to-b from-white via-white to-slate-50 dark:from-gray-800 dark:to-gray-900 border border-slate-100 dark:border-gray-800 shadow-xl shadow-slate-100/70 dark:shadow-none backdrop-blur-sm rounded-2xl p-6 hover:scale-[1.02] transition-all duration-500"
            {...anim(scaleIn)}
          >
            <h3 className="text-black dark:text-white text-2xl sm:text-3xl font-bold mb-2">
              {isOpen ? <CountUp start={0} end={500} duration={3} suffix="+" /> : "0+"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Active Users</p>
          </motion.div>

          <motion.div
            variants={cardItem}
            className="bg-gradient-to-b from-white via-white to-slate-50 dark:from-gray-800 dark:to-gray-900 border border-slate-100 dark:border-gray-800 shadow-xl shadow-slate-100/70 dark:shadow-none backdrop-blur-sm rounded-2xl p-6 hover:scale-[1.02] transition-all duration-500"
            {...anim(scaleIn)}
          >
            <h3 className="text-black dark:text-white text-2xl sm:text-3xl font-bold mb-2">Global</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Community Reach</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}