export default async function handler(req, res) {
  const { path, ...queryParams } = req.query;

  if (!path) {
    return res.status(400).json({ error: "Missing path parameter" });
  }

  const queryString = new URLSearchParams(queryParams).toString();
  const url = `https://api.github.com${path.startsWith('/') ? path : `/${path}`}${queryString ? `?${queryString}` : ""}`;

  const token = process.env.GITHUB_TOKEN || process.env.REACT_APP_GITHUB_TOKEN;

  try {
    const fetchRes = await fetch(url, {
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
