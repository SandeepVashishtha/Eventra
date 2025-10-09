import React, { useState, useEffect, useCallback } from "react";
import {
  FaGithub,
  FaExternalLinkAlt,
  FaCodeBranch,
  FaMapMarkerAlt,
  FaBuilding,
  FaUserFriends,
  FaMedal,
} from "react-icons/fa";
import { motion } from "framer-motion";

// GitHub repo
const GITHUB_REPO = "sandeepvashishtha/Eventra";
const TOKEN = process.env.REACT_APP_GITHUB_TOKEN || "";

const STORAGE_KEY = "github_contributors";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hr

// Role assignment
const getRoleByGitHubActivity = (contributor) => {
  const { contributions, followers = 0, public_repos = 0, login } = contributor;
  if (login === "sandeepvashishtha") return "Project Lead";

  if (contributions > 100 && followers > 50) return "Core Maintainer";
  if (contributions > 50 && followers > 20) return "Senior Dev";
  if (contributions > 20) return "Active Contributor";
  if (contributions > 10) return "Regular Contributor";
  return "New Contributor";
};

// Local storage helpers
const getCachedContributors = () => {
  try {
    const cachedData = localStorage.getItem(STORAGE_KEY);
    if (!cachedData) return null;
    const { data, timestamp } = JSON.parse(cachedData);
    return Date.now() - timestamp > CACHE_DURATION ? null : data;
  } catch {
    return null;
  }
};
const cacheContributors = (data) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {}
};

