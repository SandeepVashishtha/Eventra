import { safeGetItem } from "./safeStorage.js";
export const getUserProfile = () => {
  let saved = {};
  try {
    saved =
      JSON.parse(
        safeGetItem(
          "eventra_user_profile"
        )
      ) || {};
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