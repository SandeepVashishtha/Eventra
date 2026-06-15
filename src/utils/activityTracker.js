import { safeJsonParse } from "./safeJsonParse.js";
import { logger } from "./logger.js";
import { syncSecureStorage } from "./secureStorage.js";

let isUpdating = false;
let interestQueue = [];
const MAX_QUEUE_SIZE = 100;

// Helper to check if localStorage is available and writable
const isStorageAvailable = () => {
  try {
    const testKey = "__storage_test__";
    if (typeof localStorage === "undefined" || typeof localStorage.setItem !== "function") {
      return false;
    }
    localStorage.setItem(testKey, testKey);
    if (typeof localStorage.removeItem === "function") {
      localStorage.removeItem(testKey);
    }
    return true;
  } catch {
    return false;
  }
};

// Deep Fix & Refactor: Extracted fetch logic to its own function to pass CodeScene Complexity limits
const fetchUserProfile = async () => {
  try {
    const raw = await syncSecureStorage.getItemAsync("eventra_user_profile");
    return raw ? (safeJsonParse(raw, {}) || {}) : {};
  } catch (error) {
    logger.warn("Failed to parse user profile JSON, resetting it:", error);
    return {};
  }
};

const processInterestQueue = async () => {
  if (isUpdating || interestQueue.length === 0) return;
  if (!isStorageAvailable()) {
    interestQueue = [];
    return;
  }
  isUpdating = true;

  try {
    // Uses the new helper to reduce nesting
    const existing = await fetchUserProfile();
    let interests = existing.interests || [];
    let modified = false;

    while (interestQueue.length > 0) {
      const interest = interestQueue.shift();
      if (!interests.includes(interest)) {
        interests.push(interest);
        modified = true;
      }
    }

    if (interests.length > 50) {
      interests = interests.slice(-50);
      modified = true;
    }

    if (modified) {
      // Prevents the Read-Modify-Write race condition cleanly using the helper
      const freshExisting = await fetchUserProfile();
      await syncSecureStorage.setItem(
        "eventra_user_profile",
        JSON.stringify({ ...freshExisting, interests })
      );
    }
  } catch (error) {
    logger.error("Failed to update user interests:", error);
    interestQueue = [];
  } finally {
    isUpdating = false;
    if (interestQueue.length > 0) {
      processInterestQueue();
    }
  }
};

export const trackUserInterest = (interest) => {
  if (typeof interest !== "string" || !interest.trim() || interest.length > 100) return;
  if (interestQueue.length >= MAX_QUEUE_SIZE) {
    interestQueue.shift(); 
  }
  interestQueue.push(interest.trim());
  processInterestQueue();
};

export const clearActivityHistory = () => {
  try {
    interestQueue = [];
    if (isStorageAvailable()) {
      syncSecureStorage.removeItem("eventra_user_profile");
    }
  } catch (error) {
    logger.error("Failed to clear activity history:", error);
  }
};