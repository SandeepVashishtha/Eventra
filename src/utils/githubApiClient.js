/**
 * GitHub API Client Utility
 *
 * Provides a centralized interface for making GitHub API requests through
 * the backend proxy. All GitHub API requests MUST go through the proxy
 * endpoint (/api/github-proxy) to ensure:
 * 1. Rate limit pooling on backend
 * 2. Authentication via backend token
 * 3. CORS handling
 * 4. Consistent error handling
 */

const REQUEST_TIMEOUT_MS = 10000;

/**
 * Make a GitHub API request through the backend proxy
 *
 * @param {string} githubApiPath - The GitHub API path (e.g., "/repos/user/repo")
 * @param {object} options - Fetch options
 * @returns {Promise<any>} Parsed JSON response from GitHub API
 * @throws {Error} If the request fails
 */
export const fetchFromGitHubProxy = async (githubApiPath, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // Route through backend proxy: /api/github-proxy?path=/repos/...
    const proxyUrl = `/api/github-proxy?path=${encodeURIComponent(githubApiPath)}`;

    const response = await fetch(proxyUrl, {
      signal: controller.signal,
      ...options,
    });

    if (!response.ok) {
      throw new Error(
        `GitHub API request failed: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * Fetch repository information
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<object>} Repository data
 */
export const fetchRepository = (owner, repo) => {
  return fetchFromGitHubProxy(`/repos/${owner}/${repo}`);
};

/**
 * Fetch repository contributors
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} page - Page number for pagination
 * @param {number} perPage - Results per page
 * @returns {Promise<array>} Array of contributors
 */
export const fetchContributors = (owner, repo, page = 1, perPage = 100) => {
  return fetchFromGitHubProxy(
    `/repos/${owner}/${repo}/contributors?per_page=${perPage}&page=${page}&anon=true`
  );
};

/**
 * Fetch pull requests for a repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {object} options - Query parameters (state, per_page, page, etc.)
 * @returns {Promise<array>} Array of pull requests
 */
export const fetchPullRequests = (owner, repo, options = {}) => {
  const params = new URLSearchParams({
    state: 'all',
    per_page: 100,
    ...options,
  });
  return fetchFromGitHubProxy(
    `/repos/${owner}/${repo}/pulls?${params.toString()}`
  );
};

/**
 * Fetch GitHub user profile
 * @param {string} username - GitHub username
 * @returns {Promise<object>} User profile data
 */
export const fetchUserProfile = (username) => {
  return fetchFromGitHubProxy(`/users/${username}`);
};

/**
 * Fetch repository languages
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<object>} Languages object with byte counts
 */
export const fetchRepositoryLanguages = (owner, repo) => {
  return fetchFromGitHubProxy(`/repos/${owner}/${repo}/languages`);
};
