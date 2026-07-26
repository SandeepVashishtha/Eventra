/**
 * registrationGuard.js
 * Prevents duplicate event registrations by tracking and validating
 * registration attempts on the client side.
 */

const REGISTRY_KEY = "eventra_registrations";

// 🔥 FIX: single SSR guard, reused by getRegistry / saveRegistry.
const isStorageAvailable = () =>
  typeof window !== "undefined" && Boolean(window.localStorage);

const getRegistry = () => {
  if (!isStorageAvailable()) return {};
  try {
    return JSON.parse(window.localStorage.getItem(REGISTRY_KEY) || "{}");
  } catch {
    return {};
  }
};

const saveRegistry = (registry) => {
  if (!isStorageAvailable()) return false;
  try {
    window.localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
    return true;
  } catch {
    return false;
  }
};

export const isAlreadyRegistered = (userId, eventId) => {
  if (!userId || !eventId) return false;
  const registry = getRegistry();
  const key = `${userId}_${eventId}`;
  return Boolean(registry[key]);
};

export const recordRegistration = (userId, eventId, metadata = {}) => {
  if (!userId || !eventId) return false;
  const registry = getRegistry();
  const key = `${userId}_${eventId}`;
  if (registry[key]) return false;
  registry[key] = {
    userId,
    eventId,
    registeredAt: new Date().toISOString(),
    ...metadata,
  };
  return saveRegistry(registry);
};

export const cancelRegistration = (userId, eventId) => {
  if (!userId || !eventId) return false;
  const registry = getRegistry();
  const key = `${userId}_${eventId}`;
  if (!registry[key]) return false;
  delete registry[key];
  return saveRegistry(registry);
};

export const getUserRegistrations = (userId) => {
  if (!userId) return [];
  const registry = getRegistry();
  return Object.values(registry).filter((r) => r.userId === userId);
};

export const getEventRegistrationCount = (eventId) => {
  if (!eventId) return 0;
  const registry = getRegistry();
  return Object.values(registry).filter((r) => r.eventId === eventId).length;
};

export const validateRegistration = (userId, eventId, maxAttendees = null) => {
  if (!userId) return { valid: false, message: "User not authenticated" };
  if (!eventId) return { valid: false, message: "Invalid event" };

  if (isAlreadyRegistered(userId, eventId)) {
    return { valid: false, message: "You are already registered for this event" };
  }

  if (maxAttendees !== null) {
    const count = getEventRegistrationCount(eventId);
    if (count >= maxAttendees) {
      return { valid: false, message: "This event is fully booked" };
    }
  }

  return { valid: true, message: "" };
};
