import { safeJsonParse } from "./safeJsonParse.js";
import { safeGetItem, safeSetItem, safeRemoveItem } from "./safeStorage.js";


const STORAGE_KEY = "event_creation_draft";

export const saveDraft = (formData) => {
  try {
    safeSetItem(STORAGE_KEY, JSON.stringify(formData));
  } catch (error) {
    console.error("Error saving draft:", error);
  }
};

export const getDraft = () => {
  try {
    const draft = safeGetItem(STORAGE_KEY);

    return draft ? safeJsonParse(draft, {}) : null;
  } catch (error) {
    console.error("Error loading draft:", error);
    return null;
  }
};

export const clearDraft = () => {
  try {
    safeRemoveItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing draft:", error);
  }
};
