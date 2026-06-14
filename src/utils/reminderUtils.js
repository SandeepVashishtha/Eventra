import { parseEventToUTC, getUserTimezone } from "./timezoneUtils.js";
import { safeJsonParse } from "./safeJsonParse.js";

export const REMINDERS_STORAGE_KEY = "eventra_event_reminders";
export const REMINDERS_CHANGED_EVENT = "eventraRemindersChanged";

// Maximum number of active reminders stored in localStorage.
// Prevents unbounded localStorage growth; oldest entry is dropped when exceeded.
export const MAX_REMINDERS = 100;

export const REMINDER_TIMINGS = [
  { value: "1d", label: "1 day before", minutesBefore: 24 * 60 },
  { value: "1h", label: "1 hour before", minutesBefore: 60 },
  { value: "15m", label: "15 minutes before", minutesBefore: 15 },
];

const normalizeEventId = (eventId) => String(eventId);

export const getReminderId = (eventId, timing) => `${normalizeEventId(eventId)}::${timing}`;

export const getEventDateTime = (event) => {
  if (!event?.date) return null;
  const tz = event.timezone || event.timeZone || getUserTimezone();
  const startMs = parseEventToUTC(event.date, event.time, tz);
  return startMs !== null ? new Date(startMs) : null;
};

export const isPastEvent = (event) => {
  const eventDateTime = getEventDateTime(event);
  return !eventDateTime || eventDateTime <= new Date();
};

export const getReminderTriggerTime = (event, timing) => {
  const timingConfig = REMINDER_TIMINGS.find((item) => item.value === timing);
  const eventDateTime = getEventDateTime(event);

  if (!timingConfig || !eventDateTime) return null;

  return new Date(eventDateTime.getTime() - timingConfig.minutesBefore * 60 * 1000);
};

const readReminders = () => {
  if (typeof window === "undefined") return [];

  try {
    const rawReminders = window.localStorage.getItem(REMINDERS_STORAGE_KEY);
    const parsedReminders = safeJsonParse(rawReminders, []);
    return Array.isArray(parsedReminders) ? parsedReminders : [];
  } catch {
    return [];
  }
};

const writeReminders = (reminders) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
    window.dispatchEvent(new CustomEvent(REMINDERS_CHANGED_EVENT, { detail: reminders }));
  } catch {
    // Keep the app usable if localStorage is blocked or full.
  }
};

export const getReminders = () => readReminders();

export const getActiveReminders = () => {
  const now = new Date();
  return readReminders()
    .filter((reminder) => {
      const eventDateTime = getEventDateTime(reminder.event);
      return eventDateTime && eventDateTime > now;
    })
    .sort((a, b) => new Date(a.triggerAt) - new Date(b.triggerAt));
};

export const getEventReminders = (eventId) => {
  const normalizedId = normalizeEventId(eventId);
  return readReminders().filter((reminder) => normalizeEventId(reminder.eventId) === normalizedId);
};

export const hasReminder = (eventId, timing) => {
  const reminderId = getReminderId(eventId, timing);
  return readReminders().some((reminder) => reminder.id === reminderId);
};

export const addReminder = (event, timing) => {
  if (isPastEvent(event)) {
    return { ok: false, reason: "past" };
  }

  const triggerAt = getReminderTriggerTime(event, timing);
  if (!triggerAt) {
    return { ok: false, reason: "invalid" };
  }

  if (triggerAt <= new Date()) {
    return { ok: false, reason: "elapsed" };
  }

  const reminders = readReminders();
  const id = getReminderId(event.id, timing);

  if (reminders.some((reminder) => reminder.id === id)) {
    return { ok: false, reason: "duplicate", reminders };
  }

  const timingConfig = REMINDER_TIMINGS.find((item) => item.value === timing);

  // Store only the minimal display fields needed to render the reminder UI
  // and fire the browser notification. The event description is intentionally
  // excluded — it can be large, may contain organizer contact details, and is
  // not needed at notification time. Full event data is fetched on demand when
  // the user taps the notification.
  const nextReminder = {
    id,
    eventId: normalizeEventId(event.id),
    timing,
    timingLabel: timingConfig?.label || timing,
    triggerAt: triggerAt.toISOString(),
    createdAt: new Date().toISOString(),
    event: {
      id: event.id,
      title: event.title ?? "",
      date: event.date ?? "",
      time: event.time ?? "",
      location: event.location ?? "",
      type: event.type ?? event.category ?? "",
      image: event.image ?? event.imageUrl ?? "",
    },
  };

  let nextReminders = [nextReminder, ...reminders];

  // Enforce MAX_REMINDERS cap: drop the oldest entry (last in the prepended
  // list, which is sorted newest-first) when exceeded.
  if (nextReminders.length > MAX_REMINDERS) {
    nextReminders = nextReminders.slice(0, MAX_REMINDERS);
  }

  writeReminders(nextReminders);
  return { ok: true, reminder: nextReminder, reminders: nextReminders };
};

export const removeReminder = (eventId, timing) => {
  const reminderId = getReminderId(eventId, timing);
  const nextReminders = readReminders().filter((reminder) => reminder.id !== reminderId);
  writeReminders(nextReminders);
  return nextReminders;
};

export const removeReminderById = (reminderId) => {
  const nextReminders = readReminders().filter((reminder) => reminder.id !== reminderId);
  writeReminders(nextReminders);
  return nextReminders;
};

export const popDueReminders = () => {
  const now = new Date();
  const reminders = readReminders();
  const dueReminders = [];
  const activeReminders = [];

  reminders.forEach((reminder) => {
    const eventDateTime = getEventDateTime(reminder.event);
    const triggerAt = new Date(reminder.triggerAt);

    if (!eventDateTime || eventDateTime <= now) {
      return;
    }

    if (triggerAt <= now) {
      dueReminders.push(reminder);
      return;
    }

    activeReminders.push(reminder);
  });

  if (dueReminders.length || activeReminders.length !== reminders.length) {
    writeReminders(activeReminders);
  }

  return dueReminders;
};

export const subscribeToReminderChanges = (callback) => {
  if (typeof window === "undefined") return () => {};

  const handleLocalChange = (event) => {
    callback(Array.isArray(event.detail) ? event.detail : readReminders());
  };

  // 🔥 FIX: drop the 'storage' event listener. The REMINDERS_CHANGED_EVENT
  // custom event already covers in-tab updates, and the 'storage' event only
  // fires in cross-tab scenarios in most modern browsers. When the same tab
  // does fire 'storage' (Safari, older Edge, some test harnesses), it caused
  // the callback to run twice for every local write — every reminder UI re-
  // rendered and unread-count badges briefly showed duplicates.
  window.addEventListener(REMINDERS_CHANGED_EVENT, handleLocalChange);

  return () => {
    window.removeEventListener(REMINDERS_CHANGED_EVENT, handleLocalChange);
  };
};
