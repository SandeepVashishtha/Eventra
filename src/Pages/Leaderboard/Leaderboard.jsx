import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCode,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaAward,
  FaTrophy,
  FaMedal,
  FaFire,
} from "react-icons/fa";
import confetti from "canvas-confetti";
import GSSoCContribution from "./GSSoCContribution";
import StyledDropdown from "../../components/StyledDropdown";
import { LeaderboardTableSkeleton } from "../../components/common/SkeletonLoaders";
import useDocumentTitle from "../../hooks/useDocumentTitle";

// Repository constant — update if the leaderboard should point to another repo
const GITHUB_REPO = "SandeepVashishtha/Eventra";
// Token read from env for higher rate limits (optional)
const TOKEN = process.env.REACT_APP_GITHUB_TOKEN || "";
const LEADERBOARD_CACHE_KEY = "leaderboardData:v2";

// Points mapping for PR labels (keeps scoring logic centralized)
const POINTS = {
  gssoclevel1: 3,
  gssoclevel2: 7,
  gssoclevel3: 10,
};
const DEFAULT_MERGED_PR_POINTS = 1;

const normalizeLabel = (label = "") =>
  label.toLowerCase().replace(/[^a-z0-9]/g, "");

const calculatePrPoints = (labels) => {
  const levelPoints = labels.reduce((total, label) => {
    const normalized = normalizeLabel(label);
    return total + (POINTS[normalized] || 0);
  }, 0);

  return levelPoints || DEFAULT_MERGED_PR_POINTS;
};

// Gamification helper to determine contributor rank achievements
const getAchievementBadge = (rank, prs, points) => {
  if (rank === 1) return { label: "Grandmaster", color: "from-amber-500 to-yellow-400 text-amber-950", icon: FaTrophy };
  if (rank === 2) return { label: "Champion", color: "from-slate-300 to-zinc-400 text-slate-900", icon: FaAward };
  if (rank === 3) return { label: "Elite", color: "from-amber-700 to-orange-600 text-orange-50", icon: FaMedal };
  if (prs >= 10) return { label: "PR Machine", color: "from-indigo-600 to-purple-500 text-white", icon: FaFire };
  if (points >= 25) return { label: "Expert Contributor", color: "from-emerald-500 to-teal-400 text-emerald-950", icon: FaAward };
  return { label: "Active Contributor", color: "from-sky-100 to-blue-200 dark:from-slate-800 dark:to-slate-700 text-sky-800 dark:text-sky-300", icon: FaCode };
};

