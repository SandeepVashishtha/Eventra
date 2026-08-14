import crypto from "node:crypto";
import { getClientIp } from "./lib/getClientIp.js";

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const GITHUB_REPO = process.env.REACT_APP_GITHUB_REPO || "SandeepVashishtha/Eventra";
const [REPO_OWNER, REPO_NAME] = GITHUB_REPO.split("/");

const POINTS = {
  gssoclevel1: 3,
  gssoclevel2: 7,
  gssoclevel3: 10,
};

const DEFAULT_MERGED_PR_POINTS = 1;
const MAX_PAGES = 10;
const CACHE_TTL_MS = 5 * 60_000; // 5 minutes
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5;

// Webhook Secret for manual cache purging via POST
const WEBHOOK_SECRET = process.env.LEADERBOARD_WEBHOOK_SECRET || "";

// Redis / Upstash configuration (if available, overrides in-memory caching)
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// ============================================================================
// BADGES & ACHIEVEMENTS DEFINITIONS
// ============================================================================

const BADGES = {
  TOP_CONTRIBUTOR: {
    id: "top_contributor",
    name: "🥇 Top Contributor",
    description: "Ranked #1 on the leaderboard",
  },
  LEVEL_3_MASTER: {
    id: "level_3_master",
    name: "🔥 Hardcore Dev",
    description: "Merged 3 or more Level-3 PRs",
  },
  PROLIFIC_AUTHOR: {
    id: "prolific_author",
    name: "⚡ Speed Demon",
    description: "Merged 10 or more total PRs",
  },
  CENTURION: {
    id: "centurion",
    name: "💯 Century Club",
    description: "Accumulated over 100 total points",
  },
  BALANCED_DEVELOPER: {
    id: "balanced_developer",
    name: "🎯 All-Rounder",
    description: "Merged PRs across Level 1, Level 2, and Level 3",
  },
  NEWCOMER: {
    id: "newcomer",
    name: "🌱 First Step",
    description: "Merged 1st qualifying PR",
  },
};

// ============================================================================
// IN-MEMORY STORAGE FALLBACKS
// ============================================================================

const ipRateLimitMap = new Map();
let cachedLeaderboard = null;
let cacheTimestamp = 0;
let lastEvictionAt = 0;

/**
 * Clean up expired rate-limiting IP keys from memory
 */
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

/**
 * Standard In-Memory Rate Limiter
 */
