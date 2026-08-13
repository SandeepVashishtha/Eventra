export const ATTENDANCE_STATUSES = [
  "Registered",
  "Confirmed",
  "Checked In",
  "Attended",
  "Absent",
  "Cancelled",
];

export const CERTIFICATE_STATUSES = [
  "Not Available",
  "Pending",
  "Issued",
];

/**
 * Safely convert a value to a Date.
 */
export const parseEventDate = (date) => {
  if (!date) {
    return null;
  }

  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime())
    ? null
    : parsedDate;
};

/**
 * Check whether an event has already happened.
 */
export const isPastEvent = (
  event,
  referenceDate = new Date()
) => {
  const refDate = parseEventDate(referenceDate) || new Date();
  const eventDate = parseEventDate(
    event?.date || event?.eventDate
  );

  if (!eventDate) {
    return false;
  }

  return eventDate < refDate;
};

/**
 * Check whether an event is upcoming.
 */
export const isUpcomingEvent = (
  event,
  referenceDate = new Date()
) => {
  const refDate = parseEventDate(referenceDate) || new Date();
  const eventDate = parseEventDate(
    event?.date || event?.eventDate
  );

  if (!eventDate) {
    return false;
  }

  return eventDate >= refDate;
};

/**
 * Determine whether the user attended an event.
 */
export const hasAttendedEvent = (event) => {
  const status = String(
    event?.attendanceStatus ||
      event?.status ||
      ""
  )
    .trim()
    .toLowerCase();

  return [
    "attended",
    "present",
    "checked in",
    "checked-in",
  ].includes(status);
};

/**
 * Get the attendance status of an event.
 */
export const getAttendanceStatus = (event) => {
  if (!event) {
    return "Unknown";
  }

  if (event.attendanceStatus) {
    return event.attendanceStatus;
  }

  if (event.status) {
    return event.status;
  }

  return isPastEvent(event)
    ? "Not Recorded"
    : "Upcoming";
};

/**
 * Get certificate status.
 */
export const getCertificateStatus = (event) => {
  if (!event) {
    return "Not Available";
  }

  if (event.certificateStatus) {
    return event.certificateStatus;
  }

  if (
    event.certificateIssued === true ||
    event.hasCertificate === true
  ) {
    return "Issued";
  }

  if (event.certificatePending === true) {
    return "Pending";
  }

  return "Not Available";
};

/**
 * Get certificate information.
 */
export const getCertificateInfo = (event) => {
  const status =
    getCertificateStatus(event);

  return {
    status,
    available: status === "Issued",
    certificateId:
      event?.certificateId || null,
    certificateUrl:
      event?.certificateUrl || null,
  };
};

/**
 * Get the year of an event.
 */
export const getEventYear = (event) => {
  const eventDate = parseEventDate(
    event?.date || event?.eventDate
  );

  return eventDate
    ? eventDate.getFullYear()
    : null;
};

/**
 * Get the event type.
 */
export const getEventType = (event) => {
  return (
    event?.eventType ||
    event?.type ||
    event?.category ||
    "Other"
  );
};

/**
 * Filter attendance history by year.
 */
export const filterAttendanceByYear = (
  events = [],
  year = "All"
) => {
  if (!Array.isArray(events)) {
    return [];
  }

  if (
    year === "All" ||
    year === "" ||
    year === null
  ) {
    return events;
  }

  const selectedYear = Number(year);

  return events.filter(
    (event) =>
      getEventYear(event) === selectedYear
  );
};

/**
 * Filter attendance history by event type.
 */
export const filterAttendanceByType = (
  events = [],
  eventType = "All"
) => {
  if (!Array.isArray(events)) {
    return [];
  }

  if (
    eventType === "All" ||
    eventType === "" ||
    eventType === null
  ) {
    return events;
  }

  const selectedType = String(
    eventType
  )
    .trim()
    .toLowerCase();

  return events.filter(
    (event) =>
      getEventType(event)
        .trim()
        .toLowerCase() === selectedType
  );
};

