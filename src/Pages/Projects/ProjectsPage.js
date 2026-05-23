import React, { useState, useEffect, useRef } from "react"; // React hooks for state and lifecycle
import { motion, AnimatePresence } from "framer-motion"; // Framer Motion for animations
import { FiAlertCircle, FiSearch, FiX, FiChevronDown } from "react-icons/fi"; // Feather icons

import ProjectHero from "./ProjectHero"; // Hero section component
import ProjectCard from "./ProjectCard"; // Individual project card component
import FeedbackButton from "../../components/FeedbackButton"; // Feedback floating button
import ProjectCTA from "./ProjectCTA";
// Import mock data directly (assuming it's named mockProjectsData.json in the same folder as ProjectsPage.js)
import mockProjects from "./mockProjectsData.json";
// fix: import API config for real backend calls with mock fallback
import { API_ENDPOINTS } from "../../config/api";
import ModernSearchInput from "../../components/common/ModernSearchInput";
import SearchEmptyState from "../../components/common/SearchEmptyState";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import PageLoader from "../../components/common/PageLoader";
import { ProjectCardSkeleton } from "../../components/common/SkeletonLoaders";

// Main ProjectGallery component
const ProjectGallery = () => {
  useDocumentTitle("Eventra | Projects");
  const initialSearchQuery =
    new URLSearchParams(window.location.search).get("search") || "";
  // State variables
  const [projects, setProjects] = useState([]); // Stores all fetched projects
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [selectedCategories, setSelectedCategories] = useState([]); // Current category filter
  const [sortBy, setSortBy] = useState("recent"); // Sorting option
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery); // Search input
  const [categories, setCategories] = useState(["all"]); // Categories available
  const [error, setError] = useState(""); // Error message
  const [categoryOpen, setCategoryOpen] = useState(false); // Category dropdown state
  const [sortOpen, setSortOpen] = useState(false); // Sort dropdown state
  const cardSectionRef = useRef(); // Refer to card section
  const toggleCategory = (category) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      }
      return [...prev, category];
    });
  };
  // Labels for sorting options
  const sortByLabels = {
    recent: "Recently Updated",
    stars: "Most Stars",
    forks: "Most Forks",
    issues: "Most Issues",
  };

  // fix: try real API first; fall back to mock data if API is unavailable or returns empty
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await fetch(API_ENDPOINTS.PROJECTS.LIST, {
          signal: controller.signal,
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        
        const projectsData = await response.json();
        if (!isMounted) return;
        if (projectsData && projectsData.length > 0) {
          setProjects(projectsData);
        } else {
          setProjects(mockProjects);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
          
          if (isMounted) {
            setProjects(mockProjects);
          }
        }
      } finally {
        if (isMounted) {
         setIsLoading(false);
        }
      }
    };
    fetchProjects();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!isLoading && initialSearchQuery) {
      setTimeout(() => {
        cardSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [isLoading, initialSearchQuery]);

  // Filter, search, and sort projects dynamically
  const filteredAndSortedProjects = projects
    .filter((project) => {
      // Filter by selected category
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(project.category)
      ) {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          (project.techStack &&
            project.techStack.some((tech) =>
              tech.toLowerCase().includes(query),
            )) ||
          project.category.toLowerCase().includes(query) ||
          project.author.toLowerCase().includes(query)
        );
      }

      return true; // Include project if no filters applied
    })
    .sort((a, b) => {
      // Sort projects based on selected option
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

  return (
    // UPDATED: Main page background
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white dark:bg-slate-950 text-slate-900 dark:text-gray-100">
      {/* Hero Section with CTA */}
      <ProjectHero scrollToCard={scrollToCard} />
      {/* Main Container */}
      <div
        ref={cardSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Search and Filter Panel */}
        <motion.div
          // UPDATED: Panel background and border
          className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mb-8"
          style={{
            boxShadow: "0 10px 25px rgba(59, 130, 246, 0.08)",
            fontFamily: '"Big Shoulders Display", sans-seri',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          // AOS Implementation
          data-aos="fade-up"
          data-aos-duration="800"
        >
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            {/* Search Input Box */}
            <div className="flex-1">
              <ModernSearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by name, tech stack, or category..."
              />
            </div>

            {/* Filters and Sort Controls */}
            <div className="flex flex-row flex-wrap items-center gap-3 md:gap-4 w-full">
              {/* Category Dropdown */}
              <div className="relative flex-1  min-w-[140px] sm:flex-none">
                <motion.div
                  className="cursor-pointer relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-aos="zoom-in"
                  data-aos-delay="200"
                >
                  <button
                    type="button"
                    className="flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-800 hover:ring-2 hover:ring-black/20 transition-all"
                    onClick={() => setCategoryOpen((prev) => !prev)}
                    aria-expanded={categoryOpen}
                  >
                    <span className="text-gray-700 dark:text-gray-200">
                      {selectedCategories.length === 0
                        ? "All Categories"
                        : `${selectedCategories.length} Selected`}
                    </span>
                    <FiChevronDown className={`ml-2 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${categoryOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {categoryOpen && (
                      <motion.ul
                        // UPDATED: Dropdown menu styles
                        className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
                      >
                        {categories
                          .filter((cat) => cat !== "all")
                          .map((cat) => (
                            <li
                              key={cat}
                              onClick={() => toggleCategory(cat)}
                              className={`px-4 py-2 cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                selectedCategories.includes(cat)
                                  ? "bg-blue-100 dark:bg-blue-900"
                                  : ""
                              }`}
                            >
                              {cat}
                            </li>
                          ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Sort Dropdown */}
              <div className="relative flex-1  min-w-[140px] sm:flex-none">
                <motion.div
                  className="cursor-pointer relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-aos="zoom-in"
                  data-aos-delay="300"
                >
                  <button
                    type="button"
                    className="flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-700 hover:ring-2 hover:ring-black/20 transition-all"
                    onClick={() => setSortOpen((prev) => !prev)}
                    aria-expanded={sortOpen}
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {sortByLabels[sortBy]}
                    </span>
                    <FiChevronDown className={`ml-2 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Sort Dropdown Menu */}
                  <AnimatePresence>
                    {sortOpen && (
                      <motion.ul
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        // UPDATED: Dropdown menu styles
                        className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
                      >
                        {Object.entries(sortByLabels).map(([key, label]) => (
                          <li
                            key={key}
                            onClick={() => {
                              setSortBy(key);
                              setSortOpen(false);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300"
                          >
                            {label}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Clear Filters Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="whitespace-nowrap flex-shrink-0 px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg flex items-center gap-2 hover:bg-gray-700 dark:hover:bg-gray-100 transition-all shadow-sm"
                onClick={() => {
                  setSelectedCategories([]); // Reset category
                  setSearchQuery(""); // Clear search
                  setSortBy("recent"); // Reset sort
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
        <div className="flex flex-wrap gap-2 mt-3 mb-3 ">
          {selectedCategories.map((cat) => (
            <div
              key={cat}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-sm rounded-full flex items-center gap-2"
            >
              {cat}

              <button onClick={() => toggleCategory(cat)}>
                <FiX size={14} />
              </button>
            </div>
          ))}
        </div>
        {/* Projects Grid Section */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            // Show skeleton loaders while fetching
            <PageLoader text="Loading Projects..." />
          ) : error ? (
            // Show error message if fetch fails
            <motion.div
              // UPDATED: Error message styles
              className="bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-xl p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              data-aos="zoom-in"
            >
              <div className="mx-auto max-w-md">
                <FiAlertCircle className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-lg font-medium text-red-900 dark:text-red-200">
                  Error loading projects
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </motion.div>
          ) : filteredAndSortedProjects.length > 0 ? (
            // Render actual projects
            <motion.div
              className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1, // Stagger animation for each card
                  },
                },
              }}
              // AOS Implementation on the grid container
              data-aos="fade-up"
              data-aos-delay="500"
            >
              {filteredAndSortedProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </motion.div>
          ) : (
            // No projects found placeholder
            <motion.div
              // UPDATED: Main container styles
              className="relative overflow-hidden rounded-3xl p-10 text-center shadow-xl border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-800"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              data-aos="zoom-in"
            >
              {/* UPDATED: Glowing gradient background */}
              <motion.div
                className="absolute inset-0 -z-10 bg-black/10 dark:bg-black/30 blur-3xl"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* No projects icon */}
              <div className="mx-auto max-w-sm relative z-10">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex justify-center items-center w-20 h-20 rounded-full bg-white dark:bg-gray-700 shadow-lg mx-auto border border-sky-100 dark:border-gray-600"
                >
                  <FiSearch className="h-10 w-10 text-black dark:text-white" />
                </motion.div>
                <SearchEmptyState
                  query={searchQuery}
                  itemLabel="projects"
                  browseLabel="Browse All Projects"
                  browsePath="/projects"
                  onClear={() => {
                    setSelectedCategories([]);
                    setSearchQuery("");
                    setSortBy("recent");
                  }}
                  popularTags={categories.filter(
                    (category) => category !== "all",
                  )}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project Submission Modal would go here */}
      </div>
      <ProjectCTA></ProjectCTA>

      {/* Floating Feedback Button */}
      <FeedbackButton />
    </div>
  );
};

export default ProjectGallery;
