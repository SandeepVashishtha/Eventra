const GITHUB_REPO =
  process.env.GITHUB_REPO ||
  process.env.REACT_APP_GITHUB_REPO ||
  "SandeepVashishtha/Eventra";

const POINTS = {
  gssoclevel1: 3,
  gssoclevel2: 7,
  gssoclevel3: 10,
};
const DEFAULT_MERGED_PR_POINTS = 1;

// Maximum number of PR pages to fetch. Each page = 100 PRs.
// 10 pages × 100 PRs = 1 000 PRs max.
const MAX_PAGES = 10;
// ---------------------------------------------------------------------------
// Per-IP rate limiting
//
// Prevents a single unauthenticated caller from flooding this endpoint and
// exhausting the authenticated GITHUB_TOKEN quota (5 000 req/hr). Each call
// triggers up to 11 sequential GitHub API requests, so even a modest flood
// drains the quota quickly.
//
// Limit: 5 requests per IP per minute. In-memory; resets on cold start.
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const ipRateLimitMap = new Map();

const isRateLimited = (ip) => {
  const now = Date.now();
  const entry = ipRateLimitMap.get(ip);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    ipRateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  entry.count += 1;
  return false;
};

// Evict stale rate-limit entries at most once per window to avoid O(n)
// iteration on every request.
let lastEvictionAt = 0;
const evictStaleIpEntries = () => {
  const now = Date.now();
  if (now - lastEvictionAt < RATE_LIMIT_WINDOW_MS) return;
  lastEvictionAt = now;
  for (const [key, entry] of ipRateLimitMap.entries()) {
    if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
      ipRateLimitMap.delete(key);
    }
  }
};

// ---------------------------------------------------------------------------
// Server-side in-memory cache
//
// Prevents every CDN cache miss / cold start from firing 11 GitHub API calls.
// The leaderboard data changes slowly; 5-minute freshness is sufficient.
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 5 * 60_000; // 5 minutes
let cachedLeaderboard = null;
let cacheTimestamp = 0;

const normalizeLabel = (label = "") => label.toLowerCase().replace(/[^a-z0-9]/g, "");

const calculatePrPoints = (labels) => {
  const levelPoints = labels.reduce((total, label) => {
    const normalized = normalizeLabel(label);
    return total + (POINTS[normalized] || 0);
  }, 0);
  return levelPoints || DEFAULT_MERGED_PR_POINTS;
};

