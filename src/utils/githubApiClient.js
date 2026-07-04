import { fetchWithTimeout, FetchError } from "./fetchWithTimeout";
import { logError } from "./errorLogger";

const GITHUB_HOST = "github.com";

const buildDirectGitHubUrl = (path, queryParams = {}) => {
  const sanitizedPath = `/${path.replace(/^\/+/, "")}`;
  const params = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });

  const query = params.toString();
  return `https://api.github.com${sanitizedPath}${query ? `?${query}` : ""}`;
};

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
  const proxyUrl = buildGitHubProxyUrl(path, queryParams);
  const directUrl = buildDirectGitHubUrl(path, queryParams);

  try {
    const { data } = await fetchWithTimeout(
      proxyUrl,
      options
    );

    return data;
  } catch (error) {
    let finalError = error;

    if (error?.status === 401 || error?.status === 403) {
      try {
        const { data } = await fetchWithTimeout(directUrl, {
          ...options,
          headers: {
            ...(options.headers || {}),
            Accept: "application/vnd.github+json",
          },
        });
        return data;
      } catch (directError) {
        finalError = directError;
      }
    }

    let message = "Failed to fetch data from GitHub";

    if (finalError instanceof FetchError) {
      if (finalError.status === 403) {
        message = "GitHub API rate limit exceeded. Please try again later.";
      } else if (finalError.status === 404) {
        message = "GitHub repository or resource not found.";
      } else if (finalError.status >= 500) {
        message = "GitHub's servers are currently experiencing issues.";
      }
    }

    logError(finalError, { componentStack: "githubApiClient" }, { path, queryParams, friendlyMessage: message });

    const wrappedError = new Error(message);
    wrappedError.status = finalError.status ?? error.status;
    wrappedError.originalError = finalError;
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