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
                ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-300/40"
                : "bg-white/75 text-slate-600 border-slate-200/60 hover:border-slate-300 hover:bg-white"
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