// ---------------------------------------------------------------------------
// Fetch a single page of pull requests from GitHub.
// Returns the parsed JSON array, or an empty array on failure so that a
// single bad page does not abort the entire aggregation.
// ---------------------------------------------------------------------------
const fetchPrPage = async (page, headers) => {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/pulls?state=closed&per_page=100&page=${page}`;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`[Leaderboard API] PR page ${page} failed with status: ${res.status}`);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn(`[Leaderboard API] PR page ${page} fetch error:`, err);
    return [];
  }
};

// ---------------------------------------------------------------------------
// Aggregate pull-request data into a contributor points map.
// ---------------------------------------------------------------------------
const aggregatePrs = (prs, contributorsInfo) => {
  const contributorsMap = {};

  prs.forEach((pr) => {
    if (!pr.merged_at) return; // Only count merged PRs

    const labels = pr.labels.map((l) => l.name.toLowerCase());
    const hasGsocLabel = labels.some(
      (label) => label.includes("gssoc") || label.includes("gsoc"),
    );
    if (!hasGsocLabel) return;

    const author = pr.user.login;
    const points = calculatePrPoints(labels);

    if (!contributorsMap[author]) {
      const info = contributorsInfo[author] || {
        name: author,
        avatar: pr.user.avatar_url,
        profile: pr.user.html_url,
      };
      contributorsMap[author] = {
        username: author,
        name: info.name,
        avatar: info.avatar,
        profile: info.profile,
        points: 0,
        prs: 0,
      };
    }

    contributorsMap[author].points += points;
    contributorsMap[author].prs += 1;
  });

  return contributorsMap;
};
// Resolve the caller's IP from common proxy headers then socket address
// ---------------------------------------------------------------------------
const getClientIp = (req) => {
  const forwarded = req.headers?.["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || req.connection?.remoteAddress || "unknown";
};

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Per-IP rate limiting — prevents unauthenticated callers from draining the
  // GitHub token quota (each leaderboard call can fire 11 GitHub API requests).
  const clientIp = getClientIp(req);
  evictStaleIpEntries();

  if (isRateLimited(clientIp)) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({
      error: "Too many requests. The leaderboard may be requested at most 5 times per minute per client.",
    });
  }

  // Serve from the in-process cache when fresh — avoids redundant GitHub calls
  // on warm instances within the same 5-minute window.
  const now = Date.now();
  if (cachedLeaderboard && now - cacheTimestamp < CACHE_TTL_MS) {
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.setHeader("X-Cache", "HIT");
    return res.status(200).json(cachedLeaderboard);
  }

  const token = process.env.GITHUB_TOKEN;
  const headers = {
    Accept: "application/vnd.github.v3+json",
    ...(token ? { Authorization: `token ${token}` } : {}),
  };

  try {
    // Fetch contributors and the first PR page concurrently so the
    // contributors round-trip does not add to the PR-fetching latency.
    const contributorsUrl = `https://api.github.com/repos/${GITHUB_REPO}/contributors`;
    const [contributorsRes, firstPagePrs] = await Promise.all([
      fetch(contributorsUrl, { headers }),
      fetchPrPage(1, headers),
    ]);

    if (!contributorsRes.ok) {
      throw new Error(`Failed to fetch contributors: ${contributorsRes.status}`);
    }

    const contributorsData = await contributorsRes.json();
    const contributorsInfo = {};

    if (Array.isArray(contributorsData)) {
      contributorsData.forEach((contributor) => {
        contributorsInfo[contributor.login] = {
          name: contributor.name || contributor.login,
          avatar: contributor.avatar_url,
          profile: contributor.html_url,
        };
      });
    }

    // 2. Fetch remaining PR pages in parallel.
    //
    //    We determined the total page count from how many results page 1
    //    returned: if it returned a full 100 we assume more pages exist
    //    and fan out pages 2–MAX_PAGES concurrently with Promise.allSettled.
    //
    //    Promise.allSettled ensures a single failed page does not abort the
    //    entire aggregation — failed pages are logged and skipped, so the
    //    leaderboard is still populated from the pages that succeeded.
    let allPrs = [...firstPagePrs];

    if (firstPagePrs.length === 100) {
      const remainingPageNumbers = Array.from(
        { length: MAX_PAGES - 1 },
        (_, i) => i + 2,
      );

      const remainingResults = await Promise.allSettled(
        remainingPageNumbers.map((page) => fetchPrPage(page, headers)),
      );

      for (const result of remainingResults) {
        if (result.status === "fulfilled" && result.value.length > 0) {
          allPrs = allPrs.concat(result.value);
      }
    }

    // 3. Aggregate points from all collected PRs
    const contributorsMap = aggregatePrs(allPrs, contributorsInfo);

    // 4. Add achievement-based bonus points
    Object.keys(contributorsMap).forEach((user) => {
      const count = contributorsMap[user].prs;
      if (count >= 10) {
        contributorsMap[user].points += 10;
      } else if (count >= 5) {
        contributorsMap[user].points += 5;
      }
    });

    // 5. Sort contributors by points
    const sortedContributors = Object.values(contributorsMap).sort(
      (a, b) => b.points - a.points,
    );

    // 5. Populate the in-process cache so subsequent warm-instance calls skip
    //    the GitHub round-trips entirely for the next CACHE_TTL_MS window.
    cachedLeaderboard = sortedContributors;
    cacheTimestamp = Date.now();

    // 6. Apply Edge Caching (Cache-Control)
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.setHeader("X-Cache", "MISS");

    return res.status(200).json(sortedContributors);
  } catch (error) {
    console.error("[Leaderboard API] Aggregation Error:", error);
    return res.status(500).json({ error: "Failed to compile leaderboard data" });
  }
}
