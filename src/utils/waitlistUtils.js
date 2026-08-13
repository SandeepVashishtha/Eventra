
import { safeJsonParse } from "./safeJsonParse.js";
import { apiUtils, API_ENDPOINTS } from "../config/api.js";
import { getApiErrorStatus } from "../config/api/errors.js";
import { logger } from "./logger.js";
import { getOrMigrateKey } from "./storageKeyManager.js";
import { syncSecureStorage } from "./secureStorage.js";
import { pushToQueue } from "./offlineQueue.js";

// CSV parsing utility for legacy waitlist import
export const parseCsvWaitlistData = (csvText) => {
  try {
    const lines = csvText.split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least one data row');
    }

    // Parse header line
    const headers = lines[0].split(',').map(header => header.trim());
    
    // Validate required columns
    const requiredColumns = ['Name', 'Email', 'Timestamp'];
    const missingColumns = requiredColumns.filter(col => 
      !headers.some(header => header.toLowerCase() === col.toLowerCase())
    );
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Map headers to standard names (case-insensitive)
    const headerMap = {};
    headers.forEach((header, index) => {
      const lowerHeader = header.toLowerCase();
      if (lowerHeader === 'name') headerMap.name = index;
      else if (lowerHeader === 'email') headerMap.email = index;
      else if (lowerHeader === 'timestamp') headerMap.timestamp = index;
    });

    const entries = [];
    
    // Process data rows (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const values = line.split(',').map(value => value.trim());
      
      // Handle CSV values that might contain commas (quote-aware parsing with escaped double-quote support)
      const parsedValues = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let ci = 0; ci < line.length; ci++) {
        const char = line[ci];
        if (char === '"') {
          if (inQuotes && ci + 1 < line.length && line[ci + 1] === '"') {
            // Escaped double-quote ("") inside a quoted field
            currentValue += '"';
            ci++; // skip the next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          parsedValues.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      parsedValues.push(currentValue.trim()); // Add last value

      if (parsedValues.length < 3) {
        throw new Error(`Invalid CSV format in line ${i + 1}: expected at least 3 columns`);
      }

      const entry = {
        name: parsedValues[headerMap.name] || '',
        email: parsedValues[headerMap.email] || '',
        timestamp: parsedValues[headerMap.timestamp] || ''
      };

      // Validate required fields
      if (!entry.name || !entry.email || !entry.timestamp) {
        throw new Error(`Missing required data in line ${i + 1}`);
      }

      entries.push(entry);
    }

    // Deduplicate rows by email (case-insensitive) so the same email isn't
    // sent twice within a single CSV import. Keep the first occurrence.
    const seenEmails = new Set();
    const dedupedEntries = [];
    for (const entry of entries) {
      const emailKey = (entry.email || '').toLowerCase().trim();
      if (!seenEmails.has(emailKey)) {
        seenEmails.add(emailKey);
        dedupedEntries.push(entry);
      }
    }

    return dedupedEntries;
  } catch (error) {
    logger.error('[WaitlistUtils] Failed to parse CSV waitlist data:', error);
    throw new Error(`Failed to parse CSV: ${error.message}`);
  }
};

// Validate parsed CSV entries before import
export const validateCsvWaitlistEntries = (entries) => {
  if (!Array.isArray(entries)) {
    throw new Error('Invalid entries format: expected array');
  }

  if (entries.length === 0) {
    throw new Error('No valid entries found in CSV');
  }

  const errors = [];
  const validEntries = [];

  entries.forEach((entry, index) => {
    try {
      // Validate required fields
      if (!entry.name || typeof entry.name !== 'string' || entry.name.trim() === '') {
        errors.push({ line: index + 2, field: 'Name', error: 'Name is required' });
        return;
      }

      if (!entry.email || typeof entry.email !== 'string' || entry.email.trim() === '') {
        errors.push({ line: index + 2, field: 'Email', error: 'Email is required' });
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(entry.email)) {
        errors.push({ line: index + 2, field: 'Email', error: 'Invalid email format' });
        return;
      }

      if (!entry.timestamp || typeof entry.timestamp !== 'string' || entry.timestamp.trim() === '') {
        errors.push({ line: index + 2, field: 'Timestamp', error: 'Timestamp is required' });
        return;
      }

      // Try to parse timestamp (ISO format expected)
      const timestamp = entry.timestamp.trim();
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        // Try additional formats
        const formats = [
          timestamp, // ISO
          timestamp.replace(' ', 'T'), // Date with space
          `${timestamp}T00:00:00Z`, // Date only
        ];
        
        let parsedSuccessfully = false;
        for (const format of formats) {
          const testDate = new Date(format);
          if (!isNaN(testDate.getTime())) {
            parsedSuccessfully = true;
            break;
          }
        }
        
        if (!parsedSuccessfully) {
          errors.push({ line: index + 2, field: 'Timestamp', error: 'Invalid timestamp format. Expected ISO format (YYYY-MM-DDTHH:MM:SSZ)' });
          return;
        }
      }

      validEntries.push({
        name: entry.name.trim(),
        email: entry.email.trim().toLowerCase(),
        timestamp: timestamp
      });

    } catch (error) {
      errors.push({ line: index + 2, field: 'All', error: error.message });
    }
  });

  return {
    validEntries,
    errors,
    hasErrors: errors.length > 0
  };
};

