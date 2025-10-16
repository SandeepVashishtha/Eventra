import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiStar,
  FiGithub,
  FiExternalLink,
  FiAlertCircle,
  FiGitPullRequest,
  FiCpu,
  FiCode,
} from "react-icons/fi";

// Status color gradients
// UPDATED: Added null/undefined check for 'status' to fix runtime error.
const getStatusColor = (status) => {
  if (!status) {
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"; // Default for undefined status
  }
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
    case "maintenance":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
    case "archived":
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    default:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
  }
};

// UPDATED: Added dark mode classes for all difficulties
const getDifficultyColor = (difficulty) => {
  if (!difficulty) {
    return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500"; // Default for undefined difficulty
  }
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700";
    case "intermediate":
      return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700";
    case "advanced":
      return "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-700";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500";
  }
};

// UPDATED: Added dark mode classes for the tech tag style
const techTagStyle =
  "px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 dark:bg-indigo-900/60 dark:text-indigo-300 dark:border-indigo-700";

const ProjectCard = ({ project, index }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Guard clause for rendering ProjectCard without a valid project prop
  if (!project) return null;


  // Random CS-themed icons
  const csIcons = [FiCode, FiCpu, FiGitPullRequest];
  const RandomIcon = csIcons[Math.floor(Math.random() * csIcons.length)];

  return (
    <motion.div
      // UPDATED: Card background, border, and flex layout for consistent height and button alignment
      className="bg-gradient-to-l from-white to-white dark:from-indigo-950 dark:to-black rounded-xl shadow-md overflow-hidden border border-indigo-300 dark:border-gray-700 max-w-sm mx-auto hover:shadow-lg transition-all duration-300 flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
    >
      {/* Header */}
      {/* UPDATED: Header gradient, border, icon, and title text */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-300 dark:border-gray-700 bbg-gradient-to-l from-indigo-200 to-white dark:from-indigo-950 dark:to-black">
        <div className="border-2 border-indigo-500 p-2 rounded-full flex items-center justify-center">
          <RandomIcon
            size={24}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>
        <h3 className="text-center text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1 mx-3 line-clamp-1">
          {project.title}
        </h3>
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(
            project.status
          )}`}
        >
          {project.status} {/* Keep casing as-is */}
        </span>
      </div>

      {/* Image */}
      {/* UPDATED: Image container background and border */}
      <div className="relative aspect-[16/9] bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-700 overflow-hidden">
        <img
          src={project.lowResImage || project.image}
          alt={project.title}
          className={`absolute inset-0 w-full h-full object-cover blur-lg scale-105 transition-opacity duration-500 ${
            isLoaded ? "opacity-0" : "opacity-100"
          }`}
          aria-hidden="true"
        />
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className="relative w-full h-full object-cover transition-transform duration-300"
        />
      </div>

      {/* Card Content Container - allows buttons to be pushed to bottom */}
      <div className="flex flex-col flex-1">
        {/* Description - Fixed height container for consistent alignment */}
        {/* UPDATED: Fixed height description with better spacing for alignment */}
        <div className="px-5 pt-4 pb-6 border-b border-gray-300 dark:border-gray-700 h-24 flex items-start">
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}>
            {project.description}
          </p>
        </div>

        {/* Category & Difficulty - Fixed height for alignment */}
        {/* UPDATED: Fixed height section for consistent positioning */}
        <div className="px-5 py-3 flex flex-wrap gap-2 border-b border-gray-300 dark:border-gray-700 h-12 items-center">
          <span className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full border border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700">
            {project.category}
          </span>
          <span
            className={`px-2.5 py-1 text-xs font-medium border rounded-full ${getDifficultyColor(
              project.difficulty
            )}`}
          >
            {project.difficulty}
          </span>
        </div>

        {/* Admin + Stats - Fixed height for alignment */}
        {/* UPDATED: Fixed height for consistent author and stats positioning */}
        <div className="px-5 py-4 flex justify-between items-center border-b border-gray-300 dark:border-gray-700 h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-sm font-medium text-indigo-600 dark:text-indigo-400 border-2 border-indigo-500">
              {project.author.charAt(0)}
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {project.author}
            </span>
          </div>
          <div className="flex gap-1 text-xs">
            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/40 px-1.5 py-1 rounded-md text-yellow-700 dark:text-yellow-300">
              <FiStar /> {project.stars}
            </div>
            <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/40 px-1.5 py-1 rounded-md text-green-700 dark:text-green-300">
              <FiGithub /> {project.forks}
            </div>
            <div className="flex items-center gap-1 bg-red-50 dark:bg-red-900/40 px-1.5 py-1 rounded-md text-red-700 dark:text-red-300">
              <FiAlertCircle /> {project.openIssues}
            </div>
            <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/40 px-1.5 py-1 rounded-md text-blue-700 dark:text-blue-300">
              <FiGitPullRequest /> {project.pullRequests}
            </div>
          </div>
        </div>

        {/* Tech Stack - This section will expand to fill remaining space */}
        {/* UPDATED: Flexible section that grows to push buttons down while maintaining alignment */}
        <div className="px-5 py-4 flex flex-wrap gap-2 border-b border-gray-300 dark:border-gray-700 flex-1 items-start content-start min-h-16">
          {project.techStack.map((tech, index) => (
            <span key={index} className={techTagStyle}>
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Buttons - Always aligned at the bottom of all cards */}
      <div className="px-5 py-4 flex gap-3 mt-auto">
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 text-white font-semibold rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          <FiGithub className="text-white" /> GitHub
        </a>

        {project.liveDemo && (
          // UPDATED: Secondary button styles
          <a
            href={project.liveDemo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-800 dark:hover:text-indigo-300 hover:scale-105 transition-all duration-300"
          >
            {/* The icon will now inherit the text color, which changes on hover. */}
            <FiExternalLink /> Live Demo
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectCard;