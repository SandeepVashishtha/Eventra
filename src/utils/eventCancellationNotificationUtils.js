/**
 * Event change types.
 */
export const EVENT_CHANGE_TYPES = {
  CANCELLED: "cancelled",
  RESCHEDULED: "rescheduled",
};

/**
 * Event statuses.
 */
export const EVENT_STATUSES = {
  SCHEDULED: "scheduled",
  RESCHEDULED: "rescheduled",
  CANCELLED: "cancelled",
};

/**
 * Create a cancellation notification.
 */
export const createCancellationNotification = ({
  eventId = null,
  eventName = "Event",
  reason = "",
  participantId = null,
  createdAt = new Date(),
} = {}) => {
  return {
    id: generateNotificationId(),
    eventId,
    eventName,
    participantId,
    type: EVENT_CHANGE_TYPES.CANCELLED,
    status: EVENT_STATUSES.CANCELLED,
    title: "Event Cancelled",
    message:
      reason ||
      "This event has been cancelled by the organizer.",
    reason,
    newDateTime: null,
    createdAt: new Date(
      createdAt
    ).toISOString(),
    read: false,
  };
};

/**
 * Create a reschedule notification.
 */
export const createRescheduleNotification = ({
  eventId = null,
  eventName = "Event",
  reason = "",
  oldDateTime = null,
  newDateTime = null,
  participantId = null,
  createdAt = new Date(),
} = {}) => {
  return {
    id: generateNotificationId(),
    eventId,
    eventName,
    participantId,
    type: EVENT_CHANGE_TYPES.RESCHEDULED,
    status: EVENT_STATUSES.RESCHEDULED,
    title: "Event Rescheduled",
    message:
      reason ||
      "This event has been rescheduled by the organizer.",
    reason,
    oldDateTime: toISOString(
      oldDateTime
    ),
    newDateTime: toISOString(
      newDateTime
    ),
    createdAt: new Date(
      createdAt
    ).toISOString(),
    read: false,
  };
};

/**
 * Update an event's status.
 */
export const updateEventStatus = (
  event,
  status,
  details = {}
) => {
  if (!event) {
    return null;
  }

  if (
    !Object.values(
      EVENT_STATUSES
    ).includes(status)
  ) {
    return event;
  }

  return {
    ...event,
    status,
    ...details,
    updatedAt:
      new Date().toISOString(),
  };
};

/**
 * Cancel an event and update its status.
 */
export const cancelEvent = (
  event,
  reason = ""
) => {
  return updateEventStatus(
    event,
    EVENT_STATUSES.CANCELLED,
    {
      cancellationReason: reason,
      cancelledAt:
        new Date().toISOString(),
    }
  );
};

/**
 * Reschedule an event and update its
 * start date/time.
 */
export const rescheduleEvent = (
  event,
  newDateTime,
  reason = ""
) => {
  if (!event) {
    return null;
  }

  const parsedDate = new Date(
    newDateTime
  );

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return event;
  }

  const oldDateTime =
    getEventStartDate(event);

  return updateEventStatus(
    event,
    EVENT_STATUSES.RESCHEDULED,
    {
      startDateTime:
        parsedDate.toISOString(),
      previousDateTime:
        oldDateTime
          ? oldDateTime.toISOString()
          : null,
      rescheduleReason: reason,
      rescheduledAt:
        new Date().toISOString(),
    }
  );
};

/**
 * Get an event's start date/time.
 */
