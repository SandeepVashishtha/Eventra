import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  Code2,
  Handshake,
  QrCode,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const ICON_CLASSES = "text-blue-400 w-6 h-6";

const CARD_BASE_CLASSES =
  "group relative bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300";

const HEADING_CLASSES = "text-4xl md:text-5xl font-bold text-white tracking-tight";

const DESCRIPTION_CLASSES = "mt-6 text-lg text-slate-400 max-w-3xl mx-auto";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const FEATURE_CONFIG = [
  {
    id: "events",
    icon: <CalendarCheck className={ICON_CLASSES} />,
    link: "/events",
    enabled: true,
  },
  {
    id: "hackathons",
    icon: <Trophy className={ICON_CLASSES} />,
    link: "/hackathons",
    enabled: true,
  },
  {
    id: "projects",
    icon: <Code2 className={ICON_CLASSES} />,
    link: "/projects",
    enabled: true,
  },
  {
    id: "connections",
    icon: <Handshake className={ICON_CLASSES} />,
    link: "/community-event",
    enabled: true,
  },
  {
    id: "manage",
    icon: <QrCode className={ICON_CLASSES} />,
    link: "/documentation",
    enabled: true,
  },
  {
    id: "benefits",
    icon: <Sparkles className={ICON_CLASSES} />,
    link: "/signup",
    enabled: true,
  },
];

export default function Features() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  const features = useMemo(
    () =>
      FEATURE_CONFIG.map((feature) => ({
        ...feature,
        stat: t(`about.features.items.${feature.id}.stat`),
        title: t(`about.features.items.${feature.id}.title`),
        description: t(`about.features.items.${feature.id}.description`),
        cta: t(`about.features.items.${feature.id}.cta`),
      })),
    [t],
  );

  const animationProps = shouldReduceMotion
    ? { initial: false, animate: "visible" }
    : { initial: "hidden", whileInView: "visible" };

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="relative py-24 bg-slate-950 overflow-hidden"
    >
      {/* Background Glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={container}
          {...animationProps}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.h2 variants={item} id="features-heading" className={HEADING_CLASSES}>
            {t("about.features.heading")}
          </motion.h2>

          <motion.p variants={item} className={DESCRIPTION_CLASSES}>
            {t("about.features.description")}
          </motion.p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          {...animationProps}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
          role="list"
        >
          {features.map((feature) => (
            <motion.article
              key={feature.id}
              variants={item}
              role="listitem"
              whileHover={shouldReduceMotion ? {} : { y: -6 }}
              className={CARD_BASE_CLASSES}
            >
              {/* Top */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                  {feature.icon}
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  {feature.stat}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>

                <p className="text-slate-400 leading-relaxed mb-6">{feature.description}</p>

                {feature.enabled ? (
                  <Link
                    to={feature.link}
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium"
                    aria-label={t("about.features.ctaAriaLabel", {
                      cta: feature.cta,
                      title: feature.title,
                    })}
                  >
                    {feature.cta}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <span
                    className="inline-flex items-center gap-2 text-slate-500 cursor-not-allowed"
                    aria-disabled="true"
                  >
                    {feature.cta}
                    <ArrowRight className="w-4 h-4 opacity-50" />
                  </span>
                )}
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
