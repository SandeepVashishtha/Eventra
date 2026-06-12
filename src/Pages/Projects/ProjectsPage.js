import { AlertCircle, ChevronDown, Search, X } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SEOHead from "../../components/SEOHead";

import ProjectHero from "./ProjectHero";
import ProjectCard from "./ProjectCard";
import ProjectCTA from "./ProjectCTA";

import { projectService } from "../../services/projectService";
import { safeJsonParse } from "../../utils/safeJsonParse";
import useDebounce from "../../hooks/useDebounce.js";

// Modern custom styled search input
const ModernSearchInput = ({ value, onChange, placeholder }) => (
  <div className="relative flex w-full items-center">
    <Search className="pointer-events-none absolute left-4 h-5 w-5 text-gray-400 dark:text-gray-500" />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-300 bg-white py-3 pr-10 pl-12 text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-black focus:ring-2 focus:ring-black/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-white"
    />
    {value && (
      <button
        onClick={() => onChange({ target: { value: "" } })}
        className="absolute right-4 text-gray-400 transition-colors hover:text-black dark:text-gray-500 dark:hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

// Skeleton loader for project cards while data is loading
const ProjectCardSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="h-40 bg-gray-100 dark:bg-gray-700"></div>
    <div className="p-6">
      <div className="mb-4 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-600"></div>
      <div className="mb-2 h-4 w-full rounded bg-gray-100 dark:bg-gray-600"></div>
      <div className="mb-4 h-4 w-5/6 rounded bg-gray-100 dark:bg-gray-600"></div>
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="h-6 w-16 rounded-full bg-gray-100 dark:bg-gray-600"></div>
        <div className="h-6 w-24 rounded-full bg-gray-100 dark:bg-gray-600"></div>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-4 w-1/3 rounded bg-gray-100 dark:bg-gray-600"></div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 w-16 rounded-full bg-gray-100 dark:bg-gray-600"></div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="h-10 w-1/3 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-10 w-1/3 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  </div>
);

// import ModernSearchInput from "../../components/common/ModernSearchInput";

const ProjectGallery = () => {
  return (
    <>
      <SEOHead
        title="Projects"
        description="Explore community-built projects from hackathons, events, and open-source contributions on Eventra."
        url={window.location.href}
      />
      <InnerGallery />
    </>
  );
};

const InnerGallery = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [categories, setCategories] = useState(["all"]);
  const [error, setError] = useState("");

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("eventra_bookmarked_projects");
    if (saved) {
      setBookmarks(safeJsonParse(saved, []));
    }
  }, []);

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
      const response = await projectService.getAllProjects(publicRequestConfig);
      const projectsData = response.data;
      const projectsList = Array.isArray(projectsData)
        ? projectsData
        : projectsData?.content || projectsData?.projects || [];

      // Normalize data to fit ProjectCard UI structure
      const normalizedProjects = projectsList.map((p) => ({
        ...p,
        image: p.thumbnailUrl || p.image || "/Eventra.png",
        stars: p.upvotes !== undefined ? p.upvotes : p.stars || 0,
        techStack: p.techStack || [],
        author: p.author || "Anonymous",
        status: p.status || "Active",
        difficulty: p.difficulty || "Intermediate",
      }));

      setProjects(normalizedProjects);

      // Attempt to fetch categories from API
      try {
        const categoriesResponse = await projectService.getCategories(publicRequestConfig);
        const categoriesData = categoriesResponse.data;
        setCategories(["all", ...(Array.isArray(categoriesData) ? categoriesData : [])]);
      } catch {
        // derive categories from API project data if categories endpoint throws
        const uniqueCategories = [
          ...new Set(normalizedProjects.map((p) => p?.category).filter(Boolean)),
        ];
        setCategories(["all", ...uniqueCategories]);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Unable to load projects. Please try again later.");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredAndSortedProjects = (Array.isArray(projects) ? projects : [])
    .filter((project) => {
      if (filterCategory === "bookmarked") {
        if (!bookmarks.includes(project.id)) {
          return false;
        }
      } else if (filterCategory !== "all" && project.category !== filterCategory) {
        return false;
      }

      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();

        return (
          project?.title?.toLowerCase()?.includes(query) ||
          project?.description?.toLowerCase()?.includes(query) ||
          project?.category?.toLowerCase()?.includes(query) ||
          project?.author?.toLowerCase()?.includes(query) ||
          (Array.isArray(project?.techStack) &&
            project.techStack.some((tech) => tech?.toLowerCase()?.includes(query)))
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
    <div className="flex min-h-screen flex-col bg-gradient-to-l from-sky-50 via-white to-white dark:from-indigo-950 dark:to-black">
      {/* HERO */}
      <ProjectHero scrollToCard={scrollToCard} />

      {/* MAIN CONTENT */}
      <div ref={cardSectionRef} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* SEARCH + FILTER */}
        <motion.div
          className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-900"
          style={{
            boxShadow: "0 10px 25px rgba(59, 130, 246, 0.08)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          data-aos="fade-up"
          data-aos-duration="800"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* SEARCH */}
            <div className="flex-1">
              <ModernSearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by name, tech stack, or category..."
              />
            </div>

            {/* FILTERS */}
            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto md:gap-4">
              {/* CATEGORY */}
              <div className="relative flex-1 sm:flex-none">
                <motion.div
                  className="relative cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-aos="zoom-in"
                  data-aos-delay="200"
                >
                  <button
                    type="button"
                    className="flex min-w-[180px] items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm transition-all hover:ring-2 hover:ring-black/20 dark:border-gray-600 dark:bg-gray-800"
                    onClick={() => setCategoryOpen((prev) => !prev)}
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

                    <ChevronDown
                      className={`ml-2 text-gray-400 transition-transform dark:text-gray-500 ${
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
                        className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                      >
                        {["all", "bookmarked", ...categories.filter((c) => c !== "all")].map(
                          (cat) => {
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
                                  handleOptionKeyDown(event, selectCategory, () =>
                                    setCategoryOpen(false)
                                  )
                                }
                                className="cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                              >
                                {cat === "all"
                                  ? "All Categories"
                                  : cat === "bookmarked"
                                    ? "★ Saved Projects"
                                    : cat}
                              </li>
                            );
                          }
                        )}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* SORT */}
              <div className="relative flex-1 sm:flex-none">
                <motion.div
                  className="relative cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-aos="zoom-in"
                  data-aos-delay="300"
                >
                  <button
                    type="button"
                    className="flex min-w-[200px] items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm transition-all hover:ring-2 hover:ring-black/20 dark:border-gray-600 dark:bg-gray-700"
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
                    <span className="text-gray-700 dark:text-gray-300">{sortByLabels[sortBy]}</span>

                    <ChevronDown
                      className={`ml-2 text-gray-400 transition-transform dark:text-gray-500 ${
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
                        className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                      >
                        {Object.entries(sortByLabels).map(([key, label]) => {
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
                                handleOptionKeyDown(event, selectSort, () => setSortOpen(false))
                              }
                              className="cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                            >
                              {label}
                            </li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* CLEAR FILTERS */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-blue-500 hover:to-cyan-500"
                onClick={() => {
                  setFilterCategory("all");
                  setSearchQuery("");
                  setSortBy("recent");
                }}
                data-aos="zoom-in"
                data-aos-delay="400"
              >
                <X className="h-4 w-4 animate-pulse" />
                Clear Filters
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* CONTENT */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProjectCardSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          ) : error ? (
            <motion.div
              className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-700 dark:bg-red-900/40"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="mx-auto h-12 w-12 text-red-400" />

              <h3 className="mt-2 text-lg font-medium text-red-900 dark:text-red-200">
                Error loading projects
              </h3>

              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>

              <button
                type="button"
                onClick={fetchProjects}
                disabled={isLoading}
                className="mt-6 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="button"
              >
                Try Again
              </button>
            </motion.div>
          ) : filteredAndSortedProjects.length > 0 ? (
            <motion.div
              className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
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
              {filteredAndSortedProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  isBookmarked={bookmarks.includes(project.id)}
                  onBookmarkToggle={handleBookmarkToggle}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-xl dark:border-gray-900 dark:bg-gray-800"
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
              <div className="relative z-10 mx-auto max-w-sm">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-sky-100 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                  <Search className="h-10 w-10 text-black dark:text-white" />
                </div>

                <h3 className="mt-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  No Projects Found
                </h3>

                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  {searchQuery || filterCategory !== "all"
                    ? "We couldn’t find any projects with your filters."
                    : "No projects available right now. Be the first to share your creation with the community!"}
                </p>

                <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                  {searchQuery || filterCategory !== "all" ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setFilterCategory("all");
                        setSearchQuery("");
                        setSortBy("recent");
                      }}
                      className="rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-zinc-800"
                    >
                      Clear Filters
                    </motion.button>
                  ) : (
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href="/submit-project"
                      className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-zinc-800"
                    >
                      Submit a Project
                    </motion.a>
                  )}
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
