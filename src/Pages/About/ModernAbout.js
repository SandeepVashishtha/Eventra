import { motion } from "framer-motion";
import {
  CalendarDays,
  Code2,
  HeartHandshake,
  Network,
  Trophy,
  Users,
} from "lucide-react";

import useDocumentTitle from "../../hooks/useDocumentTitle";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import ErrorBoundary from "../../components/common/ErrorBoundary";

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
    value: 75,
    suffix: "+",
    label: "Events and Hackathons",
    icon: CalendarDays,
  },
  {
    value: 1500,
    suffix: "+",
    label: "Builders and Organizers",
    icon: Users,
  },
  {
    value: 30,
    suffix: "+",
    label: "Project and Community Partners",
    icon: Network,
  },
];

const values = [
  {
    icon: CalendarDays,
    title: "Event Management",
    desc: "Plan, promote, discover, and join events with clear registration flows and organizer tools.",
  },
  {
    icon: Trophy,
    title: "Hackathon Growth",
    desc: "Support builders from idea discovery to team formation, submissions, and showcase moments.",
  },
  {
    icon: Code2,
    title: "Project Collaboration",
    desc: "Help participants turn event momentum into shared projects, learning, and contribution.",
  },
  {
    icon: HeartHandshake,
    title: "Networking",
    desc: "Create meaningful connections between students, developers, organizers, mentors, and communities.",
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
              Events • Hackathons • Projects • Community
            </motion.p>

            <motion.h1
              variants={item}
              className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight"
            >
              About Eventra
              <span className="block bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Built for Community
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed mb-16"
            >
              Eventra is an open-source platform for discovering, hosting, and managing community
              events. It brings event management, hackathons, networking, project collaboration,
              and participant engagement into one accessible experience for organizers and new
              users alike.
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
                      {stat.value}
                      {stat.suffix}
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
              Why Eventra Exists
            </motion.h2>

            <motion.p variants={item} className="max-w-3xl mx-auto text-lg text-slate-400">
              Eventra helps communities reduce event friction, welcome first-time participants,
              and keep learning, collaboration, and project momentum going after each event ends.
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