export default function LeaderBoard() {
  useDocumentTitle("Eventra | Leaderboard");
  // Local state: contributors list and UI state
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("points");

  const CONTRIBUTORS_PER_PAGE = 10;

  // 🎉 Confetti on page load
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { x: 0.5, y: 0.6 },
      startVelocity: 45,
      gravity: 0.9,
      scalar: 1.2,
    });
  }, []);

  const loadLeaderboardData = async () => {
    setLoading(true);
    const cachedData = localStorage.getItem(LEADERBOARD_CACHE_KEY);
    const now = Date.now();

    if (cachedData) {
      try {
        const { data, timestamp } = JSON.parse(cachedData);
        if (now - timestamp < 60 * 60 * 1000) {
          setContributors(data);
          setLastUpdated(
            `Last updated: ${new Date(timestamp).toLocaleString()} (cached)`,
          );
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error parsing cached data:", error);
      }
    }
    await fetchContributors();
  };

  const fetchContributors = async () => {
    try {
      let contributorsMap = {};
      let page = 1;
      let hasMore = true;

      const contributorsRes = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contributors`,
        { headers: TOKEN ? { Authorization: `token ${TOKEN}` } : {} },
      );

      if (!contributorsRes.ok) throw new Error("Failed to fetch contributors");
      const contributorsData = await contributorsRes.json();
      const contributorsInfo = {};

      contributorsData.forEach((contributor) => {
        contributorsInfo[contributor.login] = {
          name: contributor.name || contributor.login,
          avatar: contributor.avatar_url,
          profile: contributor.html_url,
        };
      });

      while (hasMore) {
        const res = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/pulls?state=closed&per_page=100&page=${page}`,
          { headers: TOKEN ? { Authorization: `token ${TOKEN}` } : {} },
        );

        if (!res.ok) {
          console.warn(`GitHub API request failed with status: ${res.status}`);
          hasMore = false;
          break;
        }

        const prs = await res.json();
        
        // Ensure standard array shape to avoid runtime TypeError crash
        if (!Array.isArray(prs) || prs.length === 0) {
          hasMore = false;
          break;
        }

        prs.forEach((pr) => {
          if (!pr.merged_at) return;

          const labels = pr.labels.map((l) => l.name.toLowerCase());
          const hasGsocLabel = labels.some(
            (label) => label.includes("gssoc") || label.includes("gsoc"),
          );
          if (!hasGsocLabel) return;

          const author = pr.user.login;
          const points = calculatePrPoints(labels);

          if (!contributorsMap[author]) {
            const contributorInfo = contributorsInfo[author] || {
              name: author,
              avatar: pr.user.avatar_url,
              profile: pr.user.html_url,
            };
            contributorsMap[author] = {
              username: author,
              name: contributorInfo.name,
              avatar: contributorInfo.avatar,
              profile: contributorInfo.profile,
              points: 0,
              prs: 0,
            };
          }

          contributorsMap[author].points += points;
          contributorsMap[author].prs += 1;
        });

        page++;
      }

      // Add achievement-based bonus points to gamify contributors:
      // +5 points for 5-9 PRs, +10 points for >= 10 PRs
      Object.keys(contributorsMap).forEach((user) => {
        const count = contributorsMap[user].prs;
        if (count >= 10) {
          contributorsMap[user].points += 10; // Mega bonus
        } else if (count >= 5) {
          contributorsMap[user].points += 5; // Mid bonus
        }
      });

      const sortedContributors = Object.values(contributorsMap).sort(
        (a, b) => b.points - a.points,
      );

      setContributors(sortedContributors);
      setLastUpdated(new Date().toLocaleString());
      localStorage.setItem(
        LEADERBOARD_CACHE_KEY,
        JSON.stringify({ data: sortedContributors, timestamp: Date.now() }),
      );
    } catch (err) {
      console.error("Error fetching contributors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const filteredContributors = contributors.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.username.toLowerCase().includes(q) ||
      (c.name && c.name.toLowerCase().includes(q))
    );
  });

  const sortedContributors = [...filteredContributors].sort((a, b) => {
    if (sortBy === "points") return b.points - a.points;
    if (sortBy === "prs") return b.prs - a.prs;
    if (sortBy === "username") return a.username.localeCompare(b.username);
    return 0;
  });

  const indexOfLast = currentPage * CONTRIBUTORS_PER_PAGE;
  const indexOfFirst = indexOfLast - CONTRIBUTORS_PER_PAGE;
  const currentContributors = sortedContributors.slice(
    indexOfFirst,
    indexOfLast,
  );
  const totalPages = Math.ceil(
    sortedContributors.length / CONTRIBUTORS_PER_PAGE,
  );

  const ranksMap = {};
  contributors.forEach((c, i) => {
    ranksMap[c.username] = i + 1;
  });

  const stats = {
    totalContributors: contributors.length,
    flooredTotalPRs: contributors.reduce((sum, c) => sum + c.prs, 0),
    flooredTotalPoints: contributors.reduce((sum, c) => sum + c.points, 0),
  };

  const sortOptions = [
    { label: "Points", value: "points" },
    { label: "PRs", value: "prs" },
    { label: "Username", value: "username" },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 pt-20 md:pt-24 py-12 sm:py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HERO TITLE */}
        <div className="text-center mb-12 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest"
          >
            🏆 GSSoC'26 Contribution Arena
          </motion.div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Community <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Leaderboard</span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Honoring our elite open-source creators driving the core features of Eventra with robust code and design improvements.
          </p>
        </div>

        {/* SEARCH & FILTERS GRID */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/40">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search creators..."
            className="w-full sm:max-w-xs px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-950 dark:text-white"
          />
          
          <StyledDropdown
            label="Filter & Sort"
            value={sortOptions.find((opt) => opt.value === sortBy)?.label || "Select Sort"}
            options={sortOptions.map((opt) => opt.label)}
            onChange={(value) => {
              const selectedOption = sortOptions.find(
                (opt) => opt.label === value,
              );
              if (selectedOption) setSortBy(selectedOption.value);
            }}
            placeholder="Sort by"
          />
        </div>

        {/* AGGREGATED STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: "Active Contributors",
              value: stats.totalContributors,
              color: "from-blue-500/10 to-indigo-500/10 border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400",
              icon: FaUsers,
            },
            {
              title: "Merged Pull Requests",
              value: stats.flooredTotalPRs,
              color: "from-emerald-500/10 to-teal-500/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400",
              icon: FaCode,
            },
            {
              title: "Aggregated Arena Points",
              value: stats.flooredTotalPoints,
              color: "from-amber-500/10 to-orange-500/10 border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-400",
              icon: FaStar,
            },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-6 rounded-2xl bg-gradient-to-br ${card.color} border shadow-sm flex items-center gap-4`}
            >
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
                <card.icon className="text-2xl" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {card.title}
                </p>
                <p className="text-3xl font-extrabold text-slate-950 dark:text-white mt-1">
                  {loading ? "..." : card.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* LEADERBOARD ARENA GRID */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
          {loading ? (
            <LeaderboardTableSkeleton rows={CONTRIBUTORS_PER_PAGE} />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Contributor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Achievement Badge
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Points
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Merged PRs
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                  <AnimatePresence>
                    {currentContributors.map((c, index) => {
                      const rank = ranksMap[c.username];
                      const badge = getAchievementBadge(rank, c.prs, c.points);
                      return (
                        <motion.tr
                          key={c.username}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.25, delay: index * 0.05 }}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors"
                        >
                          {/* RANK INDEX BADGES */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${
                                rank === 1
                                  ? "bg-yellow-400 text-yellow-950 shadow-md shadow-yellow-400/20"
                                  : rank === 2
                                  ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                  : rank === 3
                                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                                  : "bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                              }`}
                            >
                              {rank}
                            </span>
                          </td>

                          {/* AVATAR + LINKS */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img
                                loading="lazy"
                                decoding="async"
                                width="40"
                                height="40"
                                className="h-10 w-10 rounded-full border-2 border-indigo-100 dark:border-slate-800 bg-slate-100 shadow-sm"
                                src={c.avatar}
                                alt={c.username}
                              />
                              <div>
                                <a
                                  href={c.profile}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                  {c.username}
                                </a>
                                {c.name && c.name !== c.username && (
                                  <div className="text-xs text-slate-400 mt-0.5">
                                    {c.name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* GAMIFICATION BADGES */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${badge.color} border border-black/5 dark:border-white/5 shadow-sm`}
                            >
                              <badge.icon className="w-3.5 h-3.5" />
                              {badge.label}
                            </div>
                          </td>

                          {/* POINTS METRICS */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                              <FaStar className="text-yellow-400 text-xs" />
                              <span>{c.points}</span>
                            </div>
                          </td>

                          {/* PR METRICS */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                              <FaCode className="text-indigo-500 text-xs" />
                              <span>{c.prs}</span>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>

              {/* PAGINATION BAR */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center py-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <span className="text-xs font-medium text-slate-500">
                    Showing page {currentPage} of {totalPages}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-50 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 bg-transparent transition-all"
                    >
                      <FaChevronLeft className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-50 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 bg-transparent transition-all"
                    >
                      <FaChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TABLE FOOTER METADATA */}
          <div className="bg-slate-50 dark:bg-slate-950/60 px-6 py-3 border-t border-slate-100 dark:border-slate-800 text-right">
            {lastUpdated && (
              <span className="text-xs font-medium text-slate-400">
                {lastUpdated}
              </span>
            )}
          </div>
        </div>
      </div>
      <GSSoCContribution />
    </div>
  );
}
