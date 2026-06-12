import { motion, useReducedMotion } from "framer-motion";
import { HelpCircle, LifeBuoy, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// ✅ OPTIMIZATION: Module-level definition prevents re-creation on every render
const MotionLink = motion(Link);

// ✅ MAINTAINABILITY: Extracted repeated classes
const CARD_BASE_CLASSES =
  "group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-4 shadow-md hover:shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0C1F]";
const ICON_CLASSES = "w-10 h-10";

export default function FAQCTA() {
  const { t } = useTranslation();

  const cards = [
    {
      title: t("faq.ctaBrowseTitle"),
      description: t("faq.ctaBrowseDesc"),
      to: "/faq",
      icon: <LifeBuoy className={`${ICON_CLASSES} text-purple-400`} aria-hidden="true" />,
      hoverClass: "hover:bg-black/10",
      onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
    {
      title: t("faq.ctaContactTitle"),
      description: t("faq.ctaContactDesc"),
      to: "/contact",
      icon: <MessageCircle className={`${ICON_CLASSES} text-teal-400`} aria-hidden="true" />,
      hoverClass: "hover:bg-gradient-to-br from-teal-400/20 via-cyan-400/20 to-blue-500/10",
    },
    {
      title: t("faq.ctaFeedbackTitle"),
      description: t("faq.ctaFeedbackDesc"),
      to: "/feedback",
      icon: <HelpCircle className={`${ICON_CLASSES} text-pink-400`} aria-hidden="true" />,
      hoverClass: "hover:bg-black/10",
    },
  ];

  // ✅ ACCESSIBILITY: Respect user's OS motion preferences
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative z-10 mx-auto mt-16 mb-12 max-w-5xl overflow-visible rounded-3xl bg-gradient-to-tr from-[#0C0C1F] via-[#1A1F36] to-[#0B1E2E] px-6 py-16 sm:px-8 lg:px-12">
      <div className="relative mx-auto max-w-4xl text-center">
        {/* Tag */}
        <motion.div
          className="mx-auto mb-8 inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-1 backdrop-blur-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <HelpCircle className="h-5 w-5 text-white/90" aria-hidden="true" />
          <span className="text-sm font-medium tracking-wider text-white/90">
            {t("faq.ctaBadge")}
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h2
          id="faq-cta-heading"
          className="mb-10 text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {t("faq.ctaHeading")}
        </motion.h2>

        {/* Glass cards */}
        <motion.div
          className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          role="list"
        >
          {cards.map((card) => (
            <MotionLink
              key={card.title}
              to={card.to}
              onClick={card.onClick}
              whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              className={`${CARD_BASE_CLASSES} ${card.hoverClass}`}
              role="listitem"
              aria-label={`${card.title}: ${card.description}`}
            >
              {card.icon}
              <h3 className="text-center text-lg font-semibold text-white">{card.title}</h3>
              <p className="text-center text-sm leading-relaxed text-white/70">
                {card.description}
              </p>
            </MotionLink>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
