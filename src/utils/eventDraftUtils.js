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
  const diff = Math.floor((Date.now() - new Date(isoTimestamp)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(isoTimestamp).toLocaleDateString();
};

export const createDuplicateDraft = (sourceEvent) => {
  const parseISODate = (dateValue) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const startDate = sourceEvent.startDate || sourceEvent.date;
  const endDate = sourceEvent.endDate || sourceEvent.date || sourceEvent.startDate;
  const parsedStartDate = parseISODate(startDate);
  const parsedEndDate = parseISODate(endDate);
  const isMultiDay = parsedStartDate && parsedEndDate && parsedStartDate !== parsedEndDate;

  const locationData = sourceEvent.location || {};

  return {
    title: sourceEvent.title ? `Copy of ${sourceEvent.title}` : "",
    description: sourceEvent.description || "",
    category: sourceEvent.category || "",
    isMultiDay,
    date: isMultiDay ? "" : parsedStartDate,
    startDate: isMultiDay ? parsedStartDate : "",
    endDate: isMultiDay ? parsedEndDate : "",
    startTime: formatTime(startDate),
    endTime: formatTime(endDate),
    timezone: sourceEvent.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    location: {
      name: typeof locationData === "string" ? locationData : locationData.name || "",
      address: typeof locationData === "string" ? "" : locationData.address || "",
      coordinates: {
        latitude:
          typeof locationData === "string"
            ? ""
            : locationData.coordinates?.latitude ?? "",
        longitude:
          typeof locationData === "string"
            ? ""
            : locationData.coordinates?.longitude ?? "",
      },
    },
    isVirtual: Boolean(sourceEvent.virtualLink),
    virtualLink: sourceEvent.virtualLink || "",
    capacity: sourceEvent.capacity != null ? sourceEvent.capacity : "",
    isPublic: sourceEvent.isPublic ?? true,
    requiresApproval: sourceEvent.requiresApproval ?? false,
    registrationStart: sourceEvent.registrationStart
      ? parseISODate(sourceEvent.registrationStart)
      : "",
    registrationEnd: sourceEvent.registrationEnd
      ? parseISODate(sourceEvent.registrationEnd)
      : "",
    tags: Array.isArray(sourceEvent.tags) ? sourceEvent.tags : [],
    ticketTiers: Array.isArray(sourceEvent.ticketTiers)
      ? sourceEvent.ticketTiers.map((tier) => ({
        name: tier.name || "",
        price: tier.price ?? 0,
        capacity: tier.capacity ?? "",
        description: tier.description || "",
      }))
      : [
        {
          name: "General Admission",
          price: 0,
          capacity: "",
          description: "Standard event access",
        },
      ],
    banner: null,
    bannerPreview: sourceEvent.image || sourceEvent.banner || "",
  };
};