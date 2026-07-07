import { motion } from "framer-motion";
import { memo, useMemo } from "react";
import { ArrowRight, Check, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import useDocumentTitle from "../../../hooks/useDocumentTitle";
import HeroVisual from "./HeroVisual";

const SOCIAL_PROOF_VALUES = [
  { value: "1,500+", key: "developers" },
  { value: "75+", key: "events" },
  { value: "30+", key: "partners" },
];

const Hero = () => {
  useDocumentTitle("Eventra | Home");
  const { t } = useTranslation();

  const categoryChips = useMemo(
    () => [
      { label: t("landing.hero.categories.hackathons"), to: "/hackathons" },
      { label: t("landing.hero.categories.ai"), to: "/events" },
      { label: t("landing.hero.categories.webDev"), to: "/events" },
      { label: t("landing.hero.categories.openSource"), to: "/projects" },
      { label: t("landing.hero.categories.workshops"), to: "/events" },
    ],
    [t]
  );

  return (
    <section className="relative overflow-hidden pb-10 pt-6 sm:pb-14 sm:pt-8 md:pb-16 md:pt-10">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-600/10" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-pink-300/20 blur-3xl dark:bg-pink-600/10" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto grid w-full max-w-6xl items-center gap-6 px-4 sm:gap-8 lg:grid-cols-2 lg:gap-10"
      >
        <div className="flex flex-col gap-4 sm:gap-5">
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-white/[0.04] dark:bg-white/[0.02] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-text-light">
            {t("landing.hero.badge")}
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tighter text-text sm:text-5xl lg:text-[3.25rem]">
            {t("landing.hero.headlineBefore")}{" "}
            <span className="bg-gradient-to-r from-slate-950 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              {t("landing.hero.headlineHighlight")}
            </span>{" "}
            {t("landing.hero.headlineAfter")}
          </h1>

          <p className="max-w-xl text-base font-medium leading-relaxed text-text-light sm:text-lg">
            {t("landing.hero.tagline")}
          </p>

          <p className="max-w-xl text-sm leading-relaxed text-text-light/80 sm:text-base">
            {t("landing.hero.description")}
          </p>

          <p className="max-w-xl text-sm font-semibold text-primary">
            {t("landing.hero.differentiator")}
          </p>

          <ul
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-text-light"
            aria-label={t("landing.hero.platformStats")}
          >
            {SOCIAL_PROOF_VALUES.map((stat) => (
              <li key={stat.key} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                <span>
                  <span className="font-bold text-text">{stat.value}</span>{" "}
                  {t(`landing.hero.stats.${stat.key}`)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/events"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 px-6 py-2.5 text-sm font-semibold shadow-premium-sm hover:shadow-premium-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] sm:text-base"
            >
              {t("landing.hero.ctaExplore")}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              to="/create-event"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white dark:bg-slate-900/40 hover:bg-gray-50 dark:hover:bg-slate-800 text-text px-6 py-2.5 text-sm font-semibold shadow-premium-sm hover:shadow-premium-md transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] sm:text-base"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t("landing.hero.ctaCreate")}
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {categoryChips.map((chip) => (
              <Link
                key={chip.to + chip.label}
                to={chip.to}
                className="rounded-lg border border-border bg-white/30 dark:bg-white/[0.02] px-3.5 py-1.5 text-xs font-semibold text-text-light hover:text-text hover:border-border hover:bg-white/70 dark:hover:bg-white/[0.05] transition-all duration-200"
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="order-first lg:order-last">
          <HeroVisual />
        </div>
      </motion.div>
    </section>
  );
};

export default memo(Hero);
