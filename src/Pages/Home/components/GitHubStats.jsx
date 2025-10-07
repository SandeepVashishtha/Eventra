import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

const TOKEN = process.env.REACT_APP_GITHUB_TOKEN || ""; // optional
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

  useEffect(() => {
    let mounted = true;
    const cached = readCache();
    if (cached && mounted) setStats(cached);

    (async () => {
      try {
        const headers = {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
        };

        const repoRes = await fetch(
          `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}`,
          { headers }
        );
        if (!repoRes.ok) throw new Error(`Repo ${repoRes.status}`);
        const repoData = await repoRes.json();

        // contributors
        let contribCount = "—";
        try {
          const cRes = await fetch(
            `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contributors?per_page=100`,
            { headers }
          );
          if (cRes.ok) {
            const cData = await cRes.json();
            if (Array.isArray(cData)) contribCount = cData.length;
          }
        } catch {}

        // pull requests
        let prCount = "—";
        try {
          const pRes = await fetch(
            `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/pulls?state=open`,
            { headers }
          );
          if (pRes.ok) {
            const pData = await pRes.json();
            if (Array.isArray(pData)) prCount = pData.length;
          }
        } catch {}

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
        }
      } catch (err) {
        console.warn("GitHub stats fetch failed", err);
        if (!cached && mounted)
          setStats({ ...stats, stars: "—", forks: "—", issues: "—" });
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const statCards = [
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
      icon: <Users className="text-indigo-500" size={40} />,
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
      icon: <Clock className="text-purple-500" size={40} />,
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
  ];

  return (
    // UPDATED: Section background
    <section className="py-16 bg-gradient-to-t from-indigo-50 via-indigo-100 to-white dark:from-gray-900 dark:via-indigo-900/20 dark:to-black ">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          // UPDATED: Title text color
          className="text-4xl font-extrabold text-center text-gray-900 dark:text-gray-100 mb-10"
          // AOS Implementation (Title)
          data-aos="fade-zoom-in"
          data-aos-once="true"
        >
          Project Statistics
        </motion.h2>

        <motion.div
          initial="hidden"
          animate="show"
          className="flex flex-wrap justify-center gap-6"
          // AOS Implementation (Card Grid)
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay="200"
        >
          {statCards.map(({ label, value, icon, link }, index) => (
            <motion.a
              key={label}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              // UPDATED: Card background and border
              className="group flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl px-8 py-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 relative overflow-hidden w-52"
              // Staggered AOS delay for individual cards
              data-aos="zoom-in" 
              data-aos-delay={index * 50} 
            >
              {/* Glow effect */}
              {/* UPDATED: Glow effect for dark mode */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 via-transparent to-indigo-100 dark:from-indigo-900/50 dark:via-transparent dark:to-indigo-900/50 opacity-0 group-hover:opacity-100 transition duration-500 blur-2xl"></div>

              <div className="z-10 flex flex-col items-center space-y-3">
                {/* UPDATED: Icon wrapper background */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-full shadow-inner">
                  {icon}
                </div>
                {/* UPDATED: Text colors */}
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center break-words">
                  {value}
                </p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center">
                  {label}
                </p>
              </div>

              {/* UPDATED: Icon color */}
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