import { apiUtils } from "../config/api";

// ============================================================================
// 1. CONFIGURATION & CONSTANTS
// ============================================================================

const STORAGE_KEY = "eventra_user_profile";
const BROADCAST_CHANNEL_NAME = "eventra_profile_sync_channel";
const BATCH_DEBOUNCE_MS = 300;
const MAX_INTERESTS_CAP = 50;
const BACKEND_SYNC_INTERVAL_MS = 1000 * 60 * 5; // 5 Minutes

// ============================================================================
// 2. SAFE STORAGE ENGINE (WITH FALLBACK)
// ============================================================================

class SafeStorageEngine {
  constructor() {
    this.memoryFallback = new Map();
    this.primaryStorageType = this.detectAvailableStorage();
  }

  detectAvailableStorage() {
    try {
      const testKey = "__storage_test__";
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return "localStorage";
    } catch (e) {
      try {
        const testKey = "__storage_test__";
        window.sessionStorage.setItem(testKey, testKey);
        window.sessionStorage.removeItem(testKey);
        return "sessionStorage";
      } catch (e2) {
        return "memory";
      }
    }
  }

  getItem(key) {
    try {
      if (this.primaryStorageType === "localStorage") {
        return window.localStorage.getItem(key);
      }
      if (this.primaryStorageType === "sessionStorage") {
        return window.sessionStorage.getItem(key);
      }
    } catch (e) {
      // Fallback on read error
    }
    return this.memoryFallback.get(key) || null;
  }

  setItem(key, value) {
    try {
      if (this.primaryStorageType === "localStorage") {
        window.localStorage.setItem(key, value);
        return;
      }
      if (this.primaryStorageType === "sessionStorage") {
        window.sessionStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      console.warn("[SafeStorage] Primary storage write failed. Falling back to in-memory store.", e);
    }
    this.memoryFallback.set(key, value);
  }

  removeItem(key) {
    try {
      if (this.primaryStorageType === "localStorage") window.localStorage.removeItem(key);
      if (this.primaryStorageType === "sessionStorage") window.sessionStorage.removeItem(key);
    } catch (e) {}
    this.memoryFallback.delete(key);
  }
}

const safeStorage = new SafeStorageEngine();

// ============================================================================
// 3. CROSS-TAB & PUB/SUB EVENT SYSTEM
// ============================================================================

const subscribers = new Set();

// Broadcast Channel for modern multi-tab sync
let broadcastChannel = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    broadcastChannel.onmessage = (event) => {
      if (event.data && event.data.type === "PROFILE_UPDATED") {
        notifySubscribers(event.data.profile, false);
      }
    };
  } catch (e) {
    broadcastChannel = null;
  }
}

// Storage event listener fallback for older browsers
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        notifySubscribers(parsed, false);
      } catch (e) {}
    }
  });
}

const notifySubscribers = (profileData, emitCrossTab = true) => {
  subscribers.forEach((callback) => {
    try {
      callback(profileData);
    } catch (e) {
      console.error("[userProfileService] Subscriber notification error:", e);
    }
  });

  if (emitCrossTab && broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: "PROFILE_UPDATED", profile: profileData });
    } catch (e) {}
  }
};

/**
 * Subscribe to profile changes across components or tabs
 * @param {Function} callback - Function called with updated profile
 * @returns {Function} Unsubscribe cleanup function
 */
export const subscribeToProfile = (callback) => {
  if (typeof callback === "function") {
    subscribers.add(callback);
  }
  return () => {
    subscribers.delete(callback);
  };
};

// ============================================================================
// 4. BATCHED QUEUE & WEIGHTED INTEREST ENGINE
// ============================================================================

let interestQueue = [];
let batchTimer = null;
let isSyncingToBackend = false;

/**
 * Normalizes raw interest string into a clean lowercase key
 */
const sanitizeInterest = (term) => {
  if (!term || typeof term !== "string") return null;
  const cleaned = term.trim().toLowerCase();
  return cleaned.length > 0 ? cleaned : null;
};

/**
 * Reads local user profile safely
 */
export const getUserProfile = () => {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        interests: Array.isArray(parsed.interests) ? parsed.interests : [],
        interestWeights: parsed.interestWeights || {},
        techStack: Array.isArray(parsed.techStack) ? parsed.techStack : [],
        eventTypes: Array.isArray(parsed.eventTypes) ? parsed.eventTypes : [],
        level: parsed.level || "Intermediate",
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      };
    }
  } catch (parseError) {
    console.warn("[userProfileService] Failed to parse user profile JSON. Re-initializing:", parseError);
  }

  return {
    interests: [],
    interestWeights: {},
    techStack: [],
    eventTypes: [],
    level: "Intermediate",
    lastUpdated: new Date().toISOString(),
  };
};

