// api/leaderboard.js

const MAX_PAGES = 10;
const GITHUB_REPO = process.env.REACT_APP_GITHUB_REPO || "sandeepvashishtha/Eventra";

export default async function handler(req, res) {
  try {
    let allPRs = [];
    let page = 1;
    let hasMore = true;

    const headers = {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "Eventra-Leaderboard"
    };

    if (process.env.VITE_GITHUB_TOKEN || process.env.GITHUB_TOKEN) {
      const token = process.env.VITE_GITHUB_TOKEN || process.env.GITHUB_TOKEN;
      headers.Authorization = `token ${token}`;
    }

    // 1. Fetch the first page
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

    // 2. Fetch remaining pages sequentially (Pages 2 through 10)
    // FIX: Replaced Promise.allSettled with a robust sequential while-loop to prevent 
    // secondary rate limits (Abuse Detected) from firing.
    while (hasMore && page <= MAX_PAGES) {
      // Throttle delay: Wait 600ms between requests to strictly respect GitHub's abuse mechanisms
      await new Promise(resolve => setTimeout(resolve, 600));

      const pageRes = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/pulls?state=all&per_page=100&page=${page}`,
        { headers }
      );

      if (!pageRes.ok) {
        if (pageRes.status === 403) {
          console.warn(`[Leaderboard] GitHub secondary rate limit hit on page ${page}. Returning partial data.`);
          break; // Stop fetching and gracefully degrade to returning what we have so far
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

    // 3. Send successful response
    res.status(200).json(allPRs);
  } catch (error) {
    console.error("[Leaderboard] Fetch error:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard pull requests." });
  }
}