// Bulk import CSV waitlist data
export const importCsvWaitlist = async (eventId, csvText, userId) => {
  try {
    // Parse CSV text
    const parsedEntries = parseCsvWaitlistData(csvText);
    
    // Validate entries
    const { validEntries, errors, hasErrors } = validateCsvWaitlistEntries(parsedEntries);
    
    if (hasErrors) {
      return {
        success: false,
        message: `CSV validation failed with ${errors.length} errors`,
        errors: errors.map(error => `${error.field} error at line ${error.line}: ${error.error}`),
        importedCount: 0,
        failedCount: parsedEntries.length
      };
    }

    // Prepare payload for backend
    const payload = {
      eventId: parseInt(eventId, 10),
      entries: validEntries.map(entry => ({
        name: entry.name,
        email: entry.email,
        timestamp: entry.timestamp
      }))
    };

    // Send to backend
    const response = await apiUtils.post(
      API_ENDPOINTS.WAITLIST.IMPORT_CSV(eventId),
      payload
    );

    if (!response.ok) {
      const errorData = response.data || {};
      throw new Error(errorData.message || 'Failed to import CSV waitlist data');
    }

    return {
      success: true,
      message: 'CSV waitlist data imported successfully',
      data: response.data,
      importedCount: response.data?.successfulImports || validEntries.length,
      failedCount: response.data?.failedImports || 0
    };

  } catch (error) {
    logger.error('[WaitlistUtils] Failed to import CSV waitlist:', error);
    
    if (getApiErrorStatus(error) === 401 || getApiErrorStatus(error) === 403) {
      throw error; // Re-throw auth errors
    }

    return {
      success: false,
      message: error.message || 'Failed to import CSV waitlist data',
      errors: [error.message],
      importedCount: 0,
      failedCount: 0
    };
  }
};

const GLOBAL_WAITLIST_KEY = "eventra_global_waitlists";
const NOTIFICATION_INBOX_PREFIX = "eventra_notification_inbox";
const CANONICAL_NOTIFICATION_INBOX_KEY = NOTIFICATION_INBOX_PREFIX;


/**
 * Coerce an eventId value to a safe integer.
 *
 * parseInt(value) without a radix returns NaN for null / undefined / non-numeric
 * strings, and NaN === NaN is always false in JavaScript, so any filter that
 * uses `r.eventId === parseInt(eventId)` silently empties its result when the
 * argument is invalid. This helper centralises the conversion and throws early
 * with a descriptive message so callers get useful feedback instead of a silent
 * empty result.
 *
 * @param {*} eventId - Raw event identifier (number or numeric string).
 * @returns {number} Parsed integer event ID.
 * @throws {TypeError} When eventId cannot be converted to a finite integer.
 */
const parseEventId = (eventId) => {
  const id = parseInt(eventId, 10);
  if (!Number.isFinite(id)) {
    throw new TypeError(
      `[WaitlistUtils] Invalid eventId "${eventId}": must be a finite integer.`
    );
  }
  return id;
};

/**
 * Resolve the per-user storage key for the waitlist offline cache.
 *
 * The legacy key was a single unscoped, shared value (`eventra_global_waitlists`)
 * that mixed every user's waitlist records in one place. The key is now scoped
 * to the current user so a logged-in browser only ever holds the current
 * user's own waitlist data. `getOrMigrateKey` migrates any legacy plaintext
 * into the new scoped key once and then removes the legacy key.
 *
 * @param {string} userId - The current user id (falls back to email in the app).
 * @returns {string} The user-scoped storage key.
 */
