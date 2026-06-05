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
 * Performance note: getUserProfile() reads from localStorage and always
 * constructs a new plain object, so placing the call outside useMemo meant
 * the dependency array received a different object reference on every render,
 * defeating memoization entirely. The fix wraps the profile read in its own
 * useMemo keyed on the raw localStorage string so a new profile object is
 * only produced when the stored data actually changes.
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

const USER_PROFILE_KEY = "eventra_user_profile";

const useRecommendations = (events = []) => {
  // Memoize the profile read so that getUserProfile() is only called when the
  // raw localStorage string changes. Without this wrapper getUserProfile()
  // returns a new object identity on every render (it always constructs
  // { interests:[], techStack:[], … }) causing the downstream useMemo's
  // dependency check to see a "change" on every render and re-run the full
  // map-and-sort over all events — including on every keystroke in the search
  // box or every SSE tick from the notification context.
  const userProfile = useMemo(
    () => getUserProfile(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [typeof localStorage !== "undefined" ? localStorage.getItem(USER_PROFILE_KEY) : null]
  );

  const recommendations = useMemo(() => {
    return events
      .map((event) => {
        // Wrap in try/catch so a single malformed event cannot crash the
        // entire recommendations list — return score 0 as a safe fallback.
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
