/**
 * Event registration endpoint with capacity enforcement.
 *
 * Previously a registration was inserted without comparing the current attendee
 * count against the event capacity, so events could be overbooked well beyond
 * their intended size. This handler checks capacity inside the same logical
 * step as the insert and rejects the request with 409 Conflict when the event
 * is full.
 *
 * To avoid a check-then-insert race under concurrency, the count is read and
 * the insert attempted through an injected `registerAttendee` that is expected
 * to perform an atomic conditional insert (e.g. a transaction or a unique
 * constraint) and signal capacity conflicts by throwing an error tagged with
 * `code === "CAPACITY_FULL"`.
 */

import { checkCapacity } from "../lib/capacityValidator.js";
import { registerAttendeeAtomic } from "../lib/registrationService.js";
import { withAuth } from "../lib/authMiddleware.js";

/**
 * Registration handler.
 *
 * @param {Object} req - Request with method, body, and authenticated user
 * @param {Object} res - Response exposing status()/json()
 * @param {Object} [deps] - Injected dependencies for testability
 * @param {Function} [deps.getEventById] - async (eventId) => event | null
 * @param {Function} [deps.getRegistrationCount] - async (eventId) => number
 * @param {Function} [deps.isAlreadyRegistered] - async (eventId, userId) => boolean
 * @param {Function} [deps.registerAttendee] - async (eventId, userId) => registration
 * @param {Function} [deps.getEventId] - (req) => string
 */
const registerForEvent = async (req, res, deps = {}) => {
  if (req.method && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const {
    getEventById,
    getRegistrationCount,
    isAlreadyRegistered,
    registerAttendee,
    getEventId = (request) =>
      request.params?.id ?? request.body?.eventId,
  } = deps;

  const user = req.user;
  if (!user || user.id === undefined || user.id === null) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const eventId = getEventId(req);
  if (!eventId) {
    res.status(400).json({ error: "Event id is required" });
    return;
  }

  if (
    typeof getEventById !== "function" ||
    typeof getRegistrationCount !== "function" ||
    typeof registerAttendee !== "function"
  ) {
    res.status(503).json({ error: "Registration service unavailable" });
    return;
  }

  try {
    const event = await getEventById(eventId);
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    // Reject duplicate registrations when the check is available.
    if (typeof isAlreadyRegistered === "function") {
      const already = await isAlreadyRegistered(eventId, user.id);
      if (already) {
        res.status(409).json({ error: "You are already registered for this event" });
        return;
      }
    }

    const currentCount = await getRegistrationCount(eventId);
    const capacity = checkCapacity({ event, currentCount, requestedSeats: 1 });

    if (!capacity.allowed) {
      res.status(409).json({
        error: capacity.reason || "Event is at full capacity",
        capacity: capacity.capacity,
        currentCount: capacity.currentCount,
        remaining: capacity.remaining,
      });
      return;
    }

    // Atomic insert. registerAttendee is expected to re-check capacity
    // transactionally and throw { code: "CAPACITY_FULL" } if a concurrent
    // request filled the last seat between our count read and this insert.
    // const registration = await registerAttendee(eventId, user.id);
    const registration = await registerAttendeeAtomic({
      event,
      currentCount,
      userId: user.id,
      createRegistration: ({ eventId, userId }) =>
        registerAttendee(eventId, userId),
    });
    res.status(201).json({
      message: "Registration successful",
      registration,
      remaining: capacity.remaining,
    });
  } catch (err) {
    if (err && err.code === "CAPACITY_FULL") {
      res.status(409).json({ error: "Event is at full capacity" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export default withAuth(registerForEvent);
