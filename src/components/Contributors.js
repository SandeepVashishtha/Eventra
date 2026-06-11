import { Github, ExternalLink, GitBranch, MapPin, Building, Users, Medal } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from '../hooks/useReducedMotion';
import { ContributorCardSkeleton } from "./common/SkeletonLoaders";
import ErrorBoundary from "./common/ErrorBoundary";
import SEOHead from "../components/SEOHead";
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
export const throttleProfileFetch = async () => {
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

const ContributorsInner = () => {
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

      const results = await Promise.allSettled(
        allContributors.map(async (c, idx) => {
          await new Promise((resolve) => setTimeout(resolve, idx * PROFILE_FETCH_DELAY_MS));
          const profile = await fetchGitHubProfile(c.login);
          return {
            ...c,
            ...profile,
            role: getRoleByGitHubActivity({ ...c, ...profile }),
          };
        }),
      );

      const enhanced = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);

      if (results.some((r) => r.status === "rejected")) {
        const failCount = results.filter((r) => r.status === "rejected").length;
        console.warn(`[Contributors] ${failCount} profile(s) failed to load, using partial data`);
      }

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
      <ErrorBoundary level="feature">
        <section className="pastel-grid-bg bg-gradient-to-br from-indigo-50 to-white py-20 pt-20 md:pt-24 dark:from-gray-900 dark:to-black">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <ContributorCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
      </ErrorBoundary>
    );
  }

  if (error)
    return (
      <ErrorBoundary level="feature">
        <section className="pastel-grid-bg bg-gradient-to-br from-indigo-50 to-white py-20 pt-20 md:pt-24 dark:from-gray-900 dark:to-black">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-800 dark:text-gray-100">
            Contributors are unavailable
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">{error}</p>
          <button
            type="button"
            onClick={fetchContributors}
            className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow transition-colors hover:bg-zinc-800"
           aria-label="Retry loading contributors">
            Retry
          </button>
        </div>
      </section>
      </ErrorBoundary>
    );
  return (
    // UPDATED: Section background
      <ErrorBoundary level="feature">
        <section className="pastel-grid-bg bg-gradient-to-br from-indigo-50 to-white py-20 pt-20 md:pt-24 dark:from-gray-900 dark:to-black">
        <div className="mx-auto max-w-7xl px-6">
          {/* Added The Search Bar */}
          <div className="mb-8 flex justify-center">
            <input
              type="text"
            placeholder="Search contributors by name, username, role, location, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search contributors"
            className="w-full max-w-2xl rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <motion.h2
          // UPDATED: Title text
          className="mb-16 text-center text-5xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100"
          style={{ fontFamily: '"Anton", sans-serif' }}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: "easeOut" }}
        >
          🌟 Our Amazing {/* UPDATED: Linear text for dark mode */}
          <span className="text-black dark:text-white">
            Contributors
          </span>
        </motion.h2>

        {filteredContributors.length === 0 ? (
          <div className="text-center text-lg text-gray-600 dark:text-gray-400">
            <p>
              {searchTerm
                ? `No contributors found matching "${searchTerm}"`
                : "No contributors are available yet."}
            </p>
            {!searchTerm && (
              <button
                type="button"
                onClick={fetchContributors}
                className="mt-5 inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow transition-colors hover:bg-zinc-800"
               aria-label="Retry loading contributors">
                Retry
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredContributors.map((c, i) => (
              <motion.div
                key={c.id}
                className="relative flex flex-col items-center overflow-visible rounded-2xl border border-gray-100 bg-white/95 p-6 text-center shadow-lg backdrop-blur-xl transition-all duration-300 ease-out dark:border-gray-700 dark:bg-gray-800/90"
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
                      alt={`${c.name || c.login || "Contributor"}'s GitHub profile`}
                      className="h-20 w-20 rounded-full border-4 border-black shadow-xl dark:border-gray-300"
                    />
                    <div className="absolute inset-0 animate-pulse rounded-full bg-black/10 blur-md dark:bg-white/10"></div>
                  </div>
                </div>

                {/* Name + Role + Badge */}
                <div className="mt-16">
                  {/* UPDATED: Name and role text */}
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {c.name}
                  </h3>
                  <p className="mb-3 flex items-center justify-center gap-1 text-sm font-medium text-black dark:text-white">
                    <Medal className="text-amber-300" />{" "}
                    {c.role}
                  </p>
                  {/* UPDATED: Contribution Badges */}
                  {i === 0 && (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-black dark:bg-yellow-900/50 dark:text-white">
                      🥇 Top Contributor
                    </span>
                  )}
                  {i === 1 && (
                    <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-black dark:bg-gray-600 dark:text-white">
                      🥈 Silver Contributor
                    </span>
                  )}
                  {i === 2 && (
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-black dark:bg-orange-900/50 dark:text-white">
                      🥉 Bronze Contributor
                    </span>
                  )}
                </div>

                {/* Stats Section (Glass style) */}
                <div className="my-5 grid w-full grid-cols-3 gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex flex-col items-center rounded-lg bg-white/60 p-2 shadow-sm backdrop-blur-md dark:bg-gray-600/50">
                    <GitBranch className="mb-1 text-black dark:text-white" />
                    <span className="font-semibold">{c.public_repos}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Repos
                    </span>
                  </div>
                  <div className="flex flex-col items-center rounded-lg bg-white/60 p-2 shadow-sm backdrop-blur-md dark:bg-gray-600/50">
                    <Users className="mb-1 text-black dark:text-white" />
                    <span className="font-semibold">{c.followers}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Followers
                    </span>
                  </div>
                  <div className="flex flex-col items-center rounded-lg bg-white/60 p-2 shadow-sm backdrop-blur-md dark:bg-gray-600/50">
                    <span className="font-bold text-black dark:text-white">
                      🔥
                    </span>
                    <span className="font-semibold">{c.contributions}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Contribs
                    </span>
                  </div>
                </div>

                {/* Contribution Progress Bar */}
                <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                  <div
                    className="h-2 bg-gray-900 dark:bg-indigo-400"
                    style={{
                      width: `${
                        (c.contributions / contributors[0].contributions) * 100
                      }%`,
                    }}
                  ></div>
                </div>

                {/* Extra Info */}
                <div className="mb-4 flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
                  {c.company && (
                    <span className="flex items-center justify-center gap-1">
                      <Building /> {c.company}
                    </span>
                  )}
                  {c.location && (
                    <span className="flex items-center justify-center gap-1">
                      <MapPin /> {c.location}
                    </span>
                  )}
                </div>

                {/* Profile Button */}
                <div className="mt-auto w-full">
                  <a
                    href={c.html_url}
                    target="_blank" rel="noopener noreferrer"
                    className="group relative inline-flex transform items-center justify-center gap-2 overflow-hidden rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white shadow transition-all duration-300 ease-out hover:scale-105 hover:bg-zinc-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                  >
                    {/* GitHub Icon with animation */}
                    <Github className="text-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-blue-200" />

                    <span>Profile</span>

                    <ExternalLink className="text-xs opacity-80 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
    </ErrorBoundary>
  );
};

const Contributors = () => (
  <>
    <SEOHead
      title="Contributors"
      description="Meet the amazing contributors building the Eventra open-source community. Join us and make an impact."
      url={window.location.href}
    />
    <ContributorsInner />
  </>
);

export default Contributors;
