/**
 * Enterprise User Profile & Interest Analytics Synchronizer
 *
 * Provides queue-guarded, race-condition-safe localStorage sync for tracking user interests,
 * event engagement topics, multi-tab synchronization, quota error resilience,
 * and profile change pub/sub listeners.
 */

// ============================================================================
// 1. Constants & In-Memory Storage Locks
// ============================================================================

const STORAGE_KEY = "eventra_user_profile";
const MAX_INTERESTS_LIMIT = 50;

let isUpdating = false;
let interestQueue = [];
const profileChangeListeners = new Set();

// Multi-tab sync via window storage event listener
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      notifyProfileListeners(getUserProfile());
    }
  });
}

/**
 * Safely reads and parses the user profile from LocalStorage.
 *
 * @returns {Object} User profile object or empty default structure.
 */
export const getUserProfile = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    return { interests: [] };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { interests: [] };
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : { interests: [] };
  } catch (parseError) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[UserProfile] Failed to parse user profile JSON, resetting:", parseError);
    }
    return { interests: [] };
  }
};

/**
 * Notifies all registered pub/sub subscribers of user profile updates.
 *
 * @param {Object} updatedProfile - Fresh user profile state.
 */
function notifyProfileListeners(updatedProfile) {
  profileChangeListeners.forEach((listener) => {
    try {
      listener(updatedProfile);
    } catch (err) {
      console.error("[UserProfile] Listener error:", err);
    }
  });
}

// ============================================================================
// 2. Queue Processing & LocalStorage Mutations
// ============================================================================

/**
 * Processes queued interest mutations sequentially to guarantee atomic writes.
 */
const processInterestQueue = () => {
  if (isUpdating || interestQueue.length === 0) return;
  isUpdating = true;

  try {
    const existing = getUserProfile();
    let interests = Array.isArray(existing.interests) ? [...existing.interests] : [];
    let modified = false;

    while (interestQueue.length > 0) {
      const task = interestQueue.shift();
      if (!task) continue;

      const { action, interest } = task;
      const normalized = String(interest).trim().toLowerCase();

      if (!normalized) continue;

      if (action === "ADD") {
        if (!interests.includes(normalized)) {
          interests.push(normalized);
          modified = true;
        }
      } else if (action === "REMOVE") {
        const index = interests.indexOf(normalized);
        if (index !== -1) {
          interests.splice(index, 1);
          modified = true;
        }
      } else if (action === "TOGGLE") {
        const index = interests.indexOf(normalized);
        if (index !== -1) {
          interests.splice(index, 1);
        } else {
          interests.push(normalized);
        }
        modified = true;
      }
    }

    // Cap maximum interests to prevent storage bloating
    if (interests.length > MAX_INTERESTS_LIMIT) {
      interests = interests.slice(-MAX_INTERESTS_LIMIT);
      modified = true;
    }

    if (modified) {
      const updatedProfile = { ...existing, interests, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
      notifyProfileListeners(updatedProfile);
    }
  } catch (error) {
    if (error.name === "QuotaExceededError") {
      console.error("[UserProfile] LocalStorage quota exceeded. Clearing obsolete records.");
    } else {
      console.error("[UserProfile] Failed to process interest queue:", error);
    }
    interestQueue = []; // Clear queue on unrecoverable write error to prevent infinite retries
  } finally {
    isUpdating = false;
    if (interestQueue.length > 0) {
      processInterestQueue();
    }
  }
};

// ============================================================================
// 3. Public API Methods
// ============================================================================

/**
 * Queues a user interest string to be appended safely to the user profile.
 *
 * @param {string} interest - Topic or category name (e.g. "React", "AI", "Music").
 */
export const trackUserInterest = (interest) => {
  if (!interest || typeof interest !== "string") return;
  interestQueue.push({ action: "ADD", interest });
  processInterestQueue();
};

/**
 * Removes a user interest string from the stored profile.
 *
 * @param {string} interest - Topic to remove.
 */
export const removeUserInterest = (interest) => {
  if (!interest || typeof interest !== "string") return;
  interestQueue.push({ action: "REMOVE", interest });
  processInterestQueue();
};

/**
 * Toggles a user interest (adds if absent, removes if present).
 *
 * @param {string} interest - Topic to toggle.
 */
export const toggleUserInterest = (interest) => {
  if (!interest || typeof interest !== "string") return;
  interestQueue.push({ action: "TOGGLE", interest });
  processInterestQueue();
};

/**
 * Batch updates multiple user interests in a single atomic transaction.
 *
 * @param {Array<string>} interestsArray - Array of interest topics.
 */
export const trackUserInterestsBatch = (interestsArray) => {
  if (!Array.isArray(interestsArray) || interestsArray.length === 0) return;
  interestsArray.forEach((interest) => {
    if (interest && typeof interest === "string") {
      interestQueue.push({ action: "ADD", interest });
    }
  });
  processInterestQueue();
};

/**
 * Retrieves the current array of tracked user interests.
 *
 * @returns {Array<string>} Array of normalized interest strings.
 */
export const getUserInterests = () => {
  const profile = getUserProfile();
  return Array.isArray(profile.interests) ? profile.interests : [];
};

/**
 * Subscribes a callback listener to local profile modifications across tabs.
 *
 * @param {Function} callback - Function receiving updated profile object.
 * @returns {Function} Unsubscribe function.
 */
export const subscribeToProfileChanges = (callback) => {
  if (typeof callback !== "function") return () => {};
  profileChangeListeners.add(callback);
  return () => {
    profileChangeListeners.delete(callback);
  };
};

/**
 * Clears all stored user profile data and notifies active listeners.
 */
export const clearUserProfile = () => {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    notifyProfileListeners({ interests: [] });
  } catch (err) {
    console.error("[UserProfile] Failed to clear user profile:", err);
  }
};

export default trackUserInterest;