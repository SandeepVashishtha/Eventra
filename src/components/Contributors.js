import { Github, ExternalLink, GitBranch, MapPin, Building, Users, Medal } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from '../hooks/useReducedMotion';
import { ContributorCardSkeleton } from "./common/SkeletonLoaders";
import FeatureErrorBoundary from "./common/FeatureErrorBoundary";
import SEOHead from "../components/SEOHead";
import { storageManager } from "../utils/storage/storageManager";
import { STORAGE_KEYS } from "../utils/storage/storageKeys";
import { validators } from "../utils/storage/storageValidators";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";

// GitHub repo
const GITHUB_REPO = "sandeepvashishtha/Eventra";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hr
const REQUEST_TIMEOUT = 10000;
const MAX_CONTRIBUTOR_PAGES = 10;
const PROFILE_FETCH_DELAY_MS = 100; // Throttle profile API calls to avoid rate limiting

// 🔥 FIX: Correctly throttle profile fetches
let profileFetchCounter = 0;
export const throttleProfileFetch = async () => {
  profileFetchCounter++;
  if (profileFetchCounter % 5 === 0) {
    await new Promise(resolve => setTimeout(resolve, PROFILE_FETCH_DELAY_MS));
  }
};

const fetchJsonWithTimeout = async (url, options = {}) => {
  const proxyUrl = url.startsWith("https://api.github.com")
    ? `/api/github-proxy?path=${encodeURIComponent(
        url.replace("https://api.github.com", "")
      )}`
    : url;

  const { data } = await fetchWithTimeout(
    proxyUrl,
    options,
    REQUEST_TIMEOUT
  );

  return data;
};

const getRoleByGitHubActivity = (contributor) => {
  const { contributions, followers = 0, login } = contributor;
  if (login === "sandeepvashishtha") return "Project Lead";

  if (contributions > 100 && followers > 50) return "Core Maintainer";
  if (contributions > 50 && followers > 20) return "Senior Dev";
  if (contributions > 20) return "Active Contributor";
  if (contributions > 10) return "Regular Contributor";
  return "New Contributor";
};

const getCachedContributors = () => {
  const cachedData = storageManager.get(STORAGE_KEYS.GITHUB_CONTRIBUTORS, validators.isObject);
  if (!cachedData?.data || !cachedData?.timestamp) return null;
  return Date.now() - cachedData.timestamp > CACHE_DURATION ? null : cachedData.data;
};

const cacheContributors = (data) => {
  storageManager.set(STORAGE_KEYS.GITHUB_CONTRIBUTORS, { data, timestamp: Date.now() });
};

const ContributorsInner = () => {
  const prefersReducedMotion = useReducedMotion();
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const fetchControllerRef = useRef(null);
  const isFetchingRef = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (fetchControllerRef.current) fetchControllerRef.current.abort();
    };
  }, []);

  // 🔥 FIX: Merged Master's delay with Fix's AbortSignal logic
  const fetchGitHubProfile = useCallback(async (username, signal, index) => {
    // Apply Master's delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, index * PROFILE_FETCH_DELAY_MS));
    await throttleProfileFetch();

    if (!username) return { followers: 0, public_repos: 0, name: "Anonymous Contributor", bio: "Open source contributor" };

    try {
      const profile = await fetchJsonWithTimeout(`https://api.github.com/users/${username}`, { signal });
      return {
        followers: profile.followers || 0,
        public_repos: profile.public_repos || 0,
        name: profile.name || username,
        bio: profile.bio || "Open source contributor",
        company: profile.company,
        location: profile.location,
      };
    } catch {
      return { followers: 0, public_repos: 0, name: username, bio: "Open source contributor" };
    }
  }, []);

  const fetchContributors = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);

    if (fetchControllerRef.current) fetchControllerRef.current.abort();
    fetchControllerRef.current = new AbortController();
    const signal = fetchControllerRef.current.signal;

    const cached = getCachedContributors();
    if (cached) {
      if (isMounted.current) { setContributors(cached); setLoading(false); }
      isFetchingRef.current = false;
      return;
    }

    try {
      let allContributors = [];
      let page = 1;
      let hasMore = true;
      while (hasMore && page <= MAX_CONTRIBUTOR_PAGES) {
        const data = await fetchJsonWithTimeout(
          `https://api.github.com/repos/${GITHUB_REPO}/contributors?per_page=100&page=${page}&anon=true`,
          { signal }
        );
        if (!Array.isArray(data)) throw new Error("GitHub error");
        const valid = data.filter((c) => c && (c.login || c.name));
        if (valid.length === 0) hasMore = false;
        else {
          allContributors = [...allContributors, ...valid];
          hasMore = data.length === 100;
          page++;
        }
      }

      const enhanced = await Promise.all(
        allContributors.map(async (c, i) => {
          const profile = await fetchGitHubProfile(c.login, signal, i);
          return { ...c, ...profile, role: getRoleByGitHubActivity({ ...c, ...profile }) };
        })
      );

      enhanced.sort((a, b) => b.contributions - a.contributions);
      if (isMounted.current) {
        setContributors(enhanced);
        cacheContributors(enhanced);
      }
    } catch (err) {
      if (err.name !== "AbortError") setError("Unable to load contributors.");
    } finally {
      if (isMounted.current) setLoading(false);
      isFetchingRef.current = false;
    }
  }, [fetchGitHubProfile]);

  useEffect(() => { fetchContributors(); }, [fetchContributors]);

  // ... (Keep your existing UI JSX here) ...
  return <section>...</section>;
};