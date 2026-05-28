import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { useReducedMotion } from '../hooks/useReducedMotion';
import { ContributorCardSkeleton } from "./common/SkeletonLoaders";
import FeatureErrorBoundary from "./common/FeatureErrorBoundary";
import { storageManager } from "../utils/storage/storageManager";
import { STORAGE_KEYS } from "../utils/storage/storageKeys";
import { validators } from "../utils/storage/storageValidators";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";

// GitHub repo
const GITHUB_REPO = "sandeepvashishtha/Eventra";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hr
const REQUEST_TIMEOUT = 10000;
const MAX_CONTRIBUTOR_PAGES = 10;
const PROFILE_FETCH_DELAY_MS = 100; // Throttle profile API calls to avoid rate limiting

let profileFetchCounter = 0;
const throttleProfileFetch = async () => {
  profileFetchCounter++;
  if (profileFetchCounter % 5 === 0) {
    await new Promise(resolve => setTimeout(resolve, PROFILE_FETCH_DELAY_MS));
  }
};

const fetchJsonWithTimeout = async (url) => {
  const proxyUrl = url.startsWith("https://api.github.com")
    ? `/api/github-proxy?path=${encodeURIComponent(
        url.replace("https://api.github.com", "")
      )}`
    : url;

  const { data } = await fetchWithTimeout(
    proxyUrl,
    {},
    REQUEST_TIMEOUT
  );

  return data;
};

// Role assignment
const getRoleByGitHubActivity = (contributor) => {
  const { contributions, followers = 0, login } = contributor;
  if (login === "sandeepvashishtha") return "Project Lead";

  if (contributions > 100 && followers > 50) return "Core Maintainer";
  if (contributions > 50 && followers > 20) return "Senior Dev";
  if (contributions > 20) return "Active Contributor";
  if (contributions > 10) return "Regular Contributor";
  return "New Contributor";
};

// Local storage helpers
// Centralized storage helpers
const getCachedContributors = () => {
  const cachedData = storageManager.get(
    STORAGE_KEYS.GITHUB_CONTRIBUTORS,
    validators.isObject,
  );

  if (!cachedData?.data || !cachedData?.timestamp) {
    return null;
  }

  return Date.now() - cachedData.timestamp > CACHE_DURATION
    ? null
    : cachedData.data;
};

const cacheContributors = (data) => {
  storageManager.set(
    STORAGE_KEYS.GITHUB_CONTRIBUTORS,
    {
      data,
      timestamp: Date.now(),
    },
  );
};

