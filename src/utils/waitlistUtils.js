import { get as idbGet, set as idbSet } from "idb-keyval";
import { safeJsonParse } from "./safeJsonParse.js";
import { logger } from "./logger.js";

const GLOBAL_WAITLIST_KEY = "eventra_global_waitlists";
const NOTIFICATIONS_STORAGE_KEY = "eventra_notifications";

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

// Helper to add local notifications using IndexedDB
export const addLocalNotification = async (title, message) => {
  try {
    const raw = await idbGet(NOTIFICATIONS_STORAGE_KEY);
    const notifications = raw ? safeJsonParse(raw, []) : [];
    const newNotification = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      read: false,
      createdAt: new Date().toISOString(),
      title,
      message,
    };
    notifications.unshift(newNotification);
    await idbSet(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    // Trigger cross-component real-time sync
    window.dispatchEvent(new CustomEvent("eventra-notifications-updated"));
  } catch (error) {
    logger.error("[WaitlistUtils] Failed to add local notification:", error);
  }
};

// Retrieve all waitlist entries across all events and users
export const getGlobalWaitlist = () => {
  try {
    const raw = localStorage.getItem(GLOBAL_WAITLIST_KEY);
    return raw ? safeJsonParse(raw, []) : [];
  } catch {
    return [];
  }
};

// Persist waitlist entries globally
export const saveGlobalWaitlist = (records) => {
  try {
    localStorage.setItem(GLOBAL_WAITLIST_KEY, JSON.stringify(records));
  } catch (error) {
    logger.error("[WaitlistUtils] Failed to save global waitlist:", error);
  }
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
  const storageKey = `my_events_${userId}`;
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

// Join waitlist validation & record creation
export const joinWaitlist = async (eventId, user, registrationForm = {}) => {
  const id = parseEventId(eventId);
  const userId = user.id || user.email;
  if (!userId) throw new Error("Authentication required to join waitlist.");

  // Check if already registered
  const userRegKey = `my_events_${userId}`;
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

  // Check for duplicate waitlist entries
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
    eventId: id,
    joinedAt: new Date().toISOString(),
    status: "waiting",
  };

  records.push(newEntry);
  saveGlobalWaitlist(records);

  // Notify user they joined
  await addLocalNotification(
    "Waitlist Joined",
    `You have successfully joined the waitlist for ${registrationForm.eventTitle || "the event"
    }.`
  );

  return newEntry;
};

// Leave waitlist (user action)
export const leaveWaitlist = async (eventId, userId) => {
  const id = parseEventId(eventId);
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

  await addLocalNotification("Left Waitlist", "You have left the waitlist.");

  return true;
};

// Promote a specific record to a confirmed registration
export const promoteRecord = async (record, event) => {
  const records = getGlobalWaitlist();
  const match = records.find(
    (r) =>
      r.userId === record.userId &&
      r.eventId === record.eventId &&
      r.status === "waiting"
  );

  if (match) {
    match.status = "promoted";
    match.promotedAt = new Date().toISOString();
    saveGlobalWaitlist(records);

    // 1. Add registration record to user's storage
    addRegistrationToUserStorage(record.userId, event);

    // 2. Increment attendee count in local event caches/stores
    incrementEventAttendees(event.id);

    // 3. Dispatch promotion notification
    await addLocalNotification(
      "Waitlist Promotion",
      `Good news! You have been promoted from the waitlist to a confirmed attendee for: ${event.title || "your event"
      }.`
    );
    return true;
  }
  return false;
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
  const countToPromote = Math.min(spotsToFill, eventWaitlist.length);

  for (let i = 0; i < countToPromote; i++) {
    await promoteRecord(eventWaitlist[i], event);
  }

  return countToPromote;
};

// Organizer action to manually remove a user
export const organizerRemoveUser = async (eventId, userId) => {
  const id = parseEventId(eventId);
  const records = getGlobalWaitlist();
  const matchIndex = records.findIndex(
    (r) => r.userId === userId && r.eventId === id && r.status === "waiting"
  );

  if (matchIndex === -1) {
    throw new Error("User is not in the active waitlist.");
  }

  records[matchIndex].status = "removed";
  records[matchIndex].removedAt = new Date().toISOString();
  saveGlobalWaitlist(records);

  // Trigger notification for the removed user
  await addLocalNotification(
    "Removed from Waitlist",
    `You have been removed from the waitlist for Event #${id} by the organizer.`
  );

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