import { AnimatePresence, motion } from "framer-motion";
import { Award, Calendar, Code2, Sparkles, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ModernSearchInput from "../../components/common/ModernSearchInput";
import { useAuth } from "../../context/AuthContext";
import CountUpLib from "react-countup";
import ErrorBoundary from "../../components/common/ErrorBoundary";
import useReducedMotion from "../../hooks/useReducedMotion.js";

const CountUp = CountUpLib.default || CountUpLib;
// Tag component for selected tags in search bar
const Tag = ({ tag, onRemove }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
    className="flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 shadow-sm backdrop-blur-sm dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-300"
  >
    <span>{tag}</span>
    <button
      onClick={() => onRemove(tag)}
      className="rounded-full p-0.5 transition-colors hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
    >
      <X className="h-3 w-3" />
    </button>
  </motion.div>
);

export default function HackathonHero({
  searchQuery,
  setSearchQuery,
  scrollToCards,
  filteredCount = 0,
  selectedTags = [],
  onTagRemove,
  onSearchKeyDown,
  searchInputRef,
  availableTags = [],
  onTagSelect,
}) {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-slate-50 via-indigo-50/40 to-slate-50 py-16 text-slate-900 transition-colors duration-300 sm:py-20 md:py-24 dark:border-indigo-900/40 dark:from-slate-950 dark:via-indigo-950/60 dark:to-slate-950 dark:text-white">
      {/* ── Animated mesh background blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{
            duration: prefersReducedMotion ? 0 : 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-blue-400/20 blur-[100px] dark:bg-blue-600/20 dark:blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{
            duration: prefersReducedMotion ? 0 : 13,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -right-32 -bottom-32 h-[500px] w-[500px] rounded-full bg-violet-400/20 blur-[100px] dark:bg-violet-600/20 dark:blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{
            duration: prefersReducedMotion ? 0 : 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/20 blur-[80px] dark:bg-cyan-500/10 dark:blur-[100px]"
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* ======================= HERO SECTION ======================= */}
      <div className="relative z-10 flex min-h-[75vh] flex-col items-center justify-center px-4 text-center">
        {/* Premium badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold tracking-widest text-indigo-700 uppercase shadow-sm backdrop-blur-md dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300 dark:shadow-[0_0_20px_rgba(99,102,241,0.25)]"
        >
          <Sparkles className="h-3 w-3 text-indigo-500 dark:text-indigo-400" />
          Innovation Starts Here
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.7, delay: 0.1 }}
          className="text-5xl leading-tight font-extrabold tracking-tight sm:text-7xl"
          style={{ fontFamily: '"Big Shoulders Display", sans-serif' }}
        >
          <span className="text-slate-900 drop-shadow-sm dark:text-white dark:drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
            Discover{" "}
          </span>
          <span
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400"
            style={{ filter: "drop-shadow(0 0 24px rgba(99,102,241,0.3))" }}
          >
            Hackathons
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: prefersReducedMotion ? 0 : 0.7 }}
          className="mx-auto mt-4 mb-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300"
        >
          Find and join the most exciting hackathons, compete with the best, and win prizes.
        </motion.p>

        {/* Glassmorphism search wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: prefersReducedMotion ? 0 : 0.6 }}
          className="mx-auto mt-10 w-full max-w-3xl"
        >
          <div className="rounded-2xl border border-white/60 bg-white/60 p-1 shadow-lg ring-1 ring-slate-200/50 backdrop-blur-xl ring-inset dark:border-white/10 dark:bg-white/5 dark:shadow-[0_8px_40px_rgba(99,102,241,0.15)] dark:ring-white/5">
            <ModernSearchInput
              searchInputRef={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder="Search hackathons by name, location, or tags..."
              tags={
                <AnimatePresence>
                  {selectedTags.map((tag) => (
                    <Tag key={tag} tag={tag} onRemove={onTagRemove} />
                  ))}
                </AnimatePresence>
              }
              showClearButton={searchQuery || selectedTags.length > 0}
              onClear={() => {
                setSearchQuery("");
                selectedTags.forEach((tag) => onTagRemove(tag));
              }}
            />
          </div>

          {/* TAG FILTERS */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex flex-wrap justify-center gap-2">
              {availableTags.slice(0, 10).map((tag, idx) => (
                <motion.span
                  key={idx}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTagSelect(tag)}
                  className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    selectedTags.includes(tag)
                      ? "border-indigo-500 bg-indigo-600 text-white shadow-md dark:shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                      : "border-slate-200 bg-white/80 text-slate-600 shadow-sm backdrop-blur-sm hover:border-indigo-300 hover:bg-white hover:text-indigo-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:shadow-none dark:hover:border-indigo-500/40 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              {filteredCount} {filteredCount === 1 ? "hackathon" : "hackathons"} found
            </span>
          </div>
        </motion.div>

        {/* CTA BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: prefersReducedMotion ? 0 : 0.7 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="relative flex items-center gap-2 overflow-hidden rounded-xl border border-indigo-500/30 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-7 py-3.5 font-semibold text-white shadow-lg transition-all duration-200 dark:shadow-[0_0_24px_rgba(99,102,241,0.4)]"
            onClick={scrollToCards}
          >
            {/* Shine effect */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 hover:translate-x-full" />
            <Sparkles className="h-5 w-5" />
            Explore Hackathons
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (!user) navigate("/login");
              else navigate("/host-hackathon");
            }}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-7 py-3.5 font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-indigo-300 hover:bg-white dark:border-white/20 dark:bg-white/5 dark:text-slate-200 dark:shadow-none dark:hover:border-indigo-400/50 dark:hover:bg-white/10"
          >
            <Users className="h-5 w-5 text-indigo-600 dark:text-slate-200" />
            Host a Hackathon
          </motion.button>
        </motion.div>
      </div>

      {/* STATS SECTION */}
      {searchQuery.trim() === "" && selectedTags.length === 0 && (
        <ErrorBoundary level="section" label="Hackathon Statistics">
          <div className="relative mx-auto mt-14 mb-12 grid max-w-6xl grid-cols-2 gap-4 px-4 sm:mt-20 sm:mb-16 sm:gap-6 sm:px-6 lg:grid-cols-4">
            {[
              {
                label: "Hackathons Hosted",
                value: 120,
                suffix: "+",
                icon: Calendar,
                color: "from-blue-500 to-indigo-500",
              },
              {
                label: "Participants",
                value: 50,
                suffix: "k+",
                icon: Users,
                color: "from-violet-500 to-purple-500",
              },
              {
                label: "Projects Built",
                value: 8,
                suffix: "k+",
                icon: Code2,
                color: "from-cyan-500 to-blue-500",
              },
              {
                label: "Prizes Awarded",
                value: 1,
                prefix: "$",
                suffix: "M+",
                icon: Award,
                color: "from-amber-500 to-orange-500",
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + idx * 0.12, duration: prefersReducedMotion ? 0 : 0.6 }}
                whileHover={{ scale: 1.04, y: -4 }}
                className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-6 text-center shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
              >
                {/* Gradient top border line */}
                <div
                  className={`absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r ${stat.color} opacity-80 transition-opacity group-hover:opacity-100`}
                />

                {/* Icon */}
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-sm dark:shadow-[0_0_20px_rgba(99,102,241,0.2)]`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>

                <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  <CountUp
                    start={0}
                    end={stat.value}
                    duration={2.5}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </p>
                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </ErrorBoundary>
      )}
    </div>
  );
}