const Contributors = () => {
  const prefersReducedMotion = useReducedMotion();
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const fetchControllerRef = useRef(null);
  const isFetchingRef = useRef(false);

  // Fetch GitHub profile details
  const fetchGitHubProfile = useCallback(async (username) => {
    await throttleProfileFetch();
    if (!username) {
      return {
        followers: 0,
        public_repos: 0,
        name: "Anonymous Contributor",
        bio: "Open source contributor",
        company: null,
        location: null,
      };
    }

    try {
      const profile = await fetchJsonWithTimeout(
        `https://api.github.com/users/${username}`,
      );
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
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    setError("");

    // Cancel any in-flight request
    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }
    fetchControllerRef.current = new AbortController();

    const cached = getCachedContributors();
    if (cached) {
      setContributors(cached);
      setLoading(false);
      isFetchingRef.current = false;
      return;
    }

    try {
      let allContributors = [];
      let page = 1;
      let hasMore = true;
      while (hasMore && page <= MAX_CONTRIBUTOR_PAGES) {
        const data = await fetchJsonWithTimeout(
          `https://api.github.com/repos/${GITHUB_REPO}/contributors?per_page=100&page=${page}&anon=true`,
        );

        if (!Array.isArray(data)) {
          throw new Error(
            "GitHub returned an unexpected contributors response",
          );
        }

        // Support anonymous contributors by checking for either login or name
        const validContributors = data.filter((c) => c && (c.login || c.name));

        if (validContributors.length === 0) hasMore = false;
        else {
          allContributors = [...allContributors, ...validContributors];
          hasMore = data.length === 100;
          page++;
        }
      }

      if (allContributors.length === 0) {
        setContributors([]);
        isFetchingRef.current = false;
        return;
      }

      const enhanced = await Promise.all(
        allContributors.map(async (c) => {
          const profile = await fetchGitHubProfile(c.login);
          return {
            ...c,
            ...profile,
            role: getRoleByGitHubActivity({ ...c, ...profile }),
          };
        }),
      );

      enhanced.sort((a, b) => b.contributions - a.contributions);
      setContributors(enhanced);
      cacheContributors(enhanced);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(
        err?.name === "AbortError"
          ? "GitHub took too long to respond. Please try again."
          : "Unable to load contributors from GitHub right now. Please try again.",
      );
      setContributors([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [fetchGitHubProfile]);

  useEffect(() => {
    fetchContributors();
  }, [fetchContributors]);

  // Filter contributors based on search term
  const filteredContributors = contributors.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.login || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.role || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.company || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // UPDATED: Loading skeleton grid
  if (loading) {
    return (
      <FeatureErrorBoundary>
        <section className="pastel-grid-bg pt-20 md:pt-24 py-20 bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 mt-16">
            {[...Array(8)].map((_, i) => (
              <ContributorCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
      </FeatureErrorBoundary>
    );
  }

  if (error)
    return (
      <FeatureErrorBoundary>
        <section className="pastel-grid-bg pt-20 md:pt-24 py-20 bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-black">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Contributors are unavailable
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            type="button"
            onClick={fetchContributors}
            className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-full text-sm font-semibold shadow hover:bg-zinc-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </section>
      </FeatureErrorBoundary>
    );
  return (
    // UPDATED: Section background
    <FeatureErrorBoundary>
      <section className="pastel-grid-bg pt-20 md:pt-24 py-20 bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-black">
        <div className="max-w-7xl mx-auto px-6">
          {/* Added The Search Bar */}
          <div className="flex justify-center mb-8">
            <input
              type="text"
            placeholder="Search contributors by name, username, role, location, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search contributors"
            className="px-4 py-2 rounded-lg w-full max-w-2xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-black text-gray-900 dark:text-white bg-white dark:bg-gray-800"
          />
        </div>

        <motion.h2
          // UPDATED: Title text
          className="text-5xl font-extrabold text-center mb-16 text-gray-800 dark:text-gray-100 tracking-tight"
          style={{ fontFamily: '"Anton", sans-serif' }}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: "easeOut" }}
        >
          🌟 Our Amazing {/* UPDATED: Gradient text for dark mode */}
          <span className="text-black dark:text-white animate-pulse">
            Contributors
          </span>
        </motion.h2>

        {filteredContributors.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400 text-lg">
            <p>
              {searchTerm
                ? `No contributors found matching "${searchTerm}"`
                : "No contributors are available yet."}
            </p>
            {!searchTerm && (
              <button
                type="button"
                onClick={fetchContributors}
                className="mt-5 inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-full text-sm font-semibold shadow hover:bg-zinc-800 transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
            {filteredContributors.map((c, i) => (
<motion.div
                key={c.id}
                className="relative bg-white/95 dark:bg-gray-800/90 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center transition-all duration-300 ease-out"
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
                      loading="lazy"
                      decoding="async"
                      width="80"
                      height="80"
                      src={c.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || "Anon")}&background=random`}
                      alt={`${c.name || c.login || "Contributor"}'s GitHub profile picture`}
                      className="w-20 h-20 rounded-full border-4 border-black shadow-xl"
                    />
                    <div className="absolute inset-0 rounded-full animate-pulse bg-black/10 blur-md"></div>
                  </div>
                </div>

                {/* Name + Role + Badge */}
                <div className="mt-16">
                  {/* UPDATED: Name and role text */}
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {c.name}
                  </h3>
                  <p className="text-black dark:text-white text-sm font-medium mb-3 flex items-center justify-center gap-1">
                    <FaMedal className="text-amber-300 animate-bounce" />{" "}
                    {c.role}
                  </p>
                  {/* UPDATED: Contribution Badges */}
                  {i === 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/50 text-black dark:text-white">
                      🥇 Top Contributor
                    </span>
                  )}
                  {i === 1 && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 dark:bg-gray-600 text-black dark:text-white">
                      🥈 Silver Contributor
                    </span>
                  )}
                  {i === 2 && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/50 text-black dark:text-white">
                      🥉 Bronze Contributor
                    </span>
                  )}
                </div>

                {/* Stats Section (Glass style) */}
                <div className="grid grid-cols-3 gap-3 text-sm text-gray-700 dark:text-gray-300 my-5 w-full">
                  <div className="flex flex-col items-center bg-white/60 dark:bg-gray-600/50 backdrop-blur-md p-2 rounded-lg shadow-sm">
                    <FaCodeBranch className="text-black dark:text-white mb-1" />
                    <span className="font-semibold">{c.public_repos}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Repos
                    </span>
                  </div>
                  <div className="flex flex-col items-center bg-white/60 dark:bg-gray-600/50 backdrop-blur-md p-2 rounded-lg shadow-sm">
                    <FaUserFriends className="text-black dark:text-white mb-1" />
                    <span className="font-semibold">{c.followers}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Followers
                    </span>
                  </div>
                  <div className="flex flex-col items-center bg-white/60 dark:bg-gray-600/50 backdrop-blur-md p-2 rounded-lg shadow-sm">
                    <span className="text-black dark:text-white font-bold">
                      🔥
                    </span>
                    <span className="font-semibold">{c.contributions}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Contribs
                    </span>
                  </div>
                </div>

                {/* Contribution Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-2 bg-black"
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
                    bg-black text-white
                    px-5 py-2.5 rounded-full text-sm font-semibold shadow
                    hover:bg-zinc-800
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
        )}
      </div>
    </section>
    </FeatureErrorBoundary>
  );
};
export default Contributors;
