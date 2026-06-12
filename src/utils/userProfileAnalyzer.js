import { safeJsonParse } from "../utils/safeJsonParse";
export const getUserProfile = () => {
  let saved = {};
  try {
    saved = safeJsonParse(localStorage.getItem("eventra_user_profile")) || {};
  } catch {
    saved = {};
  }

  return {
    interests: saved.interests || [],

    techStack: saved.techStack || [],

    eventTypes: saved.eventTypes || [],

    level: saved.level || "Beginner",
  };
};
