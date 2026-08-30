const DEFAULT_DURATION_MINUTES = 60;
const DEFAULT_DAY_START_HOUR = 8;
const DEFAULT_DAY_END_HOUR = 20;
const ALLOWED_VIEWS = new Set(["month", "week", "day"]);

const pad = (value) => String(value).padStart(2, "0");

export const toDateKey = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const toTimeValue = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const formatDisplayTime = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

export const parseScheduleTime = (value = "") => {
  const input = String(value || "").trim();
  if (!input) return null;

  const ampm = input.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (ampm) {
    let hours = Number(ampm[1]);
    const minutes = Number(ampm[2] || 0);
    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
    const period = ampm[3].toUpperCase();
    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return { hours, minutes };
  }

  const twentyFour = input.match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (twentyFour) {
    const hours = Number(twentyFour[1]);
    const minutes = Number(twentyFour[2] || 0);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return { hours, minutes };
  }

  return null;
};

export const buildDateTime = (dateValue, timeValue) => {
  if (!dateValue) return null;
  const dateText = String(dateValue);
  const parsedDate = new Date(dateText);

  if (dateText.includes("T") && !Number.isNaN(parsedDate.getTime()) && !timeValue) {
    return parsedDate;
  }

  const dateOnly = dateText.includes("T") ? dateText.slice(0, 10) : dateText;
  const dateMatch = dateOnly.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const fallbackDate = Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  const base = dateMatch
    ? new Date(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3]), 0, 0, 0, 0)
    : fallbackDate;

  if (!base || Number.isNaN(base.getTime())) return null;

  const time = parseScheduleTime(timeValue || "");
  if (time) {
    base.setHours(time.hours, time.minutes, 0, 0);
  }

  return base;
};

export const getEventIdentity = (event = {}) =>
  event.id ?? event.eventId ?? event._id ?? event.slug ?? "";

export const getEventOrganizer = (event = {}) => {
  if (typeof event.organizer === "string") return event.organizer;
  return (
    event.organizer?.name ||
    event.organizerName ||
    event.hostName ||
    event.createdBy ||
    ""
  );
};

export const getEventVenue = (event = {}) => {
  if (typeof event.venue === "string") return event.venue;
  if (typeof event.location === "string") return event.location;
  return (
    event.venue?.name ||
    event.location?.name ||
    event.location?.city ||
    event.room ||
    ""
  );
};

export const getEventResources = (event = {}) => {
  const values = [
    event.resource,
    event.resourceId,
    event.room,
    event.track,
    ...(Array.isArray(event.resources) ? event.resources : []),
  ].filter(Boolean);

  return values.map((value) => String(value).toLowerCase());
};

export const getEventDurationMinutes = (event = {}) => {
  if (Number.isFinite(event.durationMinutes) && event.durationMinutes > 0) {
    return event.durationMinutes;
  }

  const start = buildDateTime(event.startDate || event.date, event.startTime || event.time);
  const end = buildDateTime(event.endDate || event.date, event.endTime);

  if (start && end && end > start) {
    return Math.round((end.getTime() - start.getTime()) / 60000);
  }

  // Fallback: use start time + default duration instead of midnight
  if (start && !event.endTime) {
    return DEFAULT_DURATION_MINUTES;
  }

  return DEFAULT_DURATION_MINUTES;
};

export const normalizeScheduledEvent = (event = {}) => {
  if (!event || typeof event !== "object") return null;

  const start =
    buildDateTime(event.startDate || event.date, event.startTime || event.time) ||
    buildDateTime(event.date, event.time);

  if (!start) return null;

  const durationMinutes = getEventDurationMinutes(event);
  const explicitEnd = buildDateTime(event.endDate || event.date, event.endTime);
  const end =
    explicitEnd && explicitEnd > start
      ? explicitEnd
      : new Date(start.getTime() + durationMinutes * 60000);

  return {
    ...event,
    id: getEventIdentity(event),
    title: event.title || event.name || "Untitled event",
    start,
    end,
    durationMinutes: Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000)),
    dateKey: toDateKey(start),
    timeLabel: `${formatDisplayTime(start)} - ${formatDisplayTime(end)}`,
    organizerLabel: getEventOrganizer(event),
    venueLabel: getEventVenue(event),
    resources: getEventResources(event),
  };
};