const Contributors = () => {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch GitHub profile details
  const fetchGitHubProfile = useCallback(async (username) => {
    try {
      const res = await fetch(`https://api.github.com/users/${username}`, {
        headers: TOKEN ? { Authorization: `token ${TOKEN}` } : undefined,
      });
      if (!res.ok) throw new Error("Profile fetch failed");
      const profile = await res.json();
      return {
        followers: profile.followers || 0,
        public_repos: profile.public_repos || 0,
        name: profile.name || username,
        bio: profile.bio || "Open source contributor",
        company: profile.company,
        location: profile.location,
      };
    } catch {
      return {
        followers: 0,
        public_repos: 0,
        name: username,
        bio: "Open source contributor",
        company: null,
        location: null,
      };
    }
  }, []);

  // Fetch contributors
  const fetchContributors = useCallback(async () => {
    setLoading(true);
    const cached = getCachedContributors();
    if (cached) {
      setContributors(cached);
      setLoading(false);
      return;
    }

    try {
      let allContributors = [];
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        const res = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/contributors?per_page=100&page=${page}&anon=true`,
          {
            headers: TOKEN ? { Authorization: `token ${TOKEN}` } : undefined,
          }
        );
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) hasMore = false;
        else {
          allContributors = [...allContributors, ...data];
          page++;
        }
      }

      const enhanced = await Promise.all(
        allContributors.map(async (c) => {
          const profile = await fetchGitHubProfile(c.login);
          return {
            ...c,
            ...profile,
            role: getRoleByGitHubActivity({ ...c, ...profile }),
          };
        })
      );

      enhanced.sort((a, b) => b.contributions - a.contributions);
      setContributors(enhanced);
      cacheContributors(enhanced);
    } catch {
      setContributors([]);
    } finally {
      setLoading(false);
    }
  }, [fetchGitHubProfile]);

  useEffect(() => {
    fetchContributors();
  }, [fetchContributors]);

  // Filter contributors based on search term
  const filteredContributors = contributors.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  // UPDATED: Loading text color
  if (loading)
    return <p className="text-center py-20 text-gray-600 dark:text-gray-400">Loading contributors...</p>;

  return (
    // UPDATED: Section background
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-black">
      <div className="max-w-7xl mx-auto px-6">

      {/* Added The Search Bar */}
        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Search contributors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-lg w-64 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
          />
        </div>

        <motion.h2
          // UPDATED: Title text
          className="text-5xl font-extrabold text-center mb-16 text-gray-800 dark:text-gray-100 tracking-tight"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          🌟 Our Amazing{" "}
          {/* UPDATED: Gradient text for dark mode */}
          <span
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-500 dark:to-pink-500 bg-clip-text text-transparent animate-pulse"
          >
            Contributors
          </span>
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
          {contributors.map((c, i) => (
            <motion.div
              key={c.id}
              // UPDATED: Card background and border
              className="relative bg-gradient-to-br from-white/90 to-indigo-50/80 dark:from-gray-700/80 dark:to-gray-800/70 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center transition-all duration-300 ease-out"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{
                scale: 1.02,
                y: -4,
                boxShadow: "0px 8px 25px rgba(99,102,241,0.25)",
              }}
            >
              {/* Avatar with Glow */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <img
                    src={c.avatar_url}
                    alt={c.login}
                    className="w-20 h-20 rounded-full border-4 border-indigo-500 shadow-xl"
                  />
                  <div className="absolute inset-0 rounded-full animate-pulse bg-indigo-400/20 blur-md"></div>
                </div>
              </div>

              {/* Name + Role + Badge */}
              <div className="mt-16">
                {/* UPDATED: Name and role text */}
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{c.name}</h3>
                <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-3 flex items-center justify-center gap-1">
                  <FaMedal className="text-yellow-500 animate-bounce" /> {c.role}
                </p>
                {/* UPDATED: Contribution Badges */}
                {i === 0 && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300">
                    🥇 Top Contributor
                  </span>
                )}
                {i === 1 && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                    🥈 Silver Contributor
                  </span>
                )}
                {i === 2 && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300">
                    🥉 Bronze Contributor
                  </span>
                )}
              </div>

              {/* Stats Section (Glass style) */}
              <div className="grid grid-cols-3 gap-3 text-sm text-gray-700 dark:text-gray-300 my-5 w-full">
                <div className="flex flex-col items-center bg-white/60 dark:bg-gray-600/50 backdrop-blur-md p-2 rounded-lg shadow-sm">
                  <FaCodeBranch className="text-indigo-600 dark:text-indigo-400 mb-1" />
                  <span className="font-semibold">{c.public_repos}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Repos</span>
                </div>
                <div className="flex flex-col items-center bg-white/60 dark:bg-gray-600/50 backdrop-blur-md p-2 rounded-lg shadow-sm">
                  <FaUserFriends className="text-indigo-600 dark:text-indigo-400 mb-1" />
                  <span className="font-semibold">{c.followers}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Followers</span>
                </div>
                <div className="flex flex-col items-center bg-white/60 dark:bg-gray-600/50 backdrop-blur-md p-2 rounded-lg shadow-sm">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">🔥</span>
                  <span className="font-semibold">{c.contributions}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Contribs</span>
                </div>
              </div>

              {/* Contribution Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden mb-4">
                <div
                  className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"
                  style={{
                    width: `${
                      (c.contributions / contributors[0].contributions) * 100
                    }%`,
                  }}
                ></div>
              </div>

              {/* Extra Info */}
              <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400 mb-4">
                {c.company && (
                  <span className="flex items-center gap-1 justify-center">
                    <FaBuilding /> {c.company}
                  </span>
                )}
                {c.location && (
                  <span className="flex items-center gap-1 justify-center">
                    <FaMapMarkerAlt /> {c.location}
                  </span>
                )}
              </div>

              {/* Profile Button */}
              <div className="mt-auto w-full">
                <a
                  href={c.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 
                    bg-gradient-to-r from-indigo-600 to-purple-600 text-white 
                    px-5 py-2.5 rounded-full text-sm font-semibold shadow 
                    hover:from-indigo-700 hover:to-purple-700 
                    transition-all duration-300 ease-out transform hover:scale-105 relative overflow-hidden"
                >
                  {/* GitHub Icon with animation */}
                  <FaGithub className="text-lg transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 group-hover:text-blue-200" />

                  <span>Profile</span>

                  <FaExternalLinkAlt className="text-xs opacity-80 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Contributors;
