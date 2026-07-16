import { Search, Filter, RefreshCw, Download } from "lucide-react";
import { motion } from "framer-motion";
import StyledDropdown from "../components/StyledDropdown";

const sortOptions = [
  { label: "Points (High \u2192 Low)", value: "points" },
  { label: "PRs (High \u2192 Low)", value: "prs" },
  { label: "Username (A \u2192 Z)", value: "username" },
];

export default function LeaderboardControls({ search, onSearchChange, sortBy, onSortChange, onRefresh, onExport, isRefreshing, searchInputRef }) {

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/80 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.06)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" aria-hidden="true" />
        <input
          ref={searchInputRef}
          type="search"
          value={search}
          onChange={onSearchChange}
          placeholder="Search contributors... (Press / to focus)"
          className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-slate-950 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-slate-300 dark:focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-[#E0E9F2] dark:focus:ring-slate-700"
          aria-label="Search contributors by username"
        />
      </div>

      <div className="flex items-center gap-3">
        <StyledDropdown
          label="Sort By"
          value={sortOptions.find((opt) => opt.value === sortBy)?.label || "Sort by"}
          options={sortOptions.map((opt) => opt.label)}
          onChange={(value) => {
            const selected = sortOptions.find((opt) => opt.label === value);
            if (selected) onSortChange(selected.value);
          }}
          icon={<Filter className="w-3 h-3" aria-hidden="true" />}
        />

        <motion.button
          onClick={onRefresh}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isRefreshing}
          className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 p-2.5 text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-950 dark:hover:text-white disabled:opacity-50"
          aria-label="Refresh leaderboard data"
          title="Refresh data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
        </motion.button>

        <motion.button
          onClick={onExport}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 p-2.5 text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-950 dark:hover:text-white"
          aria-label="Export leaderboard as CSV"
          title="Export as CSV"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
        </motion.button>
      </div>
    </div>
  );
}
