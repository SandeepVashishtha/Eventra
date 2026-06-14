/**
 * Event registration endpoint with capacity enforcement.
 *
 * The race condition is handled at the database layer via `registerAttendee`,
 * which must perform an atomic conditional insert — either using a transaction
 * that re-checks capacity before inserting, or a DB-level constraint. If a
 * concurrent request fills the last seat between our count read and the insert,
 * `registerAttendee` must throw an error with `code === "CAPACITY_FULL"`.
 *
 * This handler:
 *  1. Validates the request and user session.
 *  2. Checks for duplicate registration.
 *  3. Does a pre-flight capacity check (fast rejection for clearly full events).
 *  4. Delegates the atomic insert to `registerAttendee`.
 *  5. Handles `CAPACITY_FULL` thrown by concurrent race losers.
 */

import { checkCapacity } from "../_lib/capacityValidator.js";
import { withLock } from "../_lib/distributed-lock.js";
import { enforceBodySize } from "../_lib/bodySize.js";

// Concurrency lock for RSVP
const rsvpLocks = new Map();
const rsvpLockCounters = new Map();

/**
 * Registration handler.
 *
 * @param {Object} req - Request with method, body, and authenticated user
 * @param {Object} res - Response exposing status()/json()
 * @param {Object} [deps] - Injected dependencies for testability
 * @param {Function} [deps.getEventById]          - async (eventId) => event | null
 * @param {Function} [deps.getRegistrationCount]  - async (eventId) => number
 * @param {Function} [deps.isAlreadyRegistered]   - async (eventId, userId) => boolean
 * @param {Function} [deps.registerAttendee]      - async (eventId, userId) => registration
 *   Must be atomic: re-check capacity inside a transaction or via a DB constraint,
 *   and throw { code: "CAPACITY_FULL" } if no seat is available at insert time.
 * @param {Function} [deps.getEventId]            - (req) => string
 */
export default async function registerForEvent(req, res, deps = {}) {
  if (req.method && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (enforceBodySize(req, res)) return;

  const {
    getEventById,
    getRegistrationCount,
    isAlreadyRegistered,
    registerAttendee,
    getEventId = (request) => request.params?.id ?? request.body?.eventId,
  } = deps;

  // ── Auth check ────────────────────────────────────────────────────────────
  const user = req.user;
  if (!user || user.id === undefined || user.id === null) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  // ── Input validation ──────────────────────────────────────────────────────
  const eventId = getEventId(req);
  if (!eventId) {
    res.status(400).json({ error: "Event id is required" });
    return;
  }

  // ── Dependency check ──────────────────────────────────────────────────────
  if (
    typeof getEventById !== "function" ||
    typeof getRegistrationCount !== "function" ||
    typeof registerAttendee !== "function"
  ) {
    res.status(503).json({ error: "Registration service unavailable" });
    return;
  }
  
  const counter = rsvpLockCounters.get(eventId) || 0;
  rsvpLockCounters.set(eventId, counter + 1);

  await withLock(`register:${eventId}`, async () => {
    // ── Event existence ───────────────────────────────────────────────────
    const event = await getEventById(eventId);
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    // ── Duplicate registration check ──────────────────────────────────────
    if (typeof isAlreadyRegistered === "function") {
      const already = await isAlreadyRegistered(eventId, user.id);
      if (already) {
        res.status(409).json({ error: "You are already registered for this event" });
        return;
      }
    }

    // ── Pre-flight capacity check (non-atomic, fast path) ─────────────────
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

    // ── Atomic insert ────────────────────────────────────────────────────
    const registration = await registerAttendee(eventId, user.id);

    res.status(201).json({
      message: "Registration successful",
      registration,
      remaining: capacity.remaining - 1,
    });

  }, 30000).catch((err) => {
    // ── Race condition loser ───────────────────────────────────────────────
    if (err?.code === "CAPACITY_FULL") {
      res.status(409).json({ error: "Event is at full capacity" });
      return;
    }

    if (err?.code === "DUPLICATE_REGISTRATION" || err?.code === "23505") {
      res.status(409).json({ error: "You are already registered for this event" });
      return;
    }

    res.status(500).json({ error: "Internal server error" });
  });
}