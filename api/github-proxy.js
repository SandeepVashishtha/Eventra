const SAFE_GITHUB_PATH_PATTERNS = [
  /^\/repos\/[^/?#]+\/[^/?#]+\/contributors$/,
  /^\/repos\/[^/?#]+\/[^/?#]+\/pulls$/,
  /^\/users\/[^/?#]+$/,
];

// Only these query parameters are forwarded to the GitHub API.
// All other caller-supplied parameters are silently dropped.
const ALLOWED_QUERY_PARAMS = new Set(["per_page", "page", "state", "sort", "direction"]);

const normalizePath = (path) => {
  const rawPath = Array.isArray(path) ? path[0] : path;
  if (!rawPath || typeof rawPath !== "string") {
    return "";
  }

  return rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
};

const isSafeGitHubPath = (path) => {
  if (path.includes("..") || path.includes("@") || path.includes("://")) {
    return false;
  }

  const { pathname } = new URL(path, "https://api.github.com");
  return SAFE_GITHUB_PATH_PATTERNS.some((pattern) => pattern.test(pathname));
};

export default async function handler(req, res) {
  const { path, ...queryParams } = req.query;

  if (!path) {
    return res.status(400).json({ error: "Missing path parameter" });
  }

  const normalizedPath = normalizePath(path);

  if (!normalizedPath || !isSafeGitHubPath(normalizedPath)) {
    return res.status(400).json({ error: "Invalid GitHub API path" });
  }

  const url = new URL(normalizedPath, "https://api.github.com");
  Object.entries(queryParams).forEach(([key, value]) => {
    if (!ALLOWED_QUERY_PARAMS.has(key)) return;
    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, item));
    } else if (value !== undefined) {
      url.searchParams.append(key, value);
    }
  });

  const token = process.env.GITHUB_TOKEN || process.env.REACT_APP_GITHUB_TOKEN;

  try {
    const fetchRes = await fetch(url.toString(), {
      headers: {
        Accept: "application/vnd.github.v3+json",
        ...(token ? { Authorization: `token ${token}` } : {}),
      },
    });

    const data = await fetchRes.json();
    return res.status(fetchRes.status).json(data);
  } catch (error) {
    console.error("GitHub Proxy Error:", error);
    return res.status(500).json({ error: "Failed to fetch from GitHub API" });
  }
}
