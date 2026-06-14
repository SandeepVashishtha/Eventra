import { safeJsonParse } from "./safeJsonParse.js";

const STORAGE_KEY = "eventRegistrations";

const normalizeEmail = (email) => (email || "").trim().toLowerCase();

const readRegistrations = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = safeJsonParse(data, {});
    // Migrate legacy array-based storage to Set-based storage
    const migrated = {};
    for (const [eventId, emails] of Object.entries(parsed)) {
      migrated[eventId] = Array.isArray(emails) ? [...new Set(emails)] : emails;
    }
    return migrated;
  } catch (error) {
     
    console.warn("[RegisterUtils] Failed to read registrations:", error);
    return {};
  }
};

const writeRegistrations = (registrations) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
  } catch {
    // localStorage may be unavailable or full; keep the UI functional.
  }
};



/**
 * localStorage is used here only for UX hints.
 * The backend remains the source of truth for duplicate registration checks.
 */
export const isAlreadyRegistered = (eventId, email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!eventId || !normalizedEmail) {
    return false;
  }

  const registrations = readRegistrations();
  const eventEmails = Array.isArray(registrations[eventId]) ? registrations[eventId] : [];
  const emailSet = new Set(eventEmails);

  return emailSet.has(normalizedEmail);
};

export const saveRegistration = (eventId, email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!eventId || !normalizedEmail) {
    return;
  }

  const registrations = readRegistrations();
  const eventEmails = Array.isArray(registrations[eventId]) ? registrations[eventId] : [];
  const emailSet = new Set(eventEmails);

  if (!emailSet.has(normalizedEmail)) {
    emailSet.add(normalizedEmail);
    registrations[eventId] = Array.from(emailSet);
    writeRegistrations(registrations);
  }
};
