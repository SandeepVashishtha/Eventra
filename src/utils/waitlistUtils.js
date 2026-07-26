
import { safeJsonParse } from "./safeJsonParse.js";
import { apiUtils, API_ENDPOINTS } from "../config/api.js";
import { logger } from "./logger.js";
import { getOrMigrateKey } from "./storageKeyManager.js";

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
    positions.set(record.userId, index + 1);
    return positions;
  }, new Map());

const notifyWaitlistPositionChanges = async (eventId, beforeWaitlist, eventOrTitle) => {
  const afterWaitlist = getEventWaitlist(eventId);
  if (!beforeWaitlist.length || !afterWaitlist.length) return;

  const previousPositions = getPositionMap(beforeWaitlist);
  const eventTitle = getWaitlistEventTitle(eventId, eventOrTitle, beforeWaitlist);

  await Promise.all(
    afterWaitlist.map(async (record, index) => {
      const previousPosition = previousPositions.get(record.userId);
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

// Retrieve all waitlist entries across all events and users
export const getGlobalWaitlist = () => {
  try {
    const raw = localStorage.getItem(GLOBAL_WAITLIST_KEY);
    return raw ? safeJsonParse(raw, []) : [];
  } catch (err) {
    // localStorage throws SecurityError or QuotaExceededError — never HTTP errors.
    // Log and return empty array so the UI degrades gracefully.
    logger.error("[WaitlistUtils] Failed to read global waitlist from storage:", err);
    return [];
  }
};

// Persist waitlist entries globally (offline cache only)
export const saveGlobalWaitlist = (records) => {
  try {
    localStorage.setItem(GLOBAL_WAITLIST_KEY, JSON.stringify(records));
  } catch (error) {
    logger.error("[WaitlistUtils] Failed to save global waitlist:", error);
  }
};

// Sync waitlist from server, falling back to localStorage cache
export const syncWaitlistFromServer = async (eventId) => {
  try {
    const response = await apiUtils.get(`${API_ENDPOINTS.EVENTS.ALL}/${eventId}/waitlist`);
    if (response.ok && response.data) {
      const serverData = Array.isArray(response.data) ? response.data : response.data.entries || [];
      const existing = getGlobalWaitlist().filter(r => r.eventId !== eventId);
      saveGlobalWaitlist([...existing, ...serverData]);
      return serverData;
    }
  } catch {
    logger.warn("[WaitlistUtils] Server sync failed, using localStorage cache");
  }
  return getGlobalWaitlist();
};

// Get waitlist entries for a specific event with 'waiting' status
export const getEventWaitlist = (eventId) => {
  const id = parseEventId(eventId);
  const records = getGlobalWaitlist();
  return records
    .filter((r) => r.eventId === id && r.status === "waiting")
    .sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt));
};

// Calculate queue position (1-indexed) for a user on a specific event
export const getQueuePosition = (eventId, userId) => {
  const eventWaitlist = getEventWaitlist(eventId);
  const index = eventWaitlist.findIndex((r) => r.userId === userId);
  return index !== -1 ? index + 1 : -1;
};

// Add registration to specific user's localStorage registered events
export const addRegistrationToUserStorage = (userId, event) => {
  const legacyKey = `my_events_${userId}`;
  const storageKey = getOrMigrateKey("my_events", userId, legacyKey);
  try {
    const raw = localStorage.getItem(storageKey);
    const current = raw ? safeJsonParse(raw, []) : [];
    if (!current.some((r) => r.eventId === event.id)) {
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
      const records = getGlobalWaitlist();
      records.push(newEntry);
      saveGlobalWaitlist(records);
      await addLocalNotification(
        "Waitlist Joined",
        `You have successfully joined the waitlist for ${registrationForm.eventTitle || "the event"}.`,
        { userId }
      );
      return newEntry;
    }
    throw new Error(response.data?.message || "Server rejected waitlist join");
  } catch (error) {
    if (error.response?.status === 409) {
      throw new Error("You are already on the waitlist for this event.");
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
    if (regs.some((r) => r.eventId === id)) {
      throw new Error("You are already registered for this event.");
    }
  } catch (e) {
    if (e.message.includes("already registered")) throw e;
  }

  const records = getGlobalWaitlist();
  const existing = records.find(
    (r) => r.userId === userId && r.eventId === id && r.status === "waiting"
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
  saveGlobalWaitlist(records);

  await addLocalNotification(
    "Waitlist Joined (Offline)",
    `You have been added to the offline waitlist for ${registrationForm.eventTitle || "the event"}. It will sync when you are back online.`,
    { userId }
  );

  return newEntry;
};

// Leave waitlist - tries server first, falls back to localStorage
export const leaveWaitlist = async (eventId, userId) => {
  const id = parseEventId(eventId);
  const beforeWaitlist = getEventWaitlist(id);

  try {
    const response = await apiUtils.post(`${API_ENDPOINTS.EVENTS.ALL}/${id}/waitlist/leave`, { userId });
    if (response.ok) {
      const records = getGlobalWaitlist();
      const matchIndex = records.findIndex(
        (r) => r.userId === userId && r.eventId === id && r.status === "waiting"
      );
      if (matchIndex !== -1) {
        records[matchIndex].status = "removed";
        records[matchIndex].removedAt = new Date().toISOString();
        saveGlobalWaitlist(records);
      }
      await addLocalNotification("Left Waitlist", "You have left the waitlist.", { userId });
      await notifyWaitlistPositionChanges(id, beforeWaitlist);
      return true;
    }
  } catch {
    // Fall through to localStorage-only path
  }

  const records = getGlobalWaitlist();
  const matchIndex = records.findIndex(
    (r) => r.userId === userId && r.eventId === id && r.status === "waiting"
  );
  if (matchIndex === -1) {
    throw new Error("No active waitlist record found for this user.");
  }
  records[matchIndex].status = "removed";
  records[matchIndex].removedAt = new Date().toISOString();
  saveGlobalWaitlist(records);
  await addLocalNotification("Left Waitlist", "You have left the waitlist.", { userId });
  await notifyWaitlistPositionChanges(id, beforeWaitlist);
  return true;
};

// Helper to perform local waitlist status promotion and updates
const performLocalPromotion = async (record, event) => {
  const records = getGlobalWaitlist();
  const match = records.find(
    (r) => r.userId === record.userId && r.eventId === record.eventId && r.status === "waiting"
  );
  if (match) {
    match.status = "promoted";
    match.promotedAt = new Date().toISOString();
    saveGlobalWaitlist(records);
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
export const promoteRecord = async (record, event, options = {}) => {
  const shouldNotifyPositionChanges = options.notifyPositionChanges !== false;
  const beforeWaitlist = shouldNotifyPositionChanges
    ? getEventWaitlist(record.eventId)
    : [];
  try {
    const response = await apiUtils.post(`${API_ENDPOINTS.EVENTS.ALL}/${event.id}/waitlist/promote`, {
      userId: record.userId,
    });
    if (response.ok) {
      const promoted = await performLocalPromotion(record, event);
      if (promoted && shouldNotifyPositionChanges) {
        await notifyWaitlistPositionChanges(record.eventId, beforeWaitlist, event);
      }
      return true;
    }
    // Explicit server rejection
    return false;
  } catch (error) {
    if (!checkIfOffline(error)) {
      return false;
    }
  }

  const promoted = await performLocalPromotion(record, event);
  if (promoted && shouldNotifyPositionChanges) {
    await notifyWaitlistPositionChanges(record.eventId, beforeWaitlist, event);
  }
  return promoted;
};

// Promote the next user in queue when a spot opens up
export const promoteNextUser = async (eventId, eventData = null) => {
  const id = parseEventId(eventId);
  const eventWaitlist = getEventWaitlist(id);
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

  const success = await promoteRecord(nextUserRecord, event);
  if (!success) {
    return null;
  }
  const updatedRecord = getGlobalWaitlist().find(
    (r) =>
      r.userId === nextUserRecord.userId &&
      r.eventId === nextUserRecord.eventId
  );

  return updatedRecord || null;
};

// Handle event capacity increase by promoting N users to confirmed attendees
export const handleCapacityIncrease = async (event, newCapacity) => {
  const currentAttendees = Number(event.attendees || 0);
  const spotsToFill = newCapacity - currentAttendees;
  if (spotsToFill <= 0) return 0;

  const eventWaitlist = getEventWaitlist(event.id);
  const beforeWaitlist = [...eventWaitlist];
  const countToPromote = Math.min(spotsToFill, eventWaitlist.length);

  for (let i = 0; i < countToPromote; i++) {
    await promoteRecord(eventWaitlist[i], event, { notifyPositionChanges: false });
  }

  await notifyWaitlistPositionChanges(event.id, beforeWaitlist, event);

  return countToPromote;
};

// Organizer action to manually remove a user
export const organizerRemoveUser = async (eventId, userId) => {
  const id = parseEventId(eventId);
  const beforeWaitlist = getEventWaitlist(id);

  try {
    const response = await apiUtils.post(`${API_ENDPOINTS.EVENTS.ALL}/${id}/waitlist/remove`, {
      userId,
    });
    if (response.ok) {
      const records = getGlobalWaitlist();
      const matchIndex = records.findIndex(
        (r) => r.userId === userId && r.eventId === id && r.status === "waiting"
      );
      if (matchIndex !== -1) {
        records[matchIndex].status = "removed_by_organizer";
        records[matchIndex].removedAt = new Date().toISOString();
        saveGlobalWaitlist(records);
      }
      await addLocalNotification(
        "Removed from Waitlist",
        `You have been removed from the waitlist for Event #${id} by the organizer.`,
        { userId }
      );
      await notifyWaitlistPositionChanges(id, beforeWaitlist);
      return true;
    }
  } catch {
    // Fall through to localStorage-only path
  }

  const records = getGlobalWaitlist();
  const matchIndex = records.findIndex(
    (r) => r.userId === userId && r.eventId === id && r.status === "waiting"
  );

  if (matchIndex === -1) {
    throw new Error("User is not in the active waitlist.");
  }

  records[matchIndex].status = "removed_by_organizer";
  records[matchIndex].removedAt = new Date().toISOString();
  saveGlobalWaitlist(records);

  await addLocalNotification(
    "Removed from Waitlist",
    `You have been removed from the waitlist for Event #${id} by the organizer.`,
    { userId }
  );
  await notifyWaitlistPositionChanges(id, beforeWaitlist);

  return true;
};

// Waitlist Analytics
export const getWaitlistAnalytics = (eventId) => {
  const id = parseEventId(eventId);
  const records = getGlobalWaitlist();

  const eventRecords = records.filter(
    (record) => record.eventId === id
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
