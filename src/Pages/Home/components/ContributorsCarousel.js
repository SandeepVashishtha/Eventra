import { useState, useEffect, useCallback, useRef } from "react";
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const sectionRef = useRef(null);

  useEffect(() => {
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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
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

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev + itemsPerView >= contributors.length ? 0 : prev + itemsPerView
    );
  };

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
  }, [contributors.length, itemsPerView, currentIndex]);

  // UPDATED: Loading text color
  if (loading)
    return (
      <p className="text-center py-20 text-gray-600 dark:text-gray-400">
        Loading contributors...
      </p>
    );

  const visibleContributors = contributors.slice(
    currentIndex,
    currentIndex + itemsPerView
  );
  const totalSlides = Math.ceil(contributors.length / itemsPerView);
  const currentSlide = Math.floor(currentIndex / itemsPerView);

  return (
    <section
      ref={sectionRef}
      // UPDATED: Section background
      className="py-20 bg-gradient-to-b from-indigo-50 via-indigo-100 to-white dark:from-gray-900 dark:via-indigo-900/20 dark:to-black "
      // AOS Implementation
      data-aos="slide-up"
      data-aos-duration="1000"
      data-aos-offset="200"
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          // UPDATED: Title text
          className="text-5xl font-extrabold text-center mb-16 text-gray-800 dark:text-gray-100 tracking-tight"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          // AOS Implementation (Title)
          data-aos="fade-zoom-in"
          data-aos-once="true"
        >
          Our Amazing {/* UPDATED: Gradient text for dark mode */}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-500 dark:to-pink-500 bg-clip-text text-transparent animate-pulse">
            Contributors
          </span>
        </motion.h2>

        <div className="relative p-2 mb-2">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            // UPDATED: Arrow button styles
            className="absolute left-0 top-[35%] -translate-y-1/2 -translate-x-4 z-10 bg-white/90 dark:bg-gray-800/70 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 hover:scale-110 transition-all duration-300 border border-gray-200 dark:border-gray-700"
            disabled={currentIndex === 0}
          >
            {/* UPDATED: Arrow icon color */}
            <FaChevronLeft className="text-indigo-600 dark:text-indigo-400 text-xl" />
          </button>

          <button
            onClick={nextSlide}
            // UPDATED: Arrow button styles
            className="absolute right-0 top-[35%] -translate-y-1/2 translate-x-4 z-10 bg-white/90 dark:bg-gray-800/70 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 hover:scale-110 transition-all duration-300 border border-gray-200 dark:border-gray-700"
            disabled={currentIndex + itemsPerView >= contributors.length}
          >
            {/* UPDATED: Arrow icon color */}
            <FaChevronRight className="text-indigo-600 dark:text-indigo-400 text-xl" />
          </button>

          {/* Carousel Content */}
          <div className="overflow-hidden px-10">
            <motion.div
              className="flex gap-6 items-stretch"
              animate={{ x: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {visibleContributors.map((c, i) => (
                <motion.div
                  key={c.id}
                  // UPDATED: Card background gradient and border
                  className="relative bg-gradient-to-br from-white/90 to-indigo-50/80 dark:from-gray-700/80 dark:to-gray-800/70 backdrop-blur-xl p-4 pt-10 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center mb-6 transition-all duration-300 ease-out flex-shrink-0"
                  style={{
                    flex: `0 0 calc((100% - ${
                      itemsPerView - 1
                    } * 1.5rem) / ${itemsPerView})`,
                  }}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{
                    scale: 1.02,
                    y: -4,
                    boxShadow: "0px 6px 18px rgba(99,102,241,0.25)",
                  }}
                  // AOS Implementation on individual cards
                  data-aos="zoom-in-up"
                  data-aos-delay={i * 100}
                >
                  {/* Avatar */}
                  <div className="absolute top-3 mt-3 left-1/2 -translate-x-1/2">
                    <div className="relative">
                      <img
                        src={c.avatar_url}
                        alt={c.login}
                        className="w-[65px] h-[65px] rounded-full border-4 border-indigo-500 shadow-md relative z-10"
                      />
                      <div className="absolute inset-0 rounded-full animate-pulse bg-indigo-400/20 blur-sm -z-10"></div>
                    </div>
                  </div>
                  {/* Name + Role + Badge */}
                  <div className="mt-16">
                    {/* UPDATED: Name and role text */}
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      {c.name ? c.name : c.login || "Unknown Contributor"}
                    </h3>
                    <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-3 flex items-center justify-center gap-1">
                      <FaMedal className="text-yellow-500 animate-bounce" />{" "}
                      {c.role}
                    </p>

                    {/* UPDATED: Contribution Badges */}
                    {currentIndex + i === 0 && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300">
                        ･Top Contributor
                      </span>
                    )}
                    {currentIndex + i === 1 && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                        ･Silver Contributor
                      </span>
                    )}
                    {currentIndex + i === 2 && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300">
                        ･Bronze Contributor
                      </span>
                    )}
                  </div>

                  {/* Stats Section (Glass style) */}
                  {/* UPDATED: Stat text colors */}
                  <div className="grid grid-cols-3 gap-3 text-sm text-gray-700 dark:text-gray-300 my-3 w-full">
                    {/* UPDATED: Stat box background and icon colors */}
                    <div className="flex flex-col items-center bg-white/60 dark:bg-gray-600/50 backdrop-blur-md p-2 rounded-lg shadow-sm">
                      <FaCodeBranch className="text-indigo-600 dark:text-indigo-400 mb-1" />
                      <span className="font-semibold">{c.public_repos}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Repos
                      </span>
                    </div>
                    <div className="flex flex-col items-center bg-white/60 dark:bg-gray-600/50 backdrop-blur-md p-2 rounded-lg shadow-sm">
                      <FaUserFriends className="text-indigo-600 dark:text-indigo-400 mb-1" />
                      <span className="font-semibold">{c.followers}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Followers
                      </span>
                    </div>
                    <div className="flex flex-col items-center bg-white/60 dark:bg-gray-600/50 backdrop-blur-md p-2 rounded-lg shadow-sm">
                      <FaCodeBranch className="text-indigo-600 dark:text-indigo-400 mb-1" />
                      <span className="font-semibold">{c.contributions}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Contribs
                      </span>
                    </div>
                  </div>

                  {/* Contribution Progress Bar */}
                  {/* UPDATED: Progress bar background */}
                  <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" /* ... */
                    ></div>
                  </div>

                  {/* Extra Info */}
                  {/* UPDATED: Text color */}
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
                        px-4 py-2 rounded-full text-sm font-semibold shadow 
                        hover:from-indigo-700 hover:to-purple-700 hover:scale-105
                        transition-all duration-300 ease-out transform  relative overflow-hidden"
                    >
                      {/* GitHub Icon with animation */}
                      <FaGithub className="text-lg transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 group-hover:text-blue-200" />

                      <span>Profile</span>

                      <FaExternalLinkAlt className="text-sm opacity-80 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * itemsPerView)}
                // UPDATED: Dot colors
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-indigo-600 dark:bg-indigo-400 scale-125"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
              />
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Link
              to="/contributors"
              onClick={() => window.scrollTo(0, 0)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 
                       text-white px-8 py-3 rounded-full font-semibold shadow-lg
                       hover:from-indigo-700 hover:to-purple-700 hover:scale-105
                       transition-all duration-300 ease-out"
            >
              <span>View All Contributors</span>
              <FaExternalLinkAlt className="text-sm" />
            </Link>
            <Link
              to="/ContributorGuide"
              onClick={() => window.scrollTo(0, 0)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600
             text-white px-8 py-3 rounded-full font-semibold shadow-lg
             hover:from-indigo-700 hover:to-purple-700 hover:scale-105
             transition-all duration-300 ease-out ml-10"
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
