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
import StyledDropdown from "../../components/StyledDropdown";

// Repository constant — update if the leaderboard should point to another repo
const GITHUB_REPO = "SandeepVashishtha/Eventra";
// Token read from env for higher rate limits (optional)
const TOKEN = process.env.REACT_APP_GITHUB_TOKEN || "";

// Points mapping for PR labels (keeps scoring logic centralized)
const POINTS = {
  "level-1": 3,
  "level-2": 7,
  "level-3": 10,
};

export default function LeaderBoard() {
  // Local state: contributors list and UI state
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("points");
  const [isDark, setIsDark] = useState(false);

  // Constants for pagination and UI
  const CONTRIBUTORS_PER_PAGE = 10;

  // 🎉 Confetti on page load — small celebratory effect
  useEffect(() => {
    // Only visual — does not affect data or app logic
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { x: 0.5, y: 0.6 },
      startVelocity: 45,
      gravity: 0.9,
      scalar: 1.2,
    });
  }, []);

  // Load data from cache or network
  const loadLeaderboardData = async () => {
    setLoading(true);
    const cachedData = localStorage.getItem("leaderboardData");
    const now = Date.now();

    // If cached data exists and is fresh (1 hour), use it to avoid rate limits
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
        // If cache parse fails, proceed to fetch fresh data
        console.error("Error parsing cached data:", error);
      }
    }
    await fetchContributors();
  };

  // Fetch contributors and PRs from GitHub REST API
  const fetchContributors = async () => {
    try {
      // contributorsMap accumulates scoring per username
      let contributorsMap = {};
      let page = 1;
      let hasMore = true;

      // Fetch contributor metadata (avatar, profile)
      const contributorsRes = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contributors`,
        { headers: TOKEN ? { Authorization: `token ${TOKEN}` } : {} }
      );

      if (!contributorsRes.ok) throw new Error("Failed to fetch contributors");
      const contributorsData = await contributorsRes.json();
      const contributorsInfo = {};

      // Store basic contributor info for later use when building the map
      contributorsData.forEach((contributor) => {
        // Note: contributor.name might be undefined in this endpoint response
        contributorsInfo[contributor.login] = {
          name: contributor.name || contributor.login,
          avatar: contributor.avatar_url,
          profile: contributor.html_url,
        };
      });

      // Paginate through closed PRs to find merged GSoc-related PRs
      while (hasMore) {
        const res = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/pulls?state=closed&per_page=100&page=${page}`,
          { headers: TOKEN ? { Authorization: `token ${TOKEN}` } : {} }
        );
        const prs = await res.json();
        // If no PRs returned, stop paginating
        if (prs.length === 0) {
          hasMore = false;
          break;
        }

        prs.forEach((pr) => {
          // Only count merged PRs
          if (!pr.merged_at) return;

          // Normalize labels for matching against POINTS map
          const labels = pr.labels.map((l) => l.name.toLowerCase());
          const hasGsocLabel = labels.some(
            (label) => label.includes("gssoc") || label.includes("gsoc")
          );
          // Skip PRs that are not GSoc-related
          if (!hasGsocLabel) return;

          const author = pr.user.login;
          let points = 0;
          // Sum points for all matching labels on the PR
          labels.forEach((label) => {
            const normalized = label.replace(/\s+/g, "").toLowerCase();
            if (POINTS[normalized]) points += POINTS[normalized];
          });

          // Initialize contributor entry if needed
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

          // Increment totals for this contributor
          contributorsMap[author].points += points;
          contributorsMap[author].prs += 1;
        });

        // Proceed to next page of PRs
        page++;
      }

      // Convert map to array and sort by points descending
      const sortedContributors = Object.values(contributorsMap).sort(
        (a, b) => b.points - a.points
      );

      // Update UI state and cache the results for future loads
      setContributors(sortedContributors);
      setLastUpdated(new Date().toLocaleString());
      localStorage.setItem(
        "leaderboardData",
        JSON.stringify({ data: sortedContributors, timestamp: Date.now() })
      );
    } catch (err) {
      // Log errors but keep the app functional (shows empty state)
      console.error("Error fetching contributors:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load on component mount
  useEffect(() => {
    loadLeaderboardData();
  }, []);

  // Filter & sort
  const filteredContributors = contributors.filter((c) => {
    // Simple search across username and name
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.username.toLowerCase().includes(q) ||
      (c.name && c.name.toLowerCase().includes(q))
    );
  });

  const sortedContributors = [...filteredContributors].sort((a, b) => {
    // Sorting options: points, prs, username
    if (sortBy === "points") return b.points - a.points;
    if (sortBy === "prs") return b.prs - a.prs;
    if (sortBy === "username") return a.username.localeCompare(b.username);
    return 0;
  });

  // Pagination calculations
  const indexOfLast = currentPage * CONTRIBUTORS_PER_PAGE;
  const indexOfFirst = indexOfLast - CONTRIBUTORS_PER_PAGE;
  const currentContributors = sortedContributors.slice(
    indexOfFirst,
    indexOfLast
  );
  const totalPages = Math.ceil(
    sortedContributors.length / CONTRIBUTORS_PER_PAGE
  );

  // Build a quick lookup for ranks based on the original sorted list
  const ranksMap = {};
  contributors.forEach((c, i) => {
    ranksMap[c.username] = i + 1;
  });

  // Calculate aggregate stats used in the dashboard cards
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
        <div className="flex justify-center items-end mb-6 space-x-4">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              // When searching, reset to first page to show results from start
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search contributors..."
            className="w-full max-w-xs px-4 py-2 border border-gray-300 dark:border-gray-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <StyledDropdown
            label="Sort by"
            value={sortOptions.find((opt) => opt.value === sortBy)?.label || "Select Sort"}
            options={sortOptions.map((opt) => opt.label)}
            onChange={(value) => {
              const selectedOption = sortOptions.find(
                (opt) => opt.label === value
              );
              if (selectedOption) setSortBy(selectedOption.value);
            }}
            placeholder="Sort by"
          />
        </div>

        {/* stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Contributors Card */}
          <div className="p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-indigo-50 to-gray-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center">
              <div className="p-3 rounded-xl mr-4 bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                <FaUsers className="text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Contributors
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? "..." : stats.totalContributors}
                </p>
              </div>
            </div>
          </div>
          {/* Pull Requests Card */}
          <div className="p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-indigo-50 to-gray-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center">
              <div className="p-3 rounded-xl mr-4 bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                <FaCode className="text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pull Requests
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? "..." : stats.flooredTotalPRs}
                </p>
              </div>
            </div>
          </div>
          {/* Total Points Card */}
          <div className="p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-indigo-50 to-gray-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center">
              <div className="p-3 rounded-xl mr-4 bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
                <FaStar className="text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Points
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
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
