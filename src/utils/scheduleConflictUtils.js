/**
 * Schedule Conflict Detection utilities.
 *
 * Supports:
 * - Event start/end date parsing
 * - Same-day event conflicts
 * - Multi-day event conflicts
 * - Timezone-aware date parsing
 * - Conflict detection against registered events
 * - Conflict filtering
 * - Conflict messages
 */

/**
 * Normalize an ID.
 */
export const normalizeScheduleId = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
};

/**
 * Safely convert a value to a Date.
 */
export const parseScheduleDate = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const date =
    value instanceof Date
      ? new Date(value.getTime())
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
};

/**
 * Get a possible start value from an event.
 */
export const getEventStartValue = (
  event = {}
) => {
  return (
    event.startDateTime ??
    event.startDatetime ??
    event.startTime ??
    event.startDate ??
    event.startsAt ??
    event.start_at ??
    event.date
  );
};

/**
 * Get a possible end value from an event.
 */
export const getEventEndValue = (
  event = {}
) => {
  return (
    event.endDateTime ??
    event.endDatetime ??
    event.endTime ??
    event.endDate ??
    event.endsAt ??
    event.end_at
  );
};

/**
 * Get the start date of an event.
 */
export const getEventStartDate = (
  event = {}
) => {
  return parseScheduleDate(
    getEventStartValue(event)
  );
};

/**
 * Get the end date of an event.
 *
 * If an event has no explicit end time,
 * the event is treated as lasting one hour.
 */
export const getEventEndDate = (
  event = {}
) => {
  const startDate =
    getEventStartDate(event);

  const endValue =
    getEventEndValue(event);

  const endDate =
    parseScheduleDate(
      endValue
    );

  if (endDate) {
    return endDate;
  }

  if (startDate) {
    return new Date(
      startDate.getTime() +
        60 * 60 * 1000
    );
  }

  return null;
};

/**
 * Return an event's schedule range.
 */
export const getEventScheduleRange = (
  event = {}
) => {
  const start =
    getEventStartDate(event);

  const end =
    getEventEndDate(event);

  if (!start || !end) {
    return null;
  }

  /*
   * Protect against malformed events where
   * the end is before the start.
   */
  if (
    end.getTime() <
    start.getTime()
  ) {
    return {
      start: end,
      end: start,
      reversed: true,
    };
  }

  return {
    start,
    end,
  };
};

/**
 * Check whether an event has a valid schedule.
 */
export const hasValidEventSchedule = (
  event = {}
) => {
  return Boolean(
    getEventScheduleRange(
      event
    )
  );
};

/**
 * Check whether two event schedules overlap.
 *
 * Adjacent events such as:
 *
 * 10:00 - 11:00
 * 11:00 - 12:00
 *
 * are NOT considered conflicts.
 */
export const schedulesOverlap = (
  firstEvent,
  secondEvent
) => {
  const firstRange =
    getEventScheduleRange(
      firstEvent
    );

  const secondRange =
    getEventScheduleRange(
      secondEvent
    );

  if (
    !firstRange ||
    !secondRange
  ) {
    return false;
  }

  return (
    firstRange.start.getTime() <
      secondRange.end.getTime() &&
    firstRange.end.getTime() >
      secondRange.start.getTime()
  );
};

/**
 * Get the actual overlapping period
 * between two events.
 */
export const getScheduleOverlap = (
  firstEvent,
  secondEvent
) => {
  const firstRange =
    getEventScheduleRange(
      firstEvent
    );

  const secondRange =
    getEventScheduleRange(
      secondEvent
    );

  if (
    !firstRange ||
    !secondRange ||
    !schedulesOverlap(
      firstEvent,
      secondEvent
    )
  ) {
    return null;
  }

  const startTime =
    Math.max(
      firstRange.start.getTime(),
      secondRange.start.getTime()
    );

  const endTime =
    Math.min(
      firstRange.end.getTime(),
      secondRange.end.getTime()
    );

  return {
    start: new Date(
      startTime
    ),
    end: new Date(
      endTime
    ),
    durationMinutes:
      Math.max(
        0,
        Math.round(
          (endTime -
            startTime) /
            60000
        )
      ),
  };
};

/**
 * Get an event ID.
 */
