const GITHUB_REPO = process.env.REACT_APP_GITHUB_REPO || "SandeepVashishtha/Eventra";

const POINTS = {
  gssoclevel1: 3,
  gssoclevel2: 7,
  gssoclevel3: 10,
};
const DEFAULT_MERGED_PR_POINTS = 1;

const normalizeLabel = (label = "") => label.toLowerCase().replace(/[^a-z0-9]/g, "");

const calculatePrPoints = (labels) => {
  const levelPoints = labels.reduce((total, label) => {
    const normalized = normalizeLabel(label);
    return total + (POINTS[normalized] || 0);
  }, 0);

  return levelPoints || DEFAULT_MERGED_PR_POINTS;
};

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  const headers = {
    Accept: "application/vnd.github.v3+json",
    ...(token ? { Authorization: `token ${token}` } : {}),
  };

  try {
    let contributorsMap = {};
    const contributorsInfo = {};

    // 1. Fetch contributors to get names and avatars
    const contributorsUrl = `https://api.github.com/repos/${GITHUB_REPO}/contributors`;
    const contributorsRes = await fetch(contributorsUrl, { headers });
    
    if (!contributorsRes.ok) {
      throw new Error(`Failed to fetch contributors: ${contributorsRes.status}`);
    }

    const contributorsData = await contributorsRes.json();

    if (Array.isArray(contributorsData)) {
      contributorsData.forEach((contributor) => {
        contributorsInfo[contributor.login] = {
          name: contributor.name || contributor.login,
          avatar: contributor.avatar_url,
          profile: contributor.html_url,
        };
      });
    }

    // 2. Fetch all closed PRs
    let page = 1;
    let hasMore = true;

    // Limit to 10 pages (1000 PRs) to avoid hitting Vercel 10s timeout limits
    // In production, consider Webhooks or a database-backed Cron job if > 1000 PRs
    const MAX_PAGES = 10; 

    while (hasMore && page <= MAX_PAGES) {
      const pullsUrl = `https://api.github.com/repos/${GITHUB_REPO}/pulls?state=closed&per_page=100&page=${page}`;
      const prsRes = await fetch(pullsUrl, { headers });

      if (!prsRes.ok) {
        console.warn(`[Leaderboard API] GitHub API request failed with status: ${prsRes.status}`);
        hasMore = false;
        break;
      }

      const prs = await prsRes.json();
      
      if (!Array.isArray(prs) || prs.length === 0) {
        hasMore = false;
        break;
      }

      prs.forEach((pr) => {
        if (!pr.merged_at) return; // Only count merged PRs

        const labels = pr.labels.map((l) => l.name.toLowerCase());
        const hasGsocLabel = labels.some(
          (label) => label.includes("gssoc") || label.includes("gsoc")
        );
        
        if (!hasGsocLabel) return; // Must have GSOC labels

        const author = pr.user.login;
        const points = calculatePrPoints(labels);

        if (!contributorsMap[author]) {
          const contributorInfo = contributorsInfo[author] || {
            name: author,
            avatar: pr.user.avatar_url,
            profile: pr.user.html_url,
          };
          contributorsMap[author] = {
            username: author,
            name: contributorInfo.name,
            avatar: contributorInfo.avatar,
            profile: contributorInfo.profile,
            points: 0,
            prs: 0,
          };
        }

        contributorsMap[author].points += points;
        contributorsMap[author].prs += 1;
      });

      page++;
    }

    // 3. Add achievement-based bonus points to gamify contributors
    Object.keys(contributorsMap).forEach((user) => {
      const count = contributorsMap[user].prs;
      if (count >= 10) {
        contributorsMap[user].points += 10;
      } else if (count >= 5) {
        contributorsMap[user].points += 5;
      }
    });

    // 4. Sort contributors by points
    const sortedContributors = Object.values(contributorsMap).sort((a, b) => b.points - a.points);

    // 5. Apply Edge Caching (Cache-Control)
    // s-maxage=3600 means Vercel's CDN will cache the response for 1 hour.
    // stale-while-revalidate=86400 means if the cache is stale (older than 1h),
    // it will immediately return the stale value to the user while re-fetching
    // the fresh data in the background (preventing the 10-second wait).
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    
    return res.status(200).json(sortedContributors);
    
  } catch (error) {
    console.error("[Leaderboard API] Aggregation Error:", error);
    return res.status(500).json({ error: "Failed to compile leaderboard data" });
  }
}
