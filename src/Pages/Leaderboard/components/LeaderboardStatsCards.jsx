import { motion } from "framer-motion";
import { Users, Code, Star } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

const cards = [
  {
    title: "Active Contributors",
    key: "totalContributors",
    gradient: "from-blue-500/10 to-indigo-500/10",
    border: "border-blue-100 dark:border-blue-900/30",
    textColor: "text-blue-600 dark:text-blue-400",
    icon: Users,
  },
  {
    title: "Merged Pull Requests",
    key: "flooredTotalPRs",
    gradient: "from-emerald-500/10 to-teal-500/10",
    border: "border-emerald-100 dark:border-emerald-900/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
    icon: Code,
  },
  {
    title: "Total Arena Points",
    key: "flooredTotalPoints",
    gradient: "from-amber-500/10 to-orange-500/10",
    border: "border-amber-100 dark:border-amber-900/30",
    textColor: "text-amber-600 dark:text-amber-400",
    icon: Star,
  },
];

export default function LeaderboardStatsCards({ stats, loading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, idx) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`group flex items-center gap-4 rounded-3xl border bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5 ${card.border}`}
        >
          <div className="rounded-2xl border border-slate-200 bg-[#E0E9F2]/35 p-3.5 text-slate-700 shadow-sm">
            <card.icon className="text-2xl" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {card.title}
            </p>
            <p className="mt-1 text-3xl font-extrabold text-slate-950">
              {loading ? (
                <span className="inline-block w-12 h-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              ) : (
                <AnimatedCounter value={stats[card.key]} />
              )}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
