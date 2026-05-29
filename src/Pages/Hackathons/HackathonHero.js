import { AnimatePresence, motion } from "framer-motion";
import { Award, Calendar, Code2, Sparkles, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ModernSearchInput from "../../components/common/ModernSearchInput";
import { useAuth } from "../../context/AuthContext";
import CountUpLib from "react-countup";
import SectionErrorBoundary from "../../components/common/SectionErrorBoundary";
import useReducedMotion from "../../hooks/useReducedMotion.js";

const CountUp = CountUpLib.default;
// Tag component for selected tags in search bar
const Tag = ({ tag, onRemove }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
    className="flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-300 backdrop-blur-sm"
  >
    <span>{tag}</span>
    <button
      onClick={() => onRemove(tag)}
      className="rounded-full p-0.5 transition-colors hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
    >
      <X className="w-3 h-3" />
    </button>
  </motion.div>
);

export default function HackathonHero({
  hackathons = [],
  searchQuery,
  setSearchQuery,
  scrollToCards,
  filteredCount = 0,
  selectedTags = [],
  onTagRemove,
  onSearchKeyDown,
  searchInputRef,
  availableTags = [],
  onTagSelect
}) {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-indigo-50/40 to-slate-50 dark:from-slate-950 dark:via-indigo-950/60 dark:to-slate-950 text-slate-900 dark:text-white py-16 sm:py-20 md:py-24 border-b border-slate-200 dark:border-indigo-900/40 transition-colors duration-300">

      {/* ── Animated mesh background blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: prefersReducedMotion ? 0 : 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[100px] dark:blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: prefersReducedMotion ? 0 : 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-violet-400/20 dark:bg-violet-600/20 blur-[100px] dark:blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: prefersReducedMotion ? 0 : 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-400/20 dark:bg-cyan-500/10 blur-[80px] dark:blur-[100px]"
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
      <div className="relative px-4 min-h-[75vh] flex flex-col items-center justify-center text-center z-10">

        {/* Premium badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-700 shadow-sm dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300 dark:shadow-[0_0_20px_rgba(99,102,241,0.25)] backdrop-blur-md"
        >
          <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
          Innovation Starts Here
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.7, delay: 0.1 }}
          className="text-5xl sm:text-7xl font-extrabold leading-tight tracking-tight"
          style={{ fontFamily: '"Big Shoulders Display", sans-serif' }}
        >
          <span className="text-slate-900 dark:text-white drop-shadow-sm dark:drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
            Discover{" "}
          </span>
          <span
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent"
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
          className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-6 leading-relaxed"
        >
          Find and join the most exciting hackathons, compete with the best,
          and win prizes.
        </motion.p>

        {/* Glassmorphism search wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: prefersReducedMotion ? 0 : 0.6 }}
          className="w-full max-w-3xl mx-auto mt-10"
        >
          <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-1 shadow-lg dark:shadow-[0_8px_40px_rgba(99,102,241,0.15)] backdrop-blur-xl ring-1 ring-inset ring-slate-200/50 dark:ring-white/5">
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
                selectedTags.forEach(tag => onTagRemove(tag));
              }}
            />
          </div>

          {/* TAG FILTERS */}
          <div className="mt-5 flex items-center justify-between flex-wrap gap-3 px-1">
            <div className="flex gap-2 flex-wrap justify-center">
              {availableTags.slice(0, 10).map((tag, idx) => (
                <motion.span
                  key={idx}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTagSelect(tag)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full cursor-pointer transition-all duration-200 border ${
                    selectedTags.includes(tag)
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md dark:shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                      : "text-slate-600 bg-white/80 border-slate-200 hover:bg-white hover:border-indigo-300 hover:text-indigo-700 shadow-sm dark:text-slate-300 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-indigo-500/40 dark:hover:text-white dark:shadow-none backdrop-blur-sm"
                  }`}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
            <span className="text-sm text-indigo-700 dark:text-indigo-300 font-semibold">
              {filteredCount}{" "}{filteredCount === 1 ? "hackathon" : "hackathons"} found
            </span>
          </div>
        </motion.div>

        {/* CTA BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: prefersReducedMotion ? 0 : 0.7 }}
          className="mt-10 flex justify-center gap-4 flex-wrap"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="relative overflow-hidden px-7 py-3.5 rounded-xl font-semibold text-white shadow-lg dark:shadow-[0_0_24px_rgba(99,102,241,0.4)] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 transition-all duration-200 flex items-center gap-2 border border-indigo-500/30"
            onClick={scrollToCards}
          >
            {/* Shine effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
            <Sparkles className="w-5 h-5" />
            Explore Hackathons
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (!user) navigate("/login");
              else navigate("/host-hackathon");
            }}
            className="px-7 py-3.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/20 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:border-indigo-300 dark:hover:border-indigo-400/50 shadow-sm dark:shadow-none backdrop-blur-sm transition-all duration-200 flex items-center gap-2"
          >
            <Users className="w-5 h-5 text-indigo-600 dark:text-slate-200" />
            Host a Hackathon
          </motion.button>
        </motion.div>
      </div>

      {/* STATS SECTION */}
      {searchQuery.trim() === "" && selectedTags.length === 0 && (
        <SectionErrorBoundary label="Hackathon Statistics">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 mt-14 sm:mt-20 mb-12 sm:mb-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Hackathons Hosted", value: 120, suffix: "+", icon: Calendar, color: "from-blue-500 to-indigo-500" },
            { label: "Participants", value: 50, suffix: "k+", icon: Users, color: "from-violet-500 to-purple-500" },
            { label: "Projects Built", value: 8, suffix: "k+", icon: Code2, color: "from-cyan-500 to-blue-500" },
            { label: "Prizes Awarded", value: 1, prefix: "$", suffix: "M+", icon: Award, color: "from-amber-500 to-orange-500" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + idx * 0.12, duration: prefersReducedMotion ? 0 : 0.6 }}
              whileHover={{ scale: 1.04, y: -4 }}
              className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 p-6 flex flex-col items-center text-center backdrop-blur-md shadow-sm hover:shadow-md dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-all duration-300 group"
            >
              {/* Gradient top border line */}
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${stat.color} opacity-80 group-hover:opacity-100 transition-opacity`} />

              {/* Icon */}
              <div className={`mb-4 flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} shadow-sm dark:shadow-[0_0_20px_rgba(99,102,241,0.2)]`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>

              <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
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
        </SectionErrorBoundary>
      )}
    </div>
  );
}

