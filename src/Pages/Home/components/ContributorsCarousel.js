import { useState, useEffect, useCallback, useRef } from "react";
import useReducedMotion from "../../../hooks/useReducedMotion.js";
import {
  FaGithub,
  FaExternalLinkAlt,
  FaCodeBranch,
  FaMapMarkerAlt,
  FaBuilding,
  FaUserFriends,
  FaMedal,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fetchWithTimeout } from "../../../utils/fetchWithTimeout";
import {
  fetchProfileWithCache,
  fetchWithConcurrencyLimit,
  getCachedProfile,
  setCachedProfile,
} from "../../../utils/githubProfileCache";

const GITHUB_REPO = "sandeepvashishtha/Eventra";

const STORAGE_KEY = "github_contributors";
const PROFILE_CACHE_STORAGE_KEY = "github_profile_cache";

// 24-hour cache — contributor lists and profiles change infrequently;
// hourly re-fetching on the homepage was exhausting API rate limits.
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT = 10000;

// Only fetch the first page (top 100 contributors by contribution count,
// which GitHub returns sorted descending). Slicing to MAX_DISPLAY caps the
// profile-enrichment requests at MAX_DISPLAY instead of up to 200.
const MAX_CONTRIBUTOR_PAGES = 1;
const MAX_DISPLAY_CONTRIBUTORS = 30;

const getRoleByGitHubActivity = (contributor) => {
  const { contributions, followers = 0, login } = contributor;
  if (login === "sandeepvashishtha") return "Project Lead";
  if (contributions > 100 && followers > 50) return "Core Maintainer";
  if (contributions > 20) return "Active Contributor";
  if (contributions > 10) return "Regular Contributor";
  return "New Contributor";
};

// ── localStorage helpers ───────────────────────────────────────────────────────

const getCachedContributors = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    return Date.now() - timestamp > CACHE_DURATION ? null : data;
  } catch {
    return null;
  }
};

const cacheContributors = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
};

/**
 * Restores the in-memory profile cache from localStorage on page load so
 * previously enriched profiles do not require a fresh network round-trip
 * on subsequent visits.
 */
const restoreProfileCache = () => {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_STORAGE_KEY);
    if (!raw) return;
    const entries = JSON.parse(raw);
    if (!Array.isArray(entries)) return;
    const now = Date.now();
    entries.forEach(({ username, data, fetchedAt }) => {
      // Only restore entries that are still within the cache TTL
      if (typeof username === "string" && data && typeof fetchedAt === "number") {
        if (now - fetchedAt < CACHE_DURATION) {
          setCachedProfile(username, data);
        }
      }
    });
  } catch {}
};

/**
 * Persists the in-memory profile cache to localStorage so it survives page
 * navigation. Called on component unmount and on the beforeunload event.
 *
 * Only profiles that are still within the TTL window are persisted to avoid
 * bloating localStorage with stale entries.
 */
const persistProfileCache = (contributors) => {
  try {
    const now = Date.now();
    const entries = contributors
      .filter((c) => c.login)
      .map((c) => {
        const cached = getCachedProfile(c.login);
        return cached
          ? { username: c.login, data: cached, fetchedAt: now }
          : null;
      })
      .filter(Boolean);

    if (entries.length > 0) {
      localStorage.setItem(PROFILE_CACHE_STORAGE_KEY, JSON.stringify(entries));
    }
  } catch {}
};

// ── Component ─────────────────────────────────────────────────────────────────

