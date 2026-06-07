import { apiUtils, API_ENDPOINTS } from "../config/api";
import {
  getPersonalizedEventScores,
  getTrendingRecommendations,
} from "./EventScoringService";
import {
  buildUserInterestProfile,
  getStoredPreferences,
  saveStoredPreferences,
} from "../utils/UserInterestTracker";
import mockEvents from "../Pages/Events/eventsMockData.json";
import mockHackathons from "../Pages/Hackathons/hackathonMockData.json";

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.recommendations)) return payload.recommendations;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.events)) return payload.events;
  return [];
};

export const fetchRecommendationsFromApi = async (params = {}) => {
  const endpoint = API_ENDPOINTS.RECOMMENDATIONS?.ALL;
  if (!endpoint || endpoint.includes("undefined")) {
    throw new Error("Recommendations API is not configured");
  }

  const query = new URLSearchParams();
  if (params.limit) query.set("limit", String(params.limit));
  if (params.type) query.set("type", params.type);

  const url = query.toString() ? `${endpoint}?${query}` : endpoint;
  const response = await apiUtils.get(url);
  return normalizeList(response.data);
};

export const fetchTrendingFromApi = async (params = {}) => {
  const endpoint = API_ENDPOINTS.RECOMMENDATIONS?.TRENDING;
  if (!endpoint || endpoint.includes("undefined")) {
    throw new Error("Trending recommendations API is not configured");
  }

  const query = new URLSearchParams();
  if (params.limit) query.set("limit", String(params.limit));
  if (params.location) query.set("location", params.location);

  const url = query.toString() ? `${endpoint}?${query}` : endpoint;
  const response = await apiUtils.get(url);
  return normalizeList(response.data);
};

export const saveUserPreferencesToApi = async (preferences = {}) => {
  const endpoint = API_ENDPOINTS.USERS?.PREFERENCES;
  const merged = saveStoredPreferences(preferences);

  if (!endpoint || endpoint.includes("undefined")) {
    return { savedRemotely: false, preferences: merged };
  }

  try {
    await apiUtils.post(endpoint, merged);
    return { savedRemotely: true, preferences: merged };
  } catch {
    return { savedRemotely: false, preferences: merged };
  }
};

export const getLocalRecommendations = ({
  events = mockEvents,
  hackathons = mockHackathons,
  limit = 8,
  includeInteracted = false,
} = {}) => {
  const interestProfile = buildUserInterestProfile();
  return getPersonalizedEventScores({
    events,
    hackathons,
    limit,
    includeInteracted,
    userProfile: interestProfile.preferences,
    interactions: interestProfile.interactions,
  });
};

export const getLocalTrending = ({
  events = mockEvents,
  limit = 6,
  location,
} = {}) => {
  const { preferences } = buildUserInterestProfile();
  return getTrendingRecommendations({
    events,
    location: location || preferences.location,
    limit,
  });
};

export const getRecommendations = async (options = {}) => {
  const { limit = 8, fallbackEvents = mockEvents, fallbackHackathons = mockHackathons } =
    options;

  try {
    const apiResults = await fetchRecommendationsFromApi({ limit });
    if (apiResults.length > 0) {
      return { recommendations: apiResults, source: "api" };
    }
  } catch {
    // Fall through to local scoring.
  }

  return {
    recommendations: getLocalRecommendations({
      events: fallbackEvents,
      hackathons: fallbackHackathons,
      limit,
    }),
    source: "local",
  };
};

export const getTrending = async (options = {}) => {
  const { limit = 6, fallbackEvents = mockEvents, location } = options;

  try {
    const apiResults = await fetchTrendingFromApi({ limit, location });
    if (apiResults.length > 0) {
      return { trending: apiResults, source: "api" };
    }
  } catch {
    // Fall through to local scoring.
  }

  return {
    trending: getLocalTrending({ events: fallbackEvents, limit, location }),
    source: "local",
  };
};

export const getRecommendationContext = () => ({
  preferences: getStoredPreferences(),
  ...buildUserInterestProfile(),
});
