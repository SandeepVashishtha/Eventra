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
  // NEW: Add filteredCount prop
  filteredCount = 0,
  // Tag-related props
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
    <div className="bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white dark:bg-slate-950 text-slate-900 dark:text-gray-100 relative py-16 sm:py-20 md:py-24 border-b border-gray-200 dark:border-slate-900">

      {/* ======================= HERO SECTION ======================= */}
      <div className="relative px-4 min-h-[75vh] flex flex-col items-center justify-center text-center z-10">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-6xl font-extrabold leading-tight text-gray-900 dark:text-white"
          style={{ fontFamily: '"Big Shoulders Display", sans-seri' }}
        >
          Discover <span className="text-blue-600 dark:text-blue-500">Hackathons</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-base sm:text-lg text-gray-600 dark:text-gray-200 max-w-2xl mx-auto mb-6 leading-relaxed"
        >
          Find and join the most exciting hackathons, compete with the best,
          and win prizes.
        </motion.p>

        <div className="w-full max-w-3xl mx-auto mt-12">
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

          {/* TAG FILTERS */}
          <div className="mt-4 flex items-center justify-between flex-wrap gap-3 px-2">
            <div className="flex gap-2 flex-wrap justify-center">
              {availableTags.slice(0, 10).map((tag, idx) => (
                <motion.span
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => onTagSelect(tag)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg cursor-pointer transition ${selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
              {filteredCount}{" "}{filteredCount === 1 ? "hackathon" : "hackathons"} found
            </span>
          </div>
        </div>

        {/* CTA BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-8 flex justify-center gap-5 flex-wrap"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="px-7 py-3.5 rounded-lg font-semibold text-white shadow-sm bg-blue-600 hover:bg-blue-700 transition-all duration-200 flex items-center"
            onClick={scrollToCards}
          >
            <Sparkles className="inline-block w-5 h-5 mr-2" />
            Explore Hackathons
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (!user) navigate("/login");
              else navigate("/host-hackathon");
            }}
            className="px-7 py-3.5 rounded-lg font-medium text-slate-700 dark:text-gray-300 border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all duration-200 flex items-center"
          >
            <Users className="inline-block w-5 h-5 mr-2" />
            Host a Hackathon
          </motion.button>
        </motion.div>
      </div>

      {/* STATS SECTION */}
      {searchQuery.trim() === "" && selectedTags.length === 0 && (
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 mt-12 sm:mt-16 md:mt-20 mb-12 sm:mb-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {[
            { label: "Hackathons Hosted", value: 120, suffix: "+", icon: Calendar },
            { label: "Participants", value: 50, suffix: "k+", icon: Users },
            { label: "Projects Built", value: 8, suffix: "k+", icon: Code2 },
            { label: "Prizes Awarded", value: 1, prefix: "$", suffix: "M+", icon: Award },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + idx * 0.15, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6 flex flex-col items-center text-center transition-all duration-200"
            >
              <div className="mb-4 flex items-center justify-center h-12 w-12 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
                <stat.icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
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
              <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}