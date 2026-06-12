import {
  Github,
  ExternalLink,
  GitBranch,
  MapPin,
  Building,
  Users,
  Medal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  FaMedal,
  FaCodeBranch,
  FaUserFriends,
  FaBuilding,
  FaMapMarkerAlt,
  FaGithub,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useState, useEffect, useCallback, useRef } from "react";
import useReducedMotion from "../../../hooks/useReducedMotion.js";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fetchWithTimeout } from "../../../utils/fetchWithTimeout";
import { ContributorCardSkeleton } from "../../../components/common/SkeletonLoaders";
import { safeJsonParse } from "../../../utils/safeJsonParse";

// GitHub repo
const GITHUB_REPO = "sandeepvashishtha/Eventra";

const STORAGE_KEY = "github_contributors";
const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hr
const STALE_REVALIDATE_WINDOW = 2 * 60 * 60 * 1000; // 2 hr
const REQUEST_TIMEOUT = 10000;
const MAX_CONTRIBUTOR_PAGES = 1; // Limit carousel to top contributors
// Delay inserted between batches (not between individual requests) to avoid
// triggering GitHub's unauthenticated rate limit of 60 req/hr.
const BATCH_DELAY_MS = 200;
// Number of profile requests fired in parallel within each batch.
// Increasing from 5 → 10 halves the number of serial batch rounds while still
// keeping per-batch concurrency well within rate-limit budgets.
const PROFILE_BATCH_SIZE = 10;

/**
 * Fetches items in parallel batches, inserting a short delay between batches
 * to stay within GitHub's unauthenticated rate limit.
 *
 * @param {Array}    items      - Array of items to process
 * @param {Function} asyncFn   - Async function to call for each item
 * @param {number}   batchSize - Number of items per parallel batch
 * @returns {Promise<PromiseSettledResult[]>}
 */
const fetchInBatches = async (items, asyncFn, batchSize = PROFILE_BATCH_SIZE) => {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    const batchResults = await Promise.allSettled(batch.map(asyncFn));
    results.push(...batchResults);
    // Insert a delay between batches (but not after the last one)
    if (i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }
  return results;
};

// Role assignment
const getRoleByGitHubActivity = (contributor) => {
  const { contributions, followers = 0, login } = contributor;
  if (login === "sandeepvashishtha") return "Project Lead";

  if (contributions > 100 && followers > 50) return "Core Maintainer";
  if (contributions > 20) return "Active Contributor";
  if (contributions > 10) return "Regular Contributor";
  return "New Contributor";
};

// Local storage helpers
const getCachedContributors = () => {
  try {
    const cachedData = localStorage.getItem(STORAGE_KEY);
    if (!cachedData) return { data: null, isStale: false };
    const { data, timestamp } = safeJsonParse(cachedData, {});
    const age = Date.now() - timestamp;
    if (age <= CACHE_DURATION) return { data, isStale: false };
    if (age <= CACHE_DURATION + STALE_REVALIDATE_WINDOW) {
      return { data, isStale: true };
    }
    return { data: null, isStale: false };
  } catch {
    return { data: null, isStale: false };
  }
};
const cacheContributors = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
};

