export const REGISTRATION_STATUSES = [
  "Registered",
  "Confirmed",
  "Checked In",
  "Attended",
  "Certificate Issued",
];

/**
 * Get the position of a registration status.
 */
export const getStatusIndex = (status) => {
  return REGISTRATION_STATUSES.indexOf(status);
};

/**
 * Check whether a status is valid.
 */
export const isValidRegistrationStatus = (
  status
) => {
  return REGISTRATION_STATUSES.includes(status);
};

/**
 * Normalize registration status history.
 *
 * Removes invalid entries, sorts them by timestamp,
 * and prevents duplicate status entries.
 */
export const normalizeStatusHistory = (
  history = []
) => {
  if (!Array.isArray(history)) {
    return [];
  }

  const validHistory = history.filter(
    (item) =>
      item &&
      isValidRegistrationStatus(item.status)
  );

  const sortedHistory = [...validHistory].sort(
    (a, b) => {
      const first = new Date(
        a.timestamp
      ).getTime();

      const second = new Date(
        b.timestamp
      ).getTime();

      return first - second;
    }
  );

  const seenStatuses = new Set();

  return sortedHistory.filter((item) => {
    if (seenStatuses.has(item.status)) {
      return false;
    }

    seenStatuses.add(item.status);

    return true;
  });
};

/**
 * Get the current registration status.
 */
export const getCurrentRegistrationStatus = (
  history = []
) => {
  const normalizedHistory =
    normalizeStatusHistory(history);

  if (normalizedHistory.length === 0) {
    return null;
  }

  return normalizedHistory[
    normalizedHistory.length - 1
  ].status;
};

/**
 * Get the latest history entry.
 */
export const getLatestStatusEntry = (
  history = []
) => {
  const normalizedHistory =
    normalizeStatusHistory(history);

  if (normalizedHistory.length === 0) {
    return null;
  }

  return normalizedHistory[
    normalizedHistory.length - 1
  ];
};

/**
 * Check whether a status has been completed.
 */
export const isStatusCompleted = (
  history = [],
  status
) => {
  return normalizeStatusHistory(
    history
  ).some(
    (item) => item.status === status
  );
};

/**
 * Get the timestamp for a particular status.
 */
export const getStatusTimestamp = (
  history = [],
  status
) => {
  const entry =
    normalizeStatusHistory(history).find(
      (item) => item.status === status
    );

  return entry?.timestamp || null;
};

/**
 * Format a status timestamp.
 */
export const formatStatusTimestamp = (
  timestamp
) => {
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return String(timestamp);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Add a new status to the history.
 */
export const addStatusUpdate = (
  history = [],
  status,
  timestamp = new Date().toISOString(),
  description = ""
) => {
  if (!isValidRegistrationStatus(status)) {
    return normalizeStatusHistory(history);
  }

  const existingHistory =
    normalizeStatusHistory(history);

  const updatedHistory =
    existingHistory.filter(
      (item) => item.status !== status
    );

  updatedHistory.push({
    status,
    timestamp,
    description,
  });

  return normalizeStatusHistory(
    updatedHistory
  );
};

/**
 * Get the progress percentage based on
 * the current registration status.
 */
export const getRegistrationProgress = (
  history = []
) => {
  const currentStatus =
    getCurrentRegistrationStatus(history);

  const statusIndex =
    getStatusIndex(currentStatus);

  if (statusIndex < 0) {
    return 0;
  }

  return Math.round(
    ((statusIndex + 1) /
      REGISTRATION_STATUSES.length) *
      100
  );
};