export const getWaitlistStorageKey = (userId) => {
  return getOrMigrateKey("waitlists", userId, GLOBAL_WAITLIST_KEY);
};

/**
 * Strip PII fields that must never be persisted to localStorage.
 *
 * The server remains the source of truth for contact details. The offline
 * cache only needs enough data to render positions, status and timestamps, so
 * emails and phone numbers are removed on every write. Combined with the
 * AES-GCM encryption applied by `syncSecureStorage`, this ensures no contact
 * PII can leak out of a localStorage read even when Web Crypto is unavailable.
 *
 * @param {Object} record - A raw waitlist record.
 * @returns {Object} The record without `userEmail` / `phone` fields.
 */
const sanitizeRecord = (record) => {
  if (!record || typeof record !== "object") return record;
  const safe = { ...record };
  delete safe.userEmail;
  delete safe.phone;
  return safe;
};

const getNotificationStorageKeys = (userId) => {
  const keys = new Set([CANONICAL_NOTIFICATION_INBOX_KEY]);
  if (userId) {
    keys.add(`${NOTIFICATION_INBOX_PREFIX}_${userId}`);
  }
  return [...keys];
};

const writeNotificationToStorage = (notification, storageKey) => {
  const raw = localStorage.getItem(storageKey);
  const notifications = raw ? safeJsonParse(raw, []) : [];
  notifications.unshift(notification);
  if (notifications.length > 200) notifications.length = 200;
  localStorage.setItem(storageKey, JSON.stringify(notifications));
};

// Helper to add local notifications using localStorage
export const addLocalNotification = async (title, message, options = {}) => {
  // SSR guard: localStorage and window are not available in Node.js/SSR environments
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return;
  }

  try {
    const newNotification = {
      id: typeof crypto !== "undefined" && crypto.randomUUID
        ? `local-${crypto.randomUUID()}`
        : `local-${Date.now()}-${Math.floor(Math.random() * 1e9)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      title,
      message,
      category: options.category || "registrations",
      link: options.link,
      recipientUserId: options.userId,
      metadata: options.metadata,
    };
    getNotificationStorageKeys(options.userId).forEach((storageKey) => {
      writeNotificationToStorage(newNotification, storageKey);
    });
    // Trigger cross-component real-time sync
    window.dispatchEvent(new CustomEvent("eventra-notifications-updated"));
  } catch (error) {
    logger.error("[WaitlistUtils] Failed to add local notification:", error);
  }
};

const getWaitlistEventTitle = (eventId, eventOrTitle, records = []) => {
  if (typeof eventOrTitle === "string" && eventOrTitle.trim()) return eventOrTitle.trim();
  if (eventOrTitle?.title) return eventOrTitle.title;
  const recordTitle = records.find((record) => record.eventTitle)?.eventTitle;
  return recordTitle || `Event #${eventId}`;
};

const getPositionMap = (waitlist) =>
  waitlist.reduce((positions, record, index) => {
    if (record && record.userId != null) {
      positions.set(String(record.userId), index + 1);
    }
    return positions;
  }, new Map());

const notifyWaitlistPositionChanges = async (eventId, beforeWaitlist, eventOrTitle, cacheOwnerId) => {
  const afterWaitlist = await getEventWaitlist(eventId, cacheOwnerId);
  if (!beforeWaitlist.length || !afterWaitlist.length) return;

  const previousPositions = getPositionMap(beforeWaitlist);
  const eventTitle = getWaitlistEventTitle(eventId, eventOrTitle, beforeWaitlist);

  await Promise.all(
    afterWaitlist.map(async (record, index) => {
      if (!record || record.userId == null) return;

      const previousPosition = previousPositions.get(String(record.userId));
      const currentPosition = index + 1;
      if (!previousPosition || currentPosition >= previousPosition) return;

      await addLocalNotification(
        "Waitlist Position Updated",
        `Your waitlist position for ${eventTitle} moved from #${previousPosition} to #${currentPosition}!`,
        {
          userId: record.userId,
          category: "registrations",
          metadata: {
            type: "waitlist_position_changed",
            eventId,
            eventTitle,
            previousPosition,
            currentPosition,
          },
        }
      );
    })
  );
};

// Retrieve the current user's waitlist entries across all events
export const getGlobalWaitlist = async (userId) => {
  try {
    const key = getWaitlistStorageKey(userId);
    let stored = await syncSecureStorage.getItemAsync(key);
    if (!stored) {
      const raw = syncSecureStorage.getItem(key);
      if (raw !== null && !raw.includes('"version"')) {
        stored = raw;
      }
    }
    let records = stored ? safeJsonParse(stored, []) : [];
    if (!Array.isArray(records)) records = [];

    const sanitized = records.map(sanitizeRecord);

    // One-time migration: if the scoped key still holds plaintext (copied over
    // from the legacy unscoped key by getOrMigrateKey), re-encrypt the
    // sanitized copy so no plaintext PII survives on disk.
    const raw = syncSecureStorage.getItem(key);
    if (raw !== null && !raw.includes('"version"')) {
      await saveGlobalWaitlist(sanitized, userId);
    }

    return sanitized;
  } catch (err) {
    // localStorage throws SecurityError or QuotaExceededError — never HTTP errors.
    // Log and return empty array so the UI degrades gracefully.
    logger.error("[WaitlistUtils] Failed to read global waitlist from storage:", err);
    return [];
  }
};

// Persist the current user's waitlist entries (encrypted offline cache only)
export const saveGlobalWaitlist = async (records, userId) => {
  try {
    const key = getWaitlistStorageKey(userId);
    const sanitized = (Array.isArray(records) ? records : []).map(sanitizeRecord);
    await syncSecureStorage.setItem(key, JSON.stringify(sanitized));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      throw error;
    }
    logger.error("[WaitlistUtils] Failed to save global waitlist:", error);
  }
};

