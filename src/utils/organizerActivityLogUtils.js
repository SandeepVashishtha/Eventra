/**
 * Activity types supported by the organizer activity log.
 */
export const ACTIVITY_TYPES = {
  EVENT_CREATED: "event_created",
  EVENT_UPDATED: "event_updated",
  REGISTRATION_OPENED: "registration_opened",
  REGISTRATION_CLOSED: "registration_closed",
  ANNOUNCEMENT_PUBLISHED:
    "announcement_published",
  PARTICIPANT_REMOVED: "participant_removed",
  EVENT_CANCELLED: "event_cancelled",
};

/**
 * Human-readable labels for activity types.
 */
export const ACTIVITY_LABELS = {
  [ACTIVITY_TYPES.EVENT_CREATED]:
    "Event created",

  [ACTIVITY_TYPES.EVENT_UPDATED]:
    "Event updated",

  [ACTIVITY_TYPES.REGISTRATION_OPENED]:
    "Registration opened",

  [ACTIVITY_TYPES.REGISTRATION_CLOSED]:
    "Registration closed",

  [ACTIVITY_TYPES.ANNOUNCEMENT_PUBLISHED]:
    "Announcement published",

  [ACTIVITY_TYPES.PARTICIPANT_REMOVED]:
    "Participant removed",

  [ACTIVITY_TYPES.EVENT_CANCELLED]:
    "Event cancelled",
};

/**
 * Create a new organizer activity record.
 */
export const createActivityLog = ({
  type,
  action,
  eventId = null,
  eventName = "",
  organizerId = null,
  details = "",
  metadata = {},
  timestamp = new Date(),
} = {}) => {
  const activityType =
    type || action;

  return {
    id: generateActivityId(),
    type: activityType,
    action:
      ACTIVITY_LABELS[
        activityType
      ] ||
      action ||
      "Activity",
    eventId,
    eventName,
    organizerId,
    details,
    metadata,
    timestamp:
      new Date(timestamp).toISOString(),
  };
};

/**
 * Add an activity record to an existing log.
 */
export const addActivityLog = (
  activities = [],
  activity
) => {
  if (!activity) {
    return Array.isArray(activities)
      ? activities
      : [];
  }

  return [
    ...(
      Array.isArray(activities)
        ? activities
        : []
    ),
    activity,
  ];
};

/**
 * Create an event-created activity.
 */
export const createEventCreatedActivity = ({
  eventId,
  eventName,
  organizerId,
  details = "",
  metadata = {},
} = {}) => {
  return createActivityLog({
    type:
      ACTIVITY_TYPES.EVENT_CREATED,
    eventId,
    eventName,
    organizerId,
    details:
      details ||
      `Created event "${eventName || "Untitled event"}".`,
    metadata,
  });
};

/**
 * Create an event-updated activity.
 */
export const createEventUpdatedActivity = ({
  eventId,
  eventName,
  organizerId,
  details = "",
  metadata = {},
} = {}) => {
  return createActivityLog({
    type:
      ACTIVITY_TYPES.EVENT_UPDATED,
    eventId,
    eventName,
    organizerId,
    details:
      details ||
      `Updated event "${eventName || "Untitled event"}".`,
    metadata,
  });
};

/**
 * Create a registration-opened activity.
 */
export const createRegistrationOpenedActivity = ({
  eventId,
  eventName,
  organizerId,
  details = "",
  metadata = {},
} = {}) => {
  return createActivityLog({
    type:
      ACTIVITY_TYPES.REGISTRATION_OPENED,
    eventId,
    eventName,
    organizerId,
    details:
      details ||
      `Opened registration for "${eventName || "event"}".`,
    metadata,
  });
};

/**
 * Create a registration-closed activity.
 */
export const createRegistrationClosedActivity = ({
  eventId,
  eventName,
  organizerId,
  details = "",
  metadata = {},
} = {}) => {
  return createActivityLog({
    type:
      ACTIVITY_TYPES.REGISTRATION_CLOSED,
    eventId,
    eventName,
    organizerId,
    details:
      details ||
      `Closed registration for "${eventName || "event"}".`,
    metadata,
  });
};

