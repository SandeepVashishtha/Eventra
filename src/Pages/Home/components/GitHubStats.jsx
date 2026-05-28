import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { GitHubStatCardSkeleton } from "../../../components/common/SkeletonLoaders";
import {
  Star,
  GitFork,
  AlertCircle,
  Users,
  Clock,
  Code2,
  ExternalLink,
  GitPullRequest,
  Scale,
  Eye,
  Languages,
} from "lucide-react";

const GITHUB_USER = "SandeepVashishtha";
const GITHUB_REPO = "Eventra";

const LS_KEY = "eventra:repoStats";
const CACHE_MS = 30 * 60 * 1000; // 30 min

const readCache = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    return Date.now() - ts > CACHE_MS ? null : data;
  } catch {
    return null;
  }
};

const writeCache = (data) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
};

const API_BASE = process.env.REACT_APP_API_URL ?? "";

/**
 * Fetches a single backend endpoint and returns the parsed JSON body.
 * Rejects if the response is not ok so Promise.allSettled can surface the error.
 *
 * @param {string} path - Relative path appended to REACT_APP_API_URL
 * @returns {Promise<unknown>}
 */
const fetchStat = async (path) => {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${path} responded with ${res.status}`);
  return res.json();
};

export default function GitHubStats() {
  const [stats, setStats] = useState({
    stars: 0,
    forks: 0,
    issues: 0,
    contributors: 0,
    lastCommit: "N/A",
    size: 0,
    pullRequests: 0,
    releases: 0,
    license: "N/A",
    watchers: 0,
    languages: {},
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const cached = readCache();
    if (cached) {
      setStats(cached);
      setIsLoading(false);
    }

    (async () => {
      try {
        // Fire all three requests simultaneously — they are independent and
        // there is no reason to wait for one before starting the next.
        // Promise.allSettled ensures a single failure does not abort the others.
        const [repoResult, contributorsResult, prResult] = await Promise.allSettled([
          fetchStat("/github/repo"),
          fetchStat("/github/contributors"),
          fetchStat("/github/pulls"),
        ]);

        if (!mounted) return;

        // Extract fulfilled values with per-fetch fallbacks for rejected settlements
        const repoData = repoResult.status === "fulfilled" ? repoResult.value : null;
        const contributorsData =
          contributorsResult.status === "fulfilled" ? contributorsResult.value : null;
        const prData = prResult.status === "fulfilled" ? prResult.value : null;

        if (contributorsResult.status === "rejected") {
          console.warn("GitHub contributors fetch failed:", contributorsResult.reason);
        }
        if (prResult.status === "rejected") {
          console.warn("GitHub pull requests fetch failed:", prResult.reason);
        }
        if (repoResult.status === "rejected") {
          console.warn("GitHub repo fetch failed:", repoResult.reason);
          // If the primary repo fetch failed and we had a cache, keep the cached
          // display rather than partially overwriting it with null values.
          if (cached) {
            setIsLoading(false);
            return;
          }
          setStats((s) => ({ ...s, stars: "—", forks: "—", issues: "—" }));
          setIsLoading(false);
          return;
        }

        const contribCount = Array.isArray(contributorsData) ? contributorsData.length : "—";
        const prCount = Array.isArray(prData) ? prData.length : "—";

        const next = {
          stars: repoData?.stargazers_count || 0,
          forks: repoData?.forks_count || 0,
          issues: repoData?.open_issues_count || 0,
          contributors: contribCount,
          lastCommit: repoData?.pushed_at
            ? new Date(repoData.pushed_at).toLocaleDateString("en-GB")
            : "N/A",
          size: repoData?.size || 0,
          pullRequests: prCount,
          releases: "—",
          license: repoData?.license?.spdx_id || "N/A",
          watchers: repoData?.subscribers_count || 0,
          languages: {},
        };

        // Only update state and write cache after all three results are merged —
        // preserving the all-or-nothing cache semantics of the original code.
        setStats(next);
        writeCache(next);
      } catch (err) {
        console.warn("GitHub stats fetch failed:", err);
        if (!cached && mounted) {
          setStats((s) => ({ ...s, stars: "—", forks: "—", issues: "—" }));
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const statCards = useMemo(() => [
    {
      label: "Stars",
      value: stats.stars,
      icon: <Star className="text-yellow-500" size={40} />,
      link: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/stargazers`,
    },
    {
      label: "Forks",
      value: stats.forks,
      icon: <GitFork className="text-blue-500" size={40} />,
      link: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/network/members`,
    },
    {
      label: "Issues",
      value: stats.issues,
      icon: <AlertCircle className="text-red-500" size={40} />,
      link: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/issues`,
    },
    {
      label: "Pull Requests",
      value: stats.pullRequests,
      icon: <GitPullRequest className="text-pink-500" size={40} />,
      link: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/pulls`,
    },
    {
      label: "Contributors",
      value: stats.contributors,
      icon: <Users className="text-black" size={40} />,
      link: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/graphs/contributors`,
    },
    {
      label: "Watchers",
      value: stats.watchers,
      icon: <Eye className="text-cyan-500" size={40} />,
      link: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/watchers`,
    },
    {
      label: "License",
      value: stats.license,
      icon: <Scale className="text-gray-600 dark:text-gray-400" size={40} />,
      link: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/blob/main/LICENSE`,
    },
    {
      label: "Last Update",
      value: stats.lastCommit,
      icon: <Clock className="text-black" size={40} />,
      link: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/commits`,
    },
    {
      label: "Code Size",
      value: `${(stats.size / 1024).toFixed(1)} MB`,
      icon: <Code2 className="text-green-500" size={40} />,
      link: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}`,
    },
    {
      label: "Languages",
      value: Object.keys(stats.languages).length
        ? Object.keys(stats.languages).join(", ")
        : "React",
      icon: <Languages className="text-amber-600" size={40} />,
      link: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}`,
    },
  ], [stats]);

  return (
    <section className="py-16 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 dark:text-gray-100 mb-8 sm:mb-10 px-4"
        >
          Project Statistics
        </motion.h2>

        <motion.div
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 max-w-6xl mx-auto"
        >
          {isLoading
            ? [...Array(10)].map((_, i) => <GitHubStatCardSkeleton key={`skeleton-${i}`} />)
            : statCards.map(({ label, value, icon, link }) => (
                <motion.a
                  key={label}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, rotate: 1 }}
                  whileTap={{ scale: 0.95 }}
                  className="group flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl px-3 py-4 sm:px-6 sm:py-6 md:px-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition duration-700 blur-3xl rounded-2xl"></div>

                  <div className="z-10 flex flex-col items-center space-y-2 sm:space-y-3">
                    <div className="p-2 sm:p-3 md:p-4 bg-gray-50 dark:bg-gray-700 rounded-full shadow-inner [&>svg]:w-7 [&>svg]:h-7 sm:[&>svg]:w-9 sm:[&>svg]:h-9 md:[&>svg]:w-10 md:[&>svg]:h-10">
                      {icon}
                    </div>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 text-center break-words px-1">
                      {value}
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 text-center px-1">
                      {label}
                    </p>
                  </div>

                  <ExternalLink
                    size={16}
                    className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition duration-300"
                  />
                </motion.a>
              ))}
        </motion.div>
      </div>
    </section>
  );
}