const isRateLimitedInMemory = (ip) => {
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

// ============================================================================
// DISTRIBUTED REDIS / UPSTASH INTEGRATION
// ============================================================================

/**
 * Upstash Redis REST Request Helper
 */
const redisFetch = async (command, ...args) => {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  try {
    const url = `${REDIS_URL}/${command}/${args.map((a) => encodeURIComponent(typeof a === "object" ? JSON.stringify(a) : a)).join("/")}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result;
  } catch (err) {
    console.warn("[Leaderboard Redis] Operations failed, using memory fallback:", err.message);
    return null;
  }
};

const getDistributedCache = async () => {
  const data = await redisFetch("GET", "leaderboard_cache");
  if (!data) return null;
  try {
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch {
    return null;
  }
};

const setDistributedCache = async (value, ttlSeconds = 300) => {
  await redisFetch("SET", "leaderboard_cache", JSON.stringify(value), "EX", ttlSeconds);
};

// ============================================================================
// NETWORK & UTILITY HELPERS
// ============================================================================

/**
 * Fetch wrapper with explicit AbortSignal timeout
 */
const fetchWithTimeout = async (url, options = {}, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
    }
    throw error;
  }
};

const normalizeLabel = (label = "") => label.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Calculate total points awarded to a PR based on its labels
 */
const calculatePrPoints = (labels) => {
  const levelPoints = labels.reduce((total, label) => {
    const normalized = normalizeLabel(label);
    return total + (POINTS[normalized] || 0);
  }, 0);

  return levelPoints || DEFAULT_MERGED_PR_POINTS;
};

/**
 * Extract level breakdown counters from labels
 */
const extractLevelBreakdown = (labels) => {
  const breakdown = { level1: 0, level2: 0, level3: 0, default: 0 };
  let matched = false;

  labels.forEach((label) => {
    const norm = normalizeLabel(label);
    if (norm === "gssoclevel1") {
      breakdown.level1 += 1;
      matched = true;
    } else if (norm === "gssoclevel2") {
      breakdown.level2 += 1;
      matched = true;
    } else if (norm === "gssoclevel3") {
      breakdown.level3 += 1;
      matched = true;
    }
  });

  if (!matched) breakdown.default += 1;
  return breakdown;
};

// ============================================================================
// GITHUB GRAPHQL API V4 ENGINE (PRIMARY HIGH-SPEED FETCH)
// ============================================================================

const GRAPHQL_QUERY = `
  query GetLeaderboardPRs($owner: String!, $name: String!, $cursor: String) {
    repository(owner: $owner, name: $name) {
      pullRequests(states: MERGED, first: 100, after: $cursor, orderBy: {field: CREATED_AT, direction: DESC}) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          number
          title
          mergedAt
          url
          author {
            login
            avatarUrl
            url
            ... on User {
              name
            }
          }
          labels(first: 20) {
            nodes {
              name
            }
          }
        }
      }
    }
  }
`;

/**
 * GraphQL Data fetch engine - fetches PRs using 100-node chunks with cursors
 */
const fetchAllPRsGraphQL = async (token) => {
  const endpoint = "https://api.github.com/graphql";
  const headers = {
    Authorization: `bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "Eventra-Leaderboard-Service",
  };

  let allNodes = [];
  let hasNextPage = true;
  let cursor = null;
  let pageCount = 0;

  while (hasNextPage && pageCount < MAX_PAGES) {
    pageCount += 1;
    const body = JSON.stringify({
      query: GRAPHQL_QUERY,
      variables: { owner: REPO_OWNER, name: REPO_NAME, cursor },
    });

    const response = await fetchWithTimeout(endpoint, { method: "POST", headers, body }, 12000);
    if (!response.ok) {
      throw new Error(`GraphQL endpoint returned status ${response.status}`);
    }

    const resBody = await response.json();
    if (resBody.errors && resBody.errors.length > 0) {
      throw new Error(`GraphQL Error: ${resBody.errors[0].message}`);
    }

    const prData = resBody.data?.repository?.pullRequests;
    if (!prData) break;

    allNodes = allNodes.concat(prData.nodes || []);
    hasNextPage = prData.pageInfo.hasNextPage;
    cursor = prData.pageInfo.endCursor;
  }

  // Map GraphQL nodes to REST-compatible structures
  return allNodes.map((node) => ({
    number: node.number,
    title: node.title,
    merged_at: node.mergedAt,
    html_url: node.url,
    user: {
      login: node.author?.login || "ghost",
      avatar_url: node.author?.avatarUrl || "https://github.com/ghost.png",
      html_url: node.author?.url || "https://github.com",
      name: node.author?.name || node.author?.login || "Ghost User",
    },
    labels: (node.labels?.nodes || []).map((l) => ({ name: l.name })),
  }));
};

// ============================================================================
// GITHUB REST API V3 ENGINE (FALLBACK ENGINE)
// ============================================================================

const fetchPrPageREST = async (page, headers) => {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/pulls?state=closed&per_page=100&page=${page}`;
  try {
    const response = await fetchWithTimeout(url, { headers }, 10000);
    if (!response.ok) {
      console.warn(`[Leaderboard REST API] PR page ${page} failed with status: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn(`[Leaderboard REST API] PR page ${page} fetch error:`, error.message);
    return [];
  }
};

