import { AnimatePresence, motion } from "framer-motion";
import { Award, Calendar, Code2, Sparkles, Users, X } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ModernSearchInput from "../../components/common/ModernSearchInput";
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
      { size: 42, pos: { top: "12%", left: "5%" }, color: "#dbeafe" },
      { size: 50, pos: { top: "10%", right: "8%" }, color: "#bfdbfe" },
      { size: 30, pos: { top: "24%", left: "8%" }, color: "#dcfce7" },
      { size: 36, pos: { top: "30%", right: "12%" }, color: "#fde68a" },
      { size: 46, pos: { top: "14%", right: "24%" }, color: "#fbcfe8" },
      { size: 52, pos: { top: "22%", left: "22%" }, color: "#fed7aa" },
      { size: 38, pos: { top: "48%", left: "6%" }, color: "#c7d2fe" },
      { size: 44, pos: { top: "56%", right: "10%" }, color: "#bae6fd" },
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
    <div className="bg-gradient-to-r from-white via-slate-50 to-indigo-50 dark:from-gray-900 dark:to-black relative overflow-hidden py-16 sm:py-20 md:py-24">
      {/* ======================= FLOATING SHAPES ======================= */}
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          animate={floatShape(i)}
          className="absolute rounded-full"
          style={{
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            ...shape.pos,
            backgroundColor: shape.color,
            opacity: 0.2,
          }}
        />
      ))}

      {/* ======================= HERO SECTION ======================= */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 md:px-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-6xl font-extrabold leading-tight text-text"
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
        </div>

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
      {searchQuery.trim() === "" && selectedTags.length === 0 && (
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
      </div>)}
    </div>
  );
}