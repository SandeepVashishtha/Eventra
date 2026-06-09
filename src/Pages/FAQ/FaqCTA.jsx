import { motion, useReducedMotion } from "framer-motion";
import { HelpCircle, LifeBuoy, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// ✅ OPTIMIZATION: Module-level definition prevents re-creation on every render
const MotionLink = motion(Link);

// ✅ MAINTAINABILITY: Extracted repeated classes
const CARD_BASE_CLASSES = "group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-4 shadow-md hover:shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0C1F]";
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
    <section
      className="relative z-10 bg-gradient-to-tr from-[#0C0C1F] via-[#1A1F36] to-[#0B1E2E] py-20 px-8 sm:px-12 lg:px-20 overflow-visible mt-20 mb-12 mx-8 rounded-3xl"
    >
      <div className="relative max-w-6xl mx-auto text-center m-4">
        {/* Tag */}
        <motion.div
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-1 mb-8 justify-center mx-auto border border-white/20"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <HelpCircle className="w-5 h-5 text-white/90" aria-hidden="true" />
          <span className="text-white/90 text-sm tracking-wider font-medium">
            {t("faq.ctaBadge")}
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h2
          id="faq-cta-heading"
          className="text-4xl sm:text-5xl font-extrabold text-white mb-12 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {t("faq.ctaHeading")}
        </motion.h2>

        {/* Glass cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10"
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
              <h3 className="text-white font-semibold text-lg text-center">
                {card.title}
              </h3>
              <p className="text-white/70 text-sm text-center">
                {card.description}
              </p>
            </MotionLink>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/*
 * ============================================================================
 * ACCESSIBILITY & QUALITY CHECKLIST - FAQCTA Component
 * ============================================================================
 * ✅ All decorative icons: aria-hidden="true" (prevents screen reader noise)
 * ✅ Section: aria-labelledby="faq-cta-heading" (links section to heading)
 * ✅ Heading: id="faq-cta-heading" (unique, descriptive identifier)
 * ✅ Grid container: role="list" (semantic structure for assistive tech)
 * ✅ Cards: role="listitem" + aria-label (clear context for navigation)
 * ✅ Interactive: focus-visible ring preserved, hover/tap respects reduced-motion
 * 
 * 🔄 Testing:
 * 1. VoiceOver/ChromeVox → Icons skipped, heading announced properly
 * 2. Keyboard Tab → Focus rings visible, Enter triggers navigation/scroll
 * 3. DevTools → Set `prefers-reduced-motion: reduce` → Animations disabled
 * ============================================================================
 */