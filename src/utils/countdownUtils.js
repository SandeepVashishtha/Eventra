/**
 * Get the remaining time until a registration deadline.
 */
export const getTimeRemaining = (deadline) => {
  if (!deadline) {
    return {
      total: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const deadlineTime = new Date(deadline).getTime();

  if (Number.isNaN(deadlineTime)) {
    return {
      total: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const total = Math.max(deadlineTime - Date.now(), 0);

  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (total / (1000 * 60 * 60)) % 24
  );
  const minutes = Math.floor(
    (total / (1000 * 60)) % 60
  );
  const seconds = Math.floor(
    (total / 1000) % 60
  );

  return {
    total,
    days,
    hours,
    minutes,
    seconds,
  };
};

/**
 * Check whether registration has closed.
 */
export const isRegistrationClosed = (deadline) => {
  if (!deadline) return false;

  const deadlineTime = new Date(deadline).getTime();

  if (Number.isNaN(deadlineTime)) return false;

  return Date.now() >= deadlineTime;
};

/**
 * Get registration status.
 */
export const getRegistrationStatus = (deadline) => {
  if (!deadline) return "Unknown";

  return isRegistrationClosed(deadline)
    ? "Registration Closed"
    : "Registration Open";
};

/**
 * Format countdown as a compact string.
 *
 * Example:
 * 3d 12h 25m
 */
export const formatCountdown = (time) => {
  if (!time || time.total <= 0) {
    return "Registration Closed";
  }

  const parts = [];

  if (time.days > 0) {
    parts.push(`${time.days}d`);
  }

  if (time.hours > 0 || time.days > 0) {
    parts.push(`${time.hours}h`);
  }

  parts.push(`${time.minutes}m`);

  return parts.join(" ");
};

/**
 * Format countdown with seconds.
 *
 * Example:
 * 3d 12h 25m 10s
 */
export const formatDetailedCountdown = (time) => {
  if (!time || time.total <= 0) {
    return "Registration Closed";
  }
  const days = typeof time.days === "number" && !isNaN(time.days) ? time.days : 0;
  const hours = typeof time.hours === "number" && !isNaN(time.hours) ? time.hours : 0;
  const minutes = typeof time.minutes === "number" && !isNaN(time.minutes) ? time.minutes : 0;
  const seconds = typeof time.seconds === "number" && !isNaN(time.seconds) ? time.seconds : 0;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};