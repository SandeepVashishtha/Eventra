import { safeJsonParse } from "./safeJsonParse.js";

const STORAGE_KEY = "event_creation_draft";

const isStorageAvailable = () => {
  try {
    return typeof localStorage !== "undefined" && localStorage !== null;
  } catch {
    return false;
  }
};

export const saveDraft = (formData) => {
  if (!isStorageAvailable()) return false;
  try {
    const payload = {
      data: formData,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error("Error saving draft:", error);
    return false;
  }
};

export const getDraft = () => {
  if (!isStorageAvailable()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = safeJsonParse(raw, null);
    if (!parsed) return null;
    // Support both old format (plain object) and new format (with savedAt)
    if (parsed.data && parsed.savedAt) return parsed;
    // Legacy: wrap old format
    return { data: parsed, savedAt: null };
  } catch (error) {
    console.error("Error loading draft:", error);
    return null;
  }
};

export const getDraftData = () => {
  const draft = getDraft();
  return draft ? draft.data : null;
};

export const getDraftTimestamp = () => {
  const draft = getDraft();
  return draft ? draft.savedAt : null;
};

export const clearDraft = () => {
  if (!isStorageAvailable()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing draft:", error);
  }
};

export const formatDraftAge = (isoTimestamp) => {
  if (!isoTimestamp) return null;
  const diff = Math.floor((Date.now() - new Date(isoTimestamp)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(isoTimestamp).toLocaleDateString();
};