/**
 * Purge the current user's waitlist cache.
 *
 * Invoked on logout / session clear so waitlist PII does not outlive the
 * session in the browser. Removal is synchronous and targeted to the
 * user-scoped key.
 *
 * @param {string} userId - The user whose cache should be purged.
 */
export const clearWaitlistCache = (userId) => {
  if (!userId) return;
  try {
    syncSecureStorage.removeItem(getWaitlistStorageKey(userId));
  } catch (error) {
    logger.error("[WaitlistUtils] Failed to clear waitlist cache:", error);
  }
};

// Sync waitlist from server, falling back to localStorage cache
export const syncWaitlistFromServer = async (eventId, cacheOwnerId) => {
  const id = parseEventId(eventId);
  try {
    const response = await apiUtils.get(`${API_ENDPOINTS.EVENTS.ALL}/${id}/waitlist`);
    if (response.ok && response.data) {
      const serverData = (
        Array.isArray(response.data) ? response.data : response.data.entries || []
      ).map((r) => ({
        ...r,
        id: r.id,
        waitlistId: r.id,
        eventId: parseInt(r.eventId, 10),
        userId: r.userId ?? r.userEmail,
        status: String(r.status || "waiting").toLowerCase(),
        joinedAt: r.joinedAt,
        position: r.position,
      }));
      // Reconcile: replace stale local records for this event with server state
      const records = await getGlobalWaitlist(cacheOwnerId);
      const reconciled = [
        ...records.filter((r) => String(r.eventId) !== String(id)),
        ...serverData,
      ];
      await saveGlobalWaitlist(reconciled, cacheOwnerId);
      return serverData;
    }
  } catch (err) {
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("eventra-session-expired"));
      }
      throw err;
    }
    logger.warn("[WaitlistUtils] Server sync failed, using localStorage cache");
  }
  return getEventWaitlist(id, cacheOwnerId);
};

/** Attendee: fetch own waitlist entry/position from GET /api/events/{id}/waitlist/me */
export const getMyWaitlistEntry = async (eventId) => {
  const id = parseEventId(eventId);
  const response = await apiUtils.get(`${API_ENDPOINTS.EVENTS.ALL}/${id}/waitlist/me`);
  if (!response.ok) {
    return null;
  }
  const data = response.data;
  return data
    ? {
        id: data.id,
        waitlistId: data.id,
        eventId: parseInt(data.eventId, 10),
        userId: data.userId ?? data.userEmail,
        position: data.position,
        status: String(data.status || "waiting").toLowerCase(),
        eventTitle: data.eventTitle,
        joinedAt: data.joinedAt,
      }
    : null;
};