export const normalizeScheduledEvents = (events = []) =>
  (Array.isArray(events) ? events : [])
    .map(normalizeScheduledEvent)
    .filter(Boolean)
    .sort((first, second) => first.start - second.start);

export const validateScheduleRange = ({
  start,
  end,
  minDate,
  maxDate,
  dayStartHour = DEFAULT_DAY_START_HOUR,
  dayEndHour = DEFAULT_DAY_END_HOUR,
} = {}) => {
  if (!(start instanceof Date) || Number.isNaN(start.getTime())) {
    return { ok: false, reason: "Start date is invalid." };
  }

  if (!(end instanceof Date) || Number.isNaN(end.getTime())) {
    return { ok: false, reason: "End date is invalid." };
  }

  if (start >= end) {
    return { ok: false, reason: "Start time must be before end time." };
  }

  if (minDate && start < minDate) {
    return { ok: false, reason: "Event cannot be scheduled before the allowed range." };
  }

  if (maxDate && end > maxDate) {
    return { ok: false, reason: "Event cannot be scheduled after the allowed range." };
  }

  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  if (startMinutes < dayStartHour * 60 || endMinutes > dayEndHour * 60) {
    return { ok: false, reason: "Drop inside the allowed scheduling hours." };
  }

  return { ok: true };
};

export const applyScheduleToEvent = (event, start, durationMinutes = null) => {
  const duration = durationMinutes || getEventDurationMinutes(event);
  const end = new Date(start.getTime() + duration * 60000);
  const date = toDateKey(start);
  const time = formatDisplayTime(start);
  const endTime = formatDisplayTime(end);

  return {
    ...event,
    date,
    time,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    startTime: time,
    endTime,
    durationMinutes: duration,
    updatedAt: new Date().toISOString(),
  };
};

export const buildScheduleUpdatePayload = (eventId, start, end) => ({
  eventId,
  startDate: start.toISOString(),
  endDate: end.toISOString(),
});

/**
 * Safely checks if two sessions overlap in time by normalizing their start and end
 * timestamps into UTC epoch milliseconds before comparison.
 * Returns false if either session is missing or contains invalid date values.
 *
 * @param {Object} sessionA
 * @param {Object} sessionB
 * @returns {boolean}
 */
export const checkScheduleOverlap = (sessionA, sessionB) => {
  if (!sessionA || !sessionB) return false;

  const extractTime = (val) => {
    if (!val) return NaN;
    if (val instanceof Date) return val.getTime();
    if (typeof val === "number") return val;
    return new Date(val).getTime();
  };

  const startA = extractTime(sessionA.start || sessionA.startTime || sessionA.startDate);
  const endA = extractTime(sessionA.end || sessionA.endTime || sessionA.endDate);
  const startB = extractTime(sessionB.start || sessionB.startTime || sessionB.startDate);
  const endB = extractTime(sessionB.end || sessionB.endTime || sessionB.endDate);

  if ([startA, endA, startB, endB].some(Number.isNaN)) {
    return false;
  }

  return startA < endB && startB < endA;
};

export const rangesOverlap = (first, second) => checkScheduleOverlap(first, second);

