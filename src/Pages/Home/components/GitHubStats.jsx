import { useEffect, useState, useMemo } from "react";
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

import { safeJsonParse } from "../../../utils/safeJsonParse";
import {
  fetchRepository,
  fetchContributors,
  fetchPullRequests,
} from "../../../utils/githubApiClient";
import { ENV } from "../../../config/env";

const fetchStat = fetchRepository;

const repoPath = ENV.GITHUB_REPO;
const [GITHUB_USER, GITHUB_REPO] = repoPath.split("/");

const LS_KEY = "eventra:repoStats";
const CACHE_MS = 30 * 60 * 1000; // 30 min

const readCache = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const { data, ts } = safeJsonParse(raw, {});
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
    if (cached && mounted) {
      setStats(cached);
      setIsLoading(false);
    }

    (async () => {
      try {
        const [repoResult, contributorsResult, prResult] = await Promise.allSettled([
          fetchStat(GITHUB_USER, GITHUB_REPO),
          fetchStat(GITHUB_USER, GITHUB_REPO, 1, 1),
          fetchStat(GITHUB_USER, GITHUB_REPO, { per_page: 1 }),
        ]);

        if (repoResult.status === "rejected") {
          const cached = readCache();
          if (cached) {
            setStats(cached);
            setIsLoading(false);
            return;
          }
          throw repoResult.reason;
        }
        const repoData = repoResult.value;

        let contribCount = "—";
        if (contributorsResult.status === "fulfilled") {
          const contributors = contributorsResult.value;
          if (Array.isArray(contributors) && contributors.length > 0) {
            contribCount = contributors.length;
          }
        } else if (contributorsResult.status === "rejected") {
          contribCount = "—";
        }

        let prCount = "—";
        if (prResult.status === "fulfilled") {
          const pullRequests = prResult.value;
          if (Array.isArray(pullRequests) && pullRequests.length > 0) {
            prCount = pullRequests.length;
          }
        } else if (prResult.status === "rejected") {
          prCount = "—";
        } else {
        }

        const next = {
          stars: repoData.stargazers_count || 0,
          forks: repoData.forks_count || 0,
          issues: repoData.open_issues_count || 0,
          contributors: contribCount,
          lastCommit: repoData.pushed_at
            ? new Date(repoData.pushed_at).toLocaleDateString("en-GB")
            : "N/A",
          size: repoData.size || 0,
          pullRequests: prCount,
          releases: "—",
          license: repoData.license?.spdx_id || "N/A",
          watchers: repoData.subscribers_count || 0,
          languages: {},
        };

        if (mounted) {
          setStats(next);
          writeCache(next);
          setIsLoading(false);
        }
      } catch {
        if (!cached && mounted) {
          setStats((s) => ({ ...s, stars: "—", forks: "—", issues: "—" }));
          setIsLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const statCards = useMemo(
    () => [
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
    ],
    [stats]
  );

  return (
    <section className="bg-white py-16 dark:bg-black">
      <div className="mx-auto max-w-7xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 px-4 text-center text-3xl font-extrabold text-gray-900 sm:mb-10 sm:text-4xl dark:text-gray-100"
        >
          Project Statistics
        </motion.h2>

        <motion.div
          initial="hidden"
          animate="show"
          className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
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
                  className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white px-3 py-4 shadow-lg transition-all duration-300 hover:shadow-2xl sm:px-6 sm:py-6 md:px-8 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="absolute inset-0 rounded-2xl bg-black/5 opacity-0 blur-3xl transition duration-700 group-hover:opacity-100"></div>

                  <div className="z-10 flex flex-col items-center space-y-2 sm:space-y-3">
                    <div className="rounded-full bg-gray-50 p-2 shadow-inner sm:p-3 md:p-4 dark:bg-gray-700 [&>svg]:h-7 [&>svg]:w-7 sm:[&>svg]:h-9 sm:[&>svg]:w-9 md:[&>svg]:h-10 md:[&>svg]:w-10">
                      {icon}
                    </div>
                    <p className="px-1 text-center text-base font-bold break-words text-gray-900 sm:text-lg md:text-xl dark:text-gray-100">
                      {value}
                    </p>
                    <p className="px-1 text-center text-xs font-medium text-gray-500 sm:text-sm dark:text-gray-400">
                      {label}
                    </p>
                  </div>

                  <ExternalLink
                    size={16}
                    className="absolute top-3 right-3 text-gray-400 opacity-0 transition duration-300 group-hover:opacity-100 dark:text-gray-500"
                  />
                </motion.a>
              ))}
        </motion.div>
      </div>
    </section>
  );
}