const parseJoinedAtTime = (joinedAt) => {
  const time = new Date(joinedAt).getTime();
  return Number.isFinite(time) ? time : Infinity;
};

// Get waitlist entries for a specific event with 'waiting' status
export const getEventWaitlist = async (eventId, userId) => {
  const id = parseEventId(eventId);
  const records = await getGlobalWaitlist(userId);
  return records
    .filter((r) => String(r.eventId) === String(id) && r.status === "waiting")
    .sort((a, b) => parseJoinedAtTime(a.joinedAt) - parseJoinedAtTime(b.joinedAt));
};

// Calculate queue position (1-indexed) for a user on a specific event
export const getQueuePosition = async (eventId, userId) => {
  try {
    const mine = await getMyWaitlistEntry(eventId);
    if (mine?.position != null) {
      return mine.position;
    }
  } catch (error) {
    if (getApiErrorStatus(error) === 401 || getApiErrorStatus(error) === 403) {
      throw error;
    }
    // Fall back to local cache for offline / not-on-waitlist
  }
  const eventWaitlist = await getEventWaitlist(eventId, userId);
  const index = eventWaitlist.findIndex((r) => String(r.userId) === String(userId));
  return index !== -1 ? index + 1 : -1;
};

// Add registration to specific user's localStorage registered events
export const addRegistrationToUserStorage = (userId, event) => {
  const legacyKey = `my_events_${userId}`;
  const storageKey = getOrMigrateKey("my_events", userId, legacyKey);
  try {
    const raw = localStorage.getItem(storageKey);
    const current = raw ? safeJsonParse(raw, []) : [];
    if (!current.some((r) => String(r.eventId) === String(event.id))) {
      current.push({
        eventId: event.id,
        registeredAt: new Date().toISOString(),
        eventSummary: {
          id: event.id,
          title: event.title ?? "",
          date: event.date ?? "",
          location: event.location ?? "",
          type: event.type ?? event.category ?? "",
          image: event.image ?? event.imageUrl ?? "",
          status: event.status ?? "",
        },
        event,
      });
      localStorage.setItem(storageKey, JSON.stringify(current));
    }
  } catch (error) {
    logger.error("[WaitlistUtils] Failed to add registration to user storage:", error);
  }
};

// Add registration to event's attendees count
export const incrementEventAttendees = (eventId) => {
  // If event availability caches exist, update them
  try {
    const cacheKey = `event_detail_${eventId}`;
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const parsed = safeJsonParse(raw, null);
      if (parsed && parsed.event) {
        parsed.event.attendees = (Number(parsed.event.attendees) || 0) + 1;
        localStorage.setItem(cacheKey, JSON.stringify(parsed));
      }
    }
  } catch (error) {
    logger.error("[WaitlistUtils] Failed to update event attendee count cache:", error);
  }
};