export const getEventStartDate = (
  event = {}
) => {
  const value =
    event.startDateTime ||
    event.startDate ||
    event.eventDateTime ||
    event.eventDate ||
    event.date ||
    event.startTime;

  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

/**
 * Notify all registered participants
 * about an event cancellation.
 */
export const createCancellationNotifications = ({
  event,
  participants = [],
  reason = "",
  createdAt = new Date(),
} = {}) => {
  if (!event || !Array.isArray(participants)) {
    return [];
  }

  return participants
    .filter(
      (participant) =>
        participant &&
        getParticipantId(
          participant
        )
    )
    .map((participant) =>
      createCancellationNotification({
        eventId:
          event.id ||
          event.eventId ||
          null,
        eventName:
          event.name ||
          event.title ||
          "Event",
        reason,
        participantId:
          getParticipantId(
            participant
          ),
        createdAt,
      })
    );
};

/**
 * Notify all registered participants
 * about an event reschedule.
 */
export const createRescheduleNotifications = ({
  event,
  participants = [],
  newDateTime,
  reason = "",
  createdAt = new Date(),
} = {}) => {
  if (!event || !Array.isArray(participants)) {
    return [];
  }

  const oldDateTime =
    getEventStartDate(event);

  return participants
    .filter(
      (participant) =>
        participant &&
        getParticipantId(
          participant
        )
    )
    .map((participant) =>
      createRescheduleNotification({
        eventId:
          event.id ||
          event.eventId ||
          null,
        eventName:
          event.name ||
          event.title ||
          "Event",
        reason,
        oldDateTime,
        newDateTime,
        participantId:
          getParticipantId(
            participant
          ),
        createdAt,
      })
    );
};

/**
 * Add a notification to a notification list.
 */
export const addNotification = (
  notifications = [],
  notification
) => {
  if (!notification) {
    return Array.isArray(notifications)
      ? notifications
      : [];
  }

  return [
    ...(
      Array.isArray(notifications)
        ? notifications
        : []
    ),
    notification,
  ];
};

/**
 * Add multiple notifications.
 */
export const addNotifications = (
  notifications = [],
  newNotifications = []
) => {
  if (!Array.isArray(newNotifications)) {
    return Array.isArray(notifications)
      ? notifications
      : [];
  }

  return [
    ...(
      Array.isArray(notifications)
        ? notifications
        : []
    ),
    ...newNotifications.filter(
      Boolean
    ),
  ];
};

/**
 * Mark a notification as read.
 */
export const markNotificationAsRead = (
  notification
) => {
  if (!notification) {
    return null;
  }

  return {
    ...notification,
    read: true,
    readAt:
      new Date().toISOString(),
  };
};

/**
 * Mark all notifications as read.
 */
export const markAllNotificationsAsRead = (
  notifications = []
) => {
  if (!Array.isArray(notifications)) {
    return [];
  }

  return notifications.map(
    (notification) =>
      markNotificationAsRead(
        notification
      )
  );
};

/**
 * Remove a notification.
 */
export const removeNotification = (
  notifications = [],
  notificationId
) => {
  if (!Array.isArray(notifications)) {
    return [];
  }

  return notifications.filter(
    (notification) =>
      notification.id !==
      notificationId
  );
};

/**
 * Get notifications for a specific event.
 */
export const getEventNotifications = (
  notifications = [],
  eventId
) => {
  if (!Array.isArray(notifications)) {
    return [];
  }

  return notifications.filter(
    (notification) =>
      notification.eventId ===
      eventId
  );
};

/**
 * Get notifications for a specific participant.
 */
export const getParticipantNotifications = (
  notifications = [],
  participantId
) => {
  if (!Array.isArray(notifications)) {
    return [];
  }

  return notifications.filter(
    (notification) =>
      notification.participantId ===
      participantId
  );
};

/**
 * Get unread notifications.
 */
export const getUnreadNotifications = (
  notifications = []
) => {
  if (!Array.isArray(notifications)) {
    return [];
  }

  return notifications.filter(
    (notification) =>
      notification.read !== true
  );
};

/**
 * Count unread notifications.
 */
export const getUnreadNotificationCount = (
  notifications = []
) => {
  return getUnreadNotifications(
    notifications
  ).length;
};

/**
 * Get cancellation notifications.
 */
export const getCancellationNotifications = (
  notifications = []
) => {
  if (!Array.isArray(notifications)) {
    return [];
  }

  return notifications.filter(
    (notification) =>
      notification.type ===
      EVENT_CHANGE_TYPES.CANCELLED
  );
};

/**
 * Get reschedule notifications.
 */
export const getRescheduleNotifications = (
  notifications = []
) => {
  if (!Array.isArray(notifications)) {
    return [];
  }

  return notifications.filter(
    (notification) =>
      notification.type ===
      EVENT_CHANGE_TYPES.RESCHEDULED
  );
};

/**
 * Sort notifications by creation time.
 *
 * Default: newest first.
 */
export const sortNotificationsByDate = (
  notifications = [],
  order = "desc"
) => {
  if (!Array.isArray(notifications)) {
    return [];
  }

  return [
    ...notifications,
  ].sort((a, b) => {
    const dateA = new Date(
      a.createdAt
    ).getTime();

    const dateB = new Date(
      b.createdAt
    ).getTime();

    return order === "asc"
      ? dateA - dateB
      : dateB - dateA;
  });
};

/**
 * Search event change notifications.
 */
export const searchEventNotifications = (
  notifications = [],
  searchTerm = ""
) => {
  if (!Array.isArray(notifications)) {
    return [];
  }

  const query = String(searchTerm)
    .trim()
    .toLowerCase();

  if (!query) {
    return notifications;
  }

  return notifications.filter(
    (notification) => {
      const eventName =
        String(
          notification.eventName ||
            ""
        ).toLowerCase();

      const message =
        String(
          notification.message ||
            ""
        ).toLowerCase();

      const reason =
        String(
          notification.reason || ""
        ).toLowerCase();

      return (
        eventName.includes(query) ||
        message.includes(query) ||
        reason.includes(query)
      );
    }
  );
};

/**
 * Check whether an event has changed.
 */
export const hasEventChanged = (
  previousEvent,
  currentEvent
) => {
  if (
    !previousEvent ||
    !currentEvent
  ) {
    return false;
  }

  const previousStatus =
    previousEvent.status;

  const currentStatus =
    currentEvent.status;

  const previousDate =
    getEventStartDate(
      previousEvent
    );

  const currentDate =
    getEventStartDate(
      currentEvent
    );

  if (
    previousStatus !==
    currentStatus
  ) {
    return true;
  }

  if (
    previousDate?.getTime() !==
    currentDate?.getTime()
  ) {
    return true;
  }

  return false;
};

/**
 * Determine the type of event change.
 */
export const getEventChangeType = (
  previousEvent,
  currentEvent
) => {
  if (
    !previousEvent ||
    !currentEvent
  ) {
    return null;
  }

  if (
    currentEvent.status ===
    EVENT_STATUSES.CANCELLED
  ) {
    return EVENT_CHANGE_TYPES.CANCELLED;
  }

  const previousDate =
    getEventStartDate(
      previousEvent
    );

  const currentDate =
    getEventStartDate(
      currentEvent
    );

  if (
    previousDate &&
    currentDate &&
    previousDate.getTime() !==
      currentDate.getTime()
  ) {
    return EVENT_CHANGE_TYPES.RESCHEDULED;
  }

  if (
    currentEvent.status ===
    EVENT_STATUSES.RESCHEDULED
  ) {
    return EVENT_CHANGE_TYPES.RESCHEDULED;
  }

  return null;
};

/**
 * Create the correct notification based
 * on the event change.
 */
export const createEventChangeNotifications = ({
  previousEvent,
  currentEvent,
  participants = [],
  reason = "",
  createdAt = new Date(),
} = {}) => {
  const changeType =
    getEventChangeType(
      previousEvent,
      currentEvent
    );

  if (!changeType) {
    return [];
  }

  if (
    changeType ===
    EVENT_CHANGE_TYPES.CANCELLED
  ) {
    return createCancellationNotifications(
      {
        event: currentEvent,
        participants,
        reason,
        createdAt,
      }
    );
  }

  return createRescheduleNotifications({
    event: previousEvent,
    participants,
    newDateTime:
      getEventStartDate(
        currentEvent
      ),
    reason,
    createdAt,
  });
};

/**
 * Format a date/time for display.
 */
export const formatEventChangeDateTime = (
  value
) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

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
 * Get a participant's ID from common
 * participant object shapes.
 */
const getParticipantId = (
  participant
) => {
  return (
    participant.id ||
    participant.userId ||
    participant.participantId ||
    null
  );
};

/**
 * Safely convert a value to ISO format.
 */
const toISOString = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
};

/**
 * Generate a unique notification ID.
 */
const generateNotificationId = () => {
  return `event-change-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};