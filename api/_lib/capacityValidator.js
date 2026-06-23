/**
 * Capacity validation helper.
 *
 * @param {Object} params
 * @param {Object} params.event - The event details
 * @param {number} params.currentCount - The current number of registered attendees
 * @param {number} params.requestedSeats - Number of seats being requested (default: 1)
 * @returns {{ allowed: boolean, reason?: string, capacity: number, currentCount: number, remaining: number }}
 */
export function checkCapacity({ event, currentCount, requestedSeats = 1 }) {
  const capacity = Number(event?.maxAttendees) || 0;
  const current = Number(currentCount) || 0;
  const requested = Number(requestedSeats) || 1;

  if (capacity <= 0) {
    // Unlimited capacity
    return {
      allowed: true,
      capacity,
      currentCount: current,
      remaining: Infinity,
    };
  }

  const remaining = capacity - current;
  if (remaining < requested) {
    return {
      allowed: false,
      reason: "Event is at full capacity",
      capacity,
      currentCount: current,
      remaining,
    };
  }

  return {
    allowed: true,
    capacity,
    currentCount: current,
    remaining: remaining - requested,
  };
}
