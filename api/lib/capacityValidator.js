/**
 * Event capacity validation helpers.
 *
 * Prevents overbooking by checking the current confirmed registration count
 * against an event's capacity before a new registration is accepted. The
 * registration endpoint previously inserted records without this check, so an
 * event with capacity 100 could accept its 101st (and beyond) attendee.
 *
 * Capacity is read with the same precedence used elsewhere in the codebase:
 * `event.maxAttendees` first, then `event.capacity`.
 */

/**
 * Resolves the effective capacity for an event.
 *
 * @param {Object} event - Event record
 * @returns {number} Non-negative capacity. 0 means "no capacity configured".
 */
export function resolveCapacity(event) {
  if (!event) return 0;
  const raw = event.maxAttendees ?? event.capacity ?? 0;
  const capacity = Number(raw);
  if (!Number.isFinite(capacity) || capacity < 0) {
    return 0;
  }
  return Math.floor(capacity);
}

/**
 * Evaluates whether one more registration fits within capacity.
 *
 * A capacity of 0 is treated as "unlimited" because the codebase uses 0 to mean
 * unconfigured. Callers that require an explicit limit should validate capacity
 * at event-creation time.
 *
 * @param {Object} params
 * @param {Object} params.event - Event record (provides capacity)
 * @param {number} params.currentCount - Current confirmed registrations
 * @param {number} [params.requestedSeats] - Seats requested (default 1)
 * @returns {{ allowed: boolean, capacity: number, currentCount: number, remaining: number, reason?: string }}
 */
export function checkCapacity({ event, currentCount, requestedSeats = 1 }) {
  const capacity = resolveCapacity(event);
  const count = Number(currentCount);
  const seats = Number(requestedSeats);

  if (!Number.isFinite(count) || count < 0) {
    return {
      allowed: false,
      capacity,
      currentCount: 0,
      remaining: 0,
      reason: "Current registration count is invalid",
    };
  }

  if (!Number.isFinite(seats) || seats < 1) {
    return {
      allowed: false,
      capacity,
      currentCount: count,
      remaining: Math.max(0, capacity - count),
      reason: "Requested seats must be at least 1",
    };
  }

  // Unlimited when no capacity configured.
  if (event.maxAttendees === undefined && event.capacity === undefined) {
    return {
      allowed: true,
      capacity: 0,
      currentCount: count,
      remaining: Infinity,
    };
  }

  const remaining = Math.max(0, capacity - count);

  if (count + seats > capacity) {
    return {
      allowed: false,
      capacity,
      currentCount: count,
      remaining,
      reason:
        remaining === 0
          ? "Event is at full capacity"
          : `Only ${remaining} seat(s) remaining`,
    };
  }

  return {
    allowed: true,
    capacity,
    currentCount: count,
    remaining: remaining - seats,
  };
}