export const getEventId = (
  event = {}
) => {
  return normalizeScheduleId(
    event.id ??
      event.eventId ??
      event.event_id
  );
};

/**
 * Check whether two events are actually
 * the same event.
 */
export const areSameEvent = (
  firstEvent,
  secondEvent
) => {
  const firstId =
    getEventId(firstEvent);

  const secondId =
    getEventId(secondEvent);

  return Boolean(
    firstId &&
      secondId &&
      firstId === secondId
  );
};

/**
 * Detect a conflict between a new event
 * and one registered event.
 */
export const detectScheduleConflict = (
  newEvent,
  registeredEvent
) => {
  if (
    !newEvent ||
    !registeredEvent
  ) {
    return null;
  }

  if (
    areSameEvent(
      newEvent,
      registeredEvent
    )
  ) {
    return null;
  }

  if (
    !schedulesOverlap(
      newEvent,
      registeredEvent
    )
  ) {
    return null;
  }

  const overlap =
    getScheduleOverlap(
      newEvent,
      registeredEvent
    );

  return {
    eventId:
      getEventId(
        registeredEvent
      ),

    sourceEvent:
      newEvent,

    event:
      registeredEvent,

    overlap,

    message:
      createScheduleConflictMessage(
        newEvent,
        registeredEvent
      ),
  };
};

/**
 * Find all events conflicting with
 * the new event.
 */
export const findScheduleConflicts = (
  newEvent,
  registeredEvents = []
) => {
  if (
    !newEvent ||
    !Array.isArray(
      registeredEvents
    )
  ) {
    return [];
  }

  return registeredEvents
    .map(
      (registeredEvent) =>
        detectScheduleConflict(
          newEvent,
          registeredEvent
        )
    )
    .filter(Boolean);
};

/**
 * Check whether a new event has any
 * schedule conflict.
 */
export const hasScheduleConflict = (
  newEvent,
  registeredEvents = []
) => {
  return (
    findScheduleConflicts(
      newEvent,
      registeredEvents
    ).length > 0
  );
};

/**
 * Get the number of conflicts.
 */
export const getScheduleConflictCount = (
  newEvent,
  registeredEvents = []
) => {
  return findScheduleConflicts(
    newEvent,
    registeredEvents
  ).length;
};

/**
 * Get event title safely.
 */
export const getEventTitle = (
  event = {}
) => {
  return (
    event.title ||
    event.name ||
    event.eventTitle ||
    "Untitled Event"
  );
};

/**
 * Format an event's date/time.
 */
export const formatEventSchedule = (
  event
) => {
  const range =
    getEventScheduleRange(
      event
    );

  if (!range) {
    return "Schedule unavailable";
  }

  const dateFormatter =
    new Intl.DateTimeFormat(
      undefined,
      {
        dateStyle: "medium",
      }
    );

  const timeFormatter =
    new Intl.DateTimeFormat(
      undefined,
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );

  const sameDay =
    range.start.toDateString() ===
    range.end.toDateString();

  if (sameDay) {
    return `${dateFormatter.format(
      range.start
    )}, ${timeFormatter.format(
      range.start
    )} – ${timeFormatter.format(
      range.end
    )}`;
  }

  return `${dateFormatter.format(
    range.start
  )}, ${timeFormatter.format(
    range.start
  )} – ${dateFormatter.format(
    range.end
  )}, ${timeFormatter.format(
    range.end
  )}`;
};

/**
 * Format the overlapping period.
 */
export const formatScheduleOverlap = (
  overlap
) => {
  if (!overlap) {
    return "";
  }

  const formatter =
    new Intl.DateTimeFormat(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );

  return `${formatter.format(
    overlap.start
  )} – ${formatter.format(
    overlap.end
  )}`;
};

/**
 * Create a user-facing conflict message.
 */
export const createScheduleConflictMessage =
  (
    newEvent,
    conflictingEvent
  ) => {
    const title =
      getEventTitle(
        conflictingEvent
      );

    const schedule =
      formatEventSchedule(
        conflictingEvent
      );

    return `Schedule Conflict: You already have "${title}" scheduled during this time (${schedule}).`;
  };

/**
 * Create a shorter conflict message.
 */
