import { AnimatePresence, motion } from "framer-motion";
import { Award, Calendar, Code2, Sparkles, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ModernSearchInput from "../../components/common/ModernSearchInput";
import { useAuth } from "../../context/AuthContext";
import CountUp from "react-countup";
import { darkTheme } from "../../components/styles/theme";

// Tag component
const Tag = ({ tag, onRemove }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
    className={`
      ${darkTheme.card}
      flex items-center gap-2
      rounded-full
      backdrop-blur-md
      px-3 py-1
      text-sm font-medium
      shadow-sm
    `}
  >
    <span className={darkTheme.textPrimary}>{tag}</span>

    <button
      onClick={() => onRemove(tag)}
      className="
        rounded-full p-0.5
        transition-colors
        hover:bg-blue-100
        dark:hover:bg-slate-700
      "
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
  onTagSelect,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div
      className={`
        relative overflow-hidden
        bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white 
        dark:from-slate-950 dark:via-slate-900 dark:to-black
        ${darkTheme.textPrimary}
        py-16 sm:py-20 md:py-24
        border-b border-gray-100 dark:border-slate-900
      `}
    >
      {/* HERO SECTION */}
      <div className="relative px-4 min-h-[75vh] flex flex-col items-center justify-center text-center z-10">
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className={`
            text-4xl sm:text-6xl lg:text-7xl
            font-extrabold
            leading-tight
            tracking-tight
            ${darkTheme.textPrimary}
          `}
          style={{ fontFamily: '"Big Shoulders Display", sans-serif' }}
        >
          Discover{" "}
          <span className="text-blue-600 dark:text-blue-500">Hackathons</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className={`
            text-base sm:text-lg
            max-w-2xl
            mx-auto
            mt-6
            mb-6
            leading-relaxed
            ${darkTheme.textSecondary}
          `}
        >
          Find and join the most exciting hackathons, compete with the best,
          build innovative projects, and win amazing prizes.
        </motion.p>

        {/* Search */}
        <div className="w-full max-w-3xl mx-auto mt-8">
          <ModernSearchInput
            searchInputRef={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder="Search hackathons by name, location, or technologies..."
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

          {/* TAG FILTERS */}
          <div className="mt-5 flex items-center justify-between flex-wrap gap-4 px-2">
            <div className="flex gap-2 flex-wrap justify-center">
              {availableTags.slice(0, 10).map((tag, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onTagSelect(tag)}
                  className={`
                    px-3 py-1.5
                    text-xs font-medium
                    rounded-xl
                    transition-all duration-200
                    ${
                      selectedTags.includes(tag)
                        ? `${darkTheme.buttonPrimary} shadow-md`
                        : `
                          ${darkTheme.card}
                          ${darkTheme.textSecondary}
                        `
                    }
                  `}
                >
                  {tag}
                </motion.button>
              ))}
            </div>

            <span className={`text-sm font-semibold ${darkTheme.muted}`}>
              {filteredCount} {filteredCount === 1 ? "hackathon" : "hackathons"}{" "}
              found
            </span>
          </div>
        </div>

        {/* CTA BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-10 flex justify-center gap-5 flex-wrap"
        >
          {/* Primary Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
            className={`
              ${darkTheme.buttonPrimary}
              px-7 py-3.5
              rounded-2xl
              font-semibold
              shadow-lg
              transition-all duration-200
              flex items-center
            `}
            onClick={scrollToCards}
          >
            <Sparkles className="inline-block w-5 h-5 mr-2" />
            Explore Hackathons
          </motion.button>

          {/* Secondary Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => {
              if (!user) navigate("/login");
              else navigate("/host-hackathon");
            }}
            className={`
              ${darkTheme.buttonSecondary}
              px-7 py-3.5
              rounded-2xl
              font-medium
              transition-all duration-200
              flex items-center
              shadow-sm
            `}
          >
            <Users className="inline-block w-5 h-5 mr-2" />
            Host a Hackathon
          </motion.button>
        </motion.div>
      </div>

      {/* STATS SECTION */}
      {searchQuery.trim() === "" && selectedTags.length === 0 && (
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 mt-16 sm:mt-20 mb-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {[
            {
              label: "Hackathons Hosted",
              value: 120,
              suffix: "+",
              icon: Calendar,
            },
            {
              label: "Participants",
              value: 50,
              suffix: "k+",
              icon: Users,
            },
            {
              label: "Projects Built",
              value: 8,
              suffix: "k+",
              icon: Code2,
            },
            {
              label: "Prizes Awarded",
              value: 1,
              prefix: "$",
              suffix: "M+",
              icon: Award,
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.2 + idx * 0.15,
                duration: 0.6,
              }}
              whileHover={{ scale: 1.03 }}
              className={`
                ${darkTheme.card}
                p-6
                shadow-xl
                flex flex-col items-center
                text-center
                transition-all duration-300
              `}
            >
              {/* Icon */}
              <div
                className={`
                  ${darkTheme.card}
                  mb-4
                  flex items-center justify-center
                  h-14 w-14
                  rounded-2xl
                `}
              >
                <stat.icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>

              {/* Count */}
              <p
                className={`
                  text-3xl font-bold tracking-tight
                  ${darkTheme.textPrimary}
                `}
              >
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

              {/* Label */}
              <p
                className={`
                  mt-1 text-sm font-medium
                  ${darkTheme.muted}
                `}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