// Join waitlist - tries server first, falls back to localStorage offline
export const joinWaitlist = async (eventId, user, registrationForm = {}) => {
  const id = parseEventId(eventId);
  const userId = user.id || user.email;
  if (!userId) throw new Error("Authentication required to join waitlist.");

  try {
    const response = await apiUtils.post(`${API_ENDPOINTS.EVENTS.ALL}/${id}/waitlist`, {
      userId,
      name: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Anonymous",
      email: user.email,
      phone: registrationForm.phone || "",
      eventTitle: registrationForm.eventTitle || "the event",
    });
    if (response.ok) {
      const newEntry = {
        userId,
        userName:
          user.fullName ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.username ||
          "Anonymous",
        userEmail: user.email,
        phone: registrationForm.phone || "",
        eventTitle: registrationForm.eventTitle || "the event",
        eventId: id,
        joinedAt: new Date().toISOString(),
        status: "waiting",
      };
      const records = await getGlobalWaitlist(userId);
      records.push(newEntry);
      await saveGlobalWaitlist(records, userId);
      await addLocalNotification(
        "Waitlist Joined",
        `You have successfully joined the waitlist for ${registrationForm.eventTitle || "the event"}.`,
        { userId }
      );
      return newEntry;
    }
    throw new Error(response.data?.message || "Server rejected waitlist join");
  } catch (error) {
    const status = getApiErrorStatus(error);
    if (status === 409) {
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to join waitlist due to a conflict.";
      throw new Error(serverMessage);
    }
    if (error.isNetworkError || error.isTimeout) {
      // Fall through to offline fallback
    } else {
      throw error;
    }
  }

  // Offline fallback: store locally
  const legacyKey = `my_events_${userId}`;
  const userRegKey = getOrMigrateKey("my_events", userId, legacyKey);
  try {
    const rawRegs = localStorage.getItem(userRegKey);
    const regs = rawRegs ? safeJsonParse(rawRegs, []) : [];
    if (regs.some((r) => String(r.eventId) === String(id))) {
      throw new Error("You are already registered for this event.");
    }
  } catch (e) {
    if (e.message.includes("already registered")) throw e;
  }

  const records = await getGlobalWaitlist(userId);
  const existing = records.find(
    (r) => String(r.userId) === String(userId) && String(r.eventId) === String(id) && r.status === "waiting"
  );
  if (existing) {
    throw new Error("You are already on the waitlist for this event.");
  }

  const newEntry = {
    userId,
    userName:
      user.fullName ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.username ||
      "Anonymous",
    userEmail: user.email,
    phone: registrationForm.phone || "",
    eventTitle: registrationForm.eventTitle || "the event",
    eventId: id,
    joinedAt: new Date().toISOString(),
    status: "waiting",
  };

  records.push(newEntry);
  await saveGlobalWaitlist(records, userId);

  // Issue #11538: enqueue the join so it is replayed by useOfflineSync once
  // connectivity returns; otherwise the server never receives the waitlist join.
  await pushToQueue(
    {
      actionType: "JOIN_WAITLIST",
      endpoint: `${API_ENDPOINTS.EVENTS.ALL}/${id}/waitlist`,
      eventId: id,
      idempotencyKey: `waitlist-join-${userId}-${id}`,
      payload: {
        userId,
        name: newEntry.userName,
        email: newEntry.userEmail,
        phone: newEntry.phone,
        eventTitle: newEntry.eventTitle,
      },
    },
    userId
  );

  await addLocalNotification(
    "Waitlist Joined (Offline)",
    `You have been added to the offline waitlist for ${registrationForm.eventTitle || "the event"}. It will sync when you are back online.`,
    { userId }
  );

  return newEntry;
};

// Leave waitlist - DELETE /api/events/{id}/waitlist (matches backend)
export const leaveWaitlist = async (eventId, userId) => {
  const id = parseEventId(eventId);
  const beforeWaitlist = await getEventWaitlist(id, userId);

  try {
    const response = await apiUtils.delete(`${API_ENDPOINTS.EVENTS.ALL}/${id}/waitlist`);
    if (response.ok || response.status === 204) {
      const records = await getGlobalWaitlist(userId);
      const matchIndex = records.findIndex(
        (r) => String(r.userId) === String(userId) && String(r.eventId) === String(id) && r.status === "waiting"
      );
      if (matchIndex !== -1) {
        records[matchIndex].status = "removed";
        records[matchIndex].removedAt = new Date().toISOString();
        await saveGlobalWaitlist(records, userId);
      }
      await addLocalNotification("Left Waitlist", "You have left the waitlist.", { userId });
      await notifyWaitlistPositionChanges(id, beforeWaitlist, undefined, userId);
      return true;
    }
  } catch (error) {
    if (getApiErrorStatus(error) === 401 || getApiErrorStatus(error) === 403) {
      throw error;
    }
    if (!checkIfOffline(error)) {
      throw error;
    }
    // Fall through to localStorage-only path for genuine offline
  }

  const records = await getGlobalWaitlist(userId);
  const matchIndex = records.findIndex(
    (r) => String(r.userId) === String(userId) && String(r.eventId) === String(id) && r.status === "waiting"
  );
  if (matchIndex === -1) {
    throw new Error("No active waitlist record found for this user.");
  }
  records[matchIndex].status = "removed";
  records[matchIndex].removedAt = new Date().toISOString();
  await saveGlobalWaitlist(records, userId);
  await addLocalNotification("Left Waitlist", "You have left the waitlist.", { userId });
  await notifyWaitlistPositionChanges(id, beforeWaitlist, undefined, userId);
  return true;
};

