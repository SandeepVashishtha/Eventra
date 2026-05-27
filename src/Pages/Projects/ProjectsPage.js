import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiAlertCircle, FiChevronDown, FiSearch, FiX } from "react-icons/fi";

import ProjectHero from "./ProjectHero";
import ProjectCard from "./ProjectCard";
import ProjectCTA from "./ProjectCTA";

import mockProjects from "./mockProjectsData.json";
import { apiUtils, API_ENDPOINTS } from "../../config/api";


// Modern custom styled search input
const ModernSearchInput = ({ value, onChange, placeholder }) => (
  <div className="relative flex items-center w-full">
    <FiSearch className="absolute left-4 text-gray-400 dark:text-gray-500 w-5 h-5 pointer-events-none" />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full pl-12 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black dark:focus:border-white transition-all shadow-sm"
    />
    {value && (
      <button
        onClick={() => onChange({ target: { value: "" } })}
        className="absolute right-4 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors"
      >
        <FiX className="w-4 h-4" />
      </button>
    )}
  </div>
);

// Skeleton loader for project cards while data is loading
const ProjectCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
    <div className="h-40 bg-gray-100 dark:bg-gray-700"></div>
    <div className="p-6">
      <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-full mb-2"></div>
      <div className="h-4 w-5/6 bg-gray-100 dark:bg-gray-600 rounded w-5/6 mb-4"></div>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="h-6 bg-gray-100 dark:bg-gray-600 rounded-full w-16"></div>
        <div className="h-6 bg-gray-100 dark:bg-gray-600 rounded-full w-24"></div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-1/3"></div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 bg-gray-100 dark:bg-gray-600 rounded-full w-16"></div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3"></div>
      </div>
    </div>
  </div>
);

// import ModernSearchInput from "../../components/common/ModernSearchInput";


