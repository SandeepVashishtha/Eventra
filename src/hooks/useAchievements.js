import { useState, useCallback } from "react";
import { apiUtils, API_ENDPOINTS } from "../config/api";
import { useAuth } from "../context/AuthContext";

export function useAchievements() {
  const { token } = useAuth();
  const [achievements, setAchievements] = useState({
    totalEvents: 0, gssocEvents: 0, currentStreak: 0, badges: [],
  });

  const fetchAchievements = useCallback(async () => {
    if (!token) return;
    // const t = token;
    const endpoint = API_ENDPOINTS?.USERS?.ACHIEVEMENTS;
    if (!endpoint) return;
    try {
      const res = await apiUtils.get(endpoint);
      setAchievements(res.data);
    } catch (err) {
      console.error("[useAchievements] Error fetching:", err);
    }
  }, [token]);

  return { achievements, fetchAchievements };
}
