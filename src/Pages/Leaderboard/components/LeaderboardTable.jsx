import { motion, AnimatePresence } from "framer-motion";
import { Star, Code, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getAchievementBadge } from "../../../utils/leaderboardUtils";
import AnimatedCounter from "./AnimatedCounter";
import RankMovementIndicator from "./RankMovementIndicator";
import LiveStatusBadge from "./LiveStatusBadge";
import SkeletonLeaderboard from "../../../components/common/SkeletonLeaderboard";

function TableRow({ c, rank, badge, streak, index }) {
  return (
    <motion.tr
      key={c.username}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay: index * 0.03 }}
      whileHover={{ backgroundColor: "rgba(99,102,241,0.06)" }}
      className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors focus-within:ring-2 focus-within:ring-indigo-500"
      tabIndex={0}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${
              rank === 1
                ? "bg-yellow-400 text-yellow-950 shadow-md"
                : rank === 2
                ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                : rank === 3
                ? "bg-amber-600 text-white shadow-md"
                : "bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
            }`}
            aria-label={`Rank ${rank}`}
          >
            {rank}
          </span>
          <RankMovementIndicator liveDifference={streak?.rankDifference} />
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            {rank <= 3 && (
              <span
                className={`absolute -inset-0.5 rounded-full blur-xs opacity-75 animate-pulse bg-gradient-to-r ${
                  rank === 1
                    ? "from-yellow-400 to-amber-500"
                    : rank === 2
                    ? "from-slate-200 to-zinc-400"
                    : "from-amber-600 to-orange-500"
                }`}
                aria-hidden="true"
              />
            )}
            <img
              loading="lazy"
              decoding="async"
              className={`relative h-10 w-10 rounded-full border-2 bg-slate-100 shadow-sm object-cover ${
                rank === 1
                  ? "border-yellow-400"
                  : rank === 2
                  ? "border-slate-300"
                  : rank === 3
                  ? "border-amber-600"
                  : "border-indigo-100 dark:border-slate-800"
              }`}
              src={c.avatar}
              onError={(e) => { e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E"; }}
              alt={`${c.username}'s avatar`}
              width={40}
              height={40}
            />
          </div>
          <div>
            <a
              href={c.profile}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
            >
              {c.username}
            </a>
            {c.name && c.name !== c.username && (
              <div className="text-xs text-slate-400 mt-0.5">{c.name}</div>
            )}
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-wrap items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r border shadow-sm transition-all select-none cursor-default ${badge.color}`}
            title={badge.description}
          >
            <badge.icon className="w-3.5 h-3.5" aria-hidden="true" />
            {badge.label}
          </motion.div>

          {streak?.onFire && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.08, 1], opacity: 1 }}
              transition={{ scale: { repeat: Infinity, duration: 1.2, ease: "easeInOut" } }}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 text-white border border-red-400/30 shadow-[0_0_12px_rgba(239,68,68,0.4)] cursor-default select-none"
              title="On Fire: Rapid rank improvements!"
            >
              <motion.span
                animate={{ rotate: [-10, 10, -10] }}
                transition={{ repeat: Infinity, duration: 0.65 }}
                aria-hidden="true"
              >
                🔥
              </motion.span>
              ON FIRE
            </motion.div>
          )}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
          <Star className="text-yellow-400 text-xs animate-spin-slow" aria-hidden="true" />
          <span className="font-extrabold">
            <AnimatedCounter value={c.points} />
          </span>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
          <Code className="text-indigo-500 text-xs" aria-hidden="true" />
          <span className="font-extrabold">
            <AnimatedCounter value={c.prs} />
          </span>
        </div>
      </td>
    </motion.tr>
  );
}

export default function LeaderboardTable({
  loading,
  error,
  currentContributors,
  sortedContributors,
  ranksMap,
  streaks,
  currentPage,
  totalPages,
  setCurrentPage,
  setSearch,
  setActiveCategory,
  setSortBy,
  streamStatus,
  lastUpdated,
  onRefresh,
}) {
  const renderError = () => (
    <div className="p-8 text-center">
      <p className="text-rose-500 font-medium">{error}</p>
      <button
        onClick={onRefresh}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  const renderLoading = () => (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading leaderboard...</span>
      <SkeletonLeaderboard rows={10} />
    </div>
  );

  const renderEmpty = () => (
    <tr>
      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <Search className="w-8 h-8 text-slate-300 dark:text-slate-700" aria-hidden="true" />
          <p className="font-medium">No contributors found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
          <button
            onClick={() => {
              setSearch("");
              setActiveCategory("overall");
              setSortBy("points");
            }}
            className="mt-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            Clear filters
          </button>
        </div>
      </td>
    </tr>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-between items-center py-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <span className="text-xs font-medium text-slate-500">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex items-center gap-2" role="navigation" aria-label="Pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#E0E9F2] disabled:opacity-50"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3 h-3" aria-hidden="true" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition-all hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#E0E9F2] disabled:opacity-50"
            aria-label="Next page"
          >
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  };

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50/90">
          <tr>
            {["Rank", "Contributor", "Achievement", "Points", "PRs"].map((header) => (
              <th
                key={header}
                scope="col"
                className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          <AnimatePresence mode="popLayout">
            {currentContributors.length > 0 ? (
              currentContributors.map((c, index) => {
                const rank = ranksMap[c.username];
                const badge = getAchievementBadge(rank, c.prs, c.points);
                const streak = streaks[c.username];

                return (
                  <TableRow
                    key={c.username}
                    c={c}
                    rank={rank}
                    badge={badge}
                    streak={streak}
                    index={index}
                  />
                );
              })
            ) : (
              renderEmpty()
            )}
          </AnimatePresence>
        </tbody>
      </table>

      {renderPagination()}
    </div>
  );

  return (
    <section
      className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/90 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl"
      aria-labelledby="leaderboard-table-title"
    >
      <h2 id="leaderboard-table-title" className="sr-only">Contributor Rankings</h2>

      {error ? renderError() : loading ? renderLoading() : renderTable()}

      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-3">
        {lastUpdated && (
          <time className="text-xs font-medium text-slate-500" dateTime={lastUpdated}>
            {lastUpdated}
          </time>
        )}
        <LiveStatusBadge status={streamStatus} />
      </div>
    </section>
  );
}
