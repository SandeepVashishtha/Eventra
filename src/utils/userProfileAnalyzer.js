import { safeJsonParse } from "../utils/safeJsonParse.js";
export const getUserProfile = () => {
  const storage =
    typeof window !== "undefined" && window.localStorage
      ? window.localStorage
      : globalThis.localStorage;

  if (!storage) {
    return {
      interests: [],
      techStack: [],
      eventTypes: [],
      level: "Beginner",
    };
  }

  let saved = {};
  try {
    saved = safeJsonParse(storage.getItem("eventra_user_profile"), {}) || {};
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
