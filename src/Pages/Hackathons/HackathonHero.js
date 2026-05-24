import { AnimatePresence, motion } from "framer-motion";
import { Award, Calendar, Code2, Sparkles, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ModernSearchInput from "../../components/common/ModernSearchInput";
import { useAuth } from "../../context/AuthContext";
import CountUp from "react-countup";

// Tag component for selected tags in search bar
const Tag = ({ tag, onRemove }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
    className="flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm dark:border-blue-700 dark:bg-slate-800 dark:text-slate-100"
  >
    <span>{tag}</span>
    <button
      onClick={() => onRemove(tag)}
      className="rounded-full p-0.5 transition-colors hover:bg-blue-100 dark:hover:bg-slate-700"
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
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950/60 to-slate-950 text-white py-16 sm:py-20 md:py-24 border-b border-indigo-900/40">

      {/* ── Animated mesh background blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[100px]"
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.6) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99,102,241,0.6) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* ======================= HERO SECTION ======================= */}
      <div className="relative px-4 min-h-[75vh] flex flex-col items-center justify-center text-center z-10">

        {/* Neon badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.25)] backdrop-blur-sm"
        >
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Innovation Starts Here
        </motion.div>

        {/* Heading with gradient + glow */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-7xl font-extrabold leading-tight tracking-tight"
          style={{ fontFamily: '"Big Shoulders Display", sans-serif' }}
        >
          <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
            Discover{" "}
          </span>
          <span
            className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent"
            style={{ filter: "drop-shadow(0 0 24px rgba(99,102,241,0.6))" }}
          >
            Hackathons
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-6 leading-relaxed"
        >
          Find and join the most exciting hackathons, compete with the best,
          and win prizes.
        </motion.p>

        {/* Glassmorphism search wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="w-full max-w-3xl mx-auto mt-10"
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 p-1 shadow-[0_8px_40px_rgba(99,102,241,0.15)] backdrop-blur-xl ring-1 ring-inset ring-white/5">
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

          {/* TAG FILTERS — premium pill style */}
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
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                      : "text-slate-300 bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/40 hover:text-white backdrop-blur-sm"
                  }`}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
            <span className="text-sm text-indigo-300 font-semibold">
              {filteredCount}{" "}{filteredCount === 1 ? "hackathon" : "hackathons"} found
            </span>
          </div>
        </motion.div>

        {/* CTA BUTTONS — gradient style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-10 flex justify-center gap-4 flex-wrap"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="relative overflow-hidden px-7 py-3.5 rounded-xl font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.4)] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 transition-all duration-200 flex items-center gap-2 border border-indigo-500/30"
            onClick={scrollToCards}
          >
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
            className="px-7 py-3.5 rounded-xl font-semibold text-slate-200 border border-white/15 bg-white/5 hover:bg-white/10 hover:border-indigo-400/50 backdrop-blur-sm transition-all duration-200 flex items-center gap-2"
          >
            <Users className="w-5 h-5" />
            Host a Hackathon
          </motion.button>
        </motion.div>
      </div>

      {/* STATS SECTION — premium glassmorphism cards */}
      {searchQuery.trim() === "" && selectedTags.length === 0 && (
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
              transition={{ delay: 0.15 + idx * 0.12, duration: 0.6 }}
              whileHover={{ scale: 1.04, y: -4 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col items-center text-center backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-all duration-300 group"
            >
              {/* Gradient top border accent */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${stat.color} opacity-70 group-hover:opacity-100 transition-opacity`} />

              {/* Icon with gradient bg */}
              <div className={`mb-4 flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} shadow-[0_0_20px_rgba(99,102,241,0.2)]`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>

              <p className="text-3xl font-bold text-white tracking-tight">
                <CountUp
                  start={0}
                  end={stat.value}
                  duration={2.5}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  enableScrollSpy
                  scrollSpyOnce
                />
              </p>
              <p className="mt-1 text-sm font-medium text-slate-400">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}