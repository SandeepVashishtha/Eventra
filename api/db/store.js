// api/db/store.js

// Shared in-memory databases for backend serverless functions
// These persist in process memory during a single process lifetime (e.g. tests or local dev server)
export const registrations = new Map(); // registrationId (UUID) -> registration object
export const scanLogs = []; // Array of audit logs for check-in attempts
export const eventOwnership = new Map(); // eventId -> organizer userId (lazy initialized for mocks)
