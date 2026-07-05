import { motion } from "framer-motion";
import { memo } from "react";
import { ArrowRight, Check, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import useDocumentTitle from "../../../hooks/useDocumentTitle";
import HeroVisual from "./HeroVisual";

const CATEGORY_CHIPS = [
  { label: "Hackathons", to: "/hackathons" },
  { label: "AI", to: "/events" },
  { label: "Web Development", to: "/events" },
  { label: "Open Source", to: "/projects" },
  { label: "Workshops", to: "/events" },
];

const SOCIAL_PROOF = [
  { value: "1,500+", label: "Developers" },
  { value: "75+", label: "Events Hosted" },
  { value: "30+", label: "Partners" },
];

const Hero = () => {
  useDocumentTitle("Eventra | Home");

  return (
    <section className="relative overflow-hidden py-10 sm:py-14 md:py-16">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-600/10" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-pink-300/20 blur-3xl dark:bg-pink-600/10" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto grid w-full max-w-6xl items-center gap-8 px-4 lg:grid-cols-2 lg:gap-10"
      >
        <div className="flex flex-col gap-5 sm:gap-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-700 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300">
            The home for developers & tech events
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-[3.25rem]">
            Build.{" "}
            <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
              Learn.
            </span>{" "}
            Network.
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
            Eventra helps developers discover hackathons, attend tech events, collaborate on
            projects, and grow through community-driven experiences—all in one place.
          </p>

          <ul
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            aria-label="Platform statistics"
          >
            {SOCIAL_PROOF.map((stat) => (
              <li key={stat.label} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                <span>
                  <span className="font-bold text-slate-900 dark:text-white">{stat.value}</span>{" "}
                  {stat.label}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/events"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-pink-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-transform hover:scale-[1.02] sm:text-base"
            >
              Explore Events
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
              Create Event
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {CATEGORY_CHIPS.map((chip) => (
              <Link
                key={chip.label}
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
