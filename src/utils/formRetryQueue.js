/**
 * formRetryQueue.js
 * Saves form data to localStorage when submission fails due to network issues.
 * Allows users to retry without losing their input.
 */

const QUEUE_KEY = "eventra_form_retry_queue";
const MAX_QUEUE_SIZE = 20;
const EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// 🔥 FIX: single SSR guard, reused by every function. Previously each
// accessor called localStorage directly without a typeof window check,
// which crashed the module on any SSR import.
const isStorageAvailable = () =>
  typeof window !== "undefined" && Boolean(window.localStorage);

export const saveFormData = (formId, data) => {
  if (!isStorageAvailable()) return false;
  try {
    const queue = getQueue();
    queue[formId] = { data, savedAt: new Date().toISOString() };

    // Enforce maximum queue size by removing oldest entries
    const entries = Object.entries(queue);
    if (entries.length > MAX_QUEUE_SIZE) {
      const sorted = entries.sort(
        (a, b) => new Date(a[1].savedAt) - new Date(b[1].savedAt)
      );
      const trimmed = Object.fromEntries(sorted.slice(-MAX_QUEUE_SIZE));
      window.localStorage.setItem(QUEUE_KEY, JSON.stringify(trimmed));
    } else {
      window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    }
    return true;
  } catch {
    return false;
  }
};

export const getFormData = (formId) => {
  try {
    return getQueue()[formId] || null;
  } catch {
    return null;
  }
};

export const clearFormData = (formId) => {
  if (!isStorageAvailable()) return false;
  try {
    const queue = getQueue();
    delete queue[formId];
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    return true;
  } catch {
    return false;
  }
};

export const getQueue = () => {
  if (!isStorageAvailable()) return {};
  try {
    const queue = JSON.parse(window.localStorage.getItem(QUEUE_KEY) || "{}");
    const now = Date.now();
    let hasExpired = false;

    // Filter out expired entries
    const filtered = Object.fromEntries(
      Object.entries(queue).filter(([, entry]) => {
        const savedAt = new Date(entry.savedAt).getTime();
        if (now - savedAt > EXPIRATION_MS) {
          hasExpired = true;
          return false;
        }
        return true;
      })
    );

    // Clean up expired entries from storage
    if (hasExpired) {
      window.localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
    }

    return filtered;
  } catch {
    return {};
  }
};

export const hasSavedData = (formId) => {
  return Boolean(getFormData(formId));
};