/**
 * Flushes pending queued interests into storage with weighted scores
 */
const processInterestBatch = () => {
  batchTimer = null;
  if (interestQueue.length === 0) return;

  const currentQueue = [...interestQueue];
  interestQueue = []; // Clear processing queue

  try {
    const profile = getUserProfile();
    const existingInterests = new Set(profile.interests);
    const weights = { ...profile.interestWeights };
    let modified = false;

    currentQueue.forEach((item) => {
      const sanitized = sanitizeInterest(item);
      if (!sanitized) return;

      modified = true;

      // Update interest list
      if (!existingInterests.has(sanitized)) {
        existingInterests.add(sanitized);
      }

      // Update frequency & recency weight score
      const currentWeight = weights[sanitized] || { score: 0, count: 0 };
      weights[sanitized] = {
        score: currentWeight.score + 1,
        count: currentWeight.count + 1,
        lastInteracted: new Date().toISOString(),
      };
    });

    // Keep interests size reasonable
    if (interests.length > 50) {
      interests = interests.slice(-50);
      modified = true;
    }

    if (modified) {
      // Sort interests by weight/score and apply LRU cap
      const sortedInterests = Array.from(existingInterests).sort((a, b) => {
        const scoreA = weights[a]?.score || 0;
        const scoreB = weights[b]?.score || 0;
        return scoreB - scoreA;
      });

      const cappedInterests = sortedInterests.slice(0, MAX_INTERESTS_CAP);

      const updatedProfile = {
        ...profile,
        interests: cappedInterests,
        interestWeights: weights,
        lastUpdated: new Date().toISOString(),
      };

      safeStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
      notifySubscribers(updatedProfile, true);
      scheduleBackendSync();
    }
  } catch (error) {
    console.error("[userProfileService] Failed to update user interests:", error);
  }
};

/**
 * Tracks a user interest safely with batched processing
 * @param {string} interest - Name of the interest or category
 */
export const trackUserInterest = (interest) => {
  const sanitized = sanitizeInterest(interest);
  if (!sanitized) return;

  interestQueue.push(sanitized);

  // Debounce writes to avoid disk I/O thrashing
  if (!batchTimer) {
    batchTimer = setTimeout(processInterestBatch, BATCH_DEBOUNCE_MS);
  }
};

/**
 * Removes a specific interest from the user's profile
 * @param {string} interest
 */
export const removeUserInterest = (interest) => {
  const sanitized = sanitizeInterest(interest);
  if (!sanitized) return;

  const profile = getUserProfile();
  const updatedInterests = profile.interests.filter((i) => i !== sanitized);
  
  const updatedWeights = { ...profile.interestWeights };
  delete updatedWeights[sanitized];

  const updatedProfile = {
    ...profile,
    interests: updatedInterests,
    interestWeights: updatedWeights,
    lastUpdated: new Date().toISOString(),
  };

  safeStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
  notifySubscribers(updatedProfile, true);
  scheduleBackendSync();
};

/**
 * Updates full user profile metadata
 * @param {Object} partialProfile
 */
export const updateUserProfile = (partialProfile = {}) => {
  const current = getUserProfile();
  const updatedProfile = {
    ...current,
    ...partialProfile,
    lastUpdated: new Date().toISOString(),
  };

  safeStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
  notifySubscribers(updatedProfile, true);
  scheduleBackendSync();
};

// ============================================================================
// 5. BACKEND SYNCHRONIZATION ENGINE
// ============================================================================

let syncDebounceTimer = null;

const scheduleBackendSync = () => {
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(syncProfileToBackend, 5000); // 5-second idle delay before API sync
};

/**
 * Syncs local profile vector with the backend database
 */
export const syncProfileToBackend = async () => {
  if (isSyncingToBackend) return;
  isSyncingToBackend = true;

  try {
    const profile = getUserProfile();
    await apiUtils.post("/api/user/profile/sync", {
      interests: profile.interests,
      techStack: profile.techStack,
      eventTypes: profile.eventTypes,
      level: profile.level,
      lastUpdated: profile.lastUpdated,
    });
  } catch (error) {
    console.warn("[userProfileService] Background sync to server failed. Retrying on next interaction.", error);
  } finally {
    isSyncingToBackend = false;
  }
};

/**
 * Clears user profile from local storage and subscribers
 */
export const clearUserProfile = () => {
  safeStorage.removeItem(STORAGE_KEY);
  interestQueue = [];
  notifySubscribers(getUserProfile(), true);
};