const fetchContributorsREST = async (headers) => {
  const contributorsUrl = `https://api.github.com/repos/${GITHUB_REPO}/contributors?per_page=100`;
  try {
    const response = await fetchWithTimeout(contributorsUrl, { headers }, 10000);
    if (!response.ok) return {};

    const data = await response.json();
    const infoMap = {};
    if (Array.isArray(data)) {
      data.forEach((item) => {
        infoMap[item.login] = {
          name: item.login,
          avatar: item.avatar_url,
          profile: item.html_url,
        };
      });
    }
    return infoMap;
  } catch (err) {
    console.warn("[Leaderboard REST API] Contributors fetch warning:", err.message);
    return {};
  }
};

// ============================================================================
// AGGREGATION & BADGE ENGINE
// ============================================================================

/**
 * Assign achievements/badges based on contributor performance stats
 */
const assignBadges = (contributor, rank) => {
  const badges = [];

  if (rank === 1) badges.push(BADGES.TOP_CONTRIBUTOR);
  if (contributor.levelBreakdown.level3 >= 3) badges.push(BADGES.LEVEL_3_MASTER);
  if (contributor.prs >= 10) badges.push(BADGES.PROLIFIC_AUTHOR);
  if (contributor.points >= 100) badges.push(BADGES.CENTURION);
  if (
    contributor.levelBreakdown.level1 > 0 &&
    contributor.levelBreakdown.level2 > 0 &&
    contributor.levelBreakdown.level3 > 0
  ) {
    badges.push(BADGES.BALANCED_DEVELOPER);
  }
  if (contributor.prs >= 1) badges.push(BADGES.NEWCOMER);

  return badges;
};

/**
 * Core Data Processing Engine
 */
const aggregatePrs = (prs, contributorsInfo) => {
  const contributorsMap = {};

  prs.forEach((pr) => {
    if (!pr.merged_at) return;

    const labels = (pr.labels || []).map((l) => l.name.toLowerCase());
    const hasGsocLabel = labels.some((label) => label.includes("gssoc") || label.includes("gsoc"));
    if (!hasGsocLabel) return;

    const author = pr.user?.login;
    if (!author) return;

    const points = calculatePrPoints(labels);
    const levelCounts = extractLevelBreakdown(labels);

    if (!contributorsMap[author]) {
      const info = contributorsInfo[author] || {
        name: pr.user.name || author,
        avatar: pr.user.avatar_url,
        profile: pr.user.html_url,
      };

      contributorsMap[author] = {
        username: author,
        name: info.name || author,
        avatar: info.avatar || pr.user.avatar_url,
        profile: info.profile || pr.user.html_url,
        points: 0,
        prs: 0,
        levelBreakdown: { level1: 0, level2: 0, level3: 0, default: 0 },
        recentPrs: [],
      };
    }

    const contributor = contributorsMap[author];
    contributor.points += points;
    contributor.prs += 1;
    contributor.levelBreakdown.level1 += levelCounts.level1;
    contributor.levelBreakdown.level2 += levelCounts.level2;
    contributor.levelBreakdown.level3 += levelCounts.level3;
    contributor.levelBreakdown.default += levelCounts.default;

    if (contributor.recentPrs.length < 5) {
      contributor.recentPrs.push({
        title: pr.title,
        number: pr.number,
        url: pr.html_url,
        mergedAt: pr.merged_at,
        points,
      });
    }
  });

  // Apply Bonus Threshold Rules
  Object.keys(contributorsMap).forEach((user) => {
    const count = contributorsMap[user].prs;
    if (count >= 10) {
      contributorsMap[user].points += 10;
      contributorsMap[user].bonusPoints = 10;
    } else if (count >= 5) {
      contributorsMap[user].points += 5;
      contributorsMap[user].bonusPoints = 5;
    } else {
      contributorsMap[user].bonusPoints = 0;
    }
  });

  // Sort contributors by score
  const sorted = Object.values(contributorsMap).sort((a, b) => b.points - a.points || b.prs - a.prs);

  // Attach ranks and badges
  return sorted.map((contributor, index) => {
    const rank = index + 1;
    return {
      rank,
      ...contributor,
      badges: assignBadges(contributor, rank),
    };
  });
};

