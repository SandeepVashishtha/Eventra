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
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-200/50 bg-indigo-50/50 dark:border-indigo-800/40 dark:bg-indigo-950/30 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 shadow-glow-sm">
            {t("landing.hero.badge")}
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-[3.25rem]">
            {t("landing.hero.headlineBefore")}{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-fuchsia-400 dark:to-pink-400 bg-clip-text text-transparent">
              {t("landing.hero.headlineHighlight")}
            </span>{" "}
            {t("landing.hero.headlineAfter")}
          </h1>

          <p className="max-w-xl text-base font-medium leading-relaxed text-slate-700 dark:text-slate-200 sm:text-lg">
            {t("landing.hero.tagline")}
          </p>

          <p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
            {t("landing.hero.description")}
          </p>

          <p className="max-w-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            {t("landing.hero.differentiator")}
          </p>

          <ul
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            aria-label={t("landing.hero.platformStats")}
          >
            {SOCIAL_PROOF_VALUES.map((stat) => (
              <li key={stat.key} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                <span>
                  <span className="font-bold text-slate-900 dark:text-white">{stat.value}</span>{" "}
                  {t(`landing.hero.stats.${stat.key}`)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center">
            <Link
              to="/events"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-7 py-3 text-sm font-semibold text-white shadow-premium-md shadow-indigo-500/10 hover:shadow-premium-lg hover:shadow-indigo-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] sm:text-base"
            >
              {t("landing.hero.ctaExplore")}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              to="/create-event"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300/80 bg-white/40 backdrop-blur-sm px-7 py-3 text-sm font-semibold text-gray-700 hover:bg-white hover:text-indigo-600 hover:border-indigo-500/50 dark:border-slate-700/80 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-indigo-400 dark:hover:border-indigo-400/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] sm:text-base"
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
                className="rounded-full border border-slate-200 bg-white/60 px-3.5 py-1.5 text-xs font-medium text-slate-600 backdrop-blur-sm transition-all duration-300 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400 sm:text-sm"
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
