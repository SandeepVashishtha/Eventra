import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGithub, FiExternalLink, FiStar, FiGitBranch, FiAlertCircle, FiGitPullRequest, FiClock, FiFilter, FiSearch, FiPlus } from 'react-icons/fi';
import { API_ENDPOINTS, apiUtils } from '../../config/api';
import ProjectSubmission from '../../components/common/ProjectSubmission';

// Skeleton Loader Component
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-40 bg-gray-100"></div>
    <div className="p-6">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-100 rounded w-5/6 mb-4"></div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="h-6 bg-gray-100 rounded-full w-16"></div>
        <div className="h-6 bg-gray-100 rounded-full w-24"></div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
        <div className="h-4 bg-gray-100 rounded w-1/3"></div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-6 bg-gray-100 rounded-full w-16"></div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="h-10 bg-gray-200 rounded-lg w-1/3"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-1/3"></div>
      </div>
    </div>
  </div>
);

// This is the main ProjectGallery component which manages state and renders the cards.
const ProjectGallery = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState(['all']);
  const [error, setError] = useState('');
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Fetch projects
        const response = await apiUtils.get(API_ENDPOINTS.PROJECTS.LIST);
        if (response.ok) {
          const projectsData = await response.json();
          setProjects(projectsData);
        } else {
          throw new Error('Failed to fetch projects');
        }

        // Fetch categories
        const categoriesResponse = await apiUtils.get(API_ENDPOINTS.PROJECTS.CATEGORIES);
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(['all', ...categoriesData]);
        }
        
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filters, searches, and sorts the projects based on the current state
  const filteredAndSortedProjects = projects
    .filter(project => {
      // Category filter
      if (filterCategory !== 'all' && project.category !== filterCategory) return false;

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.techStack.some(tech => tech.toLowerCase().includes(query)) ||
          project.category.toLowerCase().includes(query) ||
          project.author.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        case 'stars':
          return (b.stars || 0) - (a.stars || 0);
        case 'forks':
          return (b.forks || 0) - (a.forks || 0);
        case 'issues':
          return (b.openIssues || 0) - (a.openIssues || 0);
        default:
          return 0;
      }
    });

  // Get unique tech stack for filtering
  const allTechStack = [...new Set(projects.flatMap(project => project.techStack))];

  // ProjectCard component with improved UI
  const ProjectCard = ({ project }) => {
    const uniqueContributors = project.contributors.filter(
      (contributor) => contributor !== project.author
    );

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'maintenance': return 'bg-yellow-100 text-yellow-800';
        case 'archived': return 'bg-gray-100 text-gray-800';
        default: return 'bg-blue-100 text-blue-800';
      }
    };

    const getDifficultyColor = (difficulty) => {
      switch (difficulty.toLowerCase()) {
        case 'beginner': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'intermediate': return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'advanced': return 'bg-pink-50 text-pink-700 border-pink-200';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
      }
    };

    useEffect(()=>{
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    },[])

    return (
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
      >
        {/* Project Image with Status */}
        <div className="relative h-40 bg-gray-100 overflow-hidden">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <span className={`absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>

        {/* Project Content */}
        <div className="p-6">
          {/* Header with Title and Stats */}
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{project.title}</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm text-gray-600">
                <FiStar className="mr-1 text-yellow-500" />
                <span>{project.stars}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <FiGitBranch className="mr-1 text-gray-500" />
                <span>{project.forks}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

          {/* Category and Difficulty */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full">
              {project.category}
            </span>
            <span className={`px-2.5 py-1 text-xs font-medium border rounded-full ${getDifficultyColor(project.difficulty)}`}>
              {project.difficulty}
            </span>
          </div>

          {/* Author */}
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700 mr-2">
              {project.author.charAt(0)}
            </div>
            <span className="text-sm text-gray-700">{project.author}</span>
          </div>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.techStack.slice(0, 3).map((tech, index) => (
              <span key={index} className="px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-700 rounded-full">
                {tech}
              </span>
            ))}
            {project.techStack.length > 3 && (
              <span className="px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-500 rounded-full">
                +{project.techStack.length - 3} more
              </span>
            )}
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-500 mb-4">
            <div className="flex flex-col items-center">
              <div className="flex items-center">
                <FiAlertCircle className="mr-1" />
                <span className="font-medium text-gray-700">{project.openIssues}</span>
              </div>
              <span>Issues</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center">
                <FiGitPullRequest className="mr-1" />
                <span className="font-medium text-gray-700">{project.pullRequests}</span>
              </div>
              <span>PRs</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center">
                <FiClock className="mr-1" />
                <span className="font-medium text-gray-700">{formatDate(project.lastUpdated)}</span>
              </div>
              <span>Updated</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FiGithub className="mr-2" />
              GitHub
            </a>
            {project.liveDemo && (
              <a
                href={project.liveDemo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiExternalLink className="mr-2" />
                Live Demo
              </a>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-indigo-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Project <span className="text-indigo-600">Gallery</span></h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Discover, contribute to, and showcase amazing open-source projects
            </p>
            
            {/* Submit Project Button */}
            <motion.button
              onClick={() => setShowSubmissionModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus /> Submit Your Project
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <motion.div
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects by name, tech stack, or category..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFilter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="recent">Recently Updated</option>
                <option value="stars">Most Stars</option>
                <option value="forks">Most Forks</option>
                <option value="issues">Most Issues</option>
              </select>

              <button
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={() => {
                  setFilterCategory('all');
                  setSearchQuery('');
                  setSortBy('recent');
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={`skeleton-${i}`} />
              ))}
            </div>
          ) : error ? (
            <motion.div
              className="bg-red-50 border border-red-200 rounded-xl p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mx-auto max-w-md">
                <FiAlertCircle className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-lg font-medium text-red-900">Error loading projects</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
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
            <motion.div
              className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {filteredAndSortedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="bg-white rounded-xl shadow-sm p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mx-auto max-w-md">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No projects found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || filterCategory !== 'all'
                    ? 'No projects match your current filters. Try adjusting your search or filters.'
                    : 'Check back later for exciting new projects!'}
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setFilterCategory('all');
                      setSearchQuery('');
                      setSortBy('recent');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Section */}
        {!isLoading && filteredAndSortedProjects.length > 0 && (
          <motion.div
            className="mt-12 bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to contribute?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join our community of developers and start contributing to open-source projects today!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button 
                onClick={() => setShowSubmissionModal(true)}
                className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Submit Project
              </button>
              <button className="px-6 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Browse Issues
              </button>
            </div>
          </motion.div>
        )}

        {/* Project Submission Modal */}
        <AnimatePresence>
          {showSubmissionModal && (
            <ProjectSubmission
              onClose={() => setShowSubmissionModal(false)}
              onSubmit={(result) => {
                console.log('Project submitted:', result);
                // Optionally refresh the projects list
                // fetchProjects();
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProjectGallery;
