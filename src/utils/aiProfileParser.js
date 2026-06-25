/**
 * Utility functions for AI-Powered Profile Auto-Generation.
 * Handles GitHub REST API fetching and deterministic mock parsing for PDF resumes.
 */

/**
 * Extracts a GitHub username from various formats of GitHub URLs.
 * @param {string} url - The provided GitHub URL.
 * @returns {string|null} - The extracted username or null.
 */
function extractUsername(url) {
  try {
    const cleanUrl = url.replace(/\/$/, "");
    const parts = cleanUrl.split("/");
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

// --- Atomic Helpers for CodeScene Compliance & Array Safety ---

const trackLanguage = (repo, counts) => {
  // Track primary languages
  if (repo.language) {
    counts[repo.language] = (counts[repo.language] || 0) + 2; // Weight language higher
  }
};

const trackTopics = (repo, counts) => {
  // Track topics
  if (!repo.topics || !Array.isArray(repo.topics)) return;
  
  repo.topics.forEach(topic => {
    // Capitalize topic for nicer display
    const niceTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
    counts[niceTopic] = (counts[niceTopic] || 0) + 1;
  });
};

const processReposForTechCounts = (reposData) => {
  const techCounts = {};
  // Deep Fix: Strict type checking prevents fatal TypeErrors on malformed API responses
  if (!Array.isArray(reposData)) return techCounts;

  reposData.forEach(repo => {
    trackLanguage(repo, techCounts);
    trackTopics(repo, techCounts);
  });
  
  return techCounts;
};

const extractTopSkills = (techCounts) => {
  return Object.entries(techCounts)
    // Sort by count and take top 8
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tech]) => tech);
};

const formatPortfolioUrl = (blog) => {
  if (!blog) return "";
  return blog.startsWith("http") ? blog : `https://${blog}`;
};

const buildUserProfile = (userData, username, skills, githubUrl) => {
  return {
    fullName: userData.name || "",
    username: username,
    bio: userData.bio || "Passionate developer building open-source projects.",
    github: userData.html_url || githubUrl,
    portfolio: formatPortfolioUrl(userData.blog),
    skills: skills,
    avatarBase64: userData.avatar_url, // We'll pass the URL, the UI can handle image fetch
  };
};

const fetchReposAndGetSkills = async (username) => {
  // Fetch repositories to infer skills based on languages/topics
  const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=30&sort=updated`);
  if (!reposRes.ok) return [];
  
  const reposData = await reposRes.json();
  const techCounts = processReposForTechCounts(reposData);
  return extractTopSkills(techCounts);
};

/**
 * Parses a GitHub profile and returns structured developer data.
 * @param {string} githubUrl - The user's GitHub profile URL.
 * @returns {Promise<Object>} - The structured profile data.
 */
export async function parseGithubProfile(githubUrl) {
  const username = extractUsername(githubUrl);
  if (!username) {
    throw new Error("Invalid GitHub URL provided.");
  }

  try {
    // Fetch basic user profile
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) {
      throw new Error("GitHub profile not found.");
    }
    const userData = await userRes.json();
    const skills = await fetchReposAndGetSkills(username);

    return buildUserProfile(userData, username, skills, githubUrl);
  } catch (error) {
    throw new Error(error.message || "Failed to parse GitHub profile.");
  }
}

// --- Atomic Helpers for PDF Parsing ---

const formatPdfName = (fileName) => {
  return fileName.replace(".pdf", "").replace(/[-_]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

const getMockSkills = (nameLen) => {
  if (nameLen % 2 === 0) {
    return ["Python", "Django", "PostgreSQL", "Docker", "AWS", "Machine Learning"];
  }
  return ["JavaScript", "React", "Node.js", "Git", "HTML5", "CSS3"];
};

const getMockBio = (nameLen) => {
  if (nameLen % 3 === 0) {
    return "Creative frontend developer passionate about UI/UX design, accessibility, and modern JavaScript frameworks.";
  }
  return "Results-driven software engineer with experience building scalable web applications and RESTful APIs.";
};

/**
 * Deterministically simulates parsing a Resume PDF.
 * In a full production environment, this would hit an API endpoint that uses pdf-parse and an LLM.
 * @param {File} file - The uploaded PDF file.
 * @returns {Promise<Object>} - The structured profile data.
 */
export async function parseResumePDF(file) {
  return new Promise((resolve, reject) => {
    if (!file || file.type !== "application/pdf") {
      return reject(new Error("Please upload a valid PDF resume."));
    }

    // Simulate network/parsing delay
    setTimeout(() => {
      // Create deterministic mock data based on the file name length
      // to give the illusion of processing different files differently.
      const nameLen = file.name.length;
      
      resolve({
        fullName: formatPdfName(file.name),
        bio: getMockBio(nameLen),
        skills: getMockSkills(nameLen),
        linkedin: "https://linkedin.com/in/extracted-profile",
        portfolio: "https://my-portfolio.com",
      });
    }, 2500);
  });
}