/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
import { motion } from "framer-motion";
import { memo } from "react";
import { ArrowRight, Check, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import useDocumentTitle from "../hooks/useDocumentTitle";
import HeroVisual from "./HeroVisual";

const SOCIAL_PROOF_VALUES = [
  { value: "1,500+", key: "developers" },
  { value: "75+", key: "events" },
  { value: "30+", key: "partners" },
];

const Hero = () => {
  useDocumentTitle("Eventra | Home");
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden border-b border-border bg-bg pb-12 pt-6 sm:pb-16 sm:pt-8 md:pb-20 md:pt-10">
      {/* Structural layout: Asymmetric 2-column grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto grid w-full max-w-6xl items-start gap-8 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12"
      >
        <div className="flex flex-col pt-2 lg:pt-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-text-light mb-4">
            {t("landing.hero.badge")}
          </div>

          <h1
            style={{ fontFamily: "'Oxanium', sans-serif" }}
            className="text-4xl font-extrabold leading-tight tracking-tight text-text sm:text-5xl lg:text-[3.5rem] mb-4"
          >
            {t("landing.hero.headlineBefore")}{" "}
            <span className="text-primary">
              {t("landing.hero.headlineHighlight")}
            </span>{" "}
            {t("landing.hero.headlineAfter")}
          </h1>

          <p className="max-w-xl text-base font-normal leading-relaxed text-text-light sm:text-lg mb-6">
            {t("landing.hero.description")}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-8">
            <Link
              to="/events"
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-text text-bg hover:opacity-90 px-6 py-3 text-sm font-bold transition-all duration-200"
            >
              {t("landing.hero.ctaExplore")}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              to="/create-event"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card-bg hover:bg-bg-secondary text-text px-6 py-3 text-sm font-bold transition-all duration-200"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t("landing.hero.ctaCreate")}
            </Link>
          </div>

          <ul
            className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-text-light border-t border-border pt-6"
            aria-label={t("landing.hero.platformStats")}
          >
            {SOCIAL_PROOF_VALUES.map((stat) => (
              <li key={stat.key} className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                <span>
                  <span className="font-bold text-text">{stat.value}</span>{" "}
                  {t(`landing.hero.stats.${stat.key}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full lg:sticky lg:top-24">
          <HeroVisual />
        </div>
      </motion.div>
    </section>
  );
};

export default memo(Hero);
