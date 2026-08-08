const STORAGE_KEY = "eventra_notification_preferences";

export const NOTIFICATION_TYPES = [
  {
    id: "registrationDeadlines",
    label: "Registration Deadlines",
    description: "Get notified before event registration closes.",
  },
  {
    id: "eventReminders",
    label: "Event Reminders",
    description: "Receive reminders about upcoming events.",
  },
  {
    id: "organizerAnnouncements",
    label: "Organizer Announcements",
    description: "Receive important announcements from organizers.",
  },
  {
    id: "hackathonUpdates",
    label: "Hackathon Updates",
    description: "Get updates about hackathons and competitions.",
  },
  {
    id: "waitlistUpdates",
    label: "Waitlist Updates",
    description: "Know when your waitlist status changes.",
  },
  {
    id: "newEvents",
    label: "New Events",
    description: "Discover newly published events.",
  },
  {
    id: "certificateAvailability",
    label: "Certificate Availability",
    description: "Get notified when your event certificate is available.",
  },
];

/**
 * Get default notification preferences.
 */
export const getDefaultPreferences = () => ({
  registrationDeadlines: true,
  eventReminders: true,
  organizerAnnouncements: true,
  hackathonUpdates: true,
  waitlistUpdates: true,
  newEvents: false,
  certificateAvailability: true,
});

/**
 * Get saved notification preferences.
 */
export const getNotificationPreferences = () => {
  const defaults = getDefaultPreferences();

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return defaults;
    }

    const parsed = JSON.parse(saved);

    return {
      ...defaults,
      ...parsed,
    };
  } catch (error) {
    console.error(
      "Failed to load notification preferences:",
      error
    );

    return defaults;
  }
};

/**
 * Save notification preferences.
 */
export const saveNotificationPreferences = (
  preferences
) => {
  try {
    const updatedPreferences = {
      ...getDefaultPreferences(),
      ...preferences,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedPreferences)
    );

    return updatedPreferences;
  } catch (error) {
    console.error(
      "Failed to save notification preferences:",
      error
    );

    return preferences;
  }
};

/**
 * Toggle one notification preference.
 */
export const toggleNotificationPreference = (
  preferenceId
) => {
  const preferences =
    getNotificationPreferences();

  if (!(preferenceId in preferences)) {
    return preferences;
  }

  const updatedPreferences = {
    ...preferences,
    [preferenceId]: !preferences[preferenceId],
  };

  return saveNotificationPreferences(
    updatedPreferences
  );
};

/**
 * Check whether a notification type is enabled.
 */
export const isNotificationEnabled = (
  preferenceId
) => {
  const preferences =
    getNotificationPreferences();

  return Boolean(preferences[preferenceId]);
};

/**
 * Reset all preferences to defaults.
 */
export const resetNotificationPreferences = () => {
  const defaults = getDefaultPreferences();

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaults)
    );
  } catch (error) {
    console.error(
      "Failed to reset notification preferences:",
      error
    );
  }

  return defaults;
};

/**
 * Enable all notification types.
 */
export const enableAllNotifications = () => {
  const preferences =
    getDefaultPreferences();

  const enabledPreferences = Object.keys(
    preferences
  ).reduce((result, key) => {
    result[key] = true;
    return result;
  }, {});

  return saveNotificationPreferences(
    enabledPreferences
  );
};

/**
 * Disable all notification types.
 */
export const disableAllNotifications = () => {
  const preferences =
    getDefaultPreferences();

  const disabledPreferences = Object.keys(
    preferences
  ).reduce((result, key) => {
    result[key] = false;
    return result;
  }, {});

  return saveNotificationPreferences(
    disabledPreferences
  );
};