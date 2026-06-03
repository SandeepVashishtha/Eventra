// 🔥 FIX: In-memory queue and lock to prevent localStorage race conditions
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
  } catch (e) {
    return false;
  }
};

const processInterestQueue = () => {
  if (isUpdating || interestQueue.length === 0) return;
  if (!isStorageAvailable()) {
    // If localStorage is unavailable, clear the queue to prevent memory leak
    interestQueue = [];
    return;
  }
  isUpdating = true;

  try {
    let existing = {};
    try {
      const raw = localStorage.getItem("eventra_user_profile");
      if (raw) {
        existing = JSON.parse(raw) || {};
      }
    } catch (parseError) {
      console.warn("Failed to parse user profile JSON, resetting it:", parseError);
    }

    let interests = existing.interests || [];
    let modified = false;

    while (interestQueue.length > 0) {
      const interest = interestQueue.shift();
      if (!interests.includes(interest)) {
        interests.push(interest);
        modified = true;
      }
    }

    // Keep interests size reasonable
    if (interests.length > 50) {
      interests = interests.slice(-50);
      modified = true;
    }

    if (modified) {
      localStorage.setItem(
        "eventra_user_profile",
        JSON.stringify({ ...existing, interests })
      );
    }
  } catch (error) {
    console.error("Failed to update user interests:", error);
    interestQueue = []; // Clear the queue on persistent error to avoid infinite recursion
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
    interestQueue.shift(); // Evict oldest entry
  }
  interestQueue.push(interest.trim());
  processInterestQueue();
};

export const clearActivityHistory = () => {
  try {
    interestQueue = [];
    if (isStorageAvailable()) {
      localStorage.removeItem("eventra_user_profile");
    }
  } catch (error) {
    console.error("Failed to clear activity history:", error);
  }
};