const Contributors = () => {
  const prefersReducedMotion = useReducedMotion();
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const sectionRef = useRef(null);
  const contributorsRef = useRef([]);

  // Restore profile cache from localStorage on mount so enriched data is
  // immediately available without re-fetching
  useEffect(() => {
    restoreProfileCache();
  }, []);

  useEffect(() => {
    const target = sectionRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentIndex(0);
          }
        });
      },
      { threshold: 0.4 }
    );

    if (target) observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, []);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const fetchGitHubProfile = useCallback(async (username) => {
    const doFetch = async (user) => {
      const proxyUrl = `/api/github-proxy?path=${encodeURIComponent(`/users/${user}`)}`;
      const { data: profile } = await fetchWithTimeout(proxyUrl, {}, REQUEST_TIMEOUT);
      return {
        followers: profile.followers || 0,
        public_repos: profile.public_repos || 0,
        name: profile.name || user,
        bio: profile.bio || "Open source contributor",
        company: profile.company,
        location: profile.location,
      };
    };

    try {
      return await fetchProfileWithCache(username, doFetch);
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

  const fetchContributors = useCallback(async () => {
    setLoading(true);
    const cached = getCachedContributors();
    if (cached) {
      setContributors(cached);
      contributorsRef.current = cached;
      setLoading(false);
      return;
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
        if (!Array.isArray(data) || data.length === 0) {
          hasMore = false;
        } else {
          allContributors = [...allContributors, ...data];
          page++;
        }
      }

      // Cap to MAX_DISPLAY_CONTRIBUTORS before enrichment — this reduces
      // profile requests from up to 100 (single page) to at most 30,
      // i.e. at most 6 batches of 5 instead of 20 batches.
      const topContributors = allContributors.slice(0, MAX_DISPLAY_CONTRIBUTORS);

      const settledProfiles = await fetchWithConcurrencyLimit(
        topContributors,
        async (c) => {
          const profile = await fetchGitHubProfile(c.login);
          return {
            ...c,
            ...profile,
            role: getRoleByGitHubActivity({ ...c, ...profile }),
          };
        },
        5
      );

      const enhanced = settledProfiles
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);

      enhanced.sort((a, b) => b.contributions - a.contributions);
      setContributors(enhanced);
      contributorsRef.current = enhanced;
      cacheContributors(enhanced);
    } catch (error) {
      console.error("Failed to fetch contributors:", error);
      setContributors([]);
      contributorsRef.current = [];
    } finally {
      setLoading(false);
    }
  }, [fetchGitHubProfile]);

  useEffect(() => {
    fetchContributors();
  }, [fetchContributors]);

  // Persist profile cache to localStorage on unmount so the enriched data
  // survives navigation and is available on the next visit.
  useEffect(() => {
    const handleBeforeUnload = () => {
      persistProfileCache(contributorsRef.current);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      persistProfileCache(contributorsRef.current);
    };
  }, []);

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
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [contributors.length, itemsPerView, currentIndex, nextSlide]);

  if (loading)
    return (
      <p className="text-center py-20 text-gray-600 dark:text-gray-400">
        Loading contributors...
      </p>
    );

  const visibleContributors = contributors.slice(currentIndex, currentIndex + itemsPerView);
  const totalSlides = Math.ceil(contributors.length / itemsPerView);
  const currentSlide = Math.floor(currentIndex / itemsPerView);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-b from-indigo-50 via-indigo-100 to-white dark:from-gray-900 dark:via-indigo-900/20 dark:to-black"
      data-aos="slide-up"
      data-aos-duration="1000"
      data-aos-offset="200"
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          className="text-5xl font-extrabold text-center mb-16 text-gray-800 dark:text-gray-100 tracking-tight"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: "easeOut" }}
          data-aos="fade-zoom-in"
          data-aos-once="true"
        >
          Our Amazing{" "}
          <span className="text-black animate-pulse">Contributors</span>
        </motion.h2>

        <div className="relative p-2 mb-2">
          <button
            onClick={prevSlide}
            className="absolute left-0 top-[35%] -translate-y-1/2 -translate-x-4 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-gray-100 hover:scale-110 transition-all duration-300 border border-gray-200"
            disabled={currentIndex === 0}
          >
            <FaChevronLeft className="text-black text-xl" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-[35%] -translate-y-1/2 translate-x-4 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-gray-100 hover:scale-110 transition-all duration-300 border border-gray-200"
            disabled={currentIndex + itemsPerView >= contributors.length}
          >
            <FaChevronRight className="text-black text-xl" />
          </button>

          <div className="overflow-hidden px-10">
            <motion.div
              className="flex gap-6 items-stretch"
              animate={{ x: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: "easeInOut" }}
            >
              {visibleContributors.map((c, i) => (
                <motion.div
                  key={c.id}
                  className="relative bg-white/95 backdrop-blur-xl p-4 pt-10 rounded-xl shadow-md border border-gray-200 flex flex-col items-center text-center mb-6 transition-all duration-300 ease-out flex-shrink-0"
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
                  <div className="absolute top-3 mt-3 left-1/2 -translate-x-1/2">
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
                        alt={`${c.name || c.login || "Contributor"}'s GitHub profile picture`}
                        className="w-[65px] h-[65px] rounded-full border-4 border-black shadow-md relative z-10"
                      />
                      <div className="absolute inset-0 rounded-full animate-pulse bg-black/10 blur-sm -z-10"></div>
                    </div>
                  </div>

                  <div className="mt-16">
                    <h3 className="text-lg font-bold text-black">
                      {c.name ? c.name : c.login || "Unknown Contributor"}
                    </h3>
                    <p className="text-black text-sm font-medium mb-3 flex items-center justify-center gap-1">
                      <FaMedal className="text-yellow-500 animate-bounce" /> {c.role}
                    </p>

                    {currentIndex + i === 0 && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-black">
                        🥇･ Top Contributor
                      </span>
                    )}
                    {currentIndex + i === 1 && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-black">
                        🥈･ Silver Contributor
                      </span>
                    )}
                    {currentIndex + i === 2 && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-black">
                        🥉･ Bronze Contributor
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm text-black my-3 w-full">
                    <div className="flex flex-col items-center bg-white/60 backdrop-blur-md p-2 rounded-lg shadow-sm">
                      <FaCodeBranch className="text-black mb-1" />
                      <span className="font-semibold">{c.public_repos}</span>
                      <span className="text-xs text-black">Repos</span>
                    </div>
                    <div className="flex flex-col items-center bg-white/60 backdrop-blur-md p-2 rounded-lg shadow-sm">
                      <FaUserFriends className="text-black mb-1" />
                      <span className="font-semibold">{c.followers}</span>
                      <span className="text-xs text-black">Followers</span>
                    </div>
                    <div className="flex flex-col items-center bg-white/60 backdrop-blur-md p-2 rounded-lg shadow-sm">
                      <FaCodeBranch className="text-black mb-1" />
                      <span className="font-semibold">{c.contributions}</span>
                      <span className="text-xs text-black">Contribs</span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-4">
                    <div className="h-2 bg-black" />
                  </div>

                  <div className="flex flex-col gap-1 text-xs text-black mb-4">
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

                  <div className="mt-auto w-full">
                    <a
                      href={c.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-semibold shadow hover:bg-zinc-800 hover:scale-105 transition-all duration-300 ease-out transform relative overflow-hidden"
                    >
                      <FaGithub className="text-lg transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 group-hover:text-gray-200" />
                      <span>Profile</span>
                      <FaExternalLinkAlt className="text-sm opacity-80 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * itemsPerView)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-black scale-125"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Link
              to="/contributors"
              onClick={() => window.scrollTo(0, 0)}
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-zinc-800 hover:scale-105 transition-all duration-300 ease-out"
            >
              <span>View All Contributors</span>
              <FaExternalLinkAlt className="text-sm" />
            </Link>
            <Link
              to="/ContributorGuide"
              onClick={() => window.scrollTo(0, 0)}
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-semibold shadow-lg border border-black/15 hover:bg-gray-100 hover:scale-105 transition-all duration-300 ease-out ml-10"
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
