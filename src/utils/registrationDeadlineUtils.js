/**
 * Get the remaining time until registration closes.
 */
export const getRemainingTime = (deadline) => {
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

  const total = Math.max(
    deadlineTime - Date.now(),
    0
  );

  const days = Math.floor(
    total / (1000 * 60 * 60 * 24)
  );

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
 * Check whether the registration deadline has passed.
 */
export const isDeadlinePassed = (deadline) => {
  if (!deadline) return false;

  const deadlineTime = new Date(deadline).getTime();

  if (Number.isNaN(deadlineTime)) {
    return false;
  }

  return Date.now() >= deadlineTime;
};

/**
 * Get the current registration status.
 */
export const getRegistrationStatus = (
  deadline
) => {
  if (!deadline) {
    return "Deadline Unavailable";
  }

  return isDeadlinePassed(deadline)
    ? "Registration Closed"
    : "Registration Open";
};

/**
 * Format remaining time.
 *
 * Example:
 * 2d 8h 30m 15s
 */
export const formatRemainingTime = (
  time
) => {
  if (!time || time.total <= 0) {
    return "Registration Closed";
  }

  return `${time.days}d ${time.hours}h ${time.minutes}m ${time.seconds}s`;
};

/**
 * Check whether registration is still available.
 */
export const canRegister = (deadline) => {
  if (!deadline) return false;

  return !isDeadlinePassed(deadline);
};

/**
 * Get a complete deadline summary.
 */
export const getDeadlineSummary = (
  deadline
) => {
  const remaining = getRemainingTime(deadline);
  const closed = isDeadlinePassed(deadline);

  return {
    ...remaining,
    status: closed
      ? "Registration Closed"
      : "Registration Open",
    canRegister: !closed,
  };
};