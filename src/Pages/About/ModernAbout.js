import { useMemo } from "react";
import { motion } from "framer-motion";
import { Globe, Users, CalendarDays, HeartHandshake, Sparkles, Code2, Rocket } from "lucide-react";
import { useTranslation } from "react-i18next";

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

const STAT_CONFIG = [
  {
    id: "events",
    value: 100,
    suffix: "+",
    icon: CalendarDays,
  },
  {
    id: "builders",
    value: 500,
    suffix: "+",
    icon: Users,
  },
  {
    id: "partners",
    value: "Global",
    icon: Globe,
  },
];

const VALUE_CONFIG = [
  {
    id: "eventManagement",
    icon: Code2,
  },
  {
    id: "hackathonGrowth",
    icon: HeartHandshake,
  },
  {
    id: "projectCollaboration",
    icon: Rocket,
  },
  {
    id: "networking",
    icon: Sparkles,
  },
];

export default function ModernAbout() {
  const { t } = useTranslation();

  useDocumentTitle(t("about.documentTitle"));

  const prefersReducedMotion = useReducedMotion();

  const stats = useMemo(
    () =>
      STAT_CONFIG.map((stat) => ({
        ...stat,
        label: t(`about.stats.${stat.id}`),
      })),
    [t],
  );

  const values = useMemo(
    () =>
      VALUE_CONFIG.map((value) => ({
        ...value,
        title: t(`about.values.${value.id}.title`),
        desc: t(`about.values.${value.id}.description`),
      })),
    [t],
  );

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
              {t("about.hero.tagline")}
            </motion.p>

            <motion.h1
              variants={item}
              className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight"
            >
              {t("about.hero.title")}
              <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {t("about.hero.subtitle")}
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed mb-16"
            >
              {t("about.hero.description")}
            </motion.p>
          </motion.div>

          {/* Stats */}
          <ErrorBoundary level="section" label={t("about.errorBoundaryLabel")}>
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
                    key={stat.id}
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
              {t("about.values.heading")}
            </motion.h2>

            <motion.p variants={item} className="max-w-3xl mx-auto text-lg text-slate-400">
              {t("about.values.description")}
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
                  key={value.id}
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
