## Registration Flow Has TOCTOU Race Condition Between Capacity Check and Actual POST; Offline Queue Can Enqueue Duplicates

### Severity: High
### Category: Bug (Data Integrity / Race Condition)

## Description

The `EventRegistration.js` component has two distinct data integrity bugs that can lead to incorrect registration states and duplicate registrations.

### Bug 1 — TOCTOU (Time-of-Check Time-of-Use) Race Condition in Capacity Validation

**File:** `src/Pages/Events/EventRegistration.js`

The registration flow has a window between capacity check and the actual POST request where the event can fill up:

1. **Line 322–325:** `checkEventCapacity(eventId, event)` is called. This fetches fresh event data from the API.
2. **Line 328:** `checkAndHandleConflicts()` is called. This also makes multiple API calls (`API_ENDPOINTS.EVENTS.LIST` at line 272) to find alternative events.
3. **Line 331:** `proceedWithRegistration()` is called, which eventually makes the actual registration POST at line 370.

Between step 1 and step 3, an arbitrary amount of time passes (network requests for conflict detection, modal render, user interaction with the conflict modal). During this window, other users can register, filling the event to capacity. The result:

- If capacity was **available** at step 1 but **filled** by step 3: The user's registration POST goes to the regular register endpoint instead of the waitlist endpoint, but the backend should reject it (409). However, the offline queue at line 393-409 doesn't know the event is full and enqueues it as a regular registration.
- If capacity was **full** at step 1 but a spot **opens up** by step 3: The user is unnecessarily sent to the waitlist endpoint.

Moreover, the `isEventFull` variable used at line 352 to decide the endpoint is calculated from the **stale local `event` state**, not from the fresh API response of `checkEventCapacity`. So there's a mismatch:

```js
// Line 322-325 — checks fresh API data but doesn't update `event` state
const isFull = await checkEventCapacity(eventId, event);
if (isFull) {
  toast.info("This event is full. You will be added to the waitlist.");
}

// Line 352 — uses local `event` state which may be outdated
const isEventFull = event ? event.attendees >= event.maxAttendees : false;
const endpoint = isEventFull
  ? `/api/events/${eventId}/waitlist`
  : API_ENDPOINTS.EVENTS.REGISTER(eventId);
```

The user is told they'll be waitlisted (from the fresh check) but the actual POST goes to the regular registration endpoint (from the stale state).

### Bug 2 — Offline Queue Can Enqueue Duplicate Registrations for Same Event+User

**File:** `src/Pages/Events/EventRegistration.js` (lines 393-409) and `src/utils/offlineQueue.js`

When a registration POST fails due to a network error (`isOfflineFailure` flag at line 388), the code calls `pushToQueue` at line 401:

```js
const success = await pushToQueue(
  {
    actionType: isEventFull ? "JOIN_WAITLIST" : "REGISTER_EVENT",
    endpoint,
    eventId: parseInt(eventId),
    payload,
  },
  user.id
);
```

There is **no deduplication check** in the offline queue. If:

- The user submits the form while offline (e.g., mobile device loses connectivity)
- The POST fails with a timeout/network error
- The user hits the submit button again (the `isSubmittingRef` lock is reset in the `finally` block at line 439)

...then multiple identical registration payloads are enqueued. When the device comes back online and the queue replays, **each enqueued item creates a separate registration**, resulting in the user being registered multiple times for the same event.

The `isAlreadyRegistered` error handling at line 425-433 would catch duplicates for online POSTs, but when the queue replays, each replayed POST is a fresh request — the backend may accept the first one and reject subsequent ones with 409, but only after the first successful registration is already stored.

Additionally, the queue replay logic itself may not have idempotency guarantees (e.g., no `idempotencyKey` in the registration payload), so even the first replay could be processed multiple times if the queue replay mechanism retries failed items.

## Impact

- Users may be registered multiple times for the same event
- Event capacity tracking becomes inaccurate
- Users told they'll be waitlisted are registered normally (or vice versa)
- Offline-first users are most affected

## Files Affected

1. **`src/Pages/Events/EventRegistration.js`** — Fix TOCTOU by moving capacity check closer to POST, updating `event` state from fresh capacity check, and adding offline queue deduplication
2. **`src/utils/offlineQueue.js`** — Add deduplication logic (check if same eventId+userId+actionType already exists in queue before enqueueing) and add idempotency key support
3. **`src/context/MyEventsContext.js`** — Ensure `addRegistration` is idempotent (skip if already registered for event)

## Suggested Fix

1. **For TOCTOU:** Move the endpoint decision into `proceedWithRegistration()` and re-check capacity immediately before the POST. Use a single source of truth for `isEventFull`.
2. **For capacity check staleness:** Update the local `event` state with the fresh capacity API response.
3. **For offline queue duplicates:** Add a `deduplicateQueueEntry(eventId, userId)` check in the offline queue before enqueueing. Better yet, add an `idempotencyKey` field to the registration payload and enforce it on the backend.
4. **For MyEventsContext:** Make `addRegistration` check if the event is already registered before adding.