export const createShortConflictMessage =
  (
    conflictingEvent
  ) => {
    return `You already have "${getEventTitle(
      conflictingEvent
    )}" scheduled during this time.`;
  };

/**
 * Get all events that overlap with
 * a specific event.
 */
export const getConflictingEvents = (
  event,
  events = []
) => {
  return findScheduleConflicts(
    event,
    events
  ).map(
    (conflict) =>
      conflict.event
  );
};

/**
 * Remove duplicate events by ID.
 */
export const removeDuplicateEvents = (
  events = []
) => {
  if (
    !Array.isArray(events)
  ) {
    return [];
  }

  const seen = new Set();

  return events.filter(
    (event) => {
      const id =
        getEventId(event);

      if (!id) {
        return true;
      }

      if (seen.has(id)) {
        return false;
      }

      seen.add(id);

      return true;
    }
  );
};

/**
 * Sort events by start time.
 */
export const sortEventsByStartTime = (
  events = []
) => {
  return [
    ...(Array.isArray(
      events
    )
      ? events
      : []),
  ].sort(
    (first, second) => {
      const firstStart =
        getEventStartDate(
          first
        );

      const secondStart =
        getEventStartDate(
          second
        );

      if (!firstStart) {
        return 1;
      }

      if (!secondStart) {
        return -1;
      }

      return (
        firstStart.getTime() -
        secondStart.getTime()
      );
    }
  );
};

/**
 * Get conflicts sorted by event time.
 */
export const sortConflictsByStartTime =
  (
    conflicts = []
  ) => {
    return [
      ...(Array.isArray(
        conflicts
      )
        ? conflicts
        : []),
    ].sort(
      (first, second) => {
        const firstStart =
          getEventStartDate(
            first.event
          );

        const secondStart =
          getEventStartDate(
            second.event
          );

        if (!firstStart) {
          return 1;
        }

        if (!secondStart) {
          return -1;
        }

        return (
          firstStart.getTime() -
          secondStart.getTime()
        );
      }
    );
  };

/**
 * Get conflict summary.
 */
export const getScheduleConflictSummary = (
  newEvent,
  registeredEvents = []
) => {
  const conflicts =
    sortConflictsByStartTime(
      findScheduleConflicts(
        newEvent,
        registeredEvents
      )
    );

  return {
    hasConflict:
      conflicts.length > 0,

    conflictCount:
      conflicts.length,

    conflicts,

    conflictingEvents:
      conflicts.map(
        (conflict) =>
          conflict.event
      ),
  };
};

/**
 * Get the strongest conflict level.
 *
 * severe:
 * The new event completely contains or is
 * completely contained by another event.
 *
 * moderate:
 * Partial overlap.
 */
export const getConflictSeverity = (
  newEvent,
  conflictingEvent
) => {
  const firstRange =
    getEventScheduleRange(
      newEvent
    );

  const secondRange =
    getEventScheduleRange(
      conflictingEvent
    );

  if (
    !firstRange ||
    !secondRange ||
    !schedulesOverlap(
      newEvent,
      conflictingEvent
    )
  ) {
    return "none";
  }

  const firstStart =
    firstRange.start.getTime();

  const firstEnd =
    firstRange.end.getTime();

  const secondStart =
    secondRange.start.getTime();

  const secondEnd =
    secondRange.end.getTime();

  const firstContainsSecond =
    firstStart <=
      secondStart &&
    firstEnd >=
      secondEnd;

  const secondContainsFirst =
    secondStart <=
      firstStart &&
    secondEnd >=
      firstEnd;

  if (
    firstContainsSecond ||
    secondContainsFirst
  ) {
    return "severe";
  }

  return "moderate";
};

/**
 * Get the total overlapping duration
 * in minutes.
 */
export const getTotalConflictDuration = (
  newEvent,
  registeredEvents = []
) => {
  const conflicts =
    findScheduleConflicts(
      newEvent,
      registeredEvents
    );

  return conflicts.reduce(
    (total, conflict) =>
      total +
      Number(
        conflict.overlap
          ?.durationMinutes || 0
      ),
    0
  );
};

/**
 * Filter conflicts by severity.
 */