// Helper to perform local waitlist status promotion and updates
const performLocalPromotion = async (record, event, cacheOwnerId) => {
  const records = await getGlobalWaitlist(cacheOwnerId);
  const match = records.find(
    (r) => String(r.userId) === String(record.userId) && String(r.eventId) === String(record.eventId) && r.status === "waiting"
  );
  if (match) {
    match.status = "promoted";
    match.promotedAt = new Date().toISOString();
    await saveGlobalWaitlist(records, cacheOwnerId);
  }
  addRegistrationToUserStorage(record.userId, event);
  incrementEventAttendees(event.id);
  await addLocalNotification(
    "Waitlist Promotion",
    `Good news! You have been promoted from the waitlist to a confirmed attendee for: ${event.title || "your event"}.`,
    { userId: record.userId }
  );
  return !!match;
};

// Mark a waitlist record as pending server sync (offline path).
// The record stays "waiting" — a confirmed promotion is never fabricated, so
// no fake registration or attendee count is created while offline.
const markPromotionPendingSync = async (record, cacheOwnerId) => {
  const records = await getGlobalWaitlist(cacheOwnerId);
  const match = records.find(
    (r) => String(r.userId) === String(record.userId) && String(r.eventId) === String(record.eventId) && r.status === "waiting"
  );
  if (match) {
    match.promotionPendingSync = true;
    await saveGlobalWaitlist(records, cacheOwnerId);
  }
  return !!match;
};

// Helper to detect if a throw/exception is caused by a offline/network/timeout condition
const checkIfOffline = (error) => {
  if (error?.isNetworkError || error?.isTimeout) {
    return true;
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return true;
  }
  return false;
};

// Promote a specific record to a confirmed registration
export const promoteRecord = async (record, event, options = {}, cacheOwnerId) => {
  const shouldNotifyPositionChanges = options.notifyPositionChanges !== false;
  const beforeWaitlist = shouldNotifyPositionChanges
    ? await getEventWaitlist(record.eventId, cacheOwnerId)
    : [];
  const waitlistId = record.id ?? record.waitlistId;
  if (!waitlistId) {
    logger.error("[WaitlistUtils] promoteRecord missing waitlist entry id");
    return false;
  }
  try {
    const response = await apiUtils.post(
      `${API_ENDPOINTS.EVENTS.ALL}/${event.id}/waitlist/${waitlistId}/promote`
    );
    if (response.ok) {
      const promoted = await performLocalPromotion(record, event, cacheOwnerId);
      if (promoted && shouldNotifyPositionChanges) {
        await notifyWaitlistPositionChanges(record.eventId, beforeWaitlist, event, cacheOwnerId);
      }
      return true;
    }
    // Explicit server rejection
    return false;
  } catch (error) {
    if (getApiErrorStatus(error) === 401 || getApiErrorStatus(error) === 403) {
      throw error;
    }
    if (!checkIfOffline(error)) {
      return false;
    }
  }

  // Offline: do not fabricate a confirmed promotion — the server never issued
  // a registration. Clearly mark the record as pending sync and report the
  // failure so the organizer can retry once the connection is restored.
  await markPromotionPendingSync(record, cacheOwnerId);
  await addLocalNotification(
    "Waitlist Promotion Pending",
    `The promotion for "${event.title || "your event"}" is pending — it will complete once the connection is restored.`,
    { userId: record.userId }
  );
  return false;
};

// Promote the next user in queue when a spot opens up
export const promoteNextUser = async (eventId, eventData = null, cacheOwnerId) => {
  const id = parseEventId(eventId);
  const eventWaitlist = await getEventWaitlist(id, cacheOwnerId);
  if (eventWaitlist.length === 0) return null;

  const nextUserRecord = eventWaitlist[0];

  // Resolve event data
  let event = eventData;
  if (!event) {
    try {
      const cacheKey = `event_detail_${id}`;
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = safeJsonParse(raw, null);
        event = parsed?.event || parsed;
      }
    } catch {
      // Ignored — fallback below
    }
  }

  if (!event) {
    event = { id, title: "Event" };
  }

  const success = await promoteRecord(nextUserRecord, event, {}, cacheOwnerId);
  if (!success) {
    return null;
  }
  const updatedRecord = (await getGlobalWaitlist(cacheOwnerId)).find(
    (r) =>
      String(r.userId) === String(nextUserRecord.userId) &&
      String(r.eventId) === String(nextUserRecord.eventId)
  );

  return updatedRecord || null;
};

