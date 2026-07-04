import { safeJsonParse } from "../utils/safeJsonParse";
export const getUserProfile = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    return {
      interests: [],
      techStack: [],
      eventTypes: [],
      level: "Beginner",
    };
  }

  let saved = {};
  try {
    saved = safeJsonParse(localStorage.getItem("eventra_user_profile"), {}) || {};
  } catch {
    saved = {};
  }

  return {
    interests:
      saved.interests || [],

    techStack:
      saved.techStack || [],

    eventTypes:
      saved.eventTypes || [],

    level:
      saved.level || "Beginner",
  };
};