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
      Array.isArray(saved.interests) ? saved.interests : [],

    techStack:
      Array.isArray(saved.techStack) ? saved.techStack : [],

    eventTypes:
      Array.isArray(saved.eventTypes) ? saved.eventTypes : [],

    level:
      saved.level || "Beginner",
  };
};
