// api/leaderboard.js

const MAX_PAGES = 5;
const GITHUB_REPO = process.env.GITHUB_REPO || "sandeepvashishtha/Eventra";

const cache = { data: null, ts: 0 };
const CACHE_TTL_MS = 5 * 60 * 1000;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "public, max-age=300");

  if (cache.data && Date.now() - cache.ts < CACHE_TTL_MS) {
    return res.status(200).json(cache.data);
  }

  try {
    let allPRs = [];
    let page = 1;
    let hasMore = true;

    const headers = {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "Eventra-Leaderboard"
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    const firstPageRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/pulls?state=all&per_page=100&page=${page}`,
      { headers }
    );

    if (!firstPageRes.ok) {
      if (firstPageRes.status === 403) {
        return res.status(403).json({ error: "GitHub API rate limit exceeded." });
      }
      throw new Error(`GitHub API error: ${firstPageRes.statusText}`);
    }

    const firstPageData = await firstPageRes.json();
    
    if (!Array.isArray(firstPageData)) {
      throw new Error("Invalid response from GitHub");
    }

    allPRs = [...firstPageData];

    if (firstPageData.length < 100) {
      hasMore = false;
    } else {
      page++;
    }

    while (hasMore && page <= MAX_PAGES) {
      await new Promise(resolve => setTimeout(resolve, 600));

      const pageRes = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/pulls?state=all&per_page=100&page=${page}`,
        { headers }
      );

      if (!pageRes.ok) {
        if (pageRes.status === 403) {
          console.warn(`[Leaderboard] GitHub secondary rate limit hit on page ${page}. Returning partial data.`);
          break;
        }
        throw new Error(`GitHub API error on page ${page}: ${pageRes.statusText}`);
      }

      const pageData = await pageRes.json();
      allPRs = [...allPRs, ...pageData];

      if (pageData.length < 100) {
        hasMore = false;
      } else {
        page++;
      }
    }

    cache.data = allPRs;
    cache.ts = Date.now();
    res.status(200).json(allPRs);
  } catch (error) {
    console.error("[Leaderboard] Fetch error:", error);
    if (cache.data) {
      return res.status(200).json(cache.data);
    }
    res.status(500).json({ error: "Failed to fetch leaderboard pull requests." });
  }
}
