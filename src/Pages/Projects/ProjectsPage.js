import { AlertCircle, ChevronDown, Search, X, Filter, Bookmark, RefreshCw } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SEOHead from "../../components/SEOHead";

import ProjectHero from "./ProjectHero";
import ProjectCard from "./ProjectCard";
import ProjectCTA from "./ProjectCTA";

import { projectService } from "../../services/projectService";
import { safeJsonParse } from "../../utils/safeJsonParse";
import useDebounce from "../../hooks/useDebounce.js";

// Reusable Custom Dropdown Component
const CustomDropdown = ({ value, options, onChange, placeholder, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (event, onSelect) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
        className="flex items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-w-[160px] shadow-sm"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 truncate">
          {Icon && <Icon size={16} className="text-zinc-500 dark:text-zinc-400 shrink-0" />}
          <span className="truncate">{value || placeholder}</span>
        </span>
        <ChevronDown
          size={16}
          className={`text-zinc-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden"
            role="listbox"
          >
            {options.map((option) => {
              const isSelected = value === option.value;
              return (
                <li
                  key={option.value}
                  role="option"
                  tabIndex={0}
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  onKeyDown={(e) =>
                    handleKeyDown(e, () => {
                      onChange(option.value);
                      setIsOpen(false);
                    })
                  }
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                  }`}
                >
                  {option.label}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

// Modern Search Input
const SearchInput = ({ value, onChange, placeholder }) => (
  <div className="relative flex-1 group">
    <Search
      size={18}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors pointer-events-none"
    />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full pl-11 pr-10 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
    />
    {value && (
      <button
        onClick={() => onChange({ target: { value: "" } })}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-all"
        aria-label="Clear search"
      >
        <X size={14} />
      </button>
    )}
  </div>
);

// Skeleton Loader
const ProjectCardSkeleton = () => (
  <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden animate-pulse">
    <div className="h-48 bg-zinc-100 dark:bg-zinc-700"></div>
    <div className="p-5 space-y-3">
      <div className="h-5 bg-zinc-100 dark:bg-zinc-700 rounded w-3/4"></div>
      <div className="h-4 bg-zinc-100 dark:bg-zinc-700 rounded w-full"></div>
      <div className="h-4 bg-zinc-100 dark:bg-zinc-700 rounded w-5/6"></div>
      <div className="flex gap-2 pt-2">
        <div className="h-6 bg-zinc-100 dark:bg-zinc-700 rounded-full w-16"></div>
        <div className="h-6 bg-zinc-100 dark:bg-zinc-700 rounded-full w-20"></div>
        <div className="h-6 bg-zinc-100 dark:bg-zinc-700 rounded-full w-14"></div>
      </div>
      <div className="flex items-center justify-between pt-3">
        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-700"></div>
        <div className="h-8 bg-zinc-100 dark:bg-zinc-700 rounded-lg w-24"></div>
      </div>
    </div>
  </div>
);

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
  const [bookmarks, setBookmarks] = useState([]);

  const cardSectionRef = useRef(null);

  const sortByOptions = [
    { value: "recent", label: "Recently Updated" },
    { value: "stars", label: "Most Stars" },
    { value: "forks", label: "Most Forks" },
    { value: "issues", label: "Most Issues" },
  ];

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("eventra_bookmarked_projects");
    if (saved) {
      setBookmarks(safeJsonParse(saved, []));
    }
  }, []);

  const handleBookmarkToggle = useCallback((projectId) => {
    setBookmarks((prev) => {
      const updated = prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId];
      localStorage.setItem("eventra_bookmarked_projects", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const publicRequestConfig = { skipAuth: true, withCredentials: false };

      const response = await projectService.getAllProjects(publicRequestConfig);
      const projectsData = response.data;
      const projectsList = Array.isArray(projectsData)
        ? projectsData
        : projectsData?.content || projectsData?.projects || [];

      const normalizedProjects = projectsList.map((p) => ({
        ...p,
        image: p.thumbnailUrl || p.image || "/Eventra.png",
        stars: p.upvotes !== undefined ? p.upvotes : (p.stars || 0),
        techStack: p.techStack || [],
        author: p.author || "Anonymous",
        status: p.status || "Active",
        difficulty: p.difficulty || "Intermediate",
      }));

      setProjects(normalizedProjects);

      try {
        const categoriesResponse = await projectService.getCategories(publicRequestConfig);
        const categoriesData = categoriesResponse.data;
        setCategories(["all", ...(Array.isArray(categoriesData) ? categoriesData : [])]);
      } catch {
        const uniqueCategories = [...new Set(normalizedProjects.map((p) => p?.category).filter(Boolean))];
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
        return bookmarks.includes(project.id);
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
    cardSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const clearAllFilters = () => {
    setFilterCategory("all");
    setSearchQuery("");
    setSortBy("recent");
  };

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "bookmarked", label: "★ Saved Projects" },
    ...categories.filter((c) => c !== "all").map((cat) => ({ value: cat, label: cat })),
  ];

  const hasActiveFilters = searchQuery || filterCategory !== "all" || sortBy !== "recent";

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-zinc-50 via-white to-blue-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-blue-950/20">
      {/* HERO */}
      <ProjectHero scrollToCard={scrollToCard} />

      {/* MAIN CONTENT */}
      <div ref={cardSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* FILTER BAR */}
        <motion.div
          className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-8 shadow-lg shadow-zinc-200/50 dark:shadow-zinc-950/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col gap-4">
            {/* Top Row: Search + Clear */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by name, tech stack, or category..."
              />

              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={clearAllFilters}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-xl transition-all shrink-0"
                >
                  <X size={16} />
                  Clear Filters
                </motion.button>
              )}
            </div>

            {/* Bottom Row: Dropdowns + Result Count */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-3">
                <CustomDropdown
                  value={filterCategory}
                  options={categoryOptions}
                  onChange={setFilterCategory}
                  placeholder="Category"
                  icon={Filter}
                />

                <CustomDropdown
                  value={sortBy}
                  options={sortByOptions}
                  onChange={setSortBy}
                  placeholder="Sort by"
                />
              </div>

              {!isLoading && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-zinc-500 dark:text-zinc-400"
                >
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {filteredAndSortedProjects.length}
                  </span>{" "}
                  project{filteredAndSortedProjects.length !== 1 ? "s" : ""} found
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>

        {/* CONTENT */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ProjectCardSkeleton key={`skeleton-${i}`} />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-2xl p-8 text-center max-w-lg mx-auto"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
                Error loading projects
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-6">{error}</p>
              <button
                type="button"
                onClick={fetchProjects}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                Try Again
              </button>
            </motion.div>
          ) : filteredAndSortedProjects.length > 0 ? (
            <motion.div
              key="projects"
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 },
                },
              }}
              className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr"
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
              key="empty"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-10 text-center max-w-lg mx-auto shadow-lg"
            >
              <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-6">
                {hasActiveFilters ? (
                  <Search className="h-10 w-10 text-zinc-400 dark:text-zinc-500" />
                ) : (
                  <Bookmark className="h-10 w-10 text-zinc-400 dark:text-zinc-500" />
                )}
              </div>

              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                {hasActiveFilters ? "No Projects Found" : "No Projects Yet"}
              </h3>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8 max-w-sm mx-auto">
                {hasActiveFilters
                  ? "We couldn't find any projects matching your filters. Try adjusting your search or filters."
                  : "No projects available right now. Be the first to share your creation with the community!"}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {hasActiveFilters ? (
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-2.5 text-sm font-medium rounded-xl text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-lg"
                  >
                    Clear All Filters
                  </button>
                ) : (
                  <a
                    href="/submit-project"
                    className="px-6 py-2.5 text-sm font-medium rounded-xl text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-lg inline-flex items-center justify-center gap-2"
                  >
                    Submit a Project
                  </a>
                )}
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