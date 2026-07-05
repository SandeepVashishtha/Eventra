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
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-700 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300">
            {t("landing.hero.badge")}
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-[3.25rem]">
            {t("landing.hero.headlineBefore")}{" "}
            <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
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

          <p className="max-w-xl text-sm font-medium text-violet-700 dark:text-violet-300">
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/events"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-pink-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-transform hover:scale-[1.02] sm:text-base"
            >
              {t("landing.hero.ctaExplore")}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              to="/create-event"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-violet-500 bg-white px-7 py-3 text-sm font-semibold text-violet-600 transition-colors hover:bg-violet-50 dark:border-violet-400 dark:bg-transparent dark:text-violet-300 dark:hover:bg-violet-950/40 sm:text-base"
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
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-violet-600 dark:hover:text-violet-300 sm:text-sm"
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
