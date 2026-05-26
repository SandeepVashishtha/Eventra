const STORAGE_KEY = "eventRegistrations";

const normalizeEmail = (email) =>
  (email || "").trim().toLowerCase();

const readRegistrations = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.warn("Failed to parse eventRegistrations from localStorage.", error);
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
  const eventEmails = Array.isArray(registrations[eventId])
    ? registrations[eventId]
    : [];

  return eventEmails.includes(normalizedEmail);
};

export const saveRegistration = (eventId, email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!eventId || !normalizedEmail) {
    return;
  }

  const registrations = readRegistrations();
  const eventEmails = Array.isArray(registrations[eventId])
    ? registrations[eventId]
    : [];

  if (!eventEmails.includes(normalizedEmail)) {
    registrations[eventId] = [...eventEmails, normalizedEmail];
    writeRegistrations(registrations);
  }
};
