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
  if (!formData) {
    clearDraft();
    return true;
  }
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
    if (parsed && typeof parsed === "object" && "data" in parsed && "savedAt" in parsed) {
      if (parsed.data === null) return null;
      return parsed;
    }
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
  const diff = Math.max(0, Math.floor((Date.now() - new Date(isoTimestamp)) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(isoTimestamp).toLocaleDateString();
};

// --- Multi-draft API (consumed by EventDraftForm) ---

const DRAFTS_STORAGE_KEY = "eventra_event_drafts";

export const getEventDrafts = () => {
  if (!isStorageAvailable()) return [];
  try {
    const storedDrafts = localStorage.getItem(DRAFTS_STORAGE_KEY);
    if (!storedDrafts) return [];
    const drafts = safeJsonParse(storedDrafts, []);
    return Array.isArray(drafts) ? drafts : [];
  } catch (error) {
    console.error("Failed to load event drafts:", error);
    return [];
  }
};

const saveEventDrafts = (drafts) => {
  if (!isStorageAvailable()) return drafts;
  try {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
  } catch (error) {
    console.error("Failed to save event drafts:", error);
  }
  return drafts;
};

export const saveEventDraft = (eventData = {}) => {
  const drafts = getEventDrafts();
  const now = new Date().toISOString();
  const draft = {
    ...eventData,
    id: eventData.id || `draft-${Date.now()}`,
    status: "draft",
    createdAt: eventData.createdAt || now,
    updatedAt: now,
  };
  return saveEventDrafts([draft, ...drafts.filter((item) => item.id !== draft.id)]);
};

export const updateEventDraft = (draftId, eventData = {}) => {
  if (!draftId) return getEventDrafts();
  const drafts = getEventDrafts();
  const updatedDrafts = drafts.map((draft) =>
    draft.id === draftId
      ? {
          ...draft,
          ...eventData,
          id: draft.id,
          status: "draft",
          updatedAt: new Date().toISOString(),
        }
      : draft
  );
  return saveEventDrafts(updatedDrafts);
};

export const getEventDraft = (draftId) => {
  if (!draftId) return null;
  return getEventDrafts().find((draft) => draft.id === draftId) || null;
};

export const deleteEventDraft = (draftId) => {
  if (!draftId) return getEventDrafts();
  return saveEventDrafts(getEventDrafts().filter((draft) => draft.id !== draftId));
};

export const publishEventDraft = (draftId) => {
  const draft = getEventDraft(draftId);
  if (!draft) return null;
  const publishedEvent = {
    ...draft,
    status: "published",
    publishedAt: new Date().toISOString(),
  };
  deleteEventDraft(draftId);
  return publishedEvent;
};