const ProjectGallery = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState(["all"]);
  const [error, setError] = useState("");

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem("eventra_bookmarked_projects");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleBookmarkToggle = (projectId) => {
    setBookmarks((prev) => {
      const updated = prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId];
      localStorage.setItem("eventra_bookmarked_projects", JSON.stringify(updated));
      return updated;
    });
  };

  const cardSectionRef = useRef(null);

  const sortByLabels = {
    recent: "Recently Updated",
    stars: "Most Stars",
    forks: "Most Forks",
    issues: "Most Issues",
  };

  const handleOptionKeyDown = (event, onSelect, onClose) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  };

  const fetchProjects = useCallback(async () => {
      try {
        setIsLoading(true);
        setError("");

        const publicRequestConfig = {
          skipAuth: true,
          withCredentials: false,
        };

        // --- PRODUCTION LOGIC: attempt real API call to Spring Boot backend ---
        const response = await apiUtils.get(
          API_ENDPOINTS.PROJECTS.LIST,
          publicRequestConfig
        );
        const projectsData = response.data;

        // only use API data if it is non-empty; otherwise fall back to mock
        if (projectsData && projectsData.length > 0) {
          setProjects(projectsData);

          // Attempt to fetch categories from API
          try {
            const categoriesResponse = await apiUtils.get(
              API_ENDPOINTS.PROJECTS.CATEGORIES,
              publicRequestConfig
            );
            const categoriesData = categoriesResponse.data;
            setCategories(["all", ...categoriesData]);
          } catch {
            // derive categories from API project data if categories endpoint throws
            const uniqueCategories = [...new Set(projectsData.map(p => p.category))];
            setCategories(["all", ...uniqueCategories]);
          }
          return; // exit successfully
        }

        // --- MOCK DATA FALLBACK: API returned empty array ---
        console.warn("Projects API returned empty array — loading mock data.");
        setProjects(mockProjects);
        const mockUniqueCategories = [
          ...new Set(mockProjects.map((p) => p.category)),
        ];
        setCategories(["all", ...mockUniqueCategories]);
      } catch (err) {
        console.error("Error fetching projects:", err);

        if (err?.status === 401) {
          console.warn(
            "Projects API returned 401 for unauthenticated access — loading public mock data fallback."
          );
          setProjects(mockProjects);
          const fallbackCategories = [
            ...new Set(mockProjects.map((p) => p.category)),
          ];
          setCategories(["all", ...fallbackCategories]);
          return;
        }

        // Fall back to mock data in development so local work is unaffected
        if (process.env.NODE_ENV === "development") {
          console.warn("API unavailable — falling back to mock project data.");
          setProjects(mockProjects);
          const devUniqueCategories = [
            ...new Set(mockProjects.map((p) => p.category)),
          ];
          setCategories(["all", ...devUniqueCategories]);
        } else {
          setError("Failed to load projects. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredAndSortedProjects = projects
    .filter((project) => {
      if (filterCategory === "bookmarked") {
        if (!bookmarks.includes(project.id)) {
          return false;
        }
      } else if (
        filterCategory !== "all" &&
        project.category !== filterCategory
      ) {
        return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();

        return (
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.category.toLowerCase().includes(query) ||
          project.author.toLowerCase().includes(query) ||
          (project.techStack &&
            project.techStack.some((tech) =>
              tech.toLowerCase().includes(query)
            ))
        );
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.lastUpdated) - new Date(a.lastUpdated);

        case "stars":
          return (b.stars || 0) - (a.stars || 0);

        case "forks":
          return (b.forks || 0) - (a.forks || 0);

        case "issues":
          return (b.openIssues || 0) - (a.openIssues || 0);

        default:
          return 0;
      }
    });

  const scrollToCard = () => {
    cardSectionRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-l from-sky-50 via-white to-white dark:from-indigo-950 dark:to-black">
      {/* HERO */}
      <ProjectHero scrollToCard={scrollToCard} />

      {/* MAIN CONTENT */}
      <div
        ref={cardSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* SEARCH + FILTER */}
        <motion.div
          className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mb-8"
          style={{
            boxShadow: "0 10px 25px rgba(59, 130, 246, 0.08)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          data-aos="fade-up"
          data-aos-duration="800"
        >
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            {/* SEARCH */}
            <div className="flex-1">
              <ModernSearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by name, tech stack, or category..."
              />
            </div>

            {/* FILTERS */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full md:w-auto">
              {/* CATEGORY */}
              <div className="relative flex-1 sm:flex-none">
                <motion.div
                  className="cursor-pointer relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-aos="zoom-in"
                  data-aos-delay="200"
                >
                  <button
                    type="button"
                    className="flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-800 hover:ring-2 hover:ring-black/20 transition-all min-w-[180px]"
                    onClick={() =>
                      setCategoryOpen((prev) => !prev)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setCategoryOpen(false);
                      }
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={categoryOpen}
                    aria-controls="project-category-options"
                  >
                    <span className="text-gray-700 dark:text-gray-200">
                      {filterCategory === "all"
                        ? "All Categories"
                        : filterCategory === "bookmarked"
                        ? "Saved Projects"
                        : filterCategory}
                    </span>

                    <FiChevronDown
                      className={`ml-2 text-gray-400 dark:text-gray-500 transition-transform ${
                        categoryOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  <AnimatePresence>
                    {categoryOpen && (
                      <motion.ul
                        id="project-category-options"
                        role="listbox"
                        aria-label="Project category"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
                      >
                        {["all", "bookmarked", ...categories.filter(c => c !== "all")].map((cat) => {
                          const selectCategory = () => {
                            setFilterCategory(cat);
                            setCategoryOpen(false);
                          };
                          return (
                            <li
                              key={cat}
                              role="option"
                              tabIndex={0}
                              aria-selected={filterCategory === cat}
                              onClick={selectCategory}
                              onKeyDown={(event) =>
                                handleOptionKeyDown(
                                  event,
                                  selectCategory,
                                  () => setCategoryOpen(false)
                                )
                              }
                              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none cursor-pointer text-gray-700 dark:text-gray-300"
                            >
                              {cat === "all"
                                ? "All Categories"
                                : cat === "bookmarked"
                                ? "★ Saved Projects"
                                : cat}
                            </li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* SORT */}
              <div className="relative flex-1 sm:flex-none">
                <motion.div
                  className="cursor-pointer relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-aos="zoom-in"
                  data-aos-delay="300"
                >
                  <button
                    type="button"
                    className="flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-700 hover:ring-2 hover:ring-black/20 transition-all min-w-[200px]"
                    onClick={() => setSortOpen((prev) => !prev)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setSortOpen(false);
                      }
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={sortOpen}
                    aria-controls="project-sort-options"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {sortByLabels[sortBy]}
                    </span>

                    <FiChevronDown
                      className={`ml-2 text-gray-400 dark:text-gray-500 transition-transform ${
                        sortOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  <AnimatePresence>
                    {sortOpen && (
                      <motion.ul
                        id="project-sort-options"
                        role="listbox"
                        aria-label="Sort projects"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
                      >
                        {Object.entries(sortByLabels).map(
                          ([key, label]) => {
                            const selectSort = () => {
                              setSortBy(key);
                              setSortOpen(false);
                            };
                            return (
                              <li
                                key={key}
                                role="option"
                                tabIndex={0}
                                aria-selected={sortBy === key}
                                onClick={selectSort}
                                onKeyDown={(event) =>
                                  handleOptionKeyDown(
                                    event,
                                    selectSort,
                                    () => setSortOpen(false)
                                  )
                                }
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none cursor-pointer text-gray-700 dark:text-gray-300"
                              >
                                {label}
                              </li>
                            );
                          }
                        )}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* CLEAR FILTERS */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg"
                onClick={() => {
                  setFilterCategory("all");
                  setSearchQuery("");
                  setSortBy("recent");
                }}
                data-aos="zoom-in"
                data-aos-delay="400"
              >
                <FiX className="w-4 h-4 animate-pulse" />
                Clear Filters
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* CONTENT */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProjectCardSkeleton
                  key={`skeleton-${i}`}
                />
              ))}
            </div>
          ) : error ? (
            <motion.div
              className="bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-xl p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FiAlertCircle className="mx-auto h-12 w-12 text-red-400" />

              <h3 className="mt-2 text-lg font-medium text-red-900 dark:text-red-200">
                Error loading projects
              </h3>

              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchProjects}
                disabled={isLoading}
                className="mt-6 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Try Again
              </button>
            </motion.div>
          ) : filteredAndSortedProjects.length > 0 ? (
            <motion.div
              className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              data-aos="fade-up"
              data-aos-delay="500"
            >
              {filteredAndSortedProjects.map(
                (project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                    isBookmarked={bookmarks.includes(project.id)}
                    onBookmarkToggle={handleBookmarkToggle}
                  />
                )
              )}
            </motion.div>
          ) : (
            <motion.div
              className="relative overflow-hidden rounded-3xl p-10 text-center shadow-xl border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-800"
              initial={{
                opacity: 0,
                y: 30,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
            >
              <div className="mx-auto max-w-sm relative z-10">
                <div className="flex justify-center items-center w-20 h-20 rounded-full bg-white dark:bg-gray-700 shadow-lg mx-auto border border-sky-100 dark:border-gray-600">
                  <FiSearch className="h-10 w-10 text-black dark:text-white" />
                </div>

                <h3 className="mt-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  No Projects Found
                </h3>

                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  {searchQuery ||
                  filterCategory !== "all"
                    ? "We couldn’t find any projects with your filters."
                    : "No projects available right now."}
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setFilterCategory("all");
                      setSearchQuery("");
                      setSortBy("recent");
                    }}
                    className="px-6 py-2.5 text-sm font-medium rounded-lg text-white bg-black hover:bg-zinc-800 shadow-lg transition-all"
                  >
                    Clear Filters
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ProjectCTA />
    </div>
  );
};

export default ProjectGallery;
