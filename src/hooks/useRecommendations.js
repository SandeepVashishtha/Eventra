import { useMemo } from "react";
import { calculateRecommendationScore } from "../utils/recommendationEngine";
import { getUserProfile } from "../utils/userProfileAnalyzer";

const useRecommendations = (events = []) => {

  // 🔥 FIX 1: Call getUserProfile outside useMemo so it becomes
  // a proper dependency — prevents stale recommendation results
  // when the user profile changes
  const userProfile = getUserProfile();

  const recommendations = useMemo(() => {
    return events
      .map((event) => {
        // 🔥 FIX 2: Wrap in try/catch so a single malformed event
        // cannot crash the entire recommendations list
        try {
          const result = calculateRecommendationScore(event, userProfile);
          return {
            ...event,
            recommendationScore: result.score,
            recommendationReasons: result.reasons,
          };
        } catch {
          return {
            ...event,
            recommendationScore: 0,
            recommendationReasons: [],
          };
        }
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore);
  }, [events, userProfile]);

  return recommendations;
};

export default useRecommendations;