/**
 * Apply both year and event-type filters.
 */
export const filterAttendanceHistory = (
  events = [],
  {
    year = "All",
    eventType = "All",
  } = {}
) => {
  const yearFiltered =
    filterAttendanceByYear(
      events,
      year
    );

  return filterAttendanceByType(
    yearFiltered,
    eventType
  );
};

/**
 * Sort events by date.
 *
 * Default: newest first.
 */
export const sortAttendanceHistory = (
  events = [],
  direction = "desc"
) => {
  if (!Array.isArray(events)) {
    return [];
  }

  return [...events].sort((a, b) => {
    const dateA = parseEventDate(
      a?.date || a?.eventDate
    );

    const dateB = parseEventDate(
      b?.date || b?.eventDate
    );

    if (!dateA && !dateB) {
      return 0;
    }

    if (!dateA) {
      return 1;
    }

    if (!dateB) {
      return -1;
    }

    return direction === "asc"
      ? dateA - dateB
      : dateB - dateA;
  });
};

/**
 * Get past events.
 */
export const getPastEvents = (
  events = [],
  referenceDate = new Date()
) => {
  return events.filter((event) =>
    isPastEvent(event, referenceDate)
  );
};

/**
 * Get upcoming events.
 */
export const getUpcomingEvents = (
  events = [],
  referenceDate = new Date()
) => {
  return events.filter((event) =>
    isUpcomingEvent(
      event,
      referenceDate
    )
  );
};

/**
 * Get only events that the user attended.
 */
export const getAttendedEvents = (
  events = []
) => {
  return events.filter(hasAttendedEvent);
};

/**
 * Calculate dashboard summary statistics.
 */
export const getAttendanceSummary = (
  events = [],
  referenceDate = new Date()
) => {
  const pastEvents = getPastEvents(
    events,
    referenceDate
  );

  const upcomingEvents =
    getUpcomingEvents(
      events,
      referenceDate
    );

  const attendedEvents =
    getAttendedEvents(events);

  return {
    totalEvents: events.length,
    totalEventsAttended:
      attendedEvents.length,
    upcomingEvents:
      upcomingEvents.length,
    pastEvents: pastEvents.length,
    certificatesIssued:
      events.filter(
        (event) =>
          getCertificateStatus(event) ===
          "Issued"
      ).length,
    certificatesPending:
      events.filter(
        (event) =>
          getCertificateStatus(event) ===
          "Pending"
      ).length,
  };
};

/**
 * Get unique years available in the history.
 */
export const getAvailableYears = (
  events = []
) => {
  const years = events
    .map(getEventYear)
    .filter(Boolean);

  return [
    ...new Set(years),
  ].sort((a, b) => b - a);
};

/**
 * Get unique event types available
 * in the attendance history.
 */
export const getAvailableEventTypes = (
  events = []
) => {
  const types = events
    .map(getEventType)
    .filter(Boolean);

  return [
    ...new Set(types),
  ].sort((a, b) =>
    a.localeCompare(b)
  );
};

/**
 * Format an event date for display.
 */
export const formatEventDate = (
  date
) => {
  const parsedDate =
    parseEventDate(date);

  if (!parsedDate) {
    return "Date not available";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

/**
 * Get a complete display model for an event.
 */
export const getAttendanceEventDetails = (
  event
) => {
  return {
    id:
      event?.id ||
      event?.eventId ||
      null,

    name:
      event?.eventName ||
      event?.name ||
      event?.title ||
      "Untitled Event",

    date: formatEventDate(
      event?.date ||
        event?.eventDate
    ),

    rawDate:
      event?.date ||
      event?.eventDate ||
      null,

    type: getEventType(event),

    attendanceStatus:
      getAttendanceStatus(event),

    attended:
      hasAttendedEvent(event),

    certificate:
      getCertificateInfo(event),

    venue:
      event?.venue ||
      event?.location ||
      null,
  };
};