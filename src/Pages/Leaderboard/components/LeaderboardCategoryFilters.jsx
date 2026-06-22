import { motion } from "framer-motion";

const CATEGORY_FILTERS = [
  { id: "overall", label: "Overall Leaders", icon: "🏆", description: "All-time top contributors" },
  { id: "monthly", label: "Monthly Stars", icon: "⭐", description: "This month's active contributors" },
  { id: "mentors", label: "Project Mentors", icon: "🎓", description: "Guiding the next generation" },
];

export default function LeaderboardCategoryFilters({ activeCategory, onCategoryChange }) {
  return (
    <nav className="mb-8 flex flex-wrap items-center justify-center gap-3" aria-label="Leaderboard categories">
      {CATEGORY_FILTERS.map((cat) => (
        <motion.button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          aria-pressed={activeCategory === cat.id}
          className={`
            flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all backdrop-blur-xl
            ${
              activeCategory === cat.id
                ? "bg-slate-900 dark:bg-indigo-600 text-white border-slate-900 dark:border-indigo-500 shadow-lg shadow-slate-300/40 dark:shadow-indigo-900/40"
                : "bg-white/75 dark:bg-slate-800/75 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800"
            }
          `}
          title={cat.description}
        >
          <span aria-hidden="true">{cat.icon}</span>
          {cat.label}
        </motion.button>
      ))}
    </nav>
  );
}
