import { safeJsonParse } from "./safeJsonParse.js";

const STORAGE_KEY = "event_creation_draft";

const isStorageAvailable = () => {
  return typeof window !== "undefined" && !!window.localStorage;
};

export const saveDraft = (formData) => {
  if (!isStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  } catch (error) {
    console.error("Error saving draft:", error);
  }
};

export const getDraft = () => {
  if (!isStorageAvailable()) return null;
  try {
    const draft = localStorage.getItem(STORAGE_KEY);
    return draft ? safeJsonParse(draft, null) : null;
  } catch (error) {
    console.error("Error loading draft:", error);
    return null;
  }
};

export const clearDraft = () => {
  if (!isStorageAvailable()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing draft:", error);
  }
};