// Handle event capacity increase by promoting N users to confirmed attendees
export const handleCapacityIncrease = async (event, newCapacity, cacheOwnerId) => {
  const currentAttendees = Number(event.attendees || 0);
  const spotsToFill = newCapacity - currentAttendees;
  if (spotsToFill <= 0) return 0;

  const eventWaitlist = await getEventWaitlist(event.id, cacheOwnerId);
  const beforeWaitlist = [...eventWaitlist];
  const countToPromote = Math.min(spotsToFill, eventWaitlist.length);

  for (let i = 0; i < countToPromote; i++) {
    await promoteRecord(eventWaitlist[i], event, { notifyPositionChanges: false }, cacheOwnerId);
  }

  await notifyWaitlistPositionChanges(event.id, beforeWaitlist, event, cacheOwnerId);

  return countToPromote;
};

// Organizer action to manually remove a user
export const organizerRemoveUser = async (eventId, userId, cacheOwnerId) => {
  const id = parseEventId(eventId);
  const beforeWaitlist = await getEventWaitlist(id, cacheOwnerId);
  const target = beforeWaitlist.find((r) => String(r.userId) === String(userId));
  const waitlistId = target?.id ?? target?.waitlistId;

  try {
    if (!waitlistId) {
      throw new Error("User is not in the active waitlist.");
    }
    const response = await apiUtils.delete(
      `${API_ENDPOINTS.EVENTS.ALL}/${id}/waitlist/${waitlistId}`
    );
    if (response.ok || response.status === 204) {
      const records = await getGlobalWaitlist(cacheOwnerId);
      const matchIndex = records.findIndex(
        (r) => String(r.userId) === String(userId) && String(r.eventId) === String(id) && r.status === "waiting"
      );
      if (matchIndex !== -1) {
        records[matchIndex].status = "removed_by_organizer";
        records[matchIndex].removedAt = new Date().toISOString();
        await saveGlobalWaitlist(records, cacheOwnerId);
      }
      await addLocalNotification(
        "Removed from Waitlist",
        `You have been removed from the waitlist for Event #${id} by the organizer.`,
        { userId }
      );
      await notifyWaitlistPositionChanges(id, beforeWaitlist, undefined, cacheOwnerId);
      return true;
    }
  } catch (error) {
    if (getApiErrorStatus(error) === 401 || getApiErrorStatus(error) === 403) {
      throw error;
    }
    if (!checkIfOffline(error)) {
      throw error;
    }
    // Fall through to localStorage-only path for genuine offline
  }

  const records = await getGlobalWaitlist(cacheOwnerId);
  const matchIndex = records.findIndex(
    (r) => String(r.userId) === String(userId) && String(r.eventId) === String(id) && r.status === "waiting"
  );

  if (matchIndex === -1) {
    throw new Error("User is not in the active waitlist.");
  }

  records[matchIndex].status = "removed_by_organizer";
  records[matchIndex].removedAt = new Date().toISOString();
  await saveGlobalWaitlist(records, cacheOwnerId);

  await addLocalNotification(
    "Removed from Waitlist",
    `You have been removed from the waitlist for Event #${id} by the organizer.`,
    { userId }
  );
  await notifyWaitlistPositionChanges(id, beforeWaitlist, undefined, cacheOwnerId);

  return true;
};

// Waitlist Analytics
export const getWaitlistAnalytics = async (eventId, cacheOwnerId) => {
  const id = parseEventId(eventId);
  const records = await getGlobalWaitlist(cacheOwnerId);

  const eventRecords = records.filter(
    (record) => String(record.eventId) === String(id)
  );

  const promotedUsers = eventRecords.filter(
    (record) => record.status === "promoted"
  );

  let averageWaitTime = 0;

  if (promotedUsers.length > 0) {
    const totalWaitTime = promotedUsers.reduce(
      (sum, record) =>
        sum +
        (new Date(record.promotedAt) -
          new Date(record.joinedAt)),
      0
    );

    averageWaitTime =
      totalWaitTime /
      promotedUsers.length /
      (1000 * 60 * 60);
  }

  return {
    totalWaitlisted: eventRecords.length,

    waiting: eventRecords.filter(
      (record) => record.status === "waiting"
    ).length,

    promoted: promotedUsers.length,

    removed: eventRecords.filter(
      (record) => record.status === "removed"
    ).length,

    promotionRate:
      eventRecords.length > 0
        ? (
            (promotedUsers.length /
              eventRecords.length) *
            100
          ).toFixed(1)
        : 0,

    averageWaitTime:
      averageWaitTime.toFixed(1),
  };
};
