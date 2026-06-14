import { memo } from "react";
import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

const PodiumCard = memo(({ contributor, position, orderClass, styling, isFirst = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 20 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className={`flex flex-col items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border-b-8 ${styling.borderClass} border border-slate-200/50 dark:border-slate-800/40 shadow-xl ${orderClass}`}
      role="listitem"
      aria-label={`${position} place: ${contributor?.username || "Unknown"}`}
    >
      <div className="relative mb-4">
        <span className={`absolute -inset-1 rounded-full bg-gradient-to-r ${styling.ringClass} blur-sm opacity-80`} aria-hidden="true" />
        <img
          src={contributor.avatar}
          alt={`${contributor.username}'s avatar`}
          className={`relative ${styling.size} rounded-full border-4 ${styling.borderClass.split(" ").pop()} shadow-md object-cover`}
          loading="lazy"
          width={styling.size.includes("22") ? 88 : 72}
          height={styling.size.includes("22") ? 88 : 72}
        />
        <div className={`absolute -bottom-2 -right-1 flex h-6 w-6 items-center justify-center rounded-full ${styling.medalClass} text-[10px] font-black uppercase tracking-tight shadow`}>
          {position}
        </div>
        {isFirst && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl animate-bounce" aria-hidden="true">
            👑
          </div>
        )}
      </div>

      <a
        href={contributor.profile}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-base font-black ${isFirst ? "bg-gradient-to-r from-slate-950 via-indigo-950 to-pink-950 dark:from-white dark:via-indigo-200 dark:to-pink-100 bg-clip-text text-transparent" : "text-slate-900 dark:text-white"} hover:text-indigo-500 transition-colors truncate max-w-[200px] text-center`}
        aria-label={`View ${contributor.username}'s GitHub profile`}
      >
        {contributor.username}
      </a>

      <div className={`mt-2.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${styling.badgeClass}`}>
        {styling.title}
      </div>

      <div className="mt-4 flex items-center justify-around w-full border-t border-slate-200/50 dark:border-slate-800/40 pt-4">
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Points</span>
          <p className={`text-lg font-black mt-0.5 ${styling.pointsClass}`}>
            <AnimatedCounter value={contributor.points} />
          </p>
        </div>
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PRs</span>
          <p className="text-lg font-black text-indigo-500 mt-0.5">
            <AnimatedCounter value={contributor.prs} />
          </p>
        </div>
      </div>
    </motion.div>
  );
});

PodiumCard.displayName = "PodiumCard";

export default PodiumCard;