/**
 * Create an announcement-published activity.
 */
export const createAnnouncementPublishedActivity = ({
  eventId,
  eventName,
  organizerId,
  details = "",
  metadata = {},
} = {}) => {
  return createActivityLog({
    type:
      ACTIVITY_TYPES.ANNOUNCEMENT_PUBLISHED,
    eventId,
    eventName,
    organizerId,
    details:
      details ||
      `Published an announcement for "${eventName || "event"}".`,
    metadata,
  });
};

/**
 * Create a participant-removed activity.
 */
export const createParticipantRemovedActivity = ({
  eventId,
  eventName,
  organizerId,
  participantId = null,
  participantName = "",
  details = "",
  metadata = {},
} = {}) => {
  return createActivityLog({
    type:
      ACTIVITY_TYPES.PARTICIPANT_REMOVED,
    eventId,
    eventName,
    organizerId,
    details:
      details ||
      `Removed ${
        participantName ||
        "a participant"
      } from "${eventName || "event"}".`,
    metadata: {
      ...metadata,
      participantId,
      participantName,
    },
  });
};

/**
 * Create an event-cancelled activity.
 */
export const createEventCancelledActivity = ({
  eventId,
  eventName,
  organizerId,
  details = "",
  metadata = {},
} = {}) => {
  return createActivityLog({
    type:
      ACTIVITY_TYPES.EVENT_CANCELLED,
    eventId,
    eventName,
    organizerId,
    details:
      details ||
      `Cancelled event "${eventName || "Untitled event"}".`,
    metadata,
  });
};

/**
 * Sort activities by timestamp.
 *
 * Default: newest first.
 */
export const sortActivityLogs = (
  activities = [],
  order = "desc"
) => {
  if (!Array.isArray(activities)) {
    return [];
  }

  return [...activities].sort(
    (a, b) => {
      const dateA = new Date(
        a.timestamp
      ).getTime();

      const dateB = new Date(
        b.timestamp
      ).getTime();

      return order === "asc"
        ? dateA - dateB
        : dateB - dateA;
    }
  );
};

/**
 * Filter activities by activity type.
 */
export const filterActivityByType = (
  activities = [],
  type
) => {
  if (!Array.isArray(activities)) {
    return [];
  }

  if (!type || type === "all") {
    return activities;
  }

  return activities.filter(
    (activity) =>
      activity.type === type
  );
};

/**
 * Filter activities belonging to
 * a specific event.
 */
export const filterActivityByEvent = (
  activities = [],
  eventId
) => {
  if (!Array.isArray(activities)) {
    return [];
  }

  if (!eventId) {
    return activities;
  }

  return activities.filter(
    (activity) =>
      activity.eventId === eventId
  );
};

/**
 * Get the available activity types
 * present in the log.
 */
export const getActivityTypes = (
  activities = []
) => {
  if (!Array.isArray(activities)) {
    return [];
  }

  return [
    ...new Set(
      activities
        .map(
          (activity) =>
            activity.type
        )
        .filter(Boolean)
    ),
  ];
};

/**
 * Get the human-readable label for
 * an activity type.
 */
export const getActivityLabel = (
  type
) => {
  return (
    ACTIVITY_LABELS[type] ||
    "Activity"
  );
};

/**
 * Format an activity timestamp.
 */
