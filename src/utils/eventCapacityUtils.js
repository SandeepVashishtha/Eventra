/**
 * Get the number of remaining seats.
 */
export const getRemainingSeats = (
  capacity = 0,
  registered = 0
) => {
  const totalCapacity = Math.max(Number(capacity) || 0, 0);
  const registeredCount = Math.max(Number(registered) || 0, 0);

  return Math.max(
    totalCapacity - registeredCount,
    0
  );
};

/**
 * Get the registration percentage.
 */
export const getRegistrationPercentage = (
  capacity = 0,
  registered = 0
) => {
  const totalCapacity = Number(capacity) || 0;
  const registeredCount = Math.max(Number(registered) || 0, 0);

  if (totalCapacity <= 0) {
    return 0;
  }

  return Math.min(
    Math.round(
      (registeredCount / totalCapacity) * 100
    ),
    100
  );
};

/**
 * Check whether the event is full.
 */
export const isEventFull = (
  capacity = 0,
  registered = 0
) => {
  const totalCapacity = Number(capacity) || 0;
  const registeredCount = Number(registered) || 0;

  return (
    totalCapacity > 0 &&
    registeredCount >= totalCapacity
  );
};

/**
 * Check whether the event is almost full.
 *
 * Default threshold: 90% capacity.
 */
export const isAlmostFull = (
  capacity = 0,
  registered = 0,
  threshold = 90
) => {
  if (isEventFull(capacity, registered)) {
    return false;
  }

  const percentage = getRegistrationPercentage(
    capacity,
    registered
  );

  return percentage >= threshold;
};

/**
 * Get the current capacity status.
 */
export const getCapacityStatus = (
  capacity = 0,
  registered = 0,
  threshold = 90
) => {
  if (isEventFull(capacity, registered)) {
    return "Full";
  }

  if (
    isAlmostFull(
      capacity,
      registered,
      threshold
    )
  ) {
    return "Almost Full";
  }

  return "Available";
};

/**
 * Get a complete capacity summary.
 */
export const getCapacitySummary = (
  capacity = 0,
  registered = 0,
  threshold = 90
) => {
  return {
    capacity: Math.max(Number(capacity) || 0, 0),
    registered: Math.max(Number(registered) || 0, 0),
    remainingSeats: getRemainingSeats(
      capacity,
      registered
    ),
    registrationPercentage:
      getRegistrationPercentage(
        capacity,
        registered
      ),
    status: getCapacityStatus(
      capacity,
      registered,
      threshold
    ),
    isFull: isEventFull(
      capacity,
      registered
    ),
    isAlmostFull: isAlmostFull(
      capacity,
      registered,
      threshold
    ),
  };
};