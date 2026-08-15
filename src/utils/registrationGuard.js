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
  if (!isStorageAvailable()) {
    console.warn("[RegistrationGuard] localStorage not available - registration state not persisted");
    return false;
  }
  try {
    window.localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
    return true;
  } catch (error) {
    console.warn("[RegistrationGuard] Failed to persist registration state:", error.message);
    return false;
  }
};

export const isAlreadyRegistered = (userId, eventId) => {
  if (!userId || !eventId) return false;
  const registry = getRegistry();
  const key = `${userId}_${eventId}`;
  return Boolean(registry[key]);
};

const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

const sanitizeMetadata = (metadata) => {
  if (!metadata || typeof metadata !== "object") return {};
  const clean = {};
  for (const key of Object.keys(metadata)) {
    if (!DANGEROUS_KEYS.has(key)) {
      clean[key] = metadata[key];
    }
  }
  return clean;
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
    ...sanitizeMetadata(metadata),
  };
  const persisted = saveRegistry(registry);
  if (!persisted) {
    console.warn(`[RegistrationGuard] Registration for event ${eventId} could not be persisted - state may be lost on reload`);
  }
  return persisted;
};

export const cancelRegistration = (userId, eventId) => {
  if (!userId || !eventId) return false;
  const registry = getRegistry();
  const key = `${userId}_${eventId}`;
  if (!registry[key]) return false;
  delete registry[key];
  const persisted = saveRegistry(registry);
  if (!persisted) {
    console.warn(`[RegistrationGuard] Cancellation for event ${eventId} could not be persisted - state may be inconsistent on reload`);
  }
  return persisted;
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
