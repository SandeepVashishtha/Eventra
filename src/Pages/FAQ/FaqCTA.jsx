import { motion, useReducedMotion, useInView } from "framer-motion";
import { HelpCircle, LifeBuoy, MessageCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRef } from "react";

// ✅ PERFORMANCE: Module-level definitions
const MotionLink = motion(Link);
const ICON_CLASSES = "w-12 h-12 transition-transform duration-300";

export default function FAQCTA() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const cards = [
    {
      title: t("faq.ctaBrowseTitle"),
      description: t("faq.ctaBrowseDesc"),
      to: "/faq",
      icon: <LifeBuoy className={`${ICON_CLASSES} text-purple-400`} aria-hidden="true" />,
      accentColor: "from-purple-500/20 to-purple-600/10",
      hoverGradient: "hover:from-purple-500/30 hover:via-purple-400/20 hover:to-pink-500/10",
      onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
      badge: t("faq.ctaBrowseBadge", "Popular"),
    },
    {
      title: t("faq.ctaContactTitle"),
      description: t("faq.ctaContactDesc"),
      to: "/contact",
      icon: <MessageCircle className={`${ICON_CLASSES} text-teal-400`} aria-hidden="true" />,
      accentColor: "from-teal-500/20 to-cyan-600/10",
      hoverGradient: "hover:from-teal-400/30 hover:via-cyan-400/20 hover:to-blue-500/10",
      badge: t("faq.ctaContactBadge", "24/7"),
    },
    {
      title: t("faq.ctaFeedbackTitle"),
      description: t("faq.ctaFeedbackDesc"),
      to: "/feedback",
      icon: <HelpCircle className={`${ICON_CLASSES} text-pink-400`} aria-hidden="true" />,
      accentColor: "from-pink-500/20 to-rose-600/10",
      hoverGradient: "hover:from-pink-400/30 hover:via-rose-400/20 hover:to-orange-500/10",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative z-10 py-20 px-6 sm:px-8 lg:px-12 overflow-visible mt-20 mb-16 mx-auto max-w-6xl"
      aria-labelledby="faq-cta-heading"
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0C0C1F] via-[#1A1F36] to-[#0B1E2E] rounded-3xl" />
      </div>

      {/* Decorative border */}
      <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        {/* Enhanced tag */}
        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="relative inline-flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-full px-6 py-2 border border-white/20 shadow-lg shadow-purple-500/10">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-transparent to-teal-500/20 opacity-50" />
            <HelpCircle className="relative w-5 h-5 text-white/90" aria-hidden="true" />
            <span className="relative text-white/90 text-sm tracking-wider font-medium">
              {t("faq.ctaBadge")}
            </span>
          </div>
        </motion.div>

        {/* Gradient text heading */}
        <motion.h2
          id="faq-cta-heading"
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center mb-6 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="bg-gradient-to-r from-white via-purple-200 to-teal-200 bg-clip-text text-transparent">
            {t("faq.ctaHeading")}
          </span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="text-white/60 text-center text-lg mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t("faq.ctaSubtitle", "Choose how you'd like to get help or share your thoughts")}
        </motion.p>

        {/* Cards grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
          role="list"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {cards.map((card) => (
            <MotionLink
              key={card.title}
              to={card.to}
              onClick={card.onClick}
              variants={cardVariants}
              whileHover={shouldReduceMotion ? {} : { scale: 1.03, y: -5 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-5 shadow-xl hover:shadow-2xl transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0C1F] overflow-hidden"
              role="listitem"
              aria-label={`${card.title}: ${card.description}`}
            >
              {/* Animated gradient background on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Glowing border effect */}
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white/20 transition-all duration-500" />

              {/* Icon container with glow */}
              <div className="relative">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.accentColor} rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div className="relative p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:border-white/20 transition-all duration-300">
                  {card.icon}
                </div>
              </div>

              {/* Badge */}
              {card.badge && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <span className="text-white/80 text-xs font-medium">{card.badge}</span>
                </div>
              )}

              {/* Content */}
              <div className="relative text-center space-y-3">
                <h3 className="text-white font-bold text-xl group-hover:text-white transition-colors duration-300">
                  {card.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                  {card.description}
                </p>
              </div>

              {/* Arrow indicator */}
              <div className="relative mt-auto flex items-center gap-2 text-white/60 group-hover:text-white transition-all duration-300">
                <span className="text-sm font-medium">
                  {t("common.learnMore", "Learn more")}
                </span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </MotionLink>
          ))}
        </motion.div>

        {/* Bottom decorative element */}
        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400/50 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-teal-400/50 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-pink-400/50 animate-pulse" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}