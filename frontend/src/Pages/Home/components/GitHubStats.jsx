import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import {
  FaGithub,
  FaStar,
  FaCodeBranch,
  FaExclamationCircle,
  FaCode,
  FaUsers,
  FaClock,
  FaExternalLinkAlt,
} from "react-icons/fa";

// GitHub username and repo
const GITHUB_USER = "SandeepVashishtha";
const GITHUB_REPO = "Eventra";

// Local storage keys
const GITHUB_STATS_STORAGE_KEY = "github_stats";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Helper function to get data from local storage
const getCachedStats = () => {
  try {
    const cachedData = localStorage.getItem(GITHUB_STATS_STORAGE_KEY);
    if (!cachedData) return null;

    const { data, timestamp } = JSON.parse(cachedData);
    const isExpired = Date.now() - timestamp > CACHE_DURATION;

    return isExpired ? null : data;
  } catch (error) {
    console.error("Error reading from local storage:", error);
    return null;
  }
};

// Helper function to save data to local storage
const cacheStats = (data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(GITHUB_STATS_STORAGE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error("Error saving to local storage:", error);
  }
};

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      when: "beforeChildren",
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function GitHubStats() {
  const controls = useAnimation();
  const [inView, setInView] = useState(false);

  // Store repo stats in local state
  const [stats, setStats] = useState({
    stars: 0,
    forks: 0,
    issues: 0,
    contributors: 0,
    lastCommit: "",
    size: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (inView) {
      controls.start("show");
    }
  }, [controls, inView]);

  // Fetch GitHub stats when component mounts
  useEffect(() => {
    async function fetchGitHubStats() {
      setLoading(true);

      // Check for cached data first
      const cachedStats = getCachedStats();
      if (cachedStats) {
        setStats(cachedStats);
        setLoading(false);
        return;
      }

      try {
        const token = process.env.REACT_APP_GITHUB_TOKEN;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 📦 Fetch main repo data (stars, forks, issues, last commit, size)
        const repoRes = await fetch(
          `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}`,
          { headers }
        );
        if (!repoRes.ok) throw new Error("Failed to fetch repo data");

        const repoData = await repoRes.json();

        // 👥 Fetch contributor count
        // per_page=100 ensures we fetch up to 100 contributors at once
        const contributorsRes = await fetch(
          `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contributors?per_page=100&anon=true`,
          { headers }
        );
        const contributorsData = await contributorsRes.json();
        if (!contributorsRes.ok)
          throw new Error("Failed to fetch contributors");

        // Format last commit date
        function formatLastCommitDate(isoDate) {
          const commitDate = new Date(isoDate);
          const today = new Date();

          // Format as DD/MM/YY
          const formatDate = (d) =>
            d.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            });

          const commitDateStr = formatDate(commitDate);
          const todayStr = formatDate(today);

          // Check if yesterday
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          const yesterdayStr = formatDate(yesterday);

          if (commitDateStr === todayStr) {
            return `Today (${commitDateStr})`;
          } else if (commitDateStr === yesterdayStr) {
            return `Yesterday (${commitDateStr})`;
          } else {
            return commitDateStr;
          }
        }
        
        const statsData = {
          stars: repoData.stargazers_count || 0,
          forks: repoData.forks_count || 0,
          issues: repoData.open_issues_count || 0,
          contributors: Array.isArray(contributorsData)
            ? contributorsData.length
            : 0,
          lastCommit: repoData.pushed_at
            ? formatLastCommitDate(repoData.pushed_at)
            : "N/A",
          size: repoData.size || 0,
        };

        setStats(statsData);
        cacheStats(statsData);
      } catch (err) {
        console.error("Error fetching GitHub stats:", err);
        // If there's an error, try to use cached data if available
        const cachedStats = getCachedStats();
        if (cachedStats) {
          setStats(cachedStats);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchGitHubStats();
  }, []);

  // Define stat cards with consistent styling
  const statCards = [
    {
      label: "Stars",
      value: stats.stars,
      icon: <FaStar className="text-yellow-500" />,
      link: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/stargazers`,
      border: "border-yellow-100",
    },
    {
      label: "Forks",
      value: stats.forks,
      icon: <FaCodeBranch className="text-blue-500" />,
      link: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/network/members`,
      border: "border-blue-100",
    },
    {
      label: "Open Issues",
      value: stats.issues,
      icon: <FaExclamationCircle className="text-red-500" />,
      link: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/issues`,
      border: "border-red-100",
    },
    {
      label: "Contributors",
      value: stats.contributors,
      icon: <FaUsers className="text-indigo-500" />,
      link: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/graphs/contributors`,
      border: "border-indigo-100",
    },
    {
      label: "Last Update",
      value: stats.lastCommit,
      icon: <FaClock className="text-purple-500" />,
      link: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/commits`,
      border: "border-purple-100",
    },
    {
      label: "Code",
      value: `${(stats.size / 1024).toFixed(1)} MB`,
      icon: <FaCode className="text-green-500" />,
      link: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}`,
      border: "border-green-100",
    },
  ];

  return (
    <section className="py-16 bg-indigo-50">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        onViewportEnter={() => setInView(true)}
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate={controls}
          className="text-center mb-12"
        >
          <motion.h2
            variants={item}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Project Statistics
          </motion.h2>
          <motion.p
            variants={item}
            className="text-lg text-gray-600 max-w-3xl mx-auto"
          >
            Our journey in numbers. See how our open-source community is growing
            and evolving.
          </motion.p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {statCards.map(({ label, value, icon, link, border }) => (
            <motion.div
              key={label}
              variants={item}
              className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border-2 ${border} hover:border-indigo-100`}
            >
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-gray-50">
                      <div className="text-2xl">{icon}</div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {value}
                      </p>
                      <p className="text-sm font-medium text-gray-600">
                        {label}
                      </p>
                    </div>
                  </div>
                  <FaExternalLinkAlt className="text-gray-400" />
                </div>
              </a>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