// ============================================================================
// FORMATTERS & EXPORTERS (CSV / MARKDOWN / METRICS)
// ============================================================================

const convertToCSV = (data) => {
  const headers = ["Rank", "Username", "Name", "Points", "PRs", "Level1", "Level2", "Level3", "BonusPoints", "Profile"];
  const rows = data.map((item) => [
    item.rank,
    `"${item.username}"`,
    `"${item.name || item.username}"`,
    item.points,
    item.prs,
    item.levelBreakdown.level1,
    item.levelBreakdown.level2,
    item.levelBreakdown.level3,
    item.bonusPoints || 0,
    item.profile,
  ]);

  return [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
};

const convertToMarkdown = (data) => {
  const lines = [
    `# 🏆 Leaderboard - ${GITHUB_REPO}`,
    `*Generated on: ${new Date().toISOString()}*`,
    "",
    "| Rank | Contributor | Points | PRs Merged | Badges |",
    "| :--- | :--- | :--- | :--- | :--- |",
  ];

  data.slice(0, 25).forEach((item) => {
    const badgeIcons = item.badges.map((b) => b.name.split(" ")[0]).join(" ");
    lines.push(`| ${item.rank} | [${item.username}](${item.profile}) | **${item.points}** | ${item.prs} | ${badgeIcons} |`);
  });

  return lines.join("\n");
};

const computeSystemSummary = (contributors) => {
  const totalContributors = contributors.length;
  const totalPoints = contributors.reduce((acc, c) => acc + c.points, 0);
  const totalPrs = contributors.reduce((acc, c) => acc + c.prs, 0);

  return {
    totalContributors,
    totalPoints,
    totalPrs,
    averagePointsPerContributor: totalContributors ? (totalPoints / totalContributors).toFixed(1) : 0,
    repository: GITHUB_REPO,
    lastRefreshed: new Date().toISOString(),
  };
};

// ============================================================================
// MAIN ROUTER & HANDLER ENGINE
// ============================================================================

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST,HEAD");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Webhook-Signature",
  );

  if (req.method === "OPTIONS" || req.method === "HEAD") {
    return res.status(200).end();
  }

  // Handle Webhook Cache Purge (POST)
  if (req.method === "POST") {
    const signature = req.headers["x-webhook-signature"];
    if (WEBHOOK_SECRET && signature !== WEBHOOK_SECRET) {
      return res.status(401).json({ error: "Invalid webhook signature authorization" });
    }

    cachedLeaderboard = null;
    cacheTimestamp = 0;
    await redisFetch("DEL", "leaderboard_cache");

    return res.status(200).json({
      success: true,
      message: "Leaderboard cache successfully invalidated.",
      purgedAt: new Date().toISOString(),
    });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Rate Limiting Check
  const clientIp = getClientIp(req);
  evictStaleIpEntries();

  if (isRateLimitedInMemory(clientIp)) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({
      error: "Too many requests. The leaderboard may be requested at most 5 times per minute per client.",
    });
  }

  const token = process.env.GITHUB_TOKEN;
  const now = Date.now();

  // 1. Try Distributed Redis Cache
  let leaderboardData = await getDistributedCache();
  let cacheHeaderState = "HIT_DISTRIBUTED";

  // 2. Try In-Memory Cache
  if (!leaderboardData && cachedLeaderboard && now - cacheTimestamp < CACHE_TTL_MS) {
    leaderboardData = cachedLeaderboard;
    cacheHeaderState = "HIT_MEMORY";
  }

  // 3. Cache Miss - Fetch Fresh Data from GitHub
  if (!leaderboardData) {
    cacheHeaderState = "MISS";
    let prs = [];
    let contributorsInfo = {};

    try {
      // Attempt High-Speed GraphQL execution first if TOKEN is present
      if (token) {
        try {
          prs = await fetchAllPRsGraphQL(token);
        } catch (gqlErr) {
          console.warn("[Leaderboard Engine] GraphQL query failed, falling back to REST API:", gqlErr.message);
          prs = [];
        }
      }

      // REST Engine Fallback if GraphQL was skipped or returned empty
      if (prs.length === 0) {
        const headers = {
          Accept: "application/vnd.github.v3+json",
          ...(token ? { Authorization: `token ${token}` } : {}),
          "User-Agent": "Eventra-Leaderboard-App",
        };

        const [contributorsData, firstPagePrs] = await Promise.all([
          fetchContributorsREST(headers),
          fetchPrPageREST(1, headers),
        ]);

        contributorsInfo = contributorsData;
        prs = [...firstPagePrs];

        if (firstPagePrs.length === 100) {
          const remainingPageNumbers = Array.from({ length: MAX_PAGES - 1 }, (_, index) => index + 2);

          const remainingResults = await Promise.allSettled(
            remainingPageNumbers.map((page) => fetchPrPageREST(page, headers)),
          );

          for (const result of remainingResults) {
            if (result.status === "fulfilled" && result.value.length > 0) {
              prs = prs.concat(result.value);
            }
          }
        }
      }

      // Compile raw PRs into Leaderboard schema
      leaderboardData = aggregatePrs(prs, contributorsInfo);

      // Hydrate Caches
      cachedLeaderboard = leaderboardData;
      cacheTimestamp = Date.now();
      await setDistributedCache(leaderboardData, 300);
    } catch (error) {
      console.error("[Leaderboard API] Aggregation Error:", error);
      return res.status(500).json({
        error: "Failed to compile leaderboard data",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // ============================================================================
  // QUERY PARAMETER FILTERS, SEARCH, & EXPORTS
  // ============================================================================

  const {
    search,
    sort = "points",
    order = "desc",
    limit,
    page = 1,
    format = "json",
    user,
  } = req.query || {};

  let outputData = [...leaderboardData];

  // Specific User Profile Mode
  if (user) {
    const userProfile = outputData.find((c) => c.username.toLowerCase() === String(user).toLowerCase());
    if (!userProfile) {
      return res.status(404).json({ error: `Contributor '${user}' not found on leaderboard` });
    }
    return res.status(200).json(userProfile);
  }

  // Search Filter
  if (search) {
    const queryTerm = String(search).toLowerCase();
    outputData = outputData.filter(
      (item) =>
        item.username.toLowerCase().includes(queryTerm) ||
        (item.name && item.name.toLowerCase().includes(queryTerm)),
    );
  }

  // Custom Field Sorting
  outputData.sort((a, b) => {
    let valueA = a[sort] ?? a.points;
    let valueB = b[sort] ?? b.points;

    if (typeof valueA === "string") {
      return order === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    }

    return order === "asc" ? valueA - valueB : valueB - valueA;
  });

  // Export Format Handlers
  if (format === "csv") {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="leaderboard-${GITHUB_REPO.replace("/", "-")}.csv"`);
    return res.status(200).send(convertToCSV(outputData));
  }

  if (format === "markdown" || format === "md") {
    res.setHeader("Content-Type", "text/markdown");
    return res.status(200).send(convertToMarkdown(outputData));
  }

  // Pagination Slice
  const parsedLimit = limit ? Math.max(1, parseInt(limit, 10)) : null;
  const parsedPage = Math.max(1, parseInt(page, 10));

  if (parsedLimit) {
    const startIndex = (parsedPage - 1) * parsedLimit;
    outputData = outputData.slice(startIndex, startIndex + parsedLimit);
  }

  // Final Response Metadata Wrap
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.setHeader("X-Cache", cacheHeaderState);

  return res.status(200).json({
    summary: computeSystemSummary(leaderboardData),
    pagination: parsedLimit
      ? {
          page: parsedPage,
          limit: parsedLimit,
          totalResults: leaderboardData.length,
          totalPages: Math.ceil(leaderboardData.length / parsedLimit),
        }
      : null,
    data: outputData,
  });
}