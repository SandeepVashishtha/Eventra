// ---------------------------------------------------------------------------
// Offline Event Check-In & Ticket Validation IndexedDB Storage Service
// ---------------------------------------------------------------------------
import { logger } from "./logger";

const DB_NAME = "eventra_checkin_db";
const DB_VERSION = 1;
const MANIFESTS_STORE = "manifests";
const LOGS_STORE = "checkin_logs";

/**
 * Open Promise-based IndexedDB connection for check-in manifests and logs.
 */
export const openCheckinDB = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains(MANIFESTS_STORE)) {
        db.createObjectStore(MANIFESTS_STORE, { keyPath: "eventId" });
      }

      if (!db.objectStoreNames.contains(LOGS_STORE)) {
        db.createObjectStore(LOGS_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

/**
 * Caches an event's registered attendee manifest offline.
 * @param {string} eventId - Unique ID of the event
 * @param {Array} attendees - List of attendee registrations: [{ ticketId, userName, email, ticketType }]
 */
export const saveOfflineManifest = async (eventId, attendees) => {
  try {
    const db = await openCheckinDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MANIFESTS_STORE, "readwrite");
      const store = tx.objectStore(MANIFESTS_STORE);

      const record = {
        eventId,
        attendees: attendees || [],
        cachedAt: new Date().toISOString(),
      };

      const request = store.put(record);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    logger.error(`[checkinStorage] Failed to save manifest for event ${eventId}:`, error);
    return false;
  }
};

/**
 * Retrieves the cached offline attendee manifest for a specific event.
 * @param {string} eventId
 * @returns {Promise<Object|null>} Manifest record or null if not found
 */
export const getOfflineManifest = async (eventId) => {
  try {
    const db = await openCheckinDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MANIFESTS_STORE, "readonly");
      const store = tx.objectStore(MANIFESTS_STORE);
      const request = store.get(eventId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    logger.error(`[checkinStorage] Failed to get manifest for event ${eventId}:`, error);
    return null;
  }
};

/**
 * Records a validation check-in log offline.
 * @param {string} eventId
 * @param {string} ticketId
 * @param {Object} attendee - { userName, email, ticketType }
 * @param {string} status - "SUCCESS", "DUPLICATE", "EXPIRED", "FORGED"
 * @param {string} reason - Detailed message of scan outcome
 */
export const recordCheckinLocally = async (eventId, ticketId, attendee, status, reason = "") => {
  try {
    const db = await openCheckinDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(LOGS_STORE, "readwrite");
      const store = tx.objectStore(LOGS_STORE);

      const checkinId = `${eventId}-${ticketId}`;
      const log = {
        id: checkinId,
        eventId,
        ticketId,
        userName: attendee?.userName || attendee?.fullName || "Guest",
        email: attendee?.email || "",
        ticketType: attendee?.ticketType || "General",
        status,
        reason,
        timestamp: new Date().toISOString(),
        synced: false,
      };

      const request = store.put(log);
      request.onsuccess = () => resolve(log);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    logger.error(`[checkinStorage] Failed to log check-in for ticket ${ticketId}:`, error);
    return null;
  }
};

/**
 * Retrieves all offline validation logs recorded on this device.
 * @returns {Promise<Array>} List of scan logs
 */
export const getOfflineCheckinLogs = async () => {
  try {
    const db = await openCheckinDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(LOGS_STORE, "readonly");
      const store = tx.objectStore(LOGS_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    logger.error("[checkinStorage] Failed to retrieve local check-in logs:", error);
    return [];
  }
};

/**
 * Clears cached manifests and logs from IndexedDB.
 */
export const clearCheckinDB = async () => {
  try {
    const db = await openCheckinDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction([MANIFESTS_STORE, LOGS_STORE], "readwrite");
      
      tx.objectStore(MANIFESTS_STORE).clear();
      tx.objectStore(LOGS_STORE).clear();

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return true;
  } catch (error) {
    logger.error("[checkinStorage] Failed to clear check-in database:", error);
    return false;
  }
};
