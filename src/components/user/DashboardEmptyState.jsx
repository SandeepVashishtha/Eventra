/**
 * @fileoverview DashboardEmptyState — premium empty-state UI for the dashboard (#7453)
 *
 * Shown on the Overview tab when a user has zero registered events, hackathons,
 * or projects. Provides a visually engaging illustration, motivating copy, and
 * direct CTAs to browse events or create one.
 */

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, Search, Plus, Sparkles, ArrowRight } from "lucide-react";

const DashboardEmptyState = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] mx-auto max-w-2xl my-10"
    >
      {/* ── Decorative background blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 opacity-60 blur-3xl dark:from-indigo-900/20 dark:to-purple-900/20" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-gradient-to-tr from-blue-100 to-cyan-100 opacity-60 blur-3xl dark:from-blue-900/20 dark:to-cyan-900/20" />
        <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-300/40 to-transparent dark:via-indigo-500/20" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-8 py-14 text-center sm:px-14">
        {/* ── Illustration ── */}
        <div className="mb-8 flex items-center justify-center">
          <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 shadow-inner dark:from-indigo-900/30 dark:to-purple-900/30">
            {/* Orbiting calendar icon */}
            <Calendar
              size={52}
              className="text-indigo-400 dark:text-indigo-300"
              strokeWidth={1.5}
            />
            {/* Sparkle accent top-right */}
            <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md dark:bg-gray-800">
              <Sparkles size={14} className="text-amber-400" />
            </span>
            {/* Search accent bottom-left */}
            <span className="absolute -bottom-2 -left-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md dark:bg-gray-800">
              <Search size={14} className="text-indigo-400" />
            </span>
          </div>
        </div>

        {/* ── Headline ── */}
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Your dashboard is ready for action
        </h2>

        {/* ── Sub-copy ── */}
        <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          You haven&apos;t joined any events or hackathons yet. Discover thousands of upcoming
          events tailored to your interests and start building your schedule today.
        </p>

        {/* ── Feature highlights ── */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[
            { emoji: "🎤", label: "Talks & Conferences" },
            { emoji: "🏆", label: "Hackathons" },
            { emoji: "🛠️", label: "Workshops" },
            { emoji: "🤝", label: "Networking" },
          ].map(({ emoji, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {emoji} {label}
            </span>
          ))}
        </div>

        {/* ── CTA buttons ── */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {/* Primary — browse events */}
          <button
            type="button"
            onClick={() => navigate("/events")}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 active:scale-[0.98]"
            aria-label="Browse all events"
          >
            <Search size={16} />
            Browse Events
            <ArrowRight size={15} className="opacity-80" />
          </button>

          {/* Secondary — create an event */}
          <button
            type="button"
            onClick={() => navigate("/create-event")}
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
            aria-label="Create a new event"
          >
            <Plus size={16} />
            Create Event
          </button>
        </div>

        {/* ── Subtle reassurance line ── */}
        <p className="mt-6 text-[11px] text-gray-400 dark:text-gray-500">
          Free to join · No credit card required · Events updated daily
        </p>
      </div>
    </motion.div>
  );
};

export default DashboardEmptyState;
