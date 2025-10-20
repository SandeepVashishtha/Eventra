import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Rocket, Users, Award, Code2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Tag component for selected tags in search bar
const Tag = ({ tag, onRemove }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
    className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-medium"
  >
    <span>{tag}</span>
    <button
      onClick={() => onRemove(tag)}
      className="hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5 transition-colors"
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
      { size: 60, pos: { top: "10%", left: "5%" }, color: "from-indigo-400 to-blue-400" },
      { size: 60, pos: { top: "12%", left: "45%" }, color: "from-indigo-300 to-blue-200" },
      { size: 60, pos: { top: "2%", left: "10%" }, color: "from-purple-400 to-pink-400" },
      { size: 50, pos: { top: "4%", right: "20%" }, color: "from-indigo-300 to-blue-200" },
      { size: 70, pos: { top: "1%", right: "5%" }, color: "from-pink-300 to-purple-300" },
      { size: 80, pos: { top: "10%", right: "10%" }, color: "from-purple-400 to-pink-400" },
      { size: 100, pos: { bottom: "20%", left: "25%" }, color: "from-blue-300 to-indigo-300" },
      { size: 70, pos: { bottom: "15%", right: "15%" }, color: "from-pink-300 to-purple-300" },
      { size: 50, pos: { top: "50%", left: "2%" }, color: "from-indigo-300 to-blue-200" },
    ],
    []
  );

  const floatShape = useMemo(
    () => (i) => ({
      y: [0, -20 - i * 5, 0],
      x: [0, 20 + i * 5, 0],
      rotate: [0, 15, -15, 0],
      transition: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" },
    }),
    []
  );

  return (
    <div className="bg-gradient-to-l from-indigo-200 to-white dark:from-gray-900 dark:to-black relative overflow-hidden">
      {/* ======================= FLOATING SHAPES ======================= */}
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          animate={floatShape(i)}
          className={`hidden sm:block absolute rounded-full bg-gradient-to-tr ${shape.color} opacity-30 dark:opacity-15`}
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
          className="text-4xl sm:text-6xl font-extrabold leading-tight"
        >
          Discover{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-gradient">
            Amazing Hackathons
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          "Find and join the most exciting hackathons, compete with the best,
          and win amazing prizes 🚀"
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
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
            </div>

            {/* Search bar with tags inside */}
            <div className="flex flex-wrap items-center gap-2 w-full pl-12 pr-12 py-4 text-base text-gray-900 dark:text-gray-100 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-500 dark:focus-within:ring-indigo-400 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 transition-all duration-300 shadow-lg hover:shadow-xl">
              
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
        ? 'bg-indigo-600 text-white shadow-md'
        : 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900'
    }`}
  >
    {tag}
  </motion.span>
))}
            </div>

            {/* UPDATED: Use filteredCount prop instead of local calculation */}
            <span className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
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
            className="relative px-7 py-3.5 rounded-xl font-semibold text-white shadow-lg overflow-hidden group"
            onClick={scrollToCards}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-800 group-hover:from-indigo-500 group-hover:to-indigo-600 transition-all duration-500" />
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />
            <span className="relative flex items-center">
              <Rocket className="inline-block w-5 h-5 mr-2" />
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
            className="relative px-7 py-3.5 rounded-xl font-medium text-gray-800 dark:text-gray-100 shadow-md backdrop-blur-md border border-gray-300 dark:border-gray-600 hover:border-indigo-400 transition-all duration-300 bg-white/70 dark:bg-gray-800"
          >
            <span className="relative flex items-center">
              <Users className="inline-block w-5 h-5 mr-2 text-indigo-600" />
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
          { label: "Hackathons Hosted", value: "120+", icon: Rocket },
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
            className="relative bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-3xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-2xl transition-all duration-300"
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="mb-4 flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-800 to-indigo-300 shadow-md"
            >
              <stat.icon className="h-7 w-7 text-white" />
            </motion.div>

            <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              {stat.value}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.label}
            </p>

            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 dark:from-indigo-500/20 dark:to-indigo-600/20 blur-2xl opacity-40 -z-10" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}