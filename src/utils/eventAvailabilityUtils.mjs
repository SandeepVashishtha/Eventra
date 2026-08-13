const toFiniteNumberOrNull = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const normalizeEventAvailability = (event = {}) => {
  const capacity = toFiniteNumberOrNull(event.capacity ?? event.maxAttendees);

  const registeredCount =
    toFiniteNumberOrNull(
      event.registeredCount ?? event.attendees ?? event.attendeeCount
    ) ?? 0;

  const explicitSpotsLeft = toFiniteNumberOrNull(
    event.spotsLeft ?? event.spotsRemaining ?? event.remainingSpots
  );

  const spotsLeft =
    capacity === null ? explicitSpotsLeft : Math.max(0, capacity - registeredCount);

  let isFull = false;

  if (typeof event.isFull === "boolean") {
    isFull = event.isFull;
  } else if (typeof event.full === "boolean") {
    isFull = event.full;
  } else if (capacity !== null) {
    isFull = registeredCount >= capacity;
  } else if (explicitSpotsLeft !== null) {
    isFull = explicitSpotsLeft <= 0;
  }

  return {
    capacity,
    registeredCount,
    spotsLeft,
    isFull,
  };
};

export const isEventAtCapacity = (event = {}) =>
  normalizeEventAvailability(event).isFull;

export const mergeAvailabilityIntoEvent = (event = {}, availability = {}) => {
  const normalized = normalizeEventAvailability({
    ...event,
    ...availability,
  });

  return {
    ...event,
    ...availability,
    capacity: normalized.capacity,
    maxAttendees: normalized.capacity,
    registeredCount: normalized.registeredCount,
    attendees: normalized.registeredCount,
    spotsLeft: normalized.spotsLeft,
    isFull: normalized.isFull,
  };
};

// Status codes that the backend uses to signal a capacity / availability
// conflict. Both isCapacityConflictError and getRegistrationFailureMessage
// must agree on this set so capacity rejections are classified consistently.
export const CAPACITY_CONFLICT_STATUSES = [409, 423];

export const isCapacityConflictError = (error = {}) => {
  const message = String(
    error?.data?.message || error?.data?.error || error?.message || ""
  ).toLowerCase();

  return (
    CAPACITY_CONFLICT_STATUSES.includes(error?.status) &&
    /capacity|full|sold out|not enough|insufficient|no spots|unavailable/.test(
      message
    )
  );
};