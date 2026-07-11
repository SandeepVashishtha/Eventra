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
  GitPullRequest,
  Scale,
  Eye,
  Languages,
} from "lucide-react";

import { safeJsonParse } from "../../../utils/safeJsonParse";
import { ENV } from "../../../config/env";
import { fetchGitHubJson } from "../../../utils/githubApiClient";

const repoPath = ENV.GITHUB_REPO;
const [GITHUB_USER, GITHUB_REPO] = repoPath.split("/");

const LS_KEY = "eventra:repoStats";
const CACHE_MS = 30 * 60 * 1000; // 30 min
const CONTRIBUTORS_PAGE_SIZE = 100;

const fetchRepository = (owner, repo) =>
  fetchGitHubJson(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);

const fetchContributors = (owner, repo) =>
  fetchGitHubJson(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors`, {
    per_page: CONTRIBUTORS_PAGE_SIZE,
    anon: 1,
  });

const fetchPullRequests = (owner, repo, params) =>
  fetchGitHubJson(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls`, params);

const fetchRepository = (owner, repo) =>
  fetchGitHubJson(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);

const fetchContributors = (owner, repo, page, perPage) =>
  fetchGitHubJson(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors`, {
    page,
    per_page: perPage,
  });

const fetchPullRequests = (owner, repo, params) =>
  fetchGitHubJson(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls`, params);

const fetchLanguages = (owner, repo) =>
  fetchGitHubJson(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`);

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
    license: "N/A",
    defaultBranch: "master",
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
        const [repoResult, contributorsResult, prResult, languagesResult] =
          await Promise.allSettled([
            fetchRepository(GITHUB_USER, GITHUB_REPO),
            fetchContributors(GITHUB_USER, GITHUB_REPO),
            fetchPullRequests(GITHUB_USER, GITHUB_REPO, { per_page: 1 }),
            fetchLanguages(GITHUB_USER, GITHUB_REPO),
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
            contribCount =
              contributors.length === CONTRIBUTORS_PAGE_SIZE
                ? `${CONTRIBUTORS_PAGE_SIZE}+`
                : contributors.length;
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

        const languages =
          languagesResult.status === "fulfilled" &&
          languagesResult.value &&
          typeof languagesResult.value === "object"
            ? languagesResult.value
            : {};

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
          license: repoData.license?.spdx_id || "N/A",
          defaultBranch: repoData.default_branch || "master",
          watchers: repoData.subscribers_count || 0,
          languages,
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
      link: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/blob/${stats.defaultBranch || "master"}/LICENSE`,
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
    <section className="py-16 bg-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl font-extrabold text-center text-text mb-8 sm:mb-10 px-4"
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
            : statCards.map(({ label, value, icon, link }) => {
                const customIcon = React.cloneElement(icon, {
                  className: "text-text-light/50 group-hover:text-primary transition-colors duration-300",
                  size: 15
                });
                return (
                  <motion.a
                    key={label}
                    href={link}
                    target="_blank" rel="noopener noreferrer"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="group p-4 rounded-xl bg-white/40 dark:bg-slate-900/10 backdrop-blur-sm border border-border hover:border-text-light/40 dark:hover:border-slate-700/60 shadow-premium-sm transition-all duration-300 relative flex flex-col justify-between h-[100px]"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-bold text-text-light/50 uppercase tracking-wider select-none">
                        {label}
                      </span>
                      {customIcon}
                    </div>

                    <div className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-text truncate">
                      {value}
                    </div>
                  </motion.a>
                );
              })}
        </motion.div>
      </div>
    </section>
  );
}
