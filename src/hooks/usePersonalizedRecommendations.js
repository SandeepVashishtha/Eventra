import { useCallback, useEffect, useState } from "react";
import {
  getRecommendations,
  getTrending,
} from "../services/RecommendationEngine";
import { subscribeToInterestUpdates } from "../utils/UserInterestTracker";
import mockEvents from "../Pages/Events/eventsMockData.json";
import mockHackathons from "../Pages/Hackathons/hackathonMockData.json";

const usePersonalizedRecommendations = ({
  limit = 8,
  trendingLimit = 6,
  events = mockEvents,
  hackathons = mockHackathons,
  autoFetch = true,
} = {}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState("");
  const [source, setSource] = useState("local");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [personalized, trendingResult] = await Promise.all([
        getRecommendations({
          limit,
          fallbackEvents: events,
          fallbackHackathons: hackathons,
        }),
        getTrending({
          limit: trendingLimit,
          fallbackEvents: events,
        }),
      ]);

      setRecommendations(personalized.recommendations || []);
      setTrending(trendingResult.trending || []);
      setSource(personalized.source || "local");
    } catch (err) {
      setError(err?.message || "Unable to load recommendations");
    } finally {
      setLoading(false);
    }
  }, [events, hackathons, limit, trendingLimit]);

  useEffect(() => {
    if (!autoFetch) return;
    refresh();
  }, [autoFetch, refresh]);

  useEffect(() => {
    if (!autoFetch) return undefined;
    return subscribeToInterestUpdates(() => {
      refresh();
    });
  }, [autoFetch, refresh]);

  return {
    recommendations,
    trending,
    loading,
    error,
    source,
    refresh,
  };
};

export default usePersonalizedRecommendations;
