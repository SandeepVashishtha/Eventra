import { useMemo } from "react";

import {
  calculateRecommendationScore,
} from "../utils/recommendationEngine";

import {
  getUserProfile,
} from "../utils/userProfileAnalyzer";

const useRecommendations = (
  events = []
) => {

  const recommendations =
    useMemo(() => {

      const userProfile =
        getUserProfile();

      return events
        .map((event) => {

          const result =
            calculateRecommendationScore(
              event,
              userProfile
            );

          return {
            ...event,
            recommendationScore:
              result.score,
            recommendationReasons:
              result.reasons,
          };

        })

        .sort(
          (a, b) =>
            b.recommendationScore -
            a.recommendationScore
        );

    }, [events]);

  return recommendations;

};

export default useRecommendations;