const Contributors = () => {
  const prefersReducedMotion = useReducedMotion();
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const sectionRef = useRef(null);

  useEffect(() => {
    const target = sectionRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentIndex(0); // reset only once when entering view
          }
        });
      },
      { threshold: 0.4 } // 40% of section must be visible
    );

    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, []);

  // Replace your previous `useEffect` for itemsPerView with this:
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1); // Mobile: 1 item
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2); // Tablet: 2 items
      } else {
        setItemsPerView(3); // Desktop: 3 items instead of 4
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  // Fetches a single GitHub user profile via the backend proxy.
  const fetchGitHubProfile = useCallback(async (username) => {
    try {
      const proxyUrl = `/api/github-proxy?path=${encodeURIComponent(`/users/${username}`)}`;

      const { data: profile } = await fetchWithTimeout(proxyUrl, {}, REQUEST_TIMEOUT);

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
  const fetchContributors = useCallback(
    async ({ backgroundRefresh = false } = {}) => {
      if (!backgroundRefresh) setLoading(true);
      const cached = getCachedContributors();
      if (cached.data) {
        setContributors(cached.data);
        if (!cached.isStale) {
          if (!backgroundRefresh) setLoading(false);
          return;
        }
      }

      try {
        let allContributors = [];
        let page = 1;
        let hasMore = true;
        while (hasMore && page <= MAX_CONTRIBUTOR_PAGES) {
          const proxyUrl = `/api/github-proxy?path=${encodeURIComponent(
            `/repos/${GITHUB_REPO}/contributors?per_page=100&page=${page}&anon=true`
          )}`;

          const { data } = await fetchWithTimeout(proxyUrl, {}, REQUEST_TIMEOUT);
          if (!Array.isArray(data) || data.length === 0) hasMore = false;
          else {
            allContributors = [...allContributors, ...data];
            page++;
          }
        }

        // Enrich each contributor with profile data fetched in parallel batches
        // of PROFILE_BATCH_SIZE (10) to balance throughput against GitHub's
        // unauthenticated rate limit. A short BATCH_DELAY_MS pause is inserted
        // between batches. Promise.allSettled ensures a single failed profile
        // fetch does not abort the rest — contributors whose profiles fail to
        // load fall back to the default values from fetchGitHubProfile's catch.
        const settledProfiles = await fetchInBatches(
          allContributors,
          async (c, idx) => {
            await new Promise((resolve) =>
              setTimeout(resolve, idx * (BATCH_DELAY_MS / PROFILE_BATCH_SIZE))
            );
            const profile = await fetchGitHubProfile(c.login);
            return {
              ...c,
              ...profile,
              role: getRoleByGitHubActivity({ ...c, ...profile }),
            };
          },
          PROFILE_BATCH_SIZE
        );

        const enhanced = settledProfiles
          .filter((r) => r.status === "fulfilled")
          .map((r) => r.value);

        enhanced.sort((a, b) => b.contributions - a.contributions);
        setContributors(enhanced);
        cacheContributors(enhanced);
      } catch (error) {
        //console.error("Failed to fetch contributors:", error);

        if (!backgroundRefresh) setContributors([]);

        if (error.name === "AbortError") {
          //console.error("Contributor request timed out");
        }
      } finally {
        if (!backgroundRefresh) setLoading(false);
      }
    },
    [fetchGitHubProfile]
  );

  useEffect(() => {
    fetchContributors();
  }, [fetchContributors]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) =>
      prev + itemsPerView >= contributors.length ? 0 : prev + itemsPerView
    );
  }, [contributors.length, itemsPerView]);

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0
        ? Math.max(0, contributors.length - itemsPerView)
        : Math.max(0, prev - itemsPerView)
    );
  };

  useEffect(() => {
    if (contributors.length === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Auto-slide every 5 seconds

    return () => clearInterval(interval);
  }, [contributors.length, itemsPerView, currentIndex, nextSlide]);

  // UPDATED: Loading text color
  const visibleContributors = loading
    ? Array.from({ length: itemsPerView }, (_, i) => ({ id: `skeleton-${i}`, isSkeleton: true }))
    : contributors.slice(currentIndex, currentIndex + itemsPerView);
  const totalSlides = loading ? 1 : Math.ceil(contributors.length / itemsPerView);
  const currentSlide = loading ? 0 : Math.floor(currentIndex / itemsPerView);

  return (
    <section
      ref={sectionRef}
      // UPDATED: Section background
      className="bg-gradient-to-b from-indigo-50 via-indigo-100 to-white py-20 dark:from-gray-900 dark:via-indigo-900/20 dark:to-black"
      // AOS Implementation
      data-aos="slide-up"
      data-aos-duration="1000"
      data-aos-offset="200"
    >
      {loading && (
        <div className="sr-only" role="status" aria-live="polite">
          Loading contributors...
        </div>
      )}
      <div className="mx-auto max-w-7xl px-6">
        <motion.h2
          // UPDATED: Title text (responsive text and mb-12 spacing)
          className="mb-12 text-center text-3xl font-extrabold tracking-tight text-gray-800 sm:text-4xl md:text-5xl dark:text-gray-100"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: "easeOut" }}
          // AOS Implementation (Title)
          data-aos="fade-zoom-in"
          data-aos-once="true"
        >
          Our Amazing {/* UPDATED: Gradient text for dark mode */}
          <span className="text-gray-900 dark:text-white">Contributors</span>
        </motion.h2>

        <div className="relative mb-2 p-2">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            // UPDATED: Arrow button styles
            className="absolute top-[35%] left-0 z-10 -translate-x-4 -translate-y-1/2 rounded-full border border-gray-200 bg-white/90 p-3 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/90 dark:hover:bg-gray-700"
            disabled={loading || currentIndex === 0}
            aria-label="Previous slide"
          >
            {/* UPDATED: Arrow icon color */}
            <ChevronLeft className="text-xl text-gray-900 dark:text-white" />
          </button>

          <button
            onClick={nextSlide}
            // UPDATED: Arrow button styles
            className="absolute top-[35%] right-0 z-10 translate-x-4 -translate-y-1/2 rounded-full border border-gray-200 bg-white/90 p-3 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/90 dark:hover:bg-gray-700"
            disabled={loading || currentIndex + itemsPerView >= contributors.length}
            aria-label="Next slide"
          >
            {/* UPDATED: Arrow icon color */}
            <ChevronRight className="text-xl text-gray-900 dark:text-white" />
          </button>

          {/* Carousel Content */}
          <div className="overflow-hidden px-10">
            <motion.div
              className="flex items-stretch gap-6"
              animate={{ x: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: "easeInOut" }}
            >
              {visibleContributors.map((c, i) => {
                if (c.isSkeleton) {
                  return (
                    <ContributorCardSkeleton
                      key={c.id}
                      style={{
                        flex: `0 0 calc((100% - ${itemsPerView - 1} * 1.5rem) / ${itemsPerView})`,
                      }}
                      className="mb-6 flex-shrink-0"
                    />
                  );
                }

                return (
                  <motion.div
                    key={c.id}
                    className="relative mb-6 flex flex-shrink-0 flex-col items-center rounded-xl border border-gray-200 bg-white/95 p-4 pt-10 text-center shadow-md backdrop-blur-xl transition-all duration-300 ease-out dark:border-gray-700 dark:bg-gray-800/95"
                    style={{
                      flex: `0 0 calc((100% - ${itemsPerView - 1} * 1.5rem) / ${itemsPerView})`,
                    }}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{
                      scale: 1.02,
                      y: -4,
                      boxShadow: "0px 6px 18px rgba(99,102,241,0.25)",
                    }}
                    data-aos="zoom-in-up"
                    data-aos-delay={i * 100}
                  >
                    {/* Avatar */}
                    <div className="absolute top-3 left-1/2 mt-3 -translate-x-1/2">
                      <div className="relative">
                        <img
                          loading="lazy"
                          decoding="async"
                          width="65"
                          height="65"
                          src={
                            c.avatar_url ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || c.login || "Anon")}&background=random`
                          }
                          alt={`${c.name || c.login || "Contributor"}'s GitHub profile`}
                          className="relative z-10 h-[65px] w-[65px] rounded-full border-4 border-gray-900 shadow-md dark:border-gray-300"
                        />
                        <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-black/10 blur-sm"></div>
                      </div>
                    </div>
                    {/* Name + Role + Badge */}
                    <div className="mt-16">
                      {/* UPDATED: Name and role text */}
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {c.name ? c.name : c.login || "Unknown Contributor"}
                      </h3>
                      <p className="mb-3 flex items-center justify-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <FaMedal className="text-yellow-500" /> {c.role}
                      </p>

                      {/* UPDATED: Contribution Badges */}
                      {currentIndex + i === 0 && (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-gray-900 dark:bg-yellow-900/40 dark:text-yellow-300">
                          🥇･ Top Contributor
                        </span>
                      )}
                      {currentIndex + i === 1 && (
                        <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-900 dark:bg-gray-700 dark:text-gray-200">
                          🥈･ Silver Contributor
                        </span>
                      )}
                      {currentIndex + i === 2 && (
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-gray-900 dark:bg-orange-900/40 dark:text-orange-300">
                          🥉･ Bronze Contributor
                        </span>
                      )}
                    </div>

                    {/* UPDATED: Stat text colors */}
                    <div className="my-3 grid w-full grid-cols-3 gap-3 text-sm text-gray-900 dark:text-white">
                      {/* UPDATED: Stat box background and icon colors */}
                      <div className="flex flex-col items-center rounded-lg bg-white/60 p-2 shadow-sm backdrop-blur-md dark:bg-gray-700/60">
                        <FaCodeBranch className="mb-1 text-gray-900 dark:text-indigo-400" />
                        <span className="font-semibold">{c.public_repos}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Repos</span>
                      </div>
                      <div className="flex flex-col items-center rounded-lg bg-white/60 p-2 shadow-sm backdrop-blur-md dark:bg-gray-700/60">
                        <FaUserFriends className="mb-1 text-gray-900 dark:text-indigo-400" />
                        <span className="font-semibold">{c.followers}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Followers</span>
                      </div>
                      <div className="flex flex-col items-center rounded-lg bg-white/60 p-2 shadow-sm backdrop-blur-md dark:bg-gray-700/60">
                        <GitBranch className="mb-1 h-4 w-4 text-gray-900 dark:text-indigo-400" />
                        <span className="font-semibold">{c.contributions}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Contribs</span>
                      </div>
                    </div>

                    {/* Contribution Progress Bar */}
                    {/* UPDATED: Progress bar background */}
                    <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div className="h-2 bg-gray-900 dark:bg-indigo-400" />
                    </div>

                    {/* Extra Info */}
                    {/* UPDATED: Text color */}
                    <div className="mb-4 flex flex-col gap-1 text-xs text-gray-700 dark:text-gray-300">
                      {c.company && (
                        <span className="flex items-center justify-center gap-1">
                          <FaBuilding /> {c.company}
                        </span>
                      )}
                      {c.location && (
                        <span className="flex items-center justify-center gap-1">
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
                        className="group relative inline-flex transform items-center justify-center gap-2 overflow-hidden rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow transition-all duration-300 ease-out hover:scale-105 hover:bg-zinc-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                      >
                        {/* GitHub Icon with animation */}
                        <FaGithub className="text-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-gray-200" />

                        <span>Profile</span>

                        <FaExternalLinkAlt className="text-sm opacity-80 transition-transform duration-300 group-hover:translate-x-1" />
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Pagination Dots */}
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => !loading && setCurrentIndex(index * itemsPerView)}
                // UPDATED: Dot colors
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "scale-125 bg-gray-900 dark:bg-white"
                    : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500"
                }`}
              />
            ))}
          </div>

          <div className="mx-auto mt-8 flex w-full max-w-md flex-col items-center justify-center gap-4 sm:max-w-none sm:flex-row sm:gap-6">
            <Link
              to="/contributors"
              onClick={() => window.scrollTo(0, 0)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:bg-zinc-800 sm:w-auto dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              <span>View All Contributors</span>
              <FaExternalLinkAlt className="text-sm" />
            </Link>
            <Link
              to="/ContributorGuide"
              onClick={() => window.scrollTo(0, 0)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-8 py-3 font-semibold text-gray-900 shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:bg-gray-100 sm:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              <span>Guide</span>
              <FaExternalLinkAlt className="text-sm" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contributors;
