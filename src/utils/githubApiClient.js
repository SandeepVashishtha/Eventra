import { fetchWithTimeout } from "./fetchWithTimeout";
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

export const fetchGitHubJson = async (path, queryParams = {}, options = {}) => {
  const { data } = await fetchWithTimeout(
    buildGitHubProxyUrl(path, queryParams),
    options
  );

  return data;
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