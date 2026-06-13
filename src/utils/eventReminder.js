/**
 * Browser Notification Manager
 * Provides robust notification permission handling and reminder scheduling
 * with support for cancellation, tracking, and rich notification options.
 */

// Default notification configuration
const DEFAULT_NOTIFICATION_OPTIONS = {
  icon: "/favicon.ico", // Fallback icon
  badge: "/badge.png",
  tag: "eventra-reminder",
  requireInteraction: false,
  silent: false,
};

// Store active reminders for management (Map<reminderId, timeoutId>)
const activeReminders = new Map();

// Counter for generating unique reminder IDs
let reminderIdCounter = 0;

/**
 * Checks if the browser supports notifications
 * @returns {boolean} True if notifications are supported
 */
export const isNotificationSupported = () => {
  return typeof window !== "undefined" && "Notification" in window;
};

/**
 * Gets the current notification permission status
 * @returns {'granted'|'denied'|'default'|'unsupported'} Current permission state
 */
export const getNotificationPermission = () => {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
};

/**
 * Requests notification permission from the user
 * Handles all permission states gracefully with proper error handling
 * 
 * @returns {Promise<{granted: boolean, permission: string, alreadySet: boolean}>}
 */
export const requestNotificationPermission = async () => {
  // Check browser support
  if (!isNotificationSupported()) {
    console.warn("Notifications are not supported in this browser.");
    return { granted: false, permission: "unsupported", alreadySet: false };
  }

  const currentPermission = Notification.permission;

  // If already granted, no need to ask again
  if (currentPermission === "granted") {
    return { granted: true, permission: "granted", alreadySet: true };
  }

  // If already denied, we can't request again (user must change in browser settings)
  if (currentPermission === "denied") {
    console.warn(
      "Notification permission was previously denied. User must enable it in browser settings."
    );
    return { granted: false, permission: "denied", alreadySet: true };
  }

  // Request permission (only when state is 'default')
  try {
    const permission = await Notification.requestPermission();
    return {
      granted: permission === "granted",
      permission,
      alreadySet: false,
    };
  } catch (error) {
    console.error("Failed to request notification permission:", error);
    return { granted: false, permission: "error", alreadySet: false };
  }
};

/**
 * Sends an immediate notification
 * 
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 * @param {string} [options.body] - Notification body text
 * @param {string} [options.icon] - Icon URL
 * @param {string} [options.tag] - Tag for replacing existing notifications
 * @param {Function} [options.onClick] - Callback when notification is clicked
 * @param {Function} [options.onClose] - Callback when notification is closed
 * @returns {Notification|null} The notification object or null if failed
 */
export const sendNotification = (title, options = {}) => {
  if (!isNotificationSupported()) {
    console.warn("Cannot send notification: Browser does not support notifications.");
    return null;
  }

  if (Notification.permission !== "granted") {
    console.warn("Cannot send notification: Permission not granted.");
    return null;
  }

  try {
    const notificationOptions = {
      ...DEFAULT_NOTIFICATION_OPTIONS,
      ...options,
    };

    const notification = new Notification(title, notificationOptions);

    // Attach event handlers if provided
    if (typeof options.onClick === "function") {
      notification.onclick = (event) => {
        event.preventDefault();
        options.onClick(notification);
        // Focus the window when notification is clicked
        window.focus();
      };
    }

    if (typeof options.onClose === "function") {
      notification.onclose = () => options.onClose(notification);
    }

    // Auto-close after 10 seconds if requireInteraction is false
    if (!notificationOptions.requireInteraction) {
      setTimeout(() => notification.close(), 10000);
    }

    return notification;
  } catch (error) {
    console.error("Failed to send notification:", error);
    return null;
  }
};

/**
 * Schedules a reminder notification after a specified delay
 * Returns a reminder ID that can be used to cancel the reminder
 * 
 * @param {string} title - Event/reminder title
 * @param {number} delay - Delay in milliseconds
 * @param {Object} [options] - Additional notification options
 * @param {string} [options.body] - Custom body text (defaults to "${title} starts soon!")
 * @param {Function} [options.onClick] - Click handler
 * @returns {string|null} Reminder ID for cancellation, or null if scheduling failed
 */
export const scheduleReminder = (title, delay, options = {}) => {
  // Validate inputs
  if (!title || typeof title !== "string") {
    console.error("scheduleReminder: Invalid title provided.");
    return null;
  }

  if (typeof delay !== "number" || delay < 0) {
    console.error("scheduleReminder: Invalid delay provided. Must be a non-negative number.");
    return null;
  }

  // Check permission before scheduling
  if (!isNotificationSupported()) {
    console.warn("Cannot schedule reminder: Notifications not supported.");
    return null;
  }

  if (Notification.permission !== "granted") {
    console.warn("Cannot schedule reminder: Permission not granted.");
    return null;
  }

  // Generate unique reminder ID
  const reminderId = `reminder_${++reminderIdCounter}_${Date.now()}`;

  // Default body text
  const body = options.body || `${title} starts soon!`;

  // Schedule the notification
  const timeoutId = setTimeout(() => {
    sendNotification("⏰ Event Reminder", {
      body,
      tag: `eventra-${reminderId}`, // Unique tag for each reminder
      ...options,
    });

    // Remove from active reminders after firing
    activeReminders.delete(reminderId);
  }, delay);

  // Store the timeout ID for potential cancellation
  activeReminders.set(reminderId, {
    timeoutId,
    title,
    scheduledAt: Date.now(),
    firesAt: Date.now() + delay,
  });

  return reminderId;
};

/**
 * Cancels a specific scheduled reminder
 * 
 * @param {string} reminderId - The ID returned by scheduleReminder
 * @returns {boolean} True if the reminder was found and cancelled
 */
export const cancelReminder = (reminderId) => {
  if (!reminderId || !activeReminders.has(reminderId)) {
    return false;
  }

  const { timeoutId } = activeReminders.get(reminderId);
  clearTimeout(timeoutId);
  activeReminders.delete(reminderId);

  return true;
};

/**
 * Cancels all scheduled reminders
 * 
 * @returns {number} Number of reminders cancelled
 */
export const cancelAllReminders = () => {
  let count = 0;
  activeReminders.forEach(({ timeoutId }) => {
    clearTimeout(timeoutId);
    count++;
  });
  activeReminders.clear();
  return count;
};

/**
 * Gets a list of all active (pending) reminders
 * 
 * @returns {Array<{id: string, title: string, scheduledAt: number, firesAt: number, timeRemaining: number}>}
 */
export const getActiveReminders = () => {
  const reminders = [];
  const now = Date.now();

  activeReminders.forEach((data, id) => {
    reminders.push({
      id,
      title: data.title,
      scheduledAt: data.scheduledAt,
      firesAt: data.firesAt,
      timeRemaining: Math.max(0, data.firesAt - now),
    });
  });

  // Sort by fire time (earliest first)
  return reminders.sort((a, b) => a.firesAt - b.firesAt);
};

/**
 * Gets the count of active reminders
 * 
 * @returns {number} Number of pending reminders
 */
export const getActiveReminderCount = () => {
  return activeReminders.size;
};