export const formatActivityTimestamp = (
  timestamp
) => {
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

/**
 * Get a relative time label such as
 * "2 hours ago" or "3 days ago".
 */
export const getRelativeActivityTime = (
  timestamp,
  referenceDate = new Date()
) => {
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const difference =
    referenceDate.getTime() -
    date.getTime();

  const seconds = Math.floor(
    Math.abs(difference) / 1000
  );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(
    seconds / 60
  );

  if (minutes < 60) {
    return `${minutes} ${
      minutes === 1
        ? "minute"
        : "minutes"
    } ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours} ${
      hours === 1
        ? "hour"
        : "hours"
    } ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 30) {
    return `${days} ${
      days === 1
        ? "day"
        : "days"
    } ago`;
  }

  const months = Math.floor(
    days / 30
  );

  if (months < 12) {
    return `${months} ${
      months === 1
        ? "month"
        : "months"
    } ago`;
  }

  const years = Math.floor(
    months / 12
  );

  return `${years} ${
    years === 1
      ? "year"
      : "years"
  } ago`;
};

/**
 * Search activity logs by event name,
 * action, or details.
 */
export const searchActivityLogs = (
  activities = [],
  searchTerm = ""
) => {
  if (!Array.isArray(activities)) {
    return [];
  }

  const query = String(searchTerm)
    .trim()
    .toLowerCase();

  if (!query) {
    return activities;
  }

  return activities.filter(
    (activity) => {
      const eventName =
        String(
          activity.eventName || ""
        ).toLowerCase();

      const action =
        String(
          activity.action || ""
        ).toLowerCase();

      const details =
        String(
          activity.details || ""
        ).toLowerCase();

      return (
        eventName.includes(query) ||
        action.includes(query) ||
        details.includes(query)
      );
    }
  );
};

/**
 * Get activity statistics.
 */
export const getActivityLogStats = (
  activities = []
) => {
  if (!Array.isArray(activities)) {
    return {
      total: 0,
      created: 0,
      updated: 0,
      registrationsOpened: 0,
      registrationsClosed: 0,
      announcementsPublished: 0,
      participantsRemoved: 0,
      cancelled: 0,
    };
  }

  return {
    total: activities.length,

    created: countActivityType(
      activities,
      ACTIVITY_TYPES.EVENT_CREATED
    ),

    updated: countActivityType(
      activities,
      ACTIVITY_TYPES.EVENT_UPDATED
    ),

    registrationsOpened:
      countActivityType(
        activities,
        ACTIVITY_TYPES.REGISTRATION_OPENED
      ),

    registrationsClosed:
      countActivityType(
        activities,
        ACTIVITY_TYPES.REGISTRATION_CLOSED
      ),

    announcementsPublished:
      countActivityType(
        activities,
        ACTIVITY_TYPES.ANNOUNCEMENT_PUBLISHED
      ),

    participantsRemoved:
      countActivityType(
        activities,
        ACTIVITY_TYPES.PARTICIPANT_REMOVED
      ),

    cancelled: countActivityType(
      activities,
      ACTIVITY_TYPES.EVENT_CANCELLED
    ),
  };
};

/**
 * Limit an activity log to the most
 * recent records.
 */
export const getRecentActivities = (
  activities = [],
  limit = 10
) => {
  if (!Array.isArray(activities)) {
    return [];
  }

  return sortActivityLogs(
    activities,
    "desc"
  ).slice(0, Math.max(0, limit));
};

/**
 * Remove duplicate activity records.
 */
export const removeDuplicateActivities = (
  activities = []
) => {
  if (!Array.isArray(activities)) {
    return [];
  }

  const seen = new Set();

  return activities.filter(
    (activity) => {
      const key =
        activity.id ||
        [
          activity.type,
          activity.eventId,
          activity.timestamp,
          activity.details,
        ].join("|");

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    }
  );
};

/**
 * Prepare an activity log for display.
 */
export const prepareActivityLog = (
  activities = [],
  {
    sortOrder = "desc",
    limit = null,
    search = "",
    type = "all",
    eventId = null,
  } = {}
) => {
  let result =
    removeDuplicateActivities(
      activities
    );

  result = searchActivityLogs(
    result,
    search
  );

  result = filterActivityByType(
    result,
    type
  );

  result = filterActivityByEvent(
    result,
    eventId
  );

  result = sortActivityLogs(
    result,
    sortOrder
  );

  if (
    Number.isInteger(limit) &&
    limit >= 0
  ) {
    result = result.slice(0, limit);
  }

  return result;
};

/**
 * Count activities of a specific type.
 */
const countActivityType = (
  activities,
  type
) => {
  return activities.filter(
    (activity) =>
      activity.type === type
  ).length;
};

/**
 * Generate a unique activity ID.
 */
const generateActivityId = () => {
  return `activity-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};