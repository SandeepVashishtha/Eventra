import React, { useState, useEffect, useRef } from "react"; // React hooks for state and lifecycle
import { motion, AnimatePresence } from "framer-motion"; // Framer Motion for animations
import { FiAlertCircle, FiSearch, FiX } from "react-icons/fi"; // Feather icons
import { API_ENDPOINTS, apiUtils } from "../../config/api"; // API utility functions and endpoints
import ProjectSubmission from "../../components/common/ProjectSubmission"; // Project submission component
import ProjectHero from "./ProjectHero"; // Hero section component
import ProjectCard from "./ProjectCard"; // Individual project card component
import FeedbackButton from "../../components/FeedbackButton"; // Feedback floating button
import { useNavigate } from "react-router-dom"; // Navigation hook from React Router
import { Link } from "react-router-dom"; // Link component for routing
import ProjectCTA from "./ProjectCTA";
// Import mock data directly (assuming it's named mockProjectsData.json in the same folder as ProjectsPage.js)
import mockProjects from "./mockProjectsData.json"; 

// Skeleton loader for project cards while data is loading
const SkeletonCard = () => (
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

// Main ProjectGallery component
const ProjectGallery = () => {
  // State variables
  const [projects, setProjects] = useState([]); // Stores all fetched projects
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [filterCategory, setFilterCategory] = useState("all"); // Current category filter
  const [sortBy, setSortBy] = useState("recent"); // Sorting option
  const [searchQuery, setSearchQuery] = useState(""); // Search input
  const [categories, setCategories] = useState(["all"]); // Categories available
  const [error, setError] = useState(""); // Error message
  const [showSubmissionModal, setShowSubmissionModal] = useState(false); // Show/hide submission modal
  const [categoryOpen, setCategoryOpen] = useState(false); // Category dropdown state
  const [sortOpen, setSortOpen] = useState(false); // Sort dropdown state
  const cardSectionRef=useRef() // Refer to card section

  // Labels for sorting options
  const sortByLabels = {
    recent: "Recently Updated",
    stars: "Most Stars",
    forks: "Most Forks",
    issues: "Most Issues",
  };

  const navigate = useNavigate(); // Navigation function

  // Fetch projects and categories from API (or mock data)
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true); // Set loading before fetching
        setError(""); // Reset error

        // --- PRODUCTION LOGIC (Commented out for reliable local run) ---
        /*
        const response = await apiUtils.get(API_ENDPOINTS.PROJECTS.LIST);
        if (response.ok) {
          const projectsData = await response.json();
          setProjects(projectsData);
          const categoriesResponse = await apiUtils.get(
            API_ENDPOINTS.PROJECTS.CATEGORIES
          );
          if (categoriesResponse.ok) {
            const categoriesData = await categoriesResponse.json();
            setCategories(["all", ...categoriesData]);
          }
        } else {
          throw new Error("Failed to fetch projects from API");
        }
        */

        // --- MOCK DATA FALLBACK/REPLACEMENT ---
        // Load mock data and simulate network delay
        setTimeout(() => {
            const projectsData = mockProjects;
            setProjects(projectsData);
            
            // Extract unique categories from mock data
            const uniqueCategories = [...new Set(projectsData.map(p => p.category))];
            setCategories(["all", ...uniqueCategories]);
            setIsLoading(false);
        }, 500);

      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("Failed to load projects. Please try again later."); 
        setIsLoading(false);
      }
    };

    fetchProjects(); // Trigger data fetch
  }, []);

  // Filter, search, and sort projects dynamically
  const filteredAndSortedProjects = projects
    .filter((project) => {
      // Filter by selected category
      if (filterCategory !== "all" && project.category !== filterCategory)
        return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          (project.techStack && project.techStack.some((tech) =>
            tech.toLowerCase().includes(query)
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

    const scrollToCard = () =>{
      cardSectionRef.current?.scrollIntoView({behaviour:'smooth'})
    }

  return (
    // UPDATED: Main page background
    <div className="flex flex-col min-h-screen bg-gradient-to-l from-indigo-200 to-white dark:from-indigo-950 dark:to-black">
      {/* Hero Section with CTA */}
      <ProjectHero setShowSubmissionModal={setShowSubmissionModal} scrollToCard={scrollToCard} />
      {/* Main Container */}
      <div ref={cardSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Panel */}
        <motion.div
          // UPDATED: Panel background and border
          className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mb-8"
          style={{ boxShadow: "0 10px 25px rgba(59, 130, 246, 0.1)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          // AOS Implementation
          data-aos="fade-up"
          data-aos-duration="800"
        >
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            {/* Search Input Box */}
            <div className="relative flex-1">
              <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                {/* UPDATED: Icon color */}
                <FiSearch className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </motion.div>
              <input
                type="text"
                placeholder="Search projects by name, tech stack, or category..."
                // UPDATED: Input styles
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 shadow-sm transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full md:w-auto">
              {/* Category Dropdown */}
              <div className="relative flex-1 sm:flex-none">
                <motion.div
                  className="cursor-pointer relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-aos="zoom-in"
                  data-aos-delay="200"
                >
                  <div
                    // UPDATED: Dropdown button styles
                    className="flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-800 hover:ring-2 hover:ring-indigo-500 transition-all"
                    onClick={() => setCategoryOpen((prev) => !prev)}
                  >
                    <span className="text-gray-700 dark:text-gray-200">
                      {filterCategory === "all" ? "All Categories" : filterCategory}
                    </span>
                    <FiX className="ml-2 text-gray-400 dark:text-gray-500" />
                  </div>
                  <AnimatePresence>
                    {categoryOpen && (
                      <motion.ul
                        // UPDATED: Dropdown menu styles
                        className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
                      >
                        {categories.map((cat) => (
                          <li
                            key={cat}
                            onClick={() => {
                              setFilterCategory(cat);
                              setCategoryOpen(false); // Close dropdown on selection
                            }}
                            // UPDATED: Dropdown item styles
                            className="px-4 py-2 hover:bg-indigo-50 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300"
                          >
                            {cat === "all" ? "All Categories" : cat}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Sort Dropdown */}
              <div className="relative flex-1 sm:flex-none">
                <motion.div
                  className="cursor-pointer relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-aos="zoom-in"
                  data-aos-delay="300"
                >
                  <div
                    // UPDATED: Dropdown button styles
                    className="flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-700 hover:ring-2 hover:ring-indigo-500 transition-all"
                    onClick={() => setSortOpen((prev) => !prev)}
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {sortByLabels[sortBy]}
                    </span>
                    <FiX className="ml-2 text-gray-400 dark:text-gray-500" />
                  </div>

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
                              setSortOpen(false); // Close dropdown on selection
                            }}
                            // UPDATED: Dropdown item styles
                            className="px-4 py-2 hover:bg-indigo-50 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300"
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
                className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg"
                onClick={() => {
                  setFilterCategory("all"); // Reset category
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

        {/* Projects Grid Section */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            // Show skeleton loaders while fetching
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={`skeleton-${i}`} />
              ))}
            </div>
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
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
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
              className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
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
              className="relative overflow-hidden rounded-3xl p-10 text-center shadow-xl border border-gray-100 dark:border-gray-900 bg-gradient-to-br from-white via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-indigo-900/20 dark:to-purple-900/20"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              data-aos="zoom-in"
            >
              {/* UPDATED: Glowing gradient background */}
              <motion.div
                className="absolute inset-0 -z-10 bg-gradient-to-tr from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-900/50 dark:via-purple-900/50 dark:to-pink-900/50 blur-3xl"
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

              {/* Floating bubbles */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                {[...Array(6)].map((_, i) => {
                  const positions = [
                    { left: "10%", top: "20%" },
                    { left: "70%", top: "15%" },
                    { left: "30%", top: "70%" },
                    { left: "80%", top: "60%" },
                    { left: "50%", top: "40%" },
                    { left: "20%", top: "50%" },
                  ];
                  const size = 30 + Math.random() * 40;
                  return (
                    <motion.div
                      key={i}
                      className="absolute rounded-full bg-indigo-300 dark:bg-indigo-500/40"
                      style={{
                        width: size,
                        height: size,
                        left: positions[i].left,
                        top: positions[i].top,
                        opacity: 0.3,
                      }}
                      animate={{
                        y: [0, -30, 0],
                        x: [0, 10, -10, 0],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 6 + i,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.5,
                      }}
                    />
                  );
                })}
              </div>

              {/* No projects icon */}
              <div className="mx-auto max-w-sm relative z-10">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex justify-center items-center w-20 h-20 rounded-full bg-white dark:bg-gray-700 shadow-lg mx-auto border border-indigo-100 dark:border-gray-600"
                >
                  <FiSearch className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                </motion.div>

                {/* UPDATED: Text colors */}
                <h3 className="mt-6 text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                  No Projects Found
                </h3>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {searchQuery || filterCategory !== "all"
                    ? "We couldn’t find any projects with your filters. Try exploring all projects!"
                    : "Looks like there are no projects yet. Stay tuned for exciting updates!"}
                </p>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setFilterCategory("all");
                      setSearchQuery("");
                      setSortBy("recent");
                    }}
                    className="px-6 py-2.5 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all"
                  >
                    Clear Filters
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setFilterCategory("all");
                      setSearchQuery("");
                      setSortBy("recent");
                    }}
                    className="px-6 py-2.5 text-sm font-medium rounded-lg text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-600 shadow-md transition-all"
                  >
                    Explore Projects
                  </motion.button>
                </div>
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