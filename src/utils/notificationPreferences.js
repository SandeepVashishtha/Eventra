export const NOTIFICATION_CATEGORIES = {
  registrations: {
    label: "Registrations",
    description: "Registration confirmations, waitlists, and ticket updates.",
  },
  events: {
    label: "Event updates",
    description: "Schedule changes, venue notes, and event announcements.",
  },
  reminders: {
    label: "Reminders",
    description: "Saved event and session reminders.",
  },
  announcements: {
    label: "Announcements",
    description: "Platform news and organizer broadcasts.",
  },
  social: {
    label: "Social",
    description: "Mentions, collaboration requests, and community interactions.",
  },
  system: {
    label: "System",
    description: "Security, account, and offline sync notices.",
  },
};

export const NOTIFICATION_SOUNDS = {
  none: { label: "Silent", frequency: null },
  chime: { label: "Soft chime", frequency: 660 },
  pulse: { label: "Pulse", frequency: 440 },
  bright: { label: "Bright ping", frequency: 880 },
};

export const NOTIFICATION_PREFERENCES_KEY = "eventra_notification_preferences";
export const PUSH_SUBSCRIPTION_KEY = "eventra_push_subscription";

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  inApp: true,
  push: false,
  email: true,
  emailDigest: "daily",
  sound: "chime",
  categories: Object.keys(NOTIFICATION_CATEGORIES).reduce((acc, key) => {
    acc[key] = { inApp: true, push: true, email: true };
    return acc;
  }, {}),
};

export const getNotificationCategory = (notification = {}) => {
  if (!notification) return "system";
  const rawCategory =
    notification.category ||
    notification.type ||
    notification.kind ||
    notification.metadata?.category ||
    "system";
  const category = String(rawCategory).toLowerCase();
  return NOTIFICATION_CATEGORIES[category] ? category : "system";
};

export const normalizeNotificationPreferences = (preferences = {}) => {
  const merged = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...preferences,
    categories: {
      ...DEFAULT_NOTIFICATION_PREFERENCES.categories,
      ...(preferences.categories || {}),
    },
  };

  Object.keys(NOTIFICATION_CATEGORIES).forEach((category) => {
    merged.categories[category] = {
      ...DEFAULT_NOTIFICATION_PREFERENCES.categories[category],
      ...(preferences.categories?.[category] || {}),
    };
  });

  if (!NOTIFICATION_SOUNDS[merged.sound]) {
    merged.sound = DEFAULT_NOTIFICATION_PREFERENCES.sound;
  }

  return merged;
};

export const readNotificationPreferences = () => {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_PREFERENCES;

  try {
    const stored = window.localStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
    return normalizeNotificationPreferences(stored ? JSON.parse(stored) : {});
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
};

export const writeNotificationPreferences = (preferences) => {
  if (typeof window === "undefined") return preferences;
  const normalized = normalizeNotificationPreferences(preferences);
  window.localStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(normalized));
  window.dispatchEvent(
    new CustomEvent("eventra-notification-preferences", { detail: normalized })
  );
  return normalized;
};

export const shouldDeliverNotification = (notification, preferences, channel) => {
  const normalized = normalizeNotificationPreferences(preferences);
  const category = getNotificationCategory(notification);
  return Boolean(normalized[channel] && normalized.categories[category]?.[channel]);
};

export const getNotificationTitle = (notification = {}) =>
  notification.title || notification.heading || NOTIFICATION_CATEGORIES[getNotificationCategory(notification)].label;

export const getNotificationMessage = (notification = {}) =>
  notification.message || notification.body || notification.description || "You have a new update.";

export const playNotificationSound = (soundKey) => {
  if (typeof window === "undefined") return;
  const sound = NOTIFICATION_SOUNDS[soundKey];
  if (!sound?.frequency) return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  try {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = sound.frequency;
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.28);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
    oscillator.onended = () => audioContext.close();
  } catch {
    // Audio playback can be blocked until the user interacts with the page.
  }
};

export const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};
