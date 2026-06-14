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

  // 🔥 FIX: when the API reports an explicit spotsLeft, prefer it over the
  // local capacity - registeredCount calculation. The server may have a more
  // accurate count (e.g. accounting for waitlist holds, soft-holds, or
  // pending cancellations). Clamp to [0, capacity] for sanity.
  // Precedence: explicit spotsLeft > computed capacity - registeredCount > null.
  let spotsLeft;
  if (explicitSpotsLeft !== null) {
    spotsLeft = capacity === null
      ? explicitSpotsLeft
      : Math.max(0, Math.min(explicitSpotsLeft, capacity));
  } else if (capacity !== null) {
    spotsLeft = Math.max(0, capacity - registeredCount);
  } else {
    spotsLeft = null;
  }

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

export const isCapacityConflictError = (error = {}) => {
  const message = String(
    error?.data?.message || error?.data?.error || error?.message || ""
  ).toLowerCase();

  return (
    error?.status === 409 &&
    /capacity|full|sold out|not enough|insufficient|no spots|unavailable/.test(
      message
    )
  );
};