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
      className={`flex flex-col items-center rounded-3xl border-b-8 bg-white/80 p-6 backdrop-blur-md dark:bg-slate-900/80 ${styling.borderClass} border border-slate-200/50 shadow-xl dark:border-slate-800/40 ${orderClass}`}
      role="listitem"
      aria-label={`${position} place: ${contributor?.username || "Unknown"}`}
    >
      <div className="relative mb-4">
        <span
          className={`absolute -inset-1 rounded-full bg-gradient-to-r ${styling.ringClass} opacity-80 blur-sm`}
          aria-hidden="true"
        />
        <img
          src={contributor.avatar}
          alt={`${contributor.username}'s avatar`}
          className={`relative ${styling.size} rounded-full border-4 ${styling.borderClass.split(" ").pop()} object-cover shadow-md`}
          loading="lazy"
          width={styling.size.includes("22") ? 88 : 72}
          height={styling.size.includes("22") ? 88 : 72}
        />
        <div
          className={`absolute -right-1 -bottom-2 flex h-6 w-6 items-center justify-center rounded-full ${styling.medalClass} text-[10px] font-black tracking-tight uppercase shadow`}
        >
          {position}
        </div>
        {isFirst && (
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 animate-bounce text-2xl"
            aria-hidden="true"
          >
            👑
          </div>
        )}
      </div>

      <a
        href={contributor.profile}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-base font-black ${isFirst ? "bg-gradient-to-r from-slate-950 via-indigo-950 to-pink-950 bg-clip-text text-transparent dark:from-white dark:via-indigo-200 dark:to-pink-100" : "text-slate-900 dark:text-white"} max-w-[200px] truncate text-center transition-colors hover:text-indigo-500`}
        aria-label={`View ${contributor.username}'s GitHub profile`}
      >
        {contributor.username}
      </a>

      <div
        className={`mt-2.5 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${styling.badgeClass}`}
      >
        {styling.title}
      </div>

      <div className="mt-4 flex w-full items-center justify-around border-t border-slate-200/50 pt-4 dark:border-slate-800/40">
        <div className="text-center">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Points
          </span>
          <p className={`mt-0.5 text-lg font-black ${styling.pointsClass}`}>
            <AnimatedCounter value={contributor.points} />
          </p>
        </div>
        <div className="text-center">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">PRs</span>
          <p className="mt-0.5 text-lg font-black text-indigo-500">
            <AnimatedCounter value={contributor.prs} />
          </p>
        </div>
      </div>
    </motion.div>
  );
});

PodiumCard.displayName = "PodiumCard";

export default PodiumCard;
