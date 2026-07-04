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

export const rangesOverlap = (first, second) =>
  first.start < second.end && second.start < first.end;

export const detectScheduleConflicts = (candidateEvent, events = []) => {
  const candidate = normalizeScheduledEvent(candidateEvent);
  if (!candidate) return [];

  const candidateId = String(candidate.id);

  return normalizeScheduledEvents(events)
    .filter((event) => String(event.id) !== candidateId)
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
  const slots = [];
  for (let minutes = startHour * 60; minutes < endHour * 60; minutes += stepMinutes) {
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

  if (view === "month") next.setMonth(next.getMonth() + amount);
  else if (view === "week") next.setDate(next.getDate() + amount * 7);
  else next.setDate(next.getDate() + amount);

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
