import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiAlertCircle, FiSearch, FiX } from "react-icons/fi";

import ProjectHero from "./ProjectHero";
import ProjectCard from "./ProjectCard";
import FeedbackButton from "../../components/FeedbackButton";
import ProjectCTA from "./ProjectCTA";

import mockProjects from "./mockProjectsData.json";

import { apiUtils, API_ENDPOINTS } from "../../config/api";
import ModernSearchInput from "../../components/common/ModernSearchInput";
import { ProjectCardSkeleton } from "../../components/common/SkeletonLoaders";

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

  const cardSectionRef = useRef(null);

  const sortByLabels = {
    recent: "Recently Updated",
    stars: "Most Stars",
    forks: "Most Forks",
    issues: "Most Issues",
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError("");

        // --- PRODUCTION LOGIC: attempt real API call to Spring Boot backend ---
        const response = await apiUtils.get(API_ENDPOINTS.PROJECTS.LIST);

        const projectsData = response.data;

        // fix: only use API data if it is non-empty; otherwise fall back to mock
        if (projectsData && projectsData.length > 0) {
          setProjects(projectsData);

          // Attempt to fetch categories from API
          try {
            const categoriesResponse = await apiUtils.get(
              API_ENDPOINTS.PROJECTS.CATEGORIES
            );
            const categoriesData = categoriesResponse.data;
            setCategories(["all", ...categoriesData]);
          } catch {
            // fix: derive categories from API project data if categories endpoint throws
            const uniqueCategories = [...new Set(projectsData.map(p => p.category))];
            setCategories(["all", ...uniqueCategories]);
          }

          setIsLoading(false);
          return; // exit — API data loaded successfully
        }

        // --- MOCK DATA FALLBACK: API unavailable, not ok, or returned empty array ---
        console.warn("Projects API unavailable or empty — loading mock data.");

        setTimeout(() => {
          const projectsData = mockProjects;

          setProjects(projectsData);

          const uniqueCategories = [
            ...new Set(projectsData.map((p) => p.category)),
          ];

          setCategories(["all", ...uniqueCategories]);

          setIsLoading(false);
        }, 500);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredAndSortedProjects = projects
    .filter((project) => {
      if (
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
                  >
                    <span className="text-gray-700 dark:text-gray-200">
                      {filterCategory === "all"
                        ? "All Categories"
                        : filterCategory}
                    </span>

                    <FiX className="ml-2 text-gray-400 dark:text-gray-500" />
                  </button>

                  <AnimatePresence>
                    {categoryOpen && (
                      <motion.ul
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
                      >
                        {categories.map((cat) => (
                          <li
                            key={cat}
                            onClick={() => {
                              setFilterCategory(cat);
                              setCategoryOpen(false);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300"
                          >
                            {cat === "all"
                              ? "All Categories"
                              : cat}
                          </li>
                        ))}
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
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {sortByLabels[sortBy]}
                    </span>

                    <FiX className="ml-2 text-gray-400 dark:text-gray-500" />
                  </button>

                  <AnimatePresence>
                    {sortOpen && (
                      <motion.ul
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
                      >
                        {Object.entries(sortByLabels).map(
                          ([key, label]) => (
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
                          )
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
                onClick={() => window.location.reload()}
                className="mt-6 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
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

      <FeedbackButton />
    </div>
  );
};

export default ProjectGallery;
