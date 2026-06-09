/**
 * Performs capacity-aware registration.
 * Throws CAPACITY_FULL when no seats remain.
 */
export async function registerAttendeeAtomic({
  event,
  currentCount,
  userId,
  createRegistration,
}) {
  if (!event) {
    throw new Error("Event not found");
  }

  if (!createRegistration || typeof createRegistration !== "function") {
    throw new Error("Registration service unavailable");
  }

  const capacity = Number(event.capacity || 0);

  // Capacity <= 0 means unlimited registration
  if (capacity > 0 && currentCount >= capacity) {
    const err = new Error("Event is at full capacity");
    err.code = "CAPACITY_FULL";
    throw err;
  }

  return await createRegistration({
    eventId: event.id,
    userId,
  });
}