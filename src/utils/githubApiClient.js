import { fetchWithTimeout, FetchError } from "./fetchWithTimeout";
import { logError } from "./errorLogger";

const GITHUB_HOST = "github.com";

export const buildGitHubProxyUrl = (path, queryParams = {}) => {
  // 🔥 FIX 1: Prevent Protocol-Relative SSRF Bypass (e.g. "//evil.com")
  // Remove ALL leading slashes, then explicitly prepend exactly one.
  const sanitizedPath = `/${path.replace(/^\/+/, '')}`;
  const params = new URLSearchParams({ path: sanitizedPath });

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    
    // 🔥 FIX 2: Prevent Parameter Pollution
    // Block attackers from passing a malicious "path" key in the query string
    // which would overwrite our secure sanitized path.
    if (key.toLowerCase() === "path") return;
    
    params.set(key, String(value));
  });

  return `/api/github-proxy?${params.toString()}`;
};

/**
 * Fetch JSON from GitHub API via the backend proxy
 * @param {string} path - GitHub API path (e.g. /repos/owner/repo)
 * @param {object} queryParams - Query parameters
 * @param {object} options - Fetch options
 * @returns {Promise<any>} Parsed JSON response
 */
export const fetchGitHubJson = async (path, queryParams = {}, options = {}) => {
  try {
    const { data } = await fetchWithTimeout(
      buildGitHubProxyUrl(path, queryParams),
      options
    );

    return data;
  } catch (error) {
    let message = "Failed to fetch data from GitHub";
    //let severity = "warn";

    if (error instanceof FetchError) {
      if (error.status === 403) {
        message = "GitHub API rate limit exceeded. Please try again later.";
      } else if (error.status === 404) {
        message = "GitHub repository or resource not found.";
      } else if (error.status >= 500) {
        message = "GitHub's servers are currently experiencing issues.";
      }
    }

    // Log the error for diagnostics while providing a clean message to the UI
    logError(error, { componentStack: "githubApiClient" }, { path, queryParams, friendlyMessage: message });

    // Re-throw a clean error for the UI components to catch
    const wrappedError = new Error(message);
    wrappedError.status = error.status;
    wrappedError.originalError = error;
    throw wrappedError;
  }
};

export const fetchGitHubRepo = ({ owner, repo }, options = {}) => {
  if (!owner || !repo) {
    throw new Error("GitHub repository owner and name are required");
  }

  return fetchGitHubJson(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    {},
    options
  );
};

export const getGitHubRepoDetails = (url) => {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (parsed.hostname.toLowerCase() !== GITHUB_HOST) return null;

    const [owner, repo] = parsed.pathname
      .split("/")
      .filter(Boolean)
      .map((part) => decodeURIComponent(part));

    if (!owner || !repo) return null;

    return {
      owner,
      repo: repo.replace(/\.git$/i, ""),
    };
  } catch {
    return null;
  }
};