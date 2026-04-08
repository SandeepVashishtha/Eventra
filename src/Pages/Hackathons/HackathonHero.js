import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, Users, Award, Code2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Tag component for selected tags in search bar
const Tag = ({ tag, onRemove }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
    className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium"
  >
    <span>{tag}</span>
    <button
      onClick={() => onRemove(tag)}
      className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
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

  // Floating shapes/bubbles
  const shapes = useMemo(
    () => [
      { size: 34, pos: { top: "14%", left: "4%" }, color: "from-sky-200 to-blue-200" },
      { size: 36, pos: { top: "11%", right: "5%" }, color: "from-blue-200 to-sky-100" },
      { size: 24, pos: { top: "24%", left: "6%" }, color: "from-yellow-200 to-yellow-100" },
      { size: 24, pos: { top: "28%", right: "7%" }, color: "from-green-200 to-green-100" },
      { size: 46, pos: { top: "12%", right: "18%" }, color: "from-pink-200 to-pink-100" },
      { size: 52, pos: { top: "20%", left: "18%" }, color: "from-yellow-200 to-orange-100" },
      { size: 92, pos: { top: "52%", left: "22%" }, color: "from-blue-200 to-sky-100" },
      { size: 64, pos: { top: "58%", right: "15%" }, color: "from-green-200 to-blue-100" },
      { size: 38, pos: { top: "46%", left: "2%" }, color: "from-pink-200 to-yellow-100" },
      { size: 28, pos: { top: "36%", left: "26%" }, color: "from-sky-100 to-green-100" },
      { size: 24, pos: { top: "64%", left: "58%" }, color: "from-yellow-100 to-pink-100" },
      { size: 30, pos: { top: "70%", left: "48%" }, color: "from-blue-100 to-yellow-100" },
    ],
    []
  );

  const floatShape = useMemo(
    () => (i) => ({
      y: [0, -20 - i * 5, 0],
      x: [0, 20 + i * 5, 0],
      rotate: [0, 15, -15, 0],
      transition: { duration: 4.6 + i * 0.75, repeat: Infinity, ease: "easeInOut" },
    }),
    []
  );

  return (
    <div className="bg-gradient-to-l from-sky-50 via-white to-white dark:from-gray-900 dark:to-black relative overflow-hidden">
      {/* ======================= FLOATING SHAPES ======================= */}
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          animate={floatShape(i)}
          className={`absolute rounded-full bg-gradient-to-tr ${shape.color} opacity-14 sm:opacity-30 dark:opacity-10 dark:sm:opacity-18`}
          style={{
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            ...shape.pos,
          }}
        />
      ))}

      {/* ======================= HERO SECTION ======================= */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 md:px-8 text-center mt-8 sm:mt-12">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-6xl font-extrabold leading-tight text-black"
          style={{ fontFamily: '"Anton", sans-serif' }}
        >
          Discover Amazing Hackathons
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          Find and join the most exciting hackathons, compete with the best,
          and win amazing prizes.
        </motion.p>

        {/* ======================= SEARCH BOX WITH TAGS ======================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full max-w-3xl mx-auto mt-12"
        >
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center z-10 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
            </div>

            {/* Search bar with tags inside */}
            <div className="flex flex-wrap items-center gap-2 w-full pl-12 pr-12 py-4 text-base text-gray-900 dark:text-gray-100 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl focus-within:ring-2 focus-within:ring-black/20 dark:focus-within:ring-white/20 focus-within:border-black/20 dark:focus-within:border-white/20 transition-all duration-300 shadow-lg hover:shadow-xl">
              
              {/* Selected tags displayed in search bar */}
              <AnimatePresence>
                {selectedTags.map((tag) => (
                  <Tag key={tag} tag={tag} onRemove={onTagRemove} />
                ))}
              </AnimatePresence>
              
              {/* Search input */}
              <input
                ref={searchInputRef}
                type="text"
                placeholder={selectedTags.length === 0 ? "Search hackathons by name, location, or tags..." : ""}
                className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 min-w-[120px] placeholder-gray-400 dark:placeholder-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={onSearchKeyDown}
              />
            </div>

            {(searchQuery || selectedTags.length > 0) && (
              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setSearchQuery("");
                  // Clear all selected tags
                  selectedTags.forEach(tag => onTagRemove(tag));
                }}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </motion.button>
            )}
          </div>

          {/* ======================= TAG FILTERS ======================= */}
          <div className="mt-4 flex items-center justify-between flex-wrap gap-3 px-2">
            <div className="flex gap-2 flex-wrap justify-center">
           {/* Quick tag suggestions from available tags */}
{availableTags.slice(0, 10).map((tag, idx) => (  // CHANGED from 8 to 10
  <motion.span
    key={idx}
    whileHover={{ scale: 1.1 }}
    onClick={() => onTagSelect(tag)}
    className={`px-3 py-1 text-xs font-medium rounded-full cursor-pointer transition ${
      selectedTags.includes(tag)
        ? 'bg-black text-white shadow-md'
        : 'text-black dark:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
    }`}
  >
    {tag}
  </motion.span>
))}
            </div>

            {/* UPDATED: Use filteredCount prop instead of local calculation */}
            <span className="text-sm text-black dark:text-white font-semibold">
              {filteredCount}{" "}
              {filteredCount === 1 ? "hackathon" : "hackathons"} found
            </span>
          </div>
        </motion.div>

        {/* ======================= CTA BUTTONS ======================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-8 flex justify-center gap-5 flex-wrap"
        >
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.95 }}
            className="relative px-7 py-3.5 rounded-xl font-semibold text-black shadow-lg overflow-hidden group bg-blue-100 hover:bg-blue-200 transition-all duration-300"
            onClick={scrollToCards}
          >
            <span className="relative flex items-center">
              <Sparkles className="inline-block w-5 h-5 mr-2" />
              Explore Hackathons
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!user) navigate("/login");
              else navigate("/host-hackathon");
            }}
            className="relative px-7 py-3.5 rounded-xl font-medium text-black shadow-md hover:shadow-lg bg-green-100 hover:bg-green-200 transition-all duration-300"
          >
            <span className="relative flex items-center">
              <Users className="inline-block w-5 h-5 mr-2" />
              Host a Hackathon
            </span>
          </motion.button>
        </motion.div>
      </div>

      {/* ======================= STATS SECTION ======================= */}
      <div
        className="relative max-w-6xl mx-auto px-4 sm:px-6 mt-12 sm:mt-16 md:mt-20 mb-12 sm:mb-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
        data-aos="fade-up"
        data-aos-duration="1000"
        data-aos-delay="200"
      >
        {[
          { label: "Hackathons Hosted", value: "120+", icon: Calendar },
          { label: "Participants", value: "50k+", icon: Users },
          { label: "Projects Built", value: "8k+", icon: Code2 },
          { label: "Prizes Awarded", value: "$1M+", icon: Award },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + idx * 0.15, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            className="relative bg-gradient-to-br from-sky-50 via-white to-white dark:from-gray-800 dark:to-gray-800 rounded-3xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-2xl transition-all duration-300"
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="mb-4 flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-blue-200 to-sky-100 shadow-md"
            >
              <stat.icon className="h-7 w-7 text-black" />
            </motion.div>

            <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              {stat.value}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.label}
            </p>

            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-300/10 to-blue-300/10 dark:from-sky-500/20 dark:to-blue-500/20 blur-2xl opacity-40 -z-10" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}