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

// Status Colors
const getStatusColor = (status) => {
  if (!status) {
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
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

// Difficulty Colors
const getDifficultyColor = (difficulty) => {
  if (!difficulty) {
    return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500";
  }

  switch (difficulty.toLowerCase()) {
    case "beginner":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700";

    case "intermediate":
      return "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-700";

    case "advanced":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700";

    default:
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500";
  }
};

const techTagStyle =
  "px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-900/60 dark:text-blue-300 dark:border-blue-700";

const ProjectCard = ({ project }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  if (!project) return null;

  const csIcons = [FiCode, FiCpu, FiGitPullRequest];
  const RandomIcon =
    csIcons[Math.floor(Math.random() * csIcons.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="
        bg-white
        dark:bg-gray-900
        rounded-2xl
        shadow-md
        hover:shadow-xl
        border
        border-gray-200
        dark:border-gray-800
        overflow-hidden
        flex
        flex-col
        h-full
        transition-all
        duration-300
      "
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-950">

        <div className="w-10 h-10 rounded-full border border-blue-300 dark:border-blue-700 flex items-center justify-center bg-white dark:bg-gray-800 flex-shrink-0">
          <RandomIcon className="text-gray-800 dark:text-white" size={18} />
        </div>

        <h3 className="flex-1 text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
          {project.title}
        </h3>

        <span
          className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${getStatusColor(
            project.status
          )}`}
        >
          {project.status || "Unknown"}
        </span>
      </div>

      {/* Image */}
      <div className="relative aspect-video overflow-hidden border-b border-gray-200 dark:border-gray-800">

        <img
          src={project.lowResImage || project.image}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover blur-xl scale-110 transition-opacity duration-500 ${
            isLoaded ? "opacity-0" : "opacity-100"
          }`}
        />

        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className="relative w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1">

        {/* Description */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 min-h-[100px]">

          <p
            className="
              text-sm
              text-gray-600
              dark:text-gray-400
              leading-relaxed
              line-clamp-3
            "
          >
            {project.description}
          </p>
        </div>

        {/* Category + Difficulty */}
        <div className="px-5 py-3 flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 min-h-[60px] items-center">

          <span className="px-2.5 py-1 text-xs font-medium bg-sky-50 text-sky-700 rounded-full border border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-700">
            {project.category || "General"}
          </span>

          <span
            className={`px-2.5 py-1 text-xs font-medium border rounded-full ${getDifficultyColor(
              project.difficulty
            )}`}
          >
            {project.difficulty || "Unknown"}
          </span>
        </div>

        {/* Author + Stats */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 min-h-[88px] flex flex-col gap-3">

          <div className="flex items-center gap-3 min-w-0">

            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 border border-blue-300 dark:border-blue-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {project.author?.charAt(0) || "U"}
            </div>

            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {project.author || "Unknown"}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-xs">

            <div className="flex items-center justify-center gap-1 bg-yellow-50 dark:bg-yellow-900/40 rounded-md py-1 text-yellow-700 dark:text-yellow-300">
              <FiStar />
              {project.stars || 0}
            </div>

            <div className="flex items-center justify-center gap-1 bg-green-50 dark:bg-green-900/40 rounded-md py-1 text-green-700 dark:text-green-300">
              <FiGithub />
              {project.forks || 0}
            </div>

            <div className="flex items-center justify-center gap-1 bg-red-50 dark:bg-red-900/40 rounded-md py-1 text-red-700 dark:text-red-300">
              <FiAlertCircle />
              {project.openIssues || 0}
            </div>

            <div className="flex items-center justify-center gap-1 bg-blue-50 dark:bg-blue-900/40 rounded-md py-1 text-blue-700 dark:text-blue-300">
              <FiGitPullRequest />
              {project.pullRequests || 0}
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap gap-2 content-start min-h-[100px]">

          {(project.techStack || []).slice(0, 8).map((tech, index) => (
            <span key={index} className={techTagStyle}>
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="px-5 py-4 flex gap-3 mt-auto">

        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex-1
            flex
            items-center
            justify-center
            gap-2
            px-4
            py-2.5
            rounded-xl
            bg-black
            text-white
            font-medium
            hover:bg-zinc-800
            transition-all
            duration-300
          "
        >
          <FiGithub />
          GitHub
        </a>

        {project.liveDemo ? (
          <a
            href={project.liveDemo}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex-1
              flex
              items-center
              justify-center
              gap-2
              px-4
              py-2.5
              rounded-xl
              border-2
              border-blue-300
              text-blue-700
              dark:text-blue-300
              hover:bg-blue-50
              dark:hover:bg-blue-900/30
              transition-all
              duration-300
            "
          >
            <FiExternalLink />
            Live Demo
          </a>
        ) : (
          <div
            className="
              flex-1
              flex
              items-center
              justify-center
              px-4
              py-2.5
              rounded-xl
              bg-gray-100
              dark:bg-gray-800
              text-gray-400
              text-sm
              font-medium
              cursor-not-allowed
            "
          >
            No Demo
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectCard;