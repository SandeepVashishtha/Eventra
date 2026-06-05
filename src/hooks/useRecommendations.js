/**
 * @fileoverview useRecommendations - Event recommendation scoring hook
 * @module hooks/useRecommendations
 */
import { useMemo } from "react";
import { calculateRecommendationScore } from "../utils/recommendationEngine";
import { getUserProfile } from "../utils/userProfileAnalyzer";

/**
 * A custom React hook that scores and sorts events based on
 * the current user's profile and preferences.
 *
 * Uses calculateRecommendationScore to rank events and returns
 * them sorted by score descending. Malformed events are handled
 * gracefully with a score of 0.
 *
 * @param {Object[]} [events=[]] - Array of event objects to score
 *
 * @returns {Object[]} Events sorted by recommendation score descending,
 * each enriched with recommendationScore and recommendationReasons fields
 *
 * @example
 * const recommendations = useRecommendations(allEvents);
 * // recommendations[0] is the most relevant event for current user
 */

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