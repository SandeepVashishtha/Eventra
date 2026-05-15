import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Tag = ({ tag, onRemove }) => (
  <motion.div
    initial={{ scale: 0.92, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.92, opacity: 0 }}
    className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
  >
    <span>{tag}</span>
    <button
      type="button"
      onClick={() => onRemove(tag)}
      className="rounded-full p-0.5 transition-colors hover:bg-blue-100 dark:hover:bg-blue-800"
      aria-label={`Remove ${tag}`}
    >
      <X className="h-3 w-3" />
    </button>
  </motion.div>
);

const MetricItem = ({ value, label }) => (
  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
    <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
      {value}
    </span>
    <span>{label}</span>
  </div>
);

export default function HackathonHero({
  searchQuery,
  setSearchQuery,
  scrollToCards,
  selectedTags = [],
  onTagRemove,
  onSearchKeyDown,
  searchInputRef,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const shapes = useMemo(
    () => [
      { size: 34, pos: { top: "10%", left: "5%" }, color: "#dbeafe" },
      { size: 42, pos: { top: "12%", right: "8%" }, color: "#bfdbfe" },
      { size: 28, pos: { top: "28%", left: "10%" }, color: "#dcfce7" },
      { size: 32, pos: { top: "34%", right: "14%" }, color: "#fde68a" },
      { size: 30, pos: { top: "18%", right: "24%" }, color: "#fed7aa" },
    ],
    [],
  );

  const floatShape = useMemo(
    () => (index) => ({
      y: [0, -16 - index * 4, 0],
      x: [0, 14 + index * 4, 0],
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 4.5 + index * 0.6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }),
    [],
  );

  return (
    <div className="relative overflow-hidden bg-gradient-to-l from-sky-50 via-white to-white py-10 dark:from-gray-900 dark:to-black sm:py-12 md:py-14">
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          animate={floatShape(index)}
          className="absolute rounded-full"
          style={{
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            ...shape.pos,
            backgroundColor: shape.color,
            opacity: 0.18,
          }}
        />
      ))}

      <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 md:px-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold leading-tight text-black sm:text-5xl"
          style={{ fontFamily: '"Anton", sans-serif' }}
        >
          Discover Amazing Hackathons
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mx-auto mt-3 max-w-2xl text-sm text-gray-600 dark:text-gray-400 sm:text-base"
        >
          Find curated hackathons, filter faster, and jump into the right build
          challenge without digging through clutter.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.55 }}
          className="mx-auto mt-7 w-full max-w-3xl"
        >
          <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4">
              <Search className="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-black dark:text-gray-500 dark:group-focus-within:text-white" />
            </div>

            <div className="flex min-h-[58px] w-full flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-white/75 py-3 pl-12 pr-12 text-base text-gray-900 shadow-md backdrop-blur-xl transition-all duration-300 hover:shadow-lg focus-within:border-black/20 focus-within:ring-2 focus-within:ring-black/10 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-100 dark:focus-within:border-white/20 dark:focus-within:ring-white/10">
              <AnimatePresence>
                {selectedTags.map((tag) => (
                  <Tag key={tag} tag={tag} onRemove={onTagRemove} />
                ))}
              </AnimatePresence>

              <input
                ref={searchInputRef}
                type="text"
                placeholder={
                  selectedTags.length === 0
                    ? "Search hackathons by name, location, or technology..."
                    : ""
                }
                className="min-w-[160px] flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500 sm:text-base"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={onSearchKeyDown}
              />
            </div>

            {(searchQuery || selectedTags.length > 0) && (
              <motion.button
                type="button"
                whileHover={{ rotate: 90, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchQuery("");
                  selectedTags.forEach((tag) => onTagRemove(tag));
                }}
                className="absolute inset-y-0 right-0 z-10 flex items-center pr-4 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </motion.button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
        >
          <MetricItem value="120+" label="Hosted" />
          <span className="hidden text-gray-300 sm:inline">•</span>
          <MetricItem value="50k+" label="Participants" />
          <span className="hidden text-gray-300 sm:inline">•</span>
          <MetricItem value="8k+" label="Projects" />
          <span className="hidden text-gray-300 sm:inline">•</span>
          <MetricItem value="$1M+" label="Awarded" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mt-6 flex flex-wrap justify-center gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-xl bg-blue-100 px-5 py-3 text-sm font-semibold text-black shadow-sm transition-all duration-300 hover:bg-blue-200"
            onClick={scrollToCards}
          >
            <span className="flex items-center">
              <Sparkles className="mr-2 h-4 w-4" />
              Explore Hackathons
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (!user) navigate("/login");
              else navigate("/host-hackathon");
            }}
            className="rounded-xl bg-green-100 px-5 py-3 text-sm font-medium text-black shadow-sm transition-all duration-300 hover:bg-green-200"
          >
            <span className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Host a Hackathon
            </span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
