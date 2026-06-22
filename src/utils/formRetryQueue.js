/**
 * formRetryQueue.js
 * Saves form data to localStorage when submission fails due to network issues.
 * Allows users to retry without losing their input.
 */

const QUEUE_KEY = "eventra_form_retry_queue";

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
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
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
    return JSON.parse(window.localStorage.getItem(QUEUE_KEY) || "{}");
  } catch {
    return {};
  }
};

export const hasSavedData = (formId) => {
  return Boolean(getFormData(formId));
};
