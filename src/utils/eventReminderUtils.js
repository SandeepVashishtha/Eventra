/**
 * Default reminder options.
 */
export const DEFAULT_REMINDER_OPTIONS = [
  {
    value: "1-day",
    label: "1 day before",
    description:
      "Get a reminder one day before the event.",
    minutesBefore: 24 * 60,
  },
  {
    value: "6-hours",
    label: "6 hours before",
    description:
      "Get a reminder six hours before the event.",
    minutesBefore: 6 * 60,
  },
  {
    value: "1-hour",
    label: "1 hour before",
    description:
      "Get a reminder one hour before the event.",
    minutesBefore: 60,
  },
  {
    value: "custom",
    label: "Custom reminder",
    description:
      "Choose your own reminder date and time.",
    minutesBefore: null,
  },
];

/**
 * Get the event start date.
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
 * Get a reminder option by its value.
 */
export const getReminderOption = (
  value
) => {
  return (
    DEFAULT_REMINDER_OPTIONS.find(
      (option) =>
        option.value === value
    ) || null
  );
};

/**
 * Calculate a reminder time from an
 * event start time and preset option.
 */
export const calculateReminderTime = (
  eventStartDate,
  reminderType
) => {
  if (!eventStartDate) {
    return null;
  }

  const eventDate = new Date(
    eventStartDate
  );

  if (
    Number.isNaN(eventDate.getTime())
  ) {
    return null;
  }

  const option =
    getReminderOption(reminderType);

  if (
    !option ||
    option.minutesBefore === null
  ) {
    return null;
  }

  return new Date(
    eventDate.getTime() -
      option.minutesBefore *
        60 *
        1000
  );
};

/**
 * Validate a reminder date.
 *
 * A reminder must:
 * - be a valid date
 * - be before the event
 * - not be in the past
 */
export const isReminderValid = (
  reminderAt,
  eventStartDate,
  currentDate = new Date()
) => {
  if (!reminderAt) {
    return {
      valid: false,
      error:
        "Reminder date and time are required.",
    };
  }

  const reminderDate = new Date(
    reminderAt
  );

  if (
    Number.isNaN(
      reminderDate.getTime()
    )
  ) {
    return {
      valid: false,
      error:
        "The reminder date and time are invalid.",
    };
  }

  if (reminderDate <= currentDate) {
    return {
      valid: false,
      error:
        "The reminder must be scheduled for a future time.",
    };
  }

  if (eventStartDate) {
    const eventDate = new Date(
      eventStartDate
    );

    if (
      Number.isNaN(eventDate.getTime())
    ) {
      return {
        valid: false,
        error:
          "The event date and time are invalid.",
      };
    }

    if (reminderDate >= eventDate) {
      return {
        valid: false,
        error:
          "The reminder must be scheduled before the event starts.",
      };
    }
  }

  return {
    valid: true,
    error: null,
  };
};

/**
 * Create a reminder object.
 */
export const createReminder = ({
  eventId = null,
  eventName = "",
  type = "1-day",
  reminderAt,
} = {}) => {
  const reminderDate = new Date(
    reminderAt
  );

  return {
    id: generateReminderId(),
    eventId,
    eventName,
    type,
    reminderAt:
      reminderDate.toISOString(),
    status: "scheduled",
    createdAt:
      new Date().toISOString(),
  };
};

/**
 * Update an existing reminder.
 */
export const updateReminder = (
  reminder,
  updates = {}
) => {
  if (!reminder) {
    return null;
  }

  return {
    ...reminder,
    ...updates,
    updatedAt:
      new Date().toISOString(),
  };
};

/**
 * Cancel/remove a reminder.
 */
export const cancelReminder = (
  reminder
) => {
  if (!reminder) {
    return null;
  }

  return {
    ...reminder,
    status: "cancelled",
    cancelledAt:
      new Date().toISOString(),
  };
};

/**
 * Check whether a reminder is active.
 */
export const isReminderActive = (
  reminder
) => {
  return (
    Boolean(reminder) &&
    reminder.status === "scheduled"
  );
};

/**
 * Get the time remaining before a reminder.
 */
export const getTimeUntilReminder = (
  reminderAt,
  currentDate = new Date()
) => {
  if (!reminderAt) {
    return null;
  }

  const reminderDate = new Date(
    reminderAt
  );

  if (
    Number.isNaN(
      reminderDate.getTime()
    )
  ) {
    return null;
  }

  const difference =
    reminderDate.getTime() -
    currentDate.getTime();

  return {
    milliseconds: difference,
    seconds: Math.floor(
      difference / 1000
    ),
    minutes: Math.floor(
      difference /
        (1000 * 60)
    ),
    hours: Math.floor(
      difference /
        (1000 * 60 * 60)
    ),
    days: Math.floor(
      difference /
        (1000 * 60 * 60 * 24)
    ),
    isPast: difference <= 0,
  };
};

/**
 * Format a reminder date/time for display.
 */
export const formatReminderDateTime = (
  date
) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return "";
  }

  return parsedDate.toLocaleString(
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
 * Get a human-readable reminder label.
 */
export const getReminderLabel = (
  reminder
) => {
  if (!reminder) {
    return "No reminder";
  }

  const option =
    getReminderOption(
      reminder.type
    );

  if (option) {
    return option.label;
  }

  if (reminder.type === "custom") {
    return "Custom reminder";
  }

  return "Reminder";
};

/**
 * Get the default reminder time for an
 * event.
 */
export const getDefaultReminder = (
  event
) => {
  const eventStartDate =
    getEventStartDate(event);

  if (!eventStartDate) {
    return null;
  }

  const reminderAt =
    calculateReminderTime(
      eventStartDate,
      "1-day"
    );

  if (!reminderAt) {
    return null;
  }

  return createReminder({
    eventId:
      event?.id ||
      event?.eventId ||
      null,
    eventName:
      event?.name ||
      event?.title ||
      event?.eventName ||
      "",
    type: "1-day",
    reminderAt,
  });
};

/**
 * Find a reminder belonging to an event.
 */
export const findEventReminder = (
  reminders = [],
  eventId
) => {
  if (!Array.isArray(reminders)) {
    return null;
  }

  return (
    reminders.find(
      (reminder) =>
        reminder.eventId ===
        eventId &&
        reminder.status !==
          "cancelled"
    ) || null
  );
};

/**
 * Remove cancelled reminders.
 */
export const getActiveReminders = (
  reminders = []
) => {
  if (!Array.isArray(reminders)) {
    return [];
  }

  return reminders.filter(
    isReminderActive
  );
};

/**
 * Sort reminders by scheduled time.
 */
export const sortRemindersByDate = (
  reminders = []
) => {
  if (!Array.isArray(reminders)) {
    return [];
  }

  return [...reminders].sort(
    (a, b) =>
      new Date(a.reminderAt) -
      new Date(b.reminderAt)
  );
};

/**
 * Validate an event before allowing
 * reminder scheduling.
 */
export const validateReminderEvent = (
  event
) => {
  const eventStartDate =
    getEventStartDate(event);

  if (!eventStartDate) {
    return {
      valid: false,
      error:
        "A valid event date and time are required.",
    };
  }

  if (
    eventStartDate <= new Date()
  ) {
    return {
      valid: false,
      error:
        "Reminders cannot be scheduled for an event that has already started.",
    };
  }

  return {
    valid: true,
    error: null,
    eventStartDate,
  };
};

/**
 * Generate a unique reminder ID.
 */
const generateReminderId = () => {
  return `reminder-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};