export const detectScheduleConflicts = (candidateEvent, events = []) => {
  const candidate = normalizeScheduledEvent(candidateEvent);
  if (!candidate) return [];

  return normalizeScheduledEvents(
    // Drop the candidate itself from the comparison by object reference. This
    // is the only reliable way to exclude an id-less event without a shared
    // sentinel (issue #14616).
    events.filter((event) => event !== candidateEvent),
  )
    .filter((event) => {
      // Saved events share a stable identity, so the candidate's own row — or
      // a re-fetched copy of it — is excluded by id. Id-less events collapse
      // onto the "" identity, so excluding by identity here would remove every
      // unsaved event from the overlap check. For an id-less candidate every
      // remaining event (saved or not) must be compared.
      if (candidate.id === "") return true;
      return String(event.id) !== String(candidate.id);
    })
    .filter((event) => rangesOverlap(candidate, event))
    .map((event) => {
      const types = ["time"];
      if (
        candidate.venueLabel &&
        event.venueLabel &&
        candidate.venueLabel.toLowerCase() === event.venueLabel.toLowerCase()
      ) {
        types.push("venue");
      }
      if (
        candidate.organizerLabel &&
        event.organizerLabel &&
        candidate.organizerLabel.toLowerCase() === event.organizerLabel.toLowerCase()
      ) {
        types.push("organizer");
      }
      if (candidate.resources.some((resource) => event.resources.includes(resource))) {
        types.push("resource");
      }

      return {
        event,
        types,
        message: `${event.title} overlaps this time slot.`,
      };
    });
};

export const startOfCalendarWeek = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
};

export const buildCalendarDays = (view = "week", anchorDate = new Date()) => {
  const safeView = ALLOWED_VIEWS.has(view) ? view : "week";
  const anchor = new Date(anchorDate);
  anchor.setHours(0, 0, 0, 0);

  if (safeView === "day") return [anchor];

  if (safeView === "week") {
    const start = startOfCalendarWeek(anchor);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }

  const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = startOfCalendarWeek(firstOfMonth);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
};

export const buildTimeSlots = ({
  startHour = DEFAULT_DAY_START_HOUR,
  endHour = DEFAULT_DAY_END_HOUR,
  stepMinutes = 60,
} = {}) => {
  const safeStep = Number.isFinite(stepMinutes) && stepMinutes > 0 ? stepMinutes : DEFAULT_DURATION_MINUTES;
  const start = startHour * 60;
  const end = endHour * 60;
  const slots = [];
  for (let minutes = start; minutes < end; minutes += safeStep) {
    slots.push({
      minutes,
      label: formatDisplayTime(new Date(2026, 0, 1, Math.floor(minutes / 60), minutes % 60)),
    });
  }
  return slots;
};

export const getSlotDateTime = (date, minutes) => {
  const result = new Date(date);
  result.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return result;
};

export const navigateCalendarDate = (date, view, direction) => {
  const next = new Date(date);
  const amount = direction === "next" ? 1 : -1;

  if (view === "month") {
    // Clamp the anchor day to the 1st before advancing the month, otherwise
    // JS Date rolls over: setMonth on Jan 31 lands on Mar 3 (Feb 31 doesn't
    // exist), skipping February entirely. Anchoring on day 1 guarantees the
    // target month is reached; the caller reselects a concrete day later.
    next.setDate(1);
    next.setMonth(next.getMonth() + amount);
  } else if (view === "week") {
    next.setDate(next.getDate() + amount * 7);
  } else {
    next.setDate(next.getDate() + amount);
  }

  return next;
};

export const getCategoryColorClass = (category = "") => {
  const key = String(category).toLowerCase();
  if (key.includes("ai") || key.includes("machine")) return "border-cyan-300 bg-cyan-50 text-cyan-900";
  if (key.includes("design") || key.includes("ux")) return "border-rose-300 bg-rose-50 text-rose-900";
  if (key.includes("devops") || key.includes("cloud")) return "border-sky-300 bg-sky-50 text-sky-900";
  if (key.includes("web3") || key.includes("blockchain")) return "border-violet-300 bg-violet-50 text-violet-900";
  if (key.includes("security")) return "border-amber-300 bg-amber-50 text-amber-900";
  return "border-emerald-300 bg-emerald-50 text-emerald-900";
};