export const filterConflictsBySeverity = (
  conflicts = [],
  severity
) => {
  if (
    !Array.isArray(
      conflicts
    )
  ) {
    return [];
  }

  return conflicts.filter(
    (conflict) =>
      getConflictSeverity(
        conflict.sourceEvent ||
          {},
        conflict.event ||
          {}
      ) === severity
  );
};

/**
 * Get events occurring on the same
 * calendar date.
 */
export const getEventsOnSameDate = (
  targetEvent,
  events = []
) => {
  const targetStart =
    getEventStartDate(
      targetEvent
    );

  if (!targetStart) {
    return [];
  }

  const targetYear =
    targetStart.getFullYear();

  const targetMonth =
    targetStart.getMonth();

  const targetDay =
    targetStart.getDate();

  return (
    Array.isArray(events)
      ? events
      : []
  ).filter((event) => {
    const start =
      getEventStartDate(
        event
      );

    if (!start) {
      return false;
    }

    return (
      start.getFullYear() ===
        targetYear &&
      start.getMonth() ===
        targetMonth &&
      start.getDate() ===
        targetDay
    );
  });
};

/**
 * Determine whether an event is currently
 * happening.
 */
export const isEventCurrentlyActive = (
  event,
  now = new Date()
) => {
  const range =
    getEventScheduleRange(
      event
    );

  if (!range) {
    return false;
  }

  const current =
    parseScheduleDate(
      now
    );

  if (!current) {
    return false;
  }

  return (
    current.getTime() >=
      range.start.getTime() &&
    current.getTime() <
      range.end.getTime()
  );
};

/**
 * Determine whether an event has already
 * finished.
 */
export const isEventFinished = (
  event,
  now = new Date()
) => {
  const end =
    getEventEndDate(
      event
    );

  const current =
    parseScheduleDate(
      now
    );

  if (!end || !current) {
    return false;
  }

  return (
    current.getTime() >=
    end.getTime()
  );
};

/**
 * Determine whether an event is upcoming.
 */
export const isEventUpcoming = (
  event,
  now = new Date()
) => {
  const start =
    getEventStartDate(
      event
    );

  const current =
    parseScheduleDate(
      now
    );

  if (!start || !current) {
    return false;
  }

  return (
    start.getTime() >
    current.getTime()
  );
};

/**
 * Validate a schedule before conflict
 * detection.
 */
export const validateEventSchedule = (
  event
) => {
  const range =
    getEventScheduleRange(
      event
    );

  if (!range) {
    return {
      valid: false,
      errors: [
        "Event start and end times are required.",
      ],
    };
  }

  if (
    range.reversed
  ) {
    return {
      valid: false,
      errors: [
        "Event end time must be after the start time.",
      ],
    };
  }

  if (
    range.end.getTime() <=
    range.start.getTime()
  ) {
    return {
      valid: false,
      errors: [
        "Event end time must be after the start time.",
      ],
    };
  }

  return {
    valid: true,
    errors: [],
  };
};

/**
 * Create a conflict result suitable for
 * registration workflows.
 */
export const checkRegistrationScheduleConflicts =
  ({
    event,
    registeredEvents = [],
  } = {}) => {
    const validation =
      validateEventSchedule(
        event
      );

    if (!validation.valid) {
      return {
        valid: false,
        hasConflict: false,
        conflicts: [],
        error:
          validation.errors.join(
            " "
          ),
      };
    }

    const summary =
      getScheduleConflictSummary(
        event,
        registeredEvents
      );

    return {
      valid: true,
      hasConflict:
        summary.hasConflict,
      conflictCount:
        summary.conflictCount,
      conflicts:
        summary.conflicts,
      conflictingEvents:
        summary.conflictingEvents,
      message:
        summary.hasConflict
          ? createShortConflictMessage(
              summary.conflicts[0]
                .event
            )
          : "",
    };
  };

/**
 * Get a complete conflict report.
 */
export const getScheduleConflictReport = (
  event,
  registeredEvents = []
) => {
  const result =
    checkRegistrationScheduleConflicts(
      {
        event,
        registeredEvents,
      }
    );

  return {
    ...result,

    eventTitle:
      getEventTitle(event),

    eventSchedule:
      formatEventSchedule(
        event
      ),

    totalConflictDuration:
      getTotalConflictDuration(
        event,
        registeredEvents
      ),
  };
};