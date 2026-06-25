import { calculatePrPoints } from "../utils/leaderboardUtils";
import { logger } from "../utils/logger";

const REPO_OWNER = "SandeepVashishtha";
const REPO_NAME = "Eventra";
const APPROVED_LABEL = "gssoc:approved";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_KEY = "eventra_leaderboard_v1";
const GITHUB_API = "https://api.github.com";
const PER_PAGE = 100;

const getGitHubToken = () =>
  import.meta.env.VITE_GITHUB_TOKEN || import.meta.env.GITHUB_TOKEN || "";

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.data || !parsed?.timestamp) return null;

    const age = Date.now() - parsed.timestamp;
    if (age > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed;
  } catch (err) {
    logger.warn("[Leaderboard] Cache read error:", err);
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (err) {
    logger.warn("[Leaderboard] Cache write error (storage full?):", err);
  }
}

async function fetchPRPage(page, signal) {
  const url = new URL(`/repos/${REPO_OWNER}/${REPO_NAME}/pulls`, GITHUB_API);

  url.searchParams.set("state", "closed");
  url.searchParams.set("per_page", String(PER_PAGE));
  url.searchParams.set("page", String(page));

  const token = getGitHubToken();

  const headers = {
    Accept: "application/vnd.github+json",
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };

  const res = await fetch(url.toString(), {
    headers,
    signal,
  });

  if (!res.ok) {
    const msg =
      res.status === 403
        ? "GitHub API rate limit exceeded. Leaderboard will retry in 1 hour."
        : res.status === 404
          ? `Repository ${REPO_OWNER}/${REPO_NAME} not found on GitHub.`
          : `GitHub API error (HTTP ${res.status}).`;

    throw new Error(msg);
  }

  return res.json();
}

async function fetchAllClosedPRs(signal) {
  const all = [];
  let page = 1;

  while (true) {
    const batch = await fetchPRPage(page, signal);
    all.push(...batch);

    if (batch.length < PER_PAGE) break;
    page++;
  }

  return all;
}

const labelName = (label) => (typeof label === "string" ? label : (label?.name ?? ""));

function aggregateContributors(prs) {
  const map = new Map();

  for (const pr of prs) {
    if (!pr.merged_at) continue;

    const labels = (pr.labels ?? []).map(labelName);

    if (!labels.map((l) => l.toLowerCase()).includes(APPROVED_LABEL)) continue;

    const { login, avatar_url, html_url } = pr.user ?? {};
    if (!login) continue;

    const prPoints = calculatePrPoints(labels);

    if (map.has(login)) {
      const entry = map.get(login);
      entry.points += prPoints;
      entry.prs += 1;
    } else {
      map.set(login, {
        username: login,
        name: pr.user?.name ?? login,
        avatar: avatar_url ?? `https://avatars.githubusercontent.com/${encodeURIComponent(login)}`,
        profile: html_url ?? `https://github.com/${encodeURIComponent(login)}`,
        points: prPoints,
        prs: 1,
      });
    }
  }

  return [...map.values()].sort((a, b) => b.points - a.points);
}

export async function fetchLeaderboardData(forceRefresh = false, signal) {
  if (!forceRefresh) {
    const cached = readCache();
    if (cached) {
      return cached.data;
    }
  }

  logger.log("[Leaderboard] Fetching merged PRs from GitHub API…");
  const allPRs = await fetchAllClosedPRs(signal);
  logger.log(`[Leaderboard] Fetched ${allPRs.length} closed PRs`);

  const contributors = aggregateContributors(allPRs);
  logger.log(`[Leaderboard] ${contributors.length} approved contributors found`);

  writeCache(contributors);

  return contributors;
}

export function getCacheTimestamp() {
  const cached = readCache();
  return cached ? new Date(cached.timestamp).toISOString() : null;
}

export function clearLeaderboardCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore localStorage errors
  }
}
