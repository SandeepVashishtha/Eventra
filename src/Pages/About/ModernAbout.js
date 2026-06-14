import { motion } from "framer-motion";
import { Globe, Users, CalendarDays, HeartHandshake, Sparkles, Code2, Rocket } from "lucide-react";

import useDocumentTitle from "../../hooks/useDocumentTitle";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import CountUpLib from "react-countup";
import ErrorBoundary from "../../components/common/ErrorBoundary";

const CountUp = CountUpLib.default || CountUpLib;

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

const stats = [
  {
    value: 100,
    suffix: "+",
    label: "Events Hosted",
    icon: CalendarDays,
  },
  {
    value: 500,
    suffix: "+",
    label: "Community Members",
    icon: Users,
  },
  {
    value: "Global",
    label: "Community Reach",
    icon: Globe,
  },
];

const values = [
  {
    icon: Code2,
    title: "Open Source",
    desc: "Built transparently and freely available for communities worldwide.",
  },
  {
    icon: HeartHandshake,
    title: "Community First",
    desc: "Designed around collaboration, inclusion, and meaningful connections.",
  },
  {
    icon: Rocket,
    title: "Innovation",
    desc: "Continuously evolving through community feedback and modern technology.",
  },
  {
    icon: Sparkles,
    title: "Accessibility",
    desc: "Simple, intuitive, and accessible for organizers of every skill level.",
  },
];

export default function ModernAbout() {
  useDocumentTitle("Eventra | About");

  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-slate-950 overflow-hidden py-24 px-4">
        {/* Background Glow */}
        <motion.div
          aria-hidden="true"
          className="absolute top-0 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  scale: [1, 1.15, 1],
                }
          }
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          aria-hidden="true"
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  scale: [1, 1.2, 1],
                }
          }
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Grid Overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(to right, white 1px, transparent 1px),
              linear-gradient(to bottom, white 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 max-w-5xl text-center">
          <motion.div variants={container} initial="hidden" animate="visible">
            <motion.p
              variants={item}
              className="text-sm uppercase tracking-[0.25em] text-blue-400 mb-6"
            >
              Open Source • Community Driven • Free Forever
            </motion.p>

            <motion.h1
              variants={item}
              className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight"
            >
              Building Better Events
              <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Together
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed mb-16"
            >
              Eventra empowers communities, colleges, organizations, and open-source teams to
              create, manage, and grow impactful events through accessible, modern, and
              collaborative event management tools.
            </motion.p>
          </motion.div>

          {/* Stats */}
          <ErrorBoundary level="section" label="Statistics">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <motion.div
                    key={stat.label}
                    variants={item}
                    whileHover={
                      prefersReducedMotion
                        ? {}
                        : {
                            y: -6,
                          }
                    }
                    className="bg-slate-900/70 border border-slate-800 backdrop-blur-sm rounded-3xl p-6"
                  >
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>

                    <h3 className="text-3xl font-bold text-white mb-2">
                      {typeof stat.value === "number" ? (
                        <CountUp
                          start={0}
                          end={stat.value}
                          duration={3}
                          suffix={stat.suffix}
                          enableScrollSpy
                          scrollSpyOnce
                        />
                      ) : (
                        stat.value
                      )}
                    </h3>

                    <p className="text-slate-400 text-sm">{stat.label}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </ErrorBoundary>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={item} className="text-4xl md:text-5xl font-bold text-white mb-6">
              What Drives Eventra
            </motion.h2>

            <motion.p variants={item} className="max-w-3xl mx-auto text-lg text-slate-400">
              Our values guide every decision we make, ensuring Eventra remains accessible,
              community-focused, and built for long-term impact.
            </motion.p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 xl:grid-cols-4 gap-6"
          >
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <motion.div
                  key={value.title}
                  variants={item}
                  whileHover={
                    prefersReducedMotion
                      ? {}
                      : {
                          y: -6,
                        }
                  }
                  className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>

                  <p className="text-slate-400 leading-relaxed">{value.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </>
  );
}
