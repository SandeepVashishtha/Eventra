import { safeJsonParse } from "./safeJsonParse.js";

export const getUserProfile = () => {
  const saved = safeJsonParse(
    localStorage.getItem("eventra_user_profile"),
    {},
  );

  return {
    interests: saved.interests || [],
    techStack: saved.techStack || [],
    eventTypes: saved.eventTypes || [],
    level: saved.level || "Beginner",
  };
};