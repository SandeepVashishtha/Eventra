/**
 * @fileoverview useRecommendations - Event recommendation scoring hook
 * @module hooks/useRecommendations
 */
import { useState, useEffect, useMemo } from "react";
import { calculateRecommendationScore } from "../utils/recommendationEngine";
import { buildUserInterestProfile } from "../utils/UserInterestTracker";

const USER_PROFILE_KEY = "eventra_user_profile";
const PROFILE_UPDATED_EVENT = "userProfileUpdated";

const parseProfile = (raw) => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const useRecommendations = (events = []) => {
  const [profileKey, setProfileKey] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(USER_PROFILE_KEY);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromStorage = () => {
      try {
        setProfileKey(localStorage.getItem(USER_PROFILE_KEY));
      } catch {
        setProfileKey(null);
      }
    };

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(PROFILE_UPDATED_EVENT, syncFromStorage);

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(PROFILE_UPDATED_EVENT, syncFromStorage);
    };
  }, []);

  const userProfile = useMemo(() => parseProfile(profileKey), [profileKey]);
  const interestProfile = useMemo(() => buildUserInterestProfile(), [profileKey]);

  const recommendations = useMemo(() => {
    if (!Array.isArray(events)) return [];

    return events
      .map((event) => {
        try {
          const result = calculateRecommendationScore(
            event,
            userProfile,
            interestProfile.interactionProfile
          );
          return {
            ...event,
            recommendationScore: Number.isFinite(result?.score) ? result.score : 0,
            recommendationReasons: Array.isArray(result?.reasons) ? result.reasons : [],
          };
        } catch {
          return {
            ...event,
            recommendationScore: 0,
            recommendationReasons: [],
          };
        }
      })
      .sort((a, b) => (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0));
  }, [events, userProfile, interestProfile.interactionProfile]);

  return recommendations;
};

export default useRecommendations;