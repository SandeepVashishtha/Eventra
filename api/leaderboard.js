import { getClientIp } from "./lib/getClientIp.js";
import { fetchWithTimeout } from "./lib/fetchWithTimeout.js";
import { buildCorsHeaders } from "./auth/cors.js";

const GITHUB_REPO = process.env.GITHUB_REPO || "SandeepVashishtha/Eventra";

const POINTS = {
  gssoclevel1: 3,
  gssoclevel2: 7,
  gssoclevel3: 10,
};

const DEFAULT_MERGED_PR_POINTS = 1;
const MAX_PAGES = 10;

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

const CACHE_TTL_MS = 5 * 60_000;
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

const fetchPrPage = async (page, headers) => {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/pulls?state=closed&per_page=100&page=${page}`;
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.warn(`[Leaderboard API] PR page ${page} failed with status: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn(`[Leaderboard API] PR page ${page} fetch error:`, error);
    return [];
  }
};

const aggregatePrs = (prs, contributorsInfo) => {
  const contributorsMap = {};

  prs.forEach((pr) => {
    if (!pr.merged_at) return;

    const labels = pr.labels.map((label) => label.name.toLowerCase());
    const hasGsocLabel = labels.some((label) => label.includes("gssoc") || label.includes("gsoc"));
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

export default async function handler(req, res) {
  const corsHeaders = buildCorsHeaders(req);
  res.set(corsHeaders);

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const clientIp = getClientIp(req);
  evictStaleIpEntries();

  if (isRateLimited(clientIp)) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({
      error: "Too many requests. The leaderboard may be requested at most 5 times per minute per client.",
    });
  }

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
    const contributorsUrl = `https://api.github.com/repos/${GITHUB_REPO}/contributors`;
    const [contributorsRes, firstPagePrs] = await Promise.all([
      fetchWithTimeout(contributorsUrl, { headers }, 10000),
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

    let allPrs = [...firstPagePrs];

    if (firstPagePrs.length === 100) {
      const remainingPageNumbers = Array.from(
        { length: MAX_PAGES - 1 },
        (_, index) => index + 2,
      );

      const remainingResults = await Promise.allSettled(
        remainingPageNumbers.map((page) => fetchPrPage(page, headers)),
      );

      for (const result of remainingResults) {
        if (result.status === "fulfilled" && result.value.length > 0) {
          allPrs = allPrs.concat(result.value);
        }
      }
    }

    const contributorsMap = aggregatePrs(allPrs, contributorsInfo);

    Object.keys(contributorsMap).forEach((user) => {
      const count = contributorsMap[user].prs;
      if (count >= 10) {
        contributorsMap[user].points += 10;
      } else if (count >= 5) {
        contributorsMap[user].points += 5;
      }
    });

    const sortedContributors = Object.values(contributorsMap).sort(
      (a, b) => b.points - a.points,
    );

    // 5. Populate the in-process cache so subsequent warm-instance calls skip
    //    the GitHub round-trips entirely for the next CACHE_TTL_MS window.
    cachedLeaderboard = sortedContributors;
    cacheTimestamp = Date.now();

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.setHeader("X-Cache", "MISS");

    return res.status(200).json(sortedContributors);
  } catch (error) {
    console.error("[Leaderboard API] Aggregation Error:", error);
    return res.status(500).json({ error: "Failed to compile leaderboard data" });
  }
}