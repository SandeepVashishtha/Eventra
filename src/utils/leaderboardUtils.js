import { FaTrophy, FaAward, FaStar, FaCode } from "react-icons/fa";

export const getAchievementBadge = (rank, prs, points) => {
  if (rank === 1) {
    return {
      label: "Diamond Tier",
      color: "from-sky-300 via-indigo-400 to-pink-300 text-indigo-950 border-indigo-300/40 shadow-[0_0_12px_rgba(99,102,241,0.4)]",
      icon: FaTrophy
    };
  }
  if (rank === 2 || rank === 3) {
    return {
      label: "Platinum Tier",
      color: "from-teal-300 via-emerald-400 to-cyan-300 text-emerald-950 border-teal-300/40 shadow-[0_0_12px_rgba(20,184,166,0.3)]",
      icon: FaAward
    };
  }
  if (rank >= 4 && rank <= 10) {
    return {
      label: "Gold Tier",
      color: "from-yellow-300 via-amber-400 to-yellow-500 text-amber-950 border-yellow-300/40 shadow-[0_0_8px_rgba(234,179,8,0.25)]",
      icon: FaStar
    };
  }
  return {
    label: "Silver Tier",
    color: "from-slate-100 via-zinc-200 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 text-slate-800 dark:text-slate-200 border-slate-200/50 dark:border-slate-700/20",
    icon: FaCode
  };
};
