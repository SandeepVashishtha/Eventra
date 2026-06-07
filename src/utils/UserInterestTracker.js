import { safeJsonParse } from "./safeJsonParse";
import { buildInteractionProfile } from "./recommendationEngine";

export const USER_PROFILE_KEY = "eventra_user_profile";
export const USER_INTERACTIONS_KEY = "eventra_user_interactions";
export const PROFILE_UPDATED_EVENT = "userProfileUpdated";
export const INTERACTIONS_UPDATED_EVENT = "userInteractionsUpdated";

const DEFAULT_INTERACTIONS = {
  viewedEvents: [],
  registeredEvents: [],
  bookmarkedEvents: [],
  hackathonParticipation: [],
};

const readStorage = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    return safeJsonParse(window.localStorage.getItem(key), fallback);
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota errors.
  }
};

const toTrackedEvent = (event = {}) => ({
  id: event.id,
  title: event.title,
  category: event.category || event.type,
  type: event.type || event.category,
  tags: event.tags || [],
  location: event.location,
  date: event.date,
  attendees: event.attendees,
  maxAttendees: event.maxAttendees,
  level: event.level,
  trackedAt: new Date().toISOString(),
});

const upsertTrackedEvent = (list = [], event, max = 30) => {
  const entry = toTrackedEvent(event);
  const filtered = list.filter((item) => String(item.id) !== String(entry.id));
  return [entry, ...filtered].slice(0, max);
};

export const getStoredPreferences = () => {
  const saved = readStorage(USER_PROFILE_KEY, {});
  return {
    interests: saved.interests || [],
    techStack: saved.techStack || [],
    eventTypes: saved.eventTypes || [],
    level: saved.level || "Beginner",
    location: saved.location || "",
  };
};

export const saveStoredPreferences = (preferences = {}) => {
  const current = getStoredPreferences();
  const merged = { ...current, ...preferences };
  writeStorage(USER_PROFILE_KEY, merged);
  window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, { detail: merged }));
  return merged;
};

export const getStoredInteractions = () => {
  const stored = readStorage(USER_INTERACTIONS_KEY, DEFAULT_INTERACTIONS);
  return { ...DEFAULT_INTERACTIONS, ...stored };
};

export const saveStoredInteractions = (interactions) => {
  writeStorage(USER_INTERACTIONS_KEY, interactions);
  window.dispatchEvent(
    new CustomEvent(INTERACTIONS_UPDATED_EVENT, { detail: interactions })
  );
  return interactions;
};

export const trackEventView = (event) => {
  if (!event?.id) return getStoredInteractions();
  const current = getStoredInteractions();
  const updated = {
    ...current,
    viewedEvents: upsertTrackedEvent(current.viewedEvents, event),
  };
  return saveStoredInteractions(updated);
};

export const trackEventRegistration = (event) => {
  if (!event?.id) return getStoredInteractions();
  const current = getStoredInteractions();
  const updated = {
    ...current,
    registeredEvents: upsertTrackedEvent(current.registeredEvents, event),
  };
  return saveStoredInteractions(updated);
};

export const trackEventBookmark = (event) => {
  if (!event?.id) return getStoredInteractions();
  const current = getStoredInteractions();
  const updated = {
    ...current,
    bookmarkedEvents: upsertTrackedEvent(current.bookmarkedEvents, event),
  };
  return saveStoredInteractions(updated);
};

export const trackHackathonParticipation = (hackathon) => {
  if (!hackathon?.id) return getStoredInteractions();
  const current = getStoredInteractions();
  const updated = {
    ...current,
    hackathonParticipation: upsertTrackedEvent(
      current.hackathonParticipation,
      hackathon
    ),
  };
  return saveStoredInteractions(updated);
};

export const buildUserInterestProfile = () => {
  const preferences = getStoredPreferences();
  const interactions = getStoredInteractions();

  const interactionProfile = buildInteractionProfile({
    registeredEvents: interactions.registeredEvents,
    bookmarkedEvents: interactions.bookmarkedEvents,
    viewedEvents: interactions.viewedEvents,
    location: preferences.location,
  });

  return {
    preferences,
    interactions,
    interactionProfile,
  };
};

export const subscribeToInterestUpdates = (callback) => {
  if (typeof window === "undefined") return () => {};

  const handler = () => callback(buildUserInterestProfile());
  window.addEventListener(PROFILE_UPDATED_EVENT, handler);
  window.addEventListener(INTERACTIONS_UPDATED_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(PROFILE_UPDATED_EVENT, handler);
    window.removeEventListener(INTERACTIONS_UPDATED_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
};
