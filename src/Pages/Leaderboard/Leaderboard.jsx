import { useEffect, useState, Fragment } from "react";
import {
  FaCode,
  FaStar,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
} from "react-icons/fa";
import { Menu, Transition } from "@headlessui/react";
import confetti from "canvas-confetti";
import GSSoCContribution from "./GSSoCContribution";

const GITHUB_REPO = "SandeepVashishtha/Eventra";
const TOKEN = process.env.REACT_APP_GITHUB_TOKEN || "";

const POINTS = {
  "level-1": 3,
  "level-2": 7,
  "level-3": 10,
};

export default function LeaderBoard() {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("points");
  const [isDark, setIsDark] = useState(false);

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
    const cachedData = localStorage.getItem("leaderboardData");
    const now = Date.now();

    if (cachedData) {
      try {
        const { data, timestamp } = JSON.parse(cachedData);
        if (now - timestamp < 60 * 60 * 1000) {
          setContributors(data);
          setLastUpdated(
            `Last updated: ${new Date(timestamp).toLocaleString()} (cached)`
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
        { headers: TOKEN ? { Authorization: `token ${TOKEN}` } : {} }
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
          { headers: TOKEN ? { Authorization: `token ${TOKEN}` } : {} }
        );
        const prs = await res.json();
        if (prs.length === 0) {
          hasMore = false;
          break;
        }

        prs.forEach((pr) => {
          if (!pr.merged_at) return;
          const labels = pr.labels.map((l) => l.name.toLowerCase());
          const hasGsocLabel = labels.some(
            (label) => label.includes("gssoc") || label.includes("gsoc")
          );
          if (!hasGsocLabel) return;

          const author = pr.user.login;
          let points = 0;
          labels.forEach((label) => {
            const normalized = label.replace(/\s+/g, "").toLowerCase();
            if (POINTS[normalized]) points += POINTS[normalized];
          });

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

      const sortedContributors = Object.values(contributorsMap).sort(
        (a, b) => b.points - a.points
      );
      setContributors(sortedContributors);
      setLastUpdated(new Date().toLocaleString());
      localStorage.setItem(
        "leaderboardData",
        JSON.stringify({ data: sortedContributors, timestamp: Date.now() })
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

  // Filter & sort
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

  // Pagination
  const indexOfLast = currentPage * CONTRIBUTORS_PER_PAGE;
  const indexOfFirst = indexOfLast - CONTRIBUTORS_PER_PAGE;
  const currentContributors = sortedContributors.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(
    sortedContributors.length / CONTRIBUTORS_PER_PAGE
  );

  const ranksMap = {};
  contributors.forEach((c, i) => {
    ranksMap[c.username] = i + 1;
  });

  // Calculate stats
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
    <div className="bg-white dark:bg-black py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {/* UPDATED: Header text */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            <span className="block text-indigo-700 dark:text-indigo-400">
              GSSoC'25
            </span>
            <span className="text-gray-800 dark:text-gray-200">
              Contributor Leaderboard
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Recognizing the amazing contributions from our open source community
          </p>
        </div>

        {/* Search + Modern Dropdown */}
        <div className="flex justify-center items-center mb-6 space-x-4">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search contributors..."
            className="w-full max-w-xs px-4 py-2 border border-gray-300 dark:border-gray-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <Menu as="div" className="relative inline-block text-left">
            {/* UPDATED: Sort dropdown button */}
            <Menu.Button className="inline-flex justify-center w-48 px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400">
              Sort by: {sortOptions.find((opt) => opt.value === sortBy)?.label}
              <FaChevronDown className="ml-2 h-4 w-4" />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              {/* UPDATED: Dropdown menu */}
              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 rounded-md shadow-lg focus:outline-none z-50">
                {sortOptions.map((option) => (
                  <Menu.Item key={option.value}>
                    {({ active }) => (
                      <button
                        onClick={() => setSortBy(option.value)}
                        // Active state is fine, just need to update inactive text
                        className={`${
                          active
                            ? "bg-indigo-500 text-white"
                            : "text-gray-700 dark:text-gray-300"
                        } group flex w-full items-center px-4 py-2 text-sm`}
                      >
                        {option.label}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </Menu>

          

          
        </div>


        {/* stats */}
        <div style={{ display: "flex", gap: 18, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220, padding: 24, borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: `1px solid ${isDark ? "#444" : "#eee"}`, background: isDark ? "linear-gradient(135deg,#23272f,#1a1d23)" : "linear-gradient(135deg,#e0e7ff,#f3f4f6)" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ padding: 12, borderRadius: 12, background: isDark ? "rgba(59,130,246,0.2)" : "#dbeafe", color: isDark ? "#60a5fa" : "#2563eb", marginRight: 16 }}>
                <FaUsers style={{ fontSize: 22 }} />
              </div>
              <div>
                <p style={{ fontSize: 14, color: isDark ? "#b3b3b3" : "#555" }}>Contributors</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: isDark ? "#fff" : "#222" }}>
                  {loading ? "..." : stats.totalContributors}
                </p>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 220, padding: 24, borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: `1px solid ${isDark ? "#444" : "#eee"}`, background: isDark ? "linear-gradient(135deg,#23272f,#1a1d23)" : "linear-gradient(135deg,#e0e7ff,#f3f4f6)" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ padding: 12, borderRadius: 12, background: isDark ? "rgba(16,185,129,0.2)" : "#bbf7d0", color: isDark ? "#34d399" : "#059669", marginRight: 16 }}>
                <FaCode style={{ fontSize: 22 }} />
              </div>
              <div>
                <p style={{ fontSize: 14, color: isDark ? "#b3b3b3" : "#555" }}>Pull Requests</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: isDark ? "#fff" : "#222" }}>
                  {loading ? "..." : stats.flooredTotalPRs}
                </p>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 220, padding: 24, borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: `1px solid ${isDark ? "#444" : "#eee"}`, background: isDark ? "linear-gradient(135deg,#23272f,#1a1d23)" : "linear-gradient(135deg,#e0e7ff,#f3f4f6)" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ padding: 12, borderRadius: 12, background: isDark ? "rgba(139,92,246,0.2)" : "#ede9fe", color: isDark ? "#a78bfa" : "#7c3aed", marginRight: 16 }}>
                <FaStar style={{ fontSize: 22 }} />
              </div>
              <div>
                <p style={{ fontSize: 14, color: isDark ? "#b3b3b3" : "#555" }}>Total Points</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: isDark ? "#fff" : "#222" }}>
                  {loading ? "..." : stats.flooredTotalPoints}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* UPDATED: Table container */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="overflow-x-auto">{/* Skeleton loader */}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-500">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-4 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contributor
                    </th>
                    <th className="px-6 py-4 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-4 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      PRs
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900  dark:to-black  divide-y divide-gray-400 dark:divide-gray-500">
                  {currentContributors.map((c) => {
                    const rank = ranksMap[c.username];
                    return (
                      <tr
                        key={c.username}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 border-b border-gray-100 dark:border-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            // UPDATED: Rank badges
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-medium ${
                              rank === 1
                                ? "bg-yellow-500 text-white"
                                : rank === 2
                                ? "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                                : rank === 3
                                ? "bg-amber-800 text-white"
                                : "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                            }`}
                          >
                            {rank}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full border-2 border-indigo-200 dark:border-gray-600"
                                src={c.avatar}
                                alt={c.username}
                              />
                            </div>
                            <div className="ml-4">
                              <a
                                href={c.profile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                              >
                                {c.username}
                              </a>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {c.name && c.name !== c.username ? c.name : ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaStar className="text-yellow-400 mr-1" />
                            <span className="font-medium">{c.points}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaCode className="text-indigo-500 mr-1" />
                            <span className="font-medium">{c.prs}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 py-4 bg-white dark:bg-black/80">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 flex items-center bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <FaChevronLeft />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 text-sm rounded-lg border ${
                        currentPage === i + 1
                          ? "bg-indigo-500 text-white border-indigo-500"
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 flex items-center bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* UPDATED: Table footer */}
          <div className="bg-gray-50 dark:bg-black/70 px-6 py-2 text-right border-t border-gray-200 dark:border-gray-700">
            {lastUpdated && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
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
