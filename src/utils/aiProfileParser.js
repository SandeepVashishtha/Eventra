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

/**
 * Detects whether a GitHub API response represents rate limiting and, if so,
 * returns a user-facing Error describing how long to wait. Returns null when
 * the response is not rate-limited.
 *
 * GitHub signals rate limiting in two ways for unauthenticated clients:
 *  - 429 Too Many Requests (secondary/abuse rate limits)
 *  - 403 Forbidden with `X-RateLimit-Remaining: 0` (primary hourly limit)
 *
 * @param {Response} res - The fetch Response to inspect.
 * @returns {Error|null}
 */
function getRateLimitError(res) {
  const remaining = res.headers.get("X-RateLimit-Remaining");
  const isRateLimited =
    res.status === 429 || (res.status === 403 && remaining === "0");

  if (!isRateLimited) return null;

  // Prefer the explicit Retry-After (seconds); fall back to the reset epoch.
  const retryAfter = Number(res.headers.get("Retry-After"));
  const resetEpoch = Number(res.headers.get("X-RateLimit-Reset"));
  let waitSeconds = null;
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    waitSeconds = retryAfter;
  } else if (Number.isFinite(resetEpoch) && resetEpoch > 0) {
    waitSeconds = Math.max(0, Math.round(resetEpoch - Date.now() / 1000));
  }

  const waitHint =
    waitSeconds && waitSeconds > 0
      ? ` Please try again in about ${Math.ceil(waitSeconds / 60)} minute(s).`
      : " Please try again later.";

  const error = new Error(
    `GitHub API rate limit exceeded.${waitHint}`
  );
  error.code = "RATE_LIMITED";
  error.retryAfterSeconds = waitSeconds;
  return error;
}

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
      const rateLimitError = getRateLimitError(userRes);
      if (rateLimitError) throw rateLimitError;
      if (userRes.status === 404) {
        throw new Error("GitHub profile not found.");
      }
      throw new Error(
        `Unable to fetch GitHub profile (HTTP ${userRes.status}). Please try again later.`
      );
    }
    const userData = await userRes.json();

    // Fetch repositories to infer skills based on languages/topics
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=30&sort=updated`);
    let skills = [];
    if (reposRes.ok) {
      const reposData = await reposRes.json();
      const techCounts = {};
      
      reposData.forEach(repo => {
        // Track primary languages
        if (repo.language) {
          techCounts[repo.language] = (techCounts[repo.language] || 0) + 2; // Weight language higher
        }
        // Track topics
        if (repo.topics && Array.isArray(repo.topics)) {
          repo.topics.forEach(topic => {
            // Capitalize topic for nicer display
            const niceTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
            techCounts[niceTopic] = (techCounts[niceTopic] || 0) + 1;
          });
        }
      });

      // Sort by count and take top 8
      skills = Object.entries(techCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([tech]) => tech);
    }

    return {
      fullName: userData.name || "",
      username: username,
      bio: userData.bio || "Passionate developer building open-source projects.",
      github: userData.html_url || githubUrl,
      portfolio: userData.blog ? (userData.blog.startsWith("http") ? userData.blog : `https://${userData.blog}`) : "",
      skills: skills,
      avatarBase64: userData.avatar_url, // We'll pass the URL, the UI can handle image fetch
    };
  } catch (error) {
    // Preserve typed errors (e.g. rate limiting) so callers can react to
    // error.code / error.retryAfterSeconds instead of just a message.
    if (error instanceof Error && error.code) throw error;
    throw new Error(error.message || "Failed to parse GitHub profile.");
  }
}

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
      
      let mockSkills = ["JavaScript", "React", "Node.js", "Git", "HTML5", "CSS3"];
      if (nameLen % 2 === 0) {
        mockSkills = ["Python", "Django", "PostgreSQL", "Docker", "AWS", "Machine Learning"];
      }
      
      let mockBio = "Results-driven software engineer with experience building scalable web applications and RESTful APIs.";
      if (nameLen % 3 === 0) {
        mockBio = "Creative frontend developer passionate about UI/UX design, accessibility, and modern JavaScript frameworks.";
      }

      resolve({
        fullName: file.name.replace(".pdf", "").replace(/[-_]/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
        bio: mockBio,
        skills: mockSkills,
        linkedin: "https://linkedin.com/in/extracted-profile",
        portfolio: "https://my-portfolio.com",
      });
    }, 